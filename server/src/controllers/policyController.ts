import { Request, Response } from "express";
import PolicyModel from "../models/PolicyModel"; // Mongoose model

export const getAllPolicies = async (req: Request, res: Response) => {
  try {
    console.log("🔍 Querying policies...");
    const policies = await PolicyModel.find().lean(); // 🔁 removed sort()
    console.log("✅ Fetched policies:", policies.length);
    res.json(policies);
  } catch (error) {
    console.error("❌ Error fetching policies:", error);
    res.status(500).json({ message: "Failed to load policies", error });
  }
};
