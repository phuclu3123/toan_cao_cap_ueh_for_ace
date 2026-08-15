import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import net from 'node:net';
import { connectDB } from './config/db.js';
import { runAutoMigration } from './services/autoMigration.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogEngagementRoutes from './routes/blogEngagementRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const ensurePortIsAvailable = (port) => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.unref();
  probe.once('error', reject);
  probe.once('listening', () => probe.close(resolve));
  probe.listen(port);
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', resourceRoutes);
app.use('/api', contactRoutes);
app.use('/api', blogEngagementRoutes);
app.use('/api', enrollmentRoutes);
app.use('/', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: 'MongoDB Atlas (Online)'
  });
});

// Check the port before opening a second database connection, then start once.
const startServer = async () => {
  try {
    await ensurePortIsAvailable(PORT);
    await connectDB(runAutoMigration);

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Backend server error:', error);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`Backend is already running on port ${PORT}. Reuse it instead of starting a second instance.`);
      console.error(`Health check: http://localhost:${PORT}/api/health`);
      process.exit(1);
    }

    throw error;
  }
};

startServer();
