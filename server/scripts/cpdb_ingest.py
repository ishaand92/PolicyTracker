#!/usr/bin/env python3
# pip install pandas pymongo python-dotenv
import os, sys, json, argparse, time
from pathlib import Path
from typing import Dict, Any, List

from dotenv import load_dotenv
load_dotenv()

import pandas as pd
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError

# Uses your CPDB client: cpdb_api.request.Request().set_country(...).issue() -> DataFrame
from cpdb_api import request as cpdb_request

def info(msg: str): print(f"[INFO] {msg}", file=sys.stderr)
def warn(msg: str): print(f"[WARN] {msg}", file=sys.stderr)
def err (msg: str): print(f"[ERR ] {msg}",  file=sys.stderr)

def fetch_policies(country: str) -> pd.DataFrame:
    r = cpdb_request.Request()
    r.set_country(country)
    df = r.issue()  # Expect DataFrame
    return df

def normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Stable external id if present
    if 'cpdb_id' not in df.columns:
        if 'id' in df.columns: df['cpdb_id'] = df['id'].astype(str)
        elif 'issue_id' in df.columns: df['cpdb_id'] = df['issue_id'].astype(str)
        else: df['cpdb_id'] = None

    # Names / titles
    if 'policy_name' not in df.columns:
        for c in ['policy_name', 'name', 'title', 'policy_title']:
            if c in df.columns:
                df['policy_name'] = df[c]
                break
        if 'policy_name' not in df.columns: df['policy_name'] = None

    if 'policy_title' not in df.columns:
        for c in ['policy_title', 'title', 'name']:
            if c in df.columns:
                df['policy_title'] = df[c]
                break
        if 'policy_title' not in df.columns: df['policy_title'] = None

    # Description
    if 'policy_description' not in df.columns:
        for c in ['policy_description', 'description', 'summary']:
            if c in df.columns:
                df['policy_description'] = df[c]
                break
        if 'policy_description' not in df.columns: df['policy_description'] = None

    # Country ISO
    if 'country_iso' not in df.columns:
        for c in ['country_iso', 'country_code', 'country']:
            if c in df.columns:
                df['country_iso'] = df[c]
                break
        if 'country_iso' not in df.columns: df['country_iso'] = 'USA'

    # Sector
    if 'sector' not in df.columns:
        df['sector'] = df['sector'] if 'sector' in df.columns else None

    # Status
    if 'policy_status' not in df.columns:
        for c in ['policy_status', 'status']:
            if c in df.columns:
                df['policy_status'] = df[c]
                break
        if 'policy_status' not in df.columns: df['policy_status'] = None

    # Dates (UTC)
    for col in ['decision_date', 'start_date', 'end_date', 'last_update']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce', utc=True)
        else:
            df[col] = pd.NaT

    # Sort newest first
    sort_col = 'decision_date' if 'decision_date' in df.columns else 'last_update'
    df = df.sort_values(by=[sort_col], ascending=False, na_position='last')

    keep = [
        'cpdb_id',
        'policy_name', 'policy_title', 'policy_description',
        'country_iso', 'sector', 'policy_status',
        'decision_date', 'start_date', 'end_date', 'last_update',
    ]
    # keep a few extras if present
    extras = [c for c in ['id', 'issue_id', 'source', 'jurisdiction', 'url'] if c in df.columns]
    df = df[keep + extras]
    return df

def dump_files(df: pd.DataFrame, out_dir: Path) -> Dict[str, str]:
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path  = out_dir / "policies.csv"
    json_path = out_dir / "policies.json"
    df.to_csv(csv_path, index=False)
    df.to_json(json_path, orient="records", lines=True, date_format='iso')
    return {"csv_path": str(csv_path), "json_path": str(json_path)}

def ensure_indexes(coll) -> None:
    try:
        coll.create_index([('cpdb_id', 1)], unique=True, sparse=True)
    except Exception as e:
        warn(f"Index cpdb_id create failed: {e}")
    try:
        coll.create_index([('policy_name', 1), ('country_iso', 1), ('decision_date', 1)],
                          unique=True, sparse=True)
    except Exception as e:
        warn(f"Index (name,country,decision_date) create failed: {e}")

def bulk_upsert(coll, records: List[Dict[str, Any]], chunk_size: int = 5000) -> Dict[str, int]:
    matched = modified = upserted = errors = 0
    ops: List[UpdateOne] = []
    t0 = time.time()

    def flush():
        nonlocal matched, modified, upserted, errors, ops
        if not ops: return
        try:
            res = coll.bulk_write(ops, ordered=False)
            matched   += getattr(res, 'matched_count', 0)
            modified  += getattr(res, 'modified_count', 0)
            upserted  += getattr(res, 'upserted_count', 0) or len(getattr(res, 'upserted_ids', {}))
        except BulkWriteError as bwe:
            errors += 1
            warn(f"BulkWriteError: {bwe.details}")
        finally:
            ops = []

    for rec in records:
        cpdb_id = rec.get('cpdb_id')
        has_id = bool(cpdb_id)
        # Fix date strings (if any) back to datetime
        for k in ['decision_date', 'start_date', 'end_date', 'last_update']:
            v = rec.get(k)
            if isinstance(v, str):
                try:
                    rec[k] = pd.to_datetime(v, utc=True).to_pydatetime()
                except Exception:
                    rec[k] = None

        if has_id:
            filt = {'cpdb_id': cpdb_id}
        else:
            if not (rec.get('policy_name') and rec.get('country_iso') and rec.get('decision_date')):
                continue
            filt = {
                'policy_name': rec['policy_name'],
                'country_iso': rec['country_iso'],
                'decision_date': rec['decision_date'],
            }

        ops.append(UpdateOne(filt, {'$set': rec}, upsert=True))
        if len(ops) >= chunk_size:
            flush()
    flush()
    dt = time.time() - t0
    info(f"Upsert finished in {dt:.2f}s (matched={matched}, modified={modified}, upserted={upserted}, errors={errors})")
    return dict(matched=matched, modified=modified, upserted=upserted, errors=errors)

def main():
    ap = argparse.ArgumentParser(description="CPDB policies -> CSV/JSON -> Mongo")
    ap.add_argument("--country", default=os.getenv("CPDB_COUNTRY", "USA"))
    ap.add_argument("--out-dir", default=str(Path("data")))
    ap.add_argument("--mongo-uri", default=os.getenv("MONGO_URI"))
    ap.add_argument("--db", default=os.getenv("DB_NAME", "PolicyTracker"))
    ap.add_argument("--collection", default=os.getenv("POLICY_COLLECTION", "policies"))
    ap.add_argument("--chunk-size", type=int, default=int(os.getenv("BULK_CHUNK_SIZE", "5000")))
    ap.add_argument("--skip-db", action="store_true", help="Only dump CSV/JSON; do not write to Mongo")
    args = ap.parse_args()

    if not args.mongo_uri and not args.skip_db:
        err("Missing --mongo-uri (or set MONGO_URI). Use --skip-db to only dump files.")
        print(json.dumps({"ok": False, "error": "Missing MONGO_URI"}))
        sys.exit(2)

    # 1) Fetch
    df_raw = fetch_policies(args.country)
    if df_raw is None or df_raw.empty:
        print(json.dumps({"ok": True, "rows": 0, "message": "No data returned"}))
        return

    # 2) Normalize
    df = normalize_df(df_raw)

    # 3) Dump files
    paths = dump_files(df, Path(args.out_dir))

    # 4) Mongo (optional)
    summary: Dict[str, Any] = {"ok": True, "rows": int(df.shape[0]), **paths}
    if not args.skip_db:
        client = MongoClient(args.mongo_uri)
        coll = client[args.db][args.collection]
        ensure_indexes(coll)
        records = json.loads(df.to_json(orient='records', date_format='iso'))
        stats = bulk_upsert(coll, records, args.chunk_size)
        summary.update(stats)

    # 5) Single JSON line to stdout
    print(json.dumps(summary, ensure_ascii=False))

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        err(str(e))
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)
