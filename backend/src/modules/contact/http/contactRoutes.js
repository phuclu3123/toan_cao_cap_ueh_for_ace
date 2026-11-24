import express from 'express';
import { requireTurnstile } from '../../../platform/http/turnstile.js';
import { subscribe, submitContact } from './contactController.js';
import { createRateLimit } from '../../../platform/http/rateLimit.js';

const router = express.Router();
const subscribeRateLimit = createRateLimit({
  namespace: 'newsletter-subscribe',
  windowMs: 60 * 60 * 1000,
  max: 20
});
const contactRateLimit = createRateLimit({
  namespace: 'contact-submit',
  windowMs: 60 * 60 * 1000,
  max: 8
});

router.post('/subscribe', subscribeRateLimit, requireTurnstile('subscribe'), subscribe);
router.post('/contact', contactRateLimit, requireTurnstile('contact'), submitContact);

export default router;
