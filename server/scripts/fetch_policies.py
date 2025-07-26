from cpdb_api import request

r = request.Request()
r.set_country("USA")

df = r.issue()
df.sort_values(by=["decision_date"], ascending=False, inplace=True)
print(df.head())
df.to_json("../policies.json", orient="records", lines=True)
df.to_csv("../policies.csv", index=False)