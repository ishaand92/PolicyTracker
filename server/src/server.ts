import fs from 'fs';
import Article from './models/articleModel';
import Policy from './models/PolicyModel';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './db/db';
import policyRoutes from './routes/policyRoute';
import articleRoutes from './routes/articleRoute';


// Load environment variables
dotenv.config({ path: './.env' });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve React frontend static assets
app.use(express.static(path.join(__dirname, '../../client/build')));

// Connect to MongoDB
connectDB()
  .then(async () => {
    console.log('✅ Database connection established.');
    // Import articles immediately on startup
    await importArticles();
    await importPolicies();
    // Set up auto-refresh every 24 hours
    setInterval(importArticles, 24 * 60 * 60 * 1000);
    setInterval(importPolicies, 7 * 24 * 60 * 60 * 1000);
    // Start server only after DB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to the database. Exiting...', err);
    process.exit(1);
  });
// News Article Importer
async function importArticles() {
  try {
    const articlesPath = path.join(__dirname, '../../articles.json');
    if (!fs.existsSync(articlesPath)) {
      console.warn('⚠️ articles.json not found at', articlesPath);
      return;
    }
    const data = fs.readFileSync(articlesPath, 'utf-8');
    const json = JSON.parse(data);
    if (!json.articles || !Array.isArray(json.articles)) {
      console.warn('⚠️ articles.json does not contain an "articles" array.');
      return;
    }
    await Article.deleteMany({});
    await Article.insertMany(json.articles);
    console.log(`📰 Imported ${json.articles.length} news articles from articles.json`);
  } catch (err) {
    console.error('❌ Error importing articles:', err);
  }
}

async function importPolicies() {
  try {
    const policiesPath = path.join(__dirname, '../../policies.json');
    if (!fs.existsSync(policiesPath)) {
      console.warn('⚠️ policies.json not found at', policiesPath);
      return;
    }
    const data = fs.readFileSync(policiesPath, 'utf-8');
    const json = JSON.parse(data);
    if (!json.policies || !Array.isArray(json.policies)) {
      console.warn('⚠️ policies.json does not contain a "policies" array.');
      return;
    }
    await Policy.deleteMany({});
    await Policy.insertMany(json.policies);
    console.log(`📜 Imported ${json.policies.length} policies from policies.json`);
  } catch (err) {
    console.error('❌ Error importing policies:', err);
  }
}


app.post('/api/model', async (req: Request, res: Response) => {
  try {
    const inputData = req.body;
    const modelOutput = `Processed data: ${JSON.stringify(inputData)}`;
    res.json({ output: modelOutput });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve React frontend index.html for /home
app.get('/home', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// Climate Policy API route
app.use('/api/policies', policyRoutes);

// News Article API route
app.use('/news', articleRoutes);

// Catch-all route to serve React index.html for all other frontend routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});