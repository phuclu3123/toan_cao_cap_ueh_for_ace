import express from 'express';
import {
  claimLegacyOrder,
  confirmWebhook,
  createOrder,
  getPaymentStatus,
  handleWebhook
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { createRateLimit, paymentWriteRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

const paymentReadRateLimit = createRateLimit({
  namespace: 'payment-read',
  windowMs: 60 * 1000,
  max: 90,
  message: 'Bạn đang kiểm tra giao dịch quá nhanh. Vui lòng chờ một chút.'
});

const webhookRateLimit = createRateLimit({
  namespace: 'payos-webhook',
  windowMs: 60 * 1000,
  max: 180,
  message: 'Webhook rate limit exceeded.'
});

router.get('/api/payos/webhook', (_req, res) => {
  res.json({
    success: true,
    message: 'payOS webhook endpoint is ready.',
    method: 'POST',
    path: '/api/payos/webhook'
  });
});

// Canonical checkout contract used by the React application.
router.post('/api/orders', requireAuth, paymentWriteRateLimit, createOrder);
router.post('/api/orders/claim-legacy', requireAuth, paymentWriteRateLimit, claimLegacyOrder);
router.get('/api/orders/:orderCode', requireAuth, paymentReadRateLimit, getPaymentStatus);

// Backward-compatible aliases retain the same authentication and server-side
// pricing rules; no legacy route may accept client-supplied amounts.
router.post('/api/payos/create-payment', requireAuth, paymentWriteRateLimit, createOrder);
router.get(
  ['/api/payments/:orderCode', '/api/payos/payments/:orderCode'],
  requireAuth,
  paymentReadRateLimit,
  getPaymentStatus
);

router.post('/api/payos/webhook', webhookRateLimit, handleWebhook);
router.post('/api/payos/confirm-webhook', paymentWriteRateLimit, confirmWebhook);

const frontendPaymentResultUrl = (req, cancelled) => {
  const configuredFrontend = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  if (!configuredFrontend && process.env.NODE_ENV === 'production') {
    const error = new Error('Frontend URL is not configured.');
    error.status = 503;
    throw error;
  }
  const configuredBase = configuredFrontend || 'http://localhost:5173';
  const target = new URL('/payment/result', configuredBase);
  if (!['http:', 'https:'].includes(target.protocol)) {
    const error = new Error('Frontend URL must use HTTP or HTTPS.');
    error.status = 503;
    throw error;
  }
  const orderCode = Number(req.query.orderCode);
  if (Number.isSafeInteger(orderCode) && orderCode > 0) {
    target.searchParams.set('orderCode', String(orderCode));
  }
  if (cancelled) target.searchParams.set('cancelled', '1');
  return target.toString();
};

// These legacy callback endpoints are presentation-only. They deliberately do
// not mutate payment state; only a verified webhook or server-to-server PayOS
// reconciliation can mark an order as paid.
router.get('/payment/success', (req, res, next) => {
  try {
    return res.redirect(302, frontendPaymentResultUrl(req, false));
  } catch (error) {
    return next(error);
  }
});

router.get('/payment/cancel', (req, res, next) => {
  try {
    return res.redirect(302, frontendPaymentResultUrl(req, true));
  } catch (error) {
    return next(error);
  }
});

export default router;
