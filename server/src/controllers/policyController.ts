// controllers/policyController.ts
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Policy } from "../models/Policy";

const filePath = path.join(__dirname, "../../public/policy_list.json");

export const getAllPolicies = (req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data: Policy[] = JSON.parse(rawData);

    // Optional: sort descending by decision_date
    const sorted = data.sort((a, b) => {
      return new Date(b.decision_date).getTime() - new Date(a.decision_date).getTime();
    });

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: "Failed to load policies", error });
  }
};