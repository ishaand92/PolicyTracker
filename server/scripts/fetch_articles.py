from newsapi import NewsApiClient
import json
import ast

def main():
    # Initialize the NewsApiClient with your API key
    newsapi = NewsApiClient(api_key='704959bcefb94903982f7d6c1685e164')
    
    # Fetch articles
    articles = newsapi.get_everything(q='climate policy')
    
    # Convert and save as JSON
    python_text_to_json(articles, "articles.json")

def python_text_to_json(data, output_path):
    """
    Converts Python dictionary or Python-literal string to valid JSON and saves it.
    """
    # If it's a string, try parsing as Python literal
    if isinstance(data, str):
        try:
            data = ast.literal_eval(data)
        except Exception as e:
            raise ValueError(f"Could not parse the text as Python literal: {e}")
    
    # Step 2: Convert to JSON string
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    
    # Step 3: Save to output file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_str)
    
    print(f"✅ JSON saved to {output_path}")

if __name__ == "__main__":
    main()
