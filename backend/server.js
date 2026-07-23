import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, checkMongoDBConnected } from './config/db.js';
import { runAutoMigration } from './services/autoMigration.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', resourceRoutes);
app.use('/api', contactRoutes);
app.use('/', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    database: checkMongoDBConnected() ? 'MongoDB Atlas (Online)' : 'Local JSON (Offline Fallback)'
  });
});

// Connect Database & Start Server
connectDB(runAutoMigration).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
