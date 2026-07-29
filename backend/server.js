import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, checkMongoDBConnected } from './config/db.js';
import { runAutoMigration } from './services/autoMigration.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogEngagementRoutes from './routes/blogEngagementRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import courseContentRoutes from './routes/courseContentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.set('trust proxy', 1);

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.APP_BASE_URL,
    'https://toancaocapueh.id.vn',
    'https://toancaocapueh.netlify.app',
    process.env.NODE_ENV !== 'production' ? 'http://localhost:5173' : null,
    process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:5173' : null
  ].filter(Boolean).map((origin) => origin.replace(/\/+$/, ''))
);

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ''))) {
      return callback(null, true);
    }
    const error = new Error('Origin is not allowed by CORS');
    error.statusCode = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '256kb' }));

// Routes
app.use('/api', authRoutes);
app.use('/api', resourceRoutes);
app.use('/api', contactRoutes);
app.use('/api', blogEngagementRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', courseContentRoutes);
app.use('/', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    database: checkMongoDBConnected() ? 'online' : 'offline'
  });
});

app.get('/api/readiness', (req, res) => {
  const ready = checkMongoDBConnected() || process.env.NODE_ENV !== 'production';
  return res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    database: checkMongoDBConnected() ? 'online' : 'offline'
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number(error.statusCode) || 500;
  if (status >= 500) {
    console.error('Unhandled request error:', error);
  }
  return res.status(status).json({
    success: false,
    code: error.code || 'REQUEST_FAILED',
    message: status === 500
      ? 'Hệ thống đang tạm gián đoạn. Vui lòng thử lại sau.'
      : error.message
  });
});

// Connect Database & Start Server
connectDB(runAutoMigration).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
