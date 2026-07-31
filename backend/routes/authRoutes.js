import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, syncFirebaseAuth, forgotPassword, resetPassword, updateProfile, exchangeGithubToken, getMe } from '../controllers/authController.js';

import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: { success: false, message: 'Quá nhiều yêu cầu đăng nhập/đăng ký từ IP này, vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/auth/me', requireAuth, getMe);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/auth/sync', authLimiter, syncFirebaseAuth);
router.post('/auth/forgot-password', authLimiter, forgotPassword);
router.post('/auth/reset-password', authLimiter, resetPassword);
router.post('/auth/update-profile', updateProfile);
router.post('/auth/github/token', authLimiter, exchangeGithubToken);

export default router;
