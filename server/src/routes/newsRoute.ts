import { Router } from "express";
import { getAllNews, getNewsById, getNewsDebug } from "../controllers/newsController";

const router = Router();

// Put fixed paths BEFORE :id
router.get("/debug", getNewsDebug);
router.get("/", getAllNews);

// Only match valid 24-hex object ids for :id
router.get("/:id([0-9a-fA-F]{24})", getNewsById);

export default router;
