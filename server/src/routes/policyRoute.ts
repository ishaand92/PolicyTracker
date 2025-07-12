// routes/policyRoutes.ts
import express from "express";
import { getAllPolicies } from "../controllers/policyController";

const router = express.Router();

router.get("/", getAllPolicies);

export default router;