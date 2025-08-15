// scripts/importPolicies.ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';
import PolicyModel from '../src/models/PolicyModel';
import { connectDB } from '../src/db/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // safer

const csvPath = path.resolve(process.cwd(), 'data', 'policies.csv'); // match Python

type Row = Record<string, string>;

function normalize(row: Row) {
  // Example coercions — adjust to your schema:
  return {
    // prefer a stable key from CPDB if available (e.g., row.id)
    name: row.name?.trim(),
    country: row.country?.trim() || 'USA',
    decision_date: row.decision_date ? new Date(row.decision_date) : undefined,
    // …map other fields as needed
  };
}

async function importFromCSV() {
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found at ${csvPath}`);

  const ops: any[] = [];
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row: Row) => {
        const doc = normalize(row);
        if (!doc.name || !doc.decision_date) return; // skip bad rows

        // Upsert on a stronger key than `name` alone:
        ops.push({
          updateOne: {
            filter: { name: doc.name, country: doc.country, decision_date: doc.decision_date },
            update: { $set: doc },
            upsert: true,
          },
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  if (!ops.length) {
    console.log('No rows to import.');
    return;
  }

  const result = await PolicyModel.bulkWrite(ops, { ordered: false });
  const upserted = result.upsertedCount || Object.keys(result.upsertedIds).length;
  console.log(`✅ Bulk upsert done. matched=${result.matchedCount} modified=${result.modifiedCount} upserted=${upserted}`);
}

(async () => {
  try {
    await connectDB();
    // ensure indexes once:
    await PolicyModel.collection.createIndex({ name: 1, country: 1, decision_date: 1 }, { unique: true });
    await importFromCSV();
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
})();
