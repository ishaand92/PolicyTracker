// src/db/db.ts
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not defined");

  mongoose.set("strictQuery", true);

  // 🚀 Force the dbName to "PolicyTracker"
  await mongoose.connect(uri, {
    dbName: "PolicyTracker",
  });

  // ✅ Now it's safe to inspect the connection
  const conn = mongoose.connection;
  const db = conn.db;
  if (!db) {
    console.warn("⚠️ Mongoose connected but db handle not ready yet.");
    return;
  }

  try {
    const collections = (await db.listCollections().toArray())
      .map((c) => c.name)
      .sort();

    // conn.host is not typed; guard with optional chaining + fallback
    const host = (conn as any).host ?? "unknown-host";

    console.log("✅ Connected to MongoDB");
    console.log("   host:", host);
    console.log("   db  :", db.databaseName); // should always be "PolicyTracker"
    console.log("   colls:", collections.join(", ") || "(none)");
  } catch (e: any) {
    console.warn("⚠️ Connected, but failed to list collections:", e.message);
  }
};
