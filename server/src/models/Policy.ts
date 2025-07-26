// models/Policy.ts

export interface Policy {
    _id?: string;
    policy_id: string;
    country_iso: string;
    policy_name: string;
    policy_title: string;
    jurisdiction: string;
    supranational_region: string;
    country: string;
    subnational_region: string;
    policy_city_or_local: string;
    policy_instrument: string;
    sector: string;
    policy_description: string;
    policy_type: string;
    stringency: string;
    policy_status: string;
    decision_date: string;
    start_date: string;
    end_date: string;
    high_impact: string;
    policy_objective: string;
    reference: string;
    impact_indicators: string;
    last_update: string;
  }
  