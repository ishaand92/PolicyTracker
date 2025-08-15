import { Request, Response } from "express";

const Article = require("../models/article.model");

export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 });
    res.render("news", { articles });
  } catch (error) {
    const err = error as Error;
    res.status(500).send({ error: err.message });
  }
};