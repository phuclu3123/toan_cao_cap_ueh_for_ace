import express from 'express';
import { subscribe, submitContact } from '../controllers/contactController.js';
import { publicFormRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/subscribe', publicFormRateLimit, subscribe);
router.post('/contact', publicFormRateLimit, submitContact);

export default router;
