// src/server.ts
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "./db/db";
import policyRoutes from "./routes/policyRoute";
import newsRoutes from "./routes/newsRoute";
import articleRoutes from "./routes/articleRoute";

dotenv.config(); // use defaults; Render provides env vars

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // replaces bodyParser.json()

// Optional: tiny API logger (helps on Render)
app.use("/api", (req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Static assets (adjust if your client lives elsewhere in prod)
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../../client/build")));

// API routes
app.use("/api/policies", policyRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/articles", articleRoutes);

// DB diagnostics (guard db handle, fix TS types)
app.get("/api/_dbdiag", async (_req: Request, res: Response) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ error: "DB not ready" });
      return;
    }

    type CollInfo = { name: string };

    const collectionsInfo = (await db.listCollections().toArray()) as CollInfo[];
    const collections = collectionsInfo.map((c) => c.name).sort();

    const counts: Record<string, number> = {};
    for (const name of ["policies", "articles", "news"] as const) {
      if (collections.includes(name)) {
        counts[name] = await db.collection(name).countDocuments({});
      }
    }

    const articlesSample =
      collections.includes("articles")
        ? await db
            .collection("articles")
            .find({}, { projection: { title: 1, publishedAt: 1 } })
            .limit(3)
            .toArray()
        : [];

    res.json({
      dbName: db.databaseName,
      collections,
      counts,
      articlesSample,
    });
  } catch (err) {
    // keep logging blunt so you see it on Render
    console.error("DB DIAG ERROR:", err);
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// SPA fallback (keep AFTER API routes)
app.get("/home", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

// Boot
connectDB()
  .then(() => {
    console.log("✅ Database connection established.");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB. Exiting...", err);
    process.exit(1);
  });
