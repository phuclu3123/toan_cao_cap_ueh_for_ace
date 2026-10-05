import express from 'express';
import { signup, login, syncFirebaseAuth, forgotPassword, resetPassword, updateProfile, exchangeGithubToken, getMe } from '../controllers/authController.js';
import { getCurrentSession, logoutSession } from '../controllers/sessionController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  authenticationRateLimit,
  createRateLimit,
  firebaseSyncRateLimit,
  sessionWriteRateLimit
} from '../middleware/rateLimit.js';
import { normalizeIdentifier } from '../utils/roles.js';

const router = express.Router();

const passwordResetRateLimit = createRateLimit({
  namespace: 'password-reset',
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: (req) => `${req.ip || req.socket?.remoteAddress || 'unknown'}:${normalizeIdentifier(req.body?.email)}`,
  message: 'Bạn đã yêu cầu khôi phục mật khẩu quá nhiều lần. Vui lòng thử lại sau.'
});

const profileWriteRateLimit = createRateLimit({
  namespace: 'profile-write',
  windowMs: 10 * 60 * 1000,
  max: 30
});

router.get('/auth/me', requireAuth, getMe);
router.get('/auth/session', requireAuth, getCurrentSession);
router.post('/auth/logout', sessionWriteRateLimit, logoutSession);
router.post('/signup', authenticationRateLimit, signup);
router.post('/login', authenticationRateLimit, login);
router.post('/auth/sync', firebaseSyncRateLimit, syncFirebaseAuth);
router.post('/auth/forgot-password', passwordResetRateLimit, forgotPassword);
router.post('/auth/reset-password', passwordResetRateLimit, resetPassword);
router.post('/auth/update-profile', requireAuth, profileWriteRateLimit, updateProfile);
router.post('/auth/github/token', authenticationRateLimit, exchangeGithubToken);

export default router;
