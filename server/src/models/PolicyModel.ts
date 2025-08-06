import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    policy_id: Number,
    country_iso: String,
    policy_name: String,
    policy_title: String,
    jurisdiction: String,
    supranational_region: String,
    country: String,
    subnational_region: String,
    policy_city_or_local: String,
    policy_instrument: String,
    sector: String,
    policy_description: String,
    policy_type: String,
    stringency: String,
    policy_status: String,
    decision_date: String, // or Date
    start_date: String,    // or Date
    end_date: String,      // or Date
    high_impact: String,   // or Boolean
    policy_objective: String,
    reference: String,
    impact_indicators: String,
    last_update: String,   // or Date
  },
  { strict: false } // keep this if your CSV might change over time
);

const PolicyModel = mongoose.model("Policy", PolicySchema, "policies");
export default PolicyModel;
