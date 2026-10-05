import express from 'express';
import { subscribe, submitContact } from '../controllers/contactController.js';
import { createRateLimit } from '../middleware/rateLimit.js';

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

router.post('/subscribe', subscribeRateLimit, subscribe);
router.post('/contact', contactRateLimit, submitContact);

export default router;
