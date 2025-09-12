// src/models/articleModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IGeminiMeta {
  score: number;
  rationale: string;
  model: string;
  classifiedAt: number;
}
export interface IArticle extends Document {
  title: string;
  description?: string;
  content?: string;
  author?: string;
  source?: string;
  url: string;
  urlToImage?: string;
  publishedAt?: Date;
  publishedDate?: Date;
  relevance?: number;
  gemini?: IGeminiMeta;
  ingestedAt?: number;
}

const GeminiSchema = new Schema<IGeminiMeta>(
  {
    score: Number,
    rationale: String,
    model: String,
    classifiedAt: Number,
  },
  { _id: false }
);

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    description: String,
    content: String,
    author: String,
    source: String,
    url: { type: String, required: true, unique: true },
    urlToImage: String,
    publishedAt: Date,
    publishedDate: Date,
    relevance: { type: Number, default: 1 },
    gemini: GeminiSchema,
    ingestedAt: Number,
  },
  {
    timestamps: true,
    collection: "articles", // 👈 force the right collection
  }
);

ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ relevance: -1, "gemini.score": -1 });

const Article = mongoose.model<IArticle>("Article", ArticleSchema);
export default Article;
