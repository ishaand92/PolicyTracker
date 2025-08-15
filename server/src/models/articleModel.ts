import mongoose, { Schema, Document } from 'mongoose';

export interface IGeminiMeta {
  score: number;
  rationale: string;
  model: string;
  classifiedAt: number; // epoch seconds
}

export interface IArticle extends Document {
  title: string;
  description?: string;
  content?: string;
  author?: string;
  source?: string;
  url: string;               // unique
  urlToImage?: string;
  publishedAt?: Date;        // NewsAPI field
  publishedDate?: Date;      // legacy field (optional)
  relevance?: number;        // 1 = relevant, 0 = not inserted by pipeline
  gemini?: IGeminiMeta;
  ingestedAt?: number;       // epoch seconds
}

const GeminiSchema = new Schema<IGeminiMeta>({
  score: { type: Number },
  rationale: { type: String },
  model: { type: String },
  classifiedAt: { type: Number },
}, { _id: false });

const ArticleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  author: { type: String },
  source: { type: String },
  url: { type: String, required: true, unique: true },
  urlToImage: { type: String },
  publishedAt: { type: Date },     // prefer this (matches NewsAPI)
  publishedDate: { type: Date },   // keep for backward-compat if you already have data
  relevance: { type: Number, default: 1 },
  gemini: { type: GeminiSchema },
  ingestedAt: { type: Number },
}, { timestamps: true });

ArticleSchema.index({ url: 1 }, { unique: true });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ relevance: -1, 'gemini.score': -1 });

const Article = mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;
