import { Request, Response } from "express";
import News from "../models/newsModel";

// Minimal date helpers
const toDate = (v?: any) => (v ? new Date(v) : undefined);
const ddmmyyyy = (d?: Date|null) =>
  !d ? "—" : `${String(d.getUTCDate()).padStart(2,"0")}/${String(d.getUTCMonth()+1).padStart(2,"0")}/${d.getUTCFullYear()}`;

const toDTO = (doc: any) => {
  const p = doc.publishedAt ? new Date(doc.publishedAt) : null;
  return {
    _id: String(doc._id),
    source: doc.source ?? null,
    author: doc.author ?? null,
    title: doc.title,
    description: doc.description ?? null,
    url: doc.url,
    urlToImage: doc.urlToImage ?? null,
    publishedAt: p,
    publishedAtDisplay: ddmmyyyy(p),
    content: doc.content ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
};

// GET /api/news
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const { q = "", page = "1", limit = "20", source, date_from, date_to } =
      req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter: any = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { "source.name": { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
      ];
    }
    if (source) filter["source.name"] = source;

    const fromD = toDate(date_from);
    const toD = toDate(date_to);
    if (fromD || toD) {
      filter.publishedAt = {
        ...(fromD ? { $gte: fromD } : {}),
        ...(toD ? { $lte: toD } : {}),
      };
    }

    const [docs, total] = await Promise.all([
      News.find(filter).sort({ publishedAt: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      News.countDocuments(filter),
    ]);

    res.json({
      items: docs.map(toDTO),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to fetch news" });
  }
};

// GET /api/news/:id
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const doc = await News.findById(req.params.id).lean();
    if (!doc) return void res.status(404).json({ message: "News article not found" });
    res.json(toDTO(doc));
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to fetch news article" });
  }
};

// ---- DEBUG: quick health + counts ----
export const getNewsDebug = async (_req: Request, res: Response) => {
  try {
    const total = await News.countDocuments({});
    res.json({
      ok: true,
      collection: "news",
      total,
      note: "If total > 0 but /api/news returns 0, check query params or date filters.",
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
