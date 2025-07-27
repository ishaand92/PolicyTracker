import dotenv from 'dotenv';
import path from 'path';

// ⬇️ Load env manually from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';
import PolicyModel from '../src/models/PolicyModel';
import { connectDB } from '../src/db/db';

async function importFromCSV() {
  const csvPath = path.join(__dirname, 'policies.csv');
  const policies: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => policies.push(row))
      .on('end', async () => {
        let insertedCount = 0;
        let skippedCount = 0;

        for (const policy of policies) {
          const exists = await PolicyModel.findOne({ name: policy.name });
          if (!exists) {
            await PolicyModel.create(policy);
            insertedCount++;
          } else {
            skippedCount++;
          }
        }

        console.log(`✅ Inserted ${insertedCount}, Skipped ${skippedCount} duplicates.`);
        resolve();
      })
      .on('error', reject);
  });
}

(async () => {
  try {
    await connectDB(); // uses .env now
    await importFromCSV();
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
})();
