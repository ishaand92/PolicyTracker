import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './db/db';

// Routes
import policyRoutes from './routes/policyRoute';

// Load environment variables
dotenv.config({ path: './.env' });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files like policy_list.json if needed
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('✅ Database connection established.');
    // Start server only after DB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to the database. Exiting...', err);
    process.exit(1);
  });

// ROOT Route
app.get('/home', (req: Request, res: Response) => {
  res.send('Welcome to the AI Model API');
});

// Example model API route
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

// Climate Policy API route
app.use('/api/policies', policyRoutes);