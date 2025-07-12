import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './db/db';
import policyRoutes from './routes/policyRoute';

// Load environment variables
dotenv.config({ path: './.env' });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- Routes ---
app.get('/home', (req: Request, res: Response) => {
  res.send('Welcome to the AI Model API');
});

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

app.use('/api/policies', policyRoutes);

// --- DB Connection + Server Start ---
(async () => {
  try {
    await connectDB();
    console.log('✅ Database connection established.');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database. Exiting...', err);
    process.exit(1);
  }
})();
