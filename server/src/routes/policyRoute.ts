import express from "express";
import { getAllPolicies, getPolicyById } from "../controllers/policyController";

const router = express.Router();
router.get("/", getAllPolicies);
router.get("/:id", getPolicyById);
export default router;
