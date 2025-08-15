# classify_and_save.py
# pip install google-generativeai pymongo python-dotenv
import os, json, time, argparse, urllib.parse
from typing import Dict, Any, List, Tuple
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError
import google.generativeai as genai

# Import your existing fetcher
import fetch_articles

# -------- Config via env --------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGODB_URI    = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME        = os.getenv("DB_NAME", "newsdb")
COLL_NAME      = os.getenv("COLLECTION_NAME", "articles")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
DEFAULT_THRESHOLD = float(os.getenv("RELEVANCE_THRESHOLD", "0.6"))

if not GEMINI_API_KEY:
    raise SystemExit("Missing GEMINI_API_KEY")

# -------- Gemini init --------
genai.configure(api_key=GEMINI_API_KEY)
gemini = genai.GenerativeModel(GEMINI_MODEL)

SYS_PROMPT = """You are a precise classifier for CLIMATE POLICY news.
Given items (title + description + source + url), return strict JSON:
{"items":[{"url":"...", "is_relevant": true/false, "score": 0..1, "rationale":"<=280 chars"}]}
Relevance: policy/regulation/legislation/standards, carbon markets/taxes, climate diplomacy, subsidies,
corporate policy shifts tied to climate, court rulings.
Exclude: general weather, climate science without policy angle, generic ESG marketing, unrelated politics.
Return ONLY JSON.
"""

# ---------- helpers ----------
def strip_tracking_params(url: str) -> str:
    """Remove common tracking params to canonicalize URLs for dedupe."""
    if not url:
        return url
    try:
        u = urllib.parse.urlparse(url)
        q = urllib.parse.parse_qsl(u.query, keep_blank_values=True)
        drop = {
            "utm_source","utm_medium","utm_campaign","utm_term","utm_content",
            "utm_name","utm_id","mc_cid","mc_eid","fbclid","gclid","igshid","ref"
        }
        filtered = [(k, v) for (k, v) in q if k.lower() not in drop]
        new_query = urllib.parse.urlencode(filtered)
        return urllib.parse.urlunparse((u.scheme, u.netloc, u.path, u.params, new_query, u.fragment))
    except Exception:
        return url

def chunked(lst: List[Any], n: int):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def need_fields(a: Dict[str, Any]) -> Dict[str, Any]:
    """Flatten NewsAPI article to the fields we care about."""
    source_name = (a.get("source") or {}).get("name") if isinstance(a.get("source"), dict) else a.get("source")
    canonical_url = strip_tracking_params(a.get("url") or "")
    return {
        "title": a.get("title"),
        "description": a.get("description"),
        "content": a.get("content"),
        "author": a.get("author"),
        "source": source_name,
        "url": canonical_url,
        "urlToImage": a.get("urlToImage"),
        "publishedAt": a.get("publishedAt"),  # ISO string; Mongo driver will cast to Date
    }

def classify_with_gemini_batched(articles: List[Dict[str, Any]], batch_size: int) -> Dict[str, Dict[str, Any]]:
    """Return mapping url -> decision for all articles using batched Gemini calls."""
    decisions: Dict[str, Dict[str, Any]] = {}
    for batch in chunked(articles, batch_size):
        items = [{
            "title": a.get("title") or "",
            "description": a.get("description") or "",
            "source": a.get("source") or "",
            "url": a.get("url") or "",
        } for a in batch if a.get("url")]

        if not items:
            continue

        prompt = SYS_PROMPT + "\n\n" + json.dumps({"items": items}, ensure_ascii=False)
        try:
            resp = gemini.generate_content(prompt)
            text = getattr(resp, "text", None) or ""
            # Defensive: some SDK responses include extra code fences or stray text; strip them
            text = text.strip()
            if text.startswith("```"):
                text = text.strip("`")
                # try to drop a leading "json\n"
                if text.lower().startswith("json"):
                    text = text[4:].strip()
            data = json.loads(text) if text else {"items": []}
        except Exception:
            data = {"items": []}

        for e in data.get("items", []):
            url = strip_tracking_params(e.get("url") or "")
            if not url:
                continue
            try:
                decisions[url] = {
                    "is_relevant": bool(e.get("is_relevant")),
                    "score": float(e.get("score", 0.0)),
                    "rationale": (e.get("rationale") or "")[:300],
                    "model": GEMINI_MODEL
                }
            except Exception:
                # Skip malformed entries gracefully
                continue
    return decisions

