// controllers/articleController.ts  (ensure file name matches your import)
import { Request, Response } from "express";
import Article from "../models/articleModel";

// minimal date helpers kept if you need publishedAtDisplay
const toDate = (v?: any): Date | undefined => {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const formatDisplayDate = (d?: Date) => {
  if (!d) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};
// controllers/articleController.ts
const toSafeString = (v: any) => {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.name ?? v.id ?? null;
  return String(v);
};

const toDTO = (doc: any) => {
  const published = toDate(doc.publishedAt) ?? toDate(doc.publishedDate);
  const sourceStr = toSafeString(doc.source);

  return {
    _id: String(doc._id),
    title: doc.title,
    description: doc.description,
    content: doc.content,
    author: toSafeString(doc.author),       // author can also be object sometimes
    source: sourceStr,                      // <-- normalized
    url: doc.url,
    urlToImage: typeof doc.urlToImage === 'string' ? doc.urlToImage : null,
    publishedAt: published ?? null,
    publishedAtDisplay: formatDisplayDate(published),
    relevance: doc.relevance ?? 1,
    gemini: doc.gemini ?? null,
    ingestedAt: doc.ingestedAt ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
};


// GET /api/news  — start with no filter to verify data returns
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const pageNum = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(req.query.limit || '20'), 10) || 20, 1), 100);

    const [docs, total] = await Promise.all([
      Article.find({})                               // 👈 no filter (for now)
        .sort({ publishedAt: -1, publishedDate: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Article.countDocuments({}),
    ]);

    res.json({
      items: docs.map(toDTO),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch articles" });
  }
};

// TEMP: /api/news/_debug — see counts/sample from the actual bound collection
export const getNewsDebug = async (_req: Request, res: Response) => {
  try {
    const total = await Article.countDocuments({});
    const sample = await Article.findOne({}).lean();
    res.json({ total, sample });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/news/:id
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const doc = await Article.findById(req.params.id).lean();
    if (!doc) return void res.status(404).json({ message: "Article not found" });
    res.json(toDTO(doc));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch article" });
  }
};
