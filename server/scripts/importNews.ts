import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import axios from 'axios';
import { connectDB } from '../src/db/db';
import NewsModel from '../../src/models/NewsModel';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const NEWS_API_KEY = process.env.NEWSDATA_API_KEY;
const NEWS_API_URL = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=climate+policy&language=en&category=environment`;

async function importClimatePolicyNews() {
  await connectDB();

  try {
    interface NewsApiResponse {
      results: {
        title: string;
        description: string;
        pubDate: string;
        link: string;
        creator?: string[];
      }[];
    }

    const response = await axios.get<NewsApiResponse>(NEWS_API_URL);
    const articles = response.data.results;

    let inserted = 0;
    let skipped = 0;

    for (const article of articles) {
      const exists = await NewsModel.findOne({ title: article.title });

      if (!exists) {
        await NewsModel.create({
          title: article.title,
          description: article.description,
          pubDate: article.pubDate,
          sourceUrl: article.link,
          creator: article.creator?.[0] || 'Unknown'
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ News Import Complete: Inserted ${inserted}, Skipped ${skipped}`);
    process.exit();
  } catch (error) {
    console.error('❌ Failed to import news:', error);
    process.exit(1);
  }
}

importClimatePolicyNews();