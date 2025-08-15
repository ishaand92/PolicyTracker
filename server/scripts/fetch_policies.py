# export_policies.py
from cpdb_api import request
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent  # project root if this file is in /scripts
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)

r = request.Request()
r.set_country("USA")
df = r.issue().sort_values(by=["decision_date"], ascending=False)

csv_path = DATA / "policies.csv"
json_path = DATA / "policies.json"

df.to_csv(csv_path, index=False)
df.to_json(json_path, orient="records", lines=True)
print(f"✅ Wrote {csv_path} and {json_path}")
