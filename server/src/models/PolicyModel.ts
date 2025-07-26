import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    policy_id: String,
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
    decision_date: String,
    start_date: String,
    end_date: String,
    high_impact: String,
    policy_objective: String,
    reference: String,
    impact_indicators: String,
    last_update: String,
  },
  { strict: false } // ✅ This allows all extra fields
);

const PolicyModel = mongoose.model("Policy", PolicySchema, "policies");
export default PolicyModel;
