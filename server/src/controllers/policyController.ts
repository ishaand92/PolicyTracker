import { RequestHandler } from "express";
import PolicyModel from "../models/PolicyModel";

export const getAllPolicies: RequestHandler = async (_req, res, next) => {
  try {
    const policies = await PolicyModel.find().lean();
    res.json(policies);
  } catch (error) {
    next(error);
  }
};

export const getPolicyById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const policy = await PolicyModel.findById(id).lean();
    if (!policy) {
      res.status(404).json({ message: "Policy not found" });
      return;
    }
    res.json(policy);
  } catch (error) {
    next(error);
  }
};
