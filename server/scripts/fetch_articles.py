# news_fetcher.py
from newsapi import NewsApiClient
import json
import ast
import os

def get_articles(query: str = "climate policy", language: str = "en", page_size: int = 50, pages: int = 1):
    """
    Returns a flat list of article dicts from NewsAPI.
    Keeps your exact fetching behavior, just returns data for reuse.
    """
    api_key = os.getenv("NEWSAPI_KEY") or "704959bcefb94903982f7d6c1685e164"  # TODO: move to env fully
    newsapi = NewsApiClient(api_key=api_key)

    all_items = []
    for page in range(1, pages + 1):
        res = newsapi.get_everything(q=query, language=language, sort_by="publishedAt",
                                     page_size=page_size, page=page)
        articles = res.get("articles", [])
        all_items.extend(articles)
        if len(articles) < page_size:
            break
    return all_items

def python_text_to_json(data, output_path):
    """
    Converts Python dict/list or Python-literal string to valid JSON and saves it.
    """
    if isinstance(data, str):
        try:
            data = ast.literal_eval(data)
        except Exception as e:
            raise ValueError(f"Could not parse the text as Python literal: {e}")

    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_str)
    print(f"✅ JSON saved to {output_path}")

def main():
    articles = get_articles(query="climate policy")
    python_text_to_json(articles, "articles.json")

if __name__ == "__main__":
    main()
