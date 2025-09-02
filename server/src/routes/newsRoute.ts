import { Router } from "express";
import { getAllNews, getNewsById, getNewsDebug } from "../controllers/newsController";

const router = Router();

router.get("/debug", getNewsDebug);
router.get("/", getAllNews);
router.get("/:id", getNewsById);

export default router;
