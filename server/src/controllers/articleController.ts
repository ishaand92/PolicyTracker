// controllers/article.controller.ts
import { Request, Response } from 'express';
import Article from '../models/articleModel';

export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const articles = await Article
      .find({ relevance: 1 })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    // If you render a view:
    res.render('news', { articles });

    // OR if you’re returning JSON:
    // res.json({ articles });
  } catch (error) {
    const err = error as Error;
    res.status(500).send({ error: err.message });
  }
};
