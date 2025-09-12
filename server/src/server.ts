import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import { connectDB } from "./db/db";
import policyRoutes from "./routes/policyRoute";
import newsRoutes from "./routes/newsRoute";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../../client/build")));

app.use("/api/policies", policyRoutes);
app.use("/api/news", newsRoutes);

app.get("/home", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});
app.get("/api/articles", (req, res) => {
  res.sendFile(path.join(__dirname, "scripts", "articles.json"));
});

connectDB()
  .then(() => {
    console.log("✅ Database connection established.");
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB. Exiting...", err);
    process.exit(1);
  });
