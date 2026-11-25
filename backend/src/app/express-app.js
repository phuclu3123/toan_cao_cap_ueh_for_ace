import express from 'express';
import cors from 'cors';
import authRoutes from '../modules/identity/http/authRoutes.js';
import resourceRoutes from '../modules/resources/http/resourceRoutes.js';
import contactRoutes from '../modules/contact/http/contactRoutes.js';
import paymentRoutes from '../modules/commerce/payments/http/paymentRoutes.js';
import supportPaymentRoutes from '../modules/commerce/payments/http/supportPaymentRoutes.js';
import blogEngagementRoutes from '../modules/blog/http/blogEngagementRoutes.js';
import enrollmentRoutes from '../modules/access/http/enrollmentRoutes.js';
import communityRoutes from '../modules/community/http/communityRoutes.js';
import notificationRoutes from '../modules/notifications/http/notificationRoutes.js';
import notificationDeliveryRoutes from '../modules/notifications/http/deliveryRoutes.js';
import courseContentRoutes from '../modules/learning/http/courseContentRoutes.js';
import studyContentRoutes from '../modules/learning/http/studyContentRoutes.js';
import flashcardAccessRoutes from '../modules/access/http/flashcardAccessRoutes.js';
import courseAccessRoutes from '../modules/access/http/courseAccessRoutes.js';
import courseCommerceRoutes from '../modules/commerce/http/courseCommerceRoutes.js';
import { getDatabaseStatus } from '../platform/database/db.js';
import { getPasswordResetReadiness } from '../modules/identity/index.js';
import { commerceReady } from '../modules/commerce/index.js';
import { handleApplicationError } from './http-errors.js';

// Shared HTTP perimeter for both legacy routes and native Nest controllers.
export function createExpressApp({ nativeResources = true } = {}) {
 const app = express();
 if (process.env.NODE_ENV === 'production') {
  const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '1', 10);
  app.set('trust proxy', Number.isInteger(trustProxyHops) && trustProxyHops >= 0 ? trustProxyHops : 1);
}

// Security hardening
app.disable('x-powered-by');
app.set('query parser', 'extended'); // Preserve Express 4 query semantics.

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
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5000'
];
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(process.env.NODE_ENV === 'production' ? [] : developmentOrigins)
]);

const applicationCors=cors({
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
});
// Public signed unsubscribe works from email clients and same-origin HTML
// forms on the API host; it never reads session credentials or personal data.
app.use((req,res,next)=>req.path==='/api/notification-email/unsubscribe'?next():applicationCors(req,res,next));

// Cookie-authenticated state changes must originate from the configured web
// app. CORS alone does not stop cross-site HTML forms when SameSite=None is
// required for a separately hosted frontend.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if(req.method==='POST' && req.path==='/api/notification-email/unsubscribe') return next(); // Signed, scope-limited one-click unsubscribe.

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
// Express 4 supplied an empty object when no body was parsed. Preserve that
// contract for existing login/key/payment handlers while using Express 5.
app.use((req, _res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// Routes
// Hosting probes use both GET and HEAD at the service origin.
// Keep liveness separate from /api/health, which reports dependency readiness.
app.get('/', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ service: 'M4A API', status: 'running', health: '/api/health' });
});
app.use('/api', authRoutes);
if (!nativeResources) app.use('/api', resourceRoutes);
app.use('/api', contactRoutes);
app.use('/api', blogEngagementRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', communityRoutes);
app.use('/api', notificationRoutes);
app.use('/api', notificationDeliveryRoutes);
app.use('/api', courseContentRoutes);
app.use('/api', studyContentRoutes);
app.use('/api', flashcardAccessRoutes);
app.use('/api', courseAccessRoutes);
app.use('/api', courseCommerceRoutes);
app.use('/', paymentRoutes);
app.use('/', supportPaymentRoutes);


 // Health check endpoint
app.get('/api/health', (req, res) => {
  const database = getDatabaseStatus();
  const passwordReset = getPasswordResetReadiness();
  res.json({
    status: database.status === 'connected' ? 'ok' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.round(process.uptime()),
    database,
    courseCommerce: { ready: commerceReady() },
    passwordReset: {
      status: passwordReset.status
    }
  });
});


 app.use(handleApplicationError);
 return app;
}
