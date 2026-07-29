import express from 'express';
import {
  confirmWebhook,
  claimLegacyPayment,
  createPayment,
  getPaymentStatus,
  handleWebhook
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { paymentWriteRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

const getFrontendBaseUrl = () => (
  process.env.FRONTEND_URL
  || process.env.APP_BASE_URL
  || 'https://toancaocapueh.id.vn'
).replace(/\/+$/, '');

const redirectToPaymentResult = (req, res, cancelled = false) => {
  const orderCode = Number(req.query.orderCode);
  const query = new URLSearchParams();

  if (Number.isSafeInteger(orderCode) && orderCode > 0) {
    query.set('orderCode', String(orderCode));
  }
  if (cancelled) {
    query.set('cancelled', '1');
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return res.redirect(303, `${getFrontendBaseUrl()}/payment/result${suffix}`);
};

router.get('/api/payos/webhook', (req, res) => {
  res.json({
    success: true,
    message: 'payOS webhook endpoint is ready.',
    method: 'POST',
    path: '/api/payos/webhook'
  });
});

router.post(
  ['/api/orders', '/api/payos/create-payment'],
  requireAuth,
  paymentWriteRateLimit,
  createPayment
);
router.post(
  '/api/orders/claim-legacy',
  requireAuth,
  paymentWriteRateLimit,
  claimLegacyPayment
);
router.post('/api/payos/webhook', handleWebhook);
router.post('/api/payos/confirm-webhook', confirmWebhook);
router.get(
  [
    '/api/orders/:orderCode',
    '/api/payments/:orderCode',
    '/api/payos/payments/:orderCode'
  ],
  requireAuth,
  getPaymentStatus
);

// Legacy PayOS return URLs are deliberately read-only. A browser redirect is
// never evidence that money was received; only a verified webhook or an
// authenticated server-to-server PayOS reconciliation can change an order.
router.get('/payment/success', (req, res) => redirectToPaymentResult(req, res));
router.get('/payment/cancel', (req, res) => redirectToPaymentResult(req, res, true));

export default router;
