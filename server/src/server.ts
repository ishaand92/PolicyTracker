// src/server.ts
import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { connectDB } from './db/db';
import Article from './models/articleModel';
import policyRoutes from './routes/policyRoute';
import articleRoutes from './routes/articleRoute';

// Load env
dotenv.config({ path: './.env' });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// Static assets
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../../client/build')));

// --------- Import Articles (still JSON-based) ----------
async function importArticles() {
  try {
    const articlesPath = path.resolve(__dirname, '../../articles.json');
    if (!fs.existsSync(articlesPath)) {
      console.warn('⚠️ articles.json not found at', articlesPath);
      return;
    }
    const data = fs.readFileSync(articlesPath, 'utf-8');
    const json = JSON.parse(data);
    if (!Array.isArray(json.articles)) {
      console.warn('⚠️ articles.json does not contain an "articles" array.');
      return;
    }
    await Article.deleteMany({});
    await Article.insertMany(json.articles);
    console.log(`📰 Imported ${json.articles.length} news articles`);
  } catch (err) {
    console.error('❌ Error importing articles:', err);
  }
}

// --------- API routes ----------
app.post('/api/model', async (req: Request, res: Response) => {
  try {
    const inputData = req.body;
    res.json({ output: `Processed data: ${JSON.stringify(inputData)}` });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DB-backed policies
app.use('/api/policies', policyRoutes);

// Articles (routes + DB, but seeded from JSON)
app.use('/news', articleRoutes);

// React SPA fallback
app.get('/home', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// --------- Boot ---------
connectDB()
  .then(async () => {
    console.log('✅ Database connection established.');
    await importArticles();
    setInterval(importArticles, 24 * 60 * 60 * 1000); // refresh daily

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to the database. Exiting...', err);
    process.exit(1);
  });
