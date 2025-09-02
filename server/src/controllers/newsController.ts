import { RequestHandler } from "express";
import mongoose from "mongoose";
import News from "../models/newsModel";

// Minimal date helpers
const toDate = (v?: any) => (v ? new Date(v) : undefined);
const ddmmyyyy = (d?: Date | null) =>
  !d
    ? "—"
    : `${String(d.getUTCDate()).padStart(2, "0")}/${String(
        d.getUTCMonth() + 1
      ).padStart(2, "0")}/${d.getUTCFullYear()}`;

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
export const getAllNews: RequestHandler = async (req, res): Promise<void> => {
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

    // If you stored publishedAt as a string, range queries won’t work with find().
    // Option A (simple): leave as-is if you’re not filtering by date.
    // Option B (robust): use aggregation to coerce to Date for sorting/filtering.
    const fromD = toDate(date_from);
    const toD = toDate(date_to);

    if (fromD || toD) {
      // Switch to aggregation so string dates are handled correctly
      const pipeline: any[] = [
        { $match: filter },
        {
          $addFields: {
            _pub: {
              $switch: {
                branches: [
                  { case: { $eq: [{ $type: "$publishedAt" }, "date"] }, then: "$publishedAt" },
                  { case: { $eq: [{ $type: "$publishedAt" }, "string"] }, then: { $toDate: "$publishedAt" } },
                ],
                default: null,
              },
            },
          },
        },
        {
          $match: {
            _pub: {
              ...(fromD ? { $gte: fromD } : {}),
              ...(toD ? { $lte: toD } : {}),
            },
          },
        },
        { $sort: { _pub: -1, createdAt: -1, _id: -1 } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ];

      const countPipeline = [
        pipeline[0],
        pipeline[1],
        pipeline[2],
        { $count: "count" },
      ];

      const [docs, countArr] = await Promise.all([
        News.aggregate(pipeline),
        News.aggregate(countPipeline),
      ]);
      const total = countArr?.[0]?.count ?? 0;

      return void res.json({
        items: docs.map(toDTO),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    // No date range: simple find() is fine
    const [docs, total] = await Promise.all([
      News.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      News.countDocuments(filter),
    ]);

    return void res.json({
      items: docs.map(toDTO),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (e: any) {
    return void res.status(500).json({ error: e.message || "Failed to fetch news" });
  }
};

// GET /api/news/:id (guard invalid ids)
export const getNewsById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return void res.status(400).json({ message: "Invalid id" });
    }

    const doc = await News.findById(id).lean();
    if (!doc) {
      return void res.status(404).json({ message: "News article not found" });
    }
    return void res.json(toDTO(doc));
  } catch (e: any) {
    return void res.status(500).json({ error: e.message || "Failed to fetch news article" });
  }
};

// GET /api/news/debug
export const getNewsDebug: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const total = await News.countDocuments({});
    return void res.json({
      ok: true,
      collection: "news",
      total,
      note: "If total > 0 but /api/news returns 0, check query params or date filters.",
    });
  } catch (e: any) {
    return void res.status(500).json({ ok: false, error: e.message });
  }
};