def save_articles(
    articles: List[Dict[str, Any]],
    decisions: Dict[str, Dict[str, Any]],
    min_score: float,
    keep_irrelevant: bool
) -> Tuple[int, int, int]:
    """
    Upsert relevant articles; optionally keep irrelevant with relevance=0.
    Returns: (saved_relevant, saved_irrelevant, upserted_count)
    """
    client = MongoClient(MONGODB_URI)
    coll = client[DB_NAME][COLL_NAME]

    now = int(time.time())
    ops: List[UpdateOne] = []
    saved_rel = saved_irrel = 0

    for raw in articles:
        a = need_fields(raw)
        url = a.get("url")
        if not url:
            continue

        d = decisions.get(url)
        is_rel = bool(d and d.get("is_relevant") and float(d.get("score", 0)) >= min_score)

        if not is_rel and not keep_irrelevant:
            continue  # skip writing junk

        doc = {
            **a,
            "relevance": 1 if is_rel else 0,
            "gemini": d if d else None,
            "ingestedAt": now
        }
        # Clean None gemini if absent
        if not doc["gemini"]:
            doc.pop("gemini")

        ops.append(UpdateOne({"url": url}, {"$set": doc}, upsert=True))
        if is_rel: saved_rel += 1
        else: saved_irrel += 1

    if not ops:
        return 0, 0, 0

    try:
        result = coll.bulk_write(ops, ordered=False)
        upserted = len(result.upserted_ids)
    except BulkWriteError:
        upserted = 0

    return saved_rel, saved_irrel, upserted

# ---------- CLI ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true", help="Use fetch_articles to get fresh articles.")
    ap.add_argument("--query", default="climate policy")
    ap.add_argument("--language", default="en")
    ap.add_argument("--pages", type=int, default=1)
    ap.add_argument("--page-size", type=int, default=50)
    ap.add_argument("--in", dest="infile", default=None, help="Use pre-fetched JSON file.")
    ap.add_argument("--out", dest="outfile", default=None, help="Write filtered JSON (dry-run or after classify).")
    ap.add_argument("--dry-run", action="store_true", help="Do not save to Mongo; just output JSON/stats.")
    ap.add_argument("--batch-size", type=int, default=20, help="Articles per Gemini call.")
    ap.add_argument("--min-score", type=float, default=DEFAULT_THRESHOLD, help="Minimum relevance score to keep.")
    ap.add_argument("--keep-irrelevant", action="store_true", help="Also save irrelevant (relevance=0).")
    args = ap.parse_args()

    # 0) source of truth for articles
    if args.fetch:
        raw = fetch_articles.get_articles(
            query=args.query, language=args.language,
            page_size=args.page_size, pages=args.pages
        )
        # Normalize early so batching + decisions align with canonicalized URLs
        articles = [need_fields(a) for a in raw]
    elif args.infile:
        with open(args.infile, "r", encoding="utf-8") as f:
            data = json.load(f)
        raw_list = data.get("articles", data)
        articles = [need_fields(a) for a in raw_list]
    else:
        print("Nothing to do. Use --fetch or --in <file.json>.")
        return

    if not articles:
        print("No articles.")
        return

    # 1) classify (batched)
    decisions = classify_with_gemini_batched(articles, args.batch_size)

    # 2) dry-run?
    if args.dry_run:
        kept = [
            a for a in articles
            if a.get("url") in decisions
            and decisions[a["url"]].get("is_relevant")
            and float(decisions[a["url"]].get("score", 0)) >= args.min_score
        ]
        print(f"Dry run: {len(kept)} relevant of {len(articles)} total.")
        if args.outfile:
            with open(args.outfile, "w", encoding="utf-8") as f:
                json.dump({"articles": kept, "decisions": decisions}, f, ensure_ascii=False, indent=2)
            print(f"Wrote {args.outfile}")
        return

    # 3) save
    saved_rel, saved_irrel, upserted = save_articles(
        articles, decisions, args.min_score, args.keep_irrelevant
    )
    msg = f"Saved {saved_rel} relevant"
    if args.keep_irrelevant:
        msg += f", {saved_irrel} irrelevant"
    msg += f" (upserted {upserted}) of {len(articles)} total."
    print(msg)

if __name__ == "__main__":
    main()
