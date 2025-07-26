import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import PolicyModel from '../src/models/PolicyModel'; // adjust the path if needed
import csvParser from 'csv-parser'; // only needed for CSV support
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URI = "mongodb+srv://deshpandeishaan22:PolicyTrackerPass12@policytracker.suvsa.mongodb.net/?retryWrites=true&w=majority&appName=PolicyTracker";

async function importFromJSON() {
  const jsonPath = path.join(__dirname, 'policies.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  await PolicyModel.deleteMany({}); // optional: clear existing data
  await PolicyModel.insertMany(data);
  console.log(`Inserted ${data.length} policies from JSON.`);
}

async function importFromCSV() {
  const csvPath = path.join(__dirname, 'policies.csv');
  const policies: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        policies.push(row);
      })
      .on('end', async () => {
        await PolicyModel.deleteMany({});
        await PolicyModel.insertMany(policies);
        console.log(`Inserted ${policies.length} policies from CSV.`);
        resolve();
      })
      .on('error', reject);
  });
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    // await importFromJSON(); // ← Uncomment this if you're using JSON
    await importFromCSV(); // ← Or this if you're using CSV
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();