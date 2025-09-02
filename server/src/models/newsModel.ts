import mongoose, { Schema, Document } from "mongoose";

export interface INewsSource {
  id?: string | null;
  name?: string | null;
}

export interface INews extends Document {
  source?: INewsSource;
  author?: string | null;
  title: string;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  // Can be string or Date depending on how it was imported
  publishedAt?: string | Date | null;
  content?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const NewsSourceSchema = new Schema<INewsSource>(
  {
    id: { type: String, default: null },
    name: { type: String, default: null },
  },
  { _id: false }
);

const NewsSchema = new Schema<INews>(
  {
    source: { type: NewsSourceSchema, default: null },
    author: { type: String, default: null },
    title: { type: String, required: true },
    description: { type: String, default: null },
    url: { type: String, default: null },
    urlToImage: { type: String, default: null },
    // Mixed to accept both strings and Date
    publishedAt: { type: Schema.Types.Mixed, default: null },
    content: { type: String, default: null },
  },
  { timestamps: true }
);

// Helpful indexes
NewsSchema.index({ "source.name": 1 });
NewsSchema.index({ title: "text", description: "text", content: "text", author: "text" });

const News = mongoose.model<INews>("News", NewsSchema, "news"); // <- force 'news'
export default News;
