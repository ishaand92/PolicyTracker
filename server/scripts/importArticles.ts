import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import ArticleModel from '../src/models/ArticleModel'; // Make sure you have this model
import { connectDB } from '../src/db/db';

// ⬇️ Load env manually from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function importFromJSON() {
  const jsonPath = path.join(__dirname, 'articles.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const articles: any[] = JSON.parse(rawData);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const article of articles) {
    const exists = await ArticleModel.findOne({ title: article.title }); // assume title is unique
    if (!exists) {
      await ArticleModel.create(article);
      insertedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`✅ Inserted ${insertedCount}, Skipped ${skippedCount} duplicates.`);
}

(async () => {
  try {
    await connectDB();
    await importFromJSON();
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
})();