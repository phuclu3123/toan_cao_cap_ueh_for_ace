import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDatabaseStatus } from './config/db.js';
import {
  getPasswordResetReadiness,
  reportPasswordResetReadiness
} from './config/passwordResetConfig.js';
import { runAutoMigration } from './services/autoMigration.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogEngagementRoutes from './routes/blogEngagementRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import courseContentRoutes from './routes/courseContentRoutes.js';

const app = express();
const configuredPort = Number.parseInt(process.env.PORT || '5000', 10);
const PORT = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 5000;

if (process.env.NODE_ENV === 'production') {
  const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '1', 10);
  app.set('trust proxy', Number.isInteger(trustProxyHops) && trustProxyHops >= 0 ? trustProxyHops : 1);
}

// Security hardening
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Middleware
const configuredOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean);
const developmentOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(process.env.NODE_ENV === 'production' ? [] : developmentOrigins)
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server) or listed origins
    if (!origin || allowedOrigins.has(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      const error = new Error('Origin is not allowed by CORS policy');
      error.status = 403;
      callback(error);
    }
  },
  credentials: true
}));

// Cookie-authenticated state changes must originate from the configured web
// app. CORS alone does not stop cross-site HTML forms when SameSite=None is
// required for a separately hosted frontend.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const hasSessionCookie = String(req.headers.cookie || '')
    .split(';')
    .some((part) => part.trim().startsWith('ueh_tcc_session='));
  if (!hasSessionCookie) return next();

  const origin = req.get('origin');
  if (origin && allowedOrigins.has(origin)) return next();
  if (process.env.NODE_ENV !== 'production' && !origin) return next();

  return res.status(403).json({
    success: false,
    code: 'CSRF_ORIGIN_REJECTED',
    message: 'Nguồn yêu cầu không hợp lệ.'
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', authRoutes);
app.use('/api', resourceRoutes);
app.use('/api', contactRoutes);
app.use('/api', blogEngagementRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', communityRoutes);
app.use('/api', courseContentRoutes);
app.use('/', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const database = getDatabaseStatus();
  const passwordReset = getPasswordResetReadiness();
  res.json({
    status: database.status === 'connected' ? 'ok' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.round(process.uptime()),
    database,
    passwordReset: {
      status: passwordReset.status
    }
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    code: 'API_NOT_FOUND',
    message: 'API endpoint does not exist.'
  });
});

// Centralized error handling (prevents leaking internal stack traces in production F12)
app.use((err, req, res, next) => {
  console.error('[Error caught by Global Handler]:', err.message);
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = status < 500 || process.env.NODE_ENV === 'development'
    ? (err.message || 'Request failed.')
    : 'An internal server error occurred.';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Resolve the storage mode before accepting requests. This prevents early
// requests from being written to the local fallback and then disappearing
// when MongoDB becomes active a few seconds later.
export const startServer = async () => {
  try {
    reportPasswordResetReadiness();
    await connectDB(runAutoMigration);
    const server = app.listen(PORT, () => {
      console.log(`🚀 Backend Server is running on port ${PORT}`);
      console.log(`👉 API Health: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Backend is already running on port ${PORT}. Reuse it instead of starting a second instance.`);
        console.error(`Health check: http://localhost:${PORT}/api/health`);
        process.exit(1);
      } else {
        console.error('Backend server error:', error);
      }
    });
    return server;
  } catch (error) {
    console.error('Lỗi khởi động backend:', error);
    throw error;
  }
};

const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entryFile === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error('Backend failed to start:', error);
    process.exitCode = 1;
  });
}

export { app };
