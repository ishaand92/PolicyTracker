// src/routes/articleRoute.ts
import { Router } from "express";
import { getAllArticles, getArticleById, getNewsDebug } from "../controllers/articleController";

const router = Router();
router.get("/", getAllArticles);
router.get("/_debug", getNewsDebug); // TEMP
router.get("/:id", getArticleById);
export default router;
