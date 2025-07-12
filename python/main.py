from cpdb_api import request 

r = request.Request()

# set filters
r.set_country("USA")

# Issue the request and sort by decision date
df = r.issue()
df.sort_values(by="decision_date", ascending=False, inplace=True)

# Save dataframe to a JSON file
df.to_json("policy_list.json", orient="records", lines=True)

print(df.head())
print(df.iloc[0].__getattr__("sector"))
print(df.iloc[0].__getattr__("decision_date"))

