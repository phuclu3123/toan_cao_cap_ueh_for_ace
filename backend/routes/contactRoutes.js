import express from 'express';
import { subscribe, submitContact } from '../controllers/contactController.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/contact', submitContact);

export default router;
