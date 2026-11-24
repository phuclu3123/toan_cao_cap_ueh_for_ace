import express from 'express';
import { requireTurnstile } from '../../../platform/http/turnstile.js';
import { signup, login, syncFirebaseAuth, forgotPassword, resetPassword, updateProfile, exchangeGithubToken, getAuthProviders, getMe } from './authController.js';
import { getCurrentSession, logoutSession } from './sessionController.js';
import { requireAuth } from './requireAuth.js';
import {
  authenticationRateLimit,
  createRateLimit,
  firebaseSyncRateLimit,
  sessionWriteRateLimit
} from '../../../platform/http/rateLimit.js';
import { normalizeIdentifier } from '../domain/roles.js';
import { refreshFirebaseSession } from './authController.js';

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
router.post('/signup', authenticationRateLimit, requireTurnstile('register'), signup);
router.post('/login', authenticationRateLimit, requireTurnstile('login'), login);
router.get('/auth/providers', getAuthProviders);
router.post('/auth/sync', firebaseSyncRateLimit, syncFirebaseAuth);
router.post('/auth/session/refresh', firebaseSyncRateLimit, requireAuth, refreshFirebaseSession);
router.post('/auth/forgot-password', passwordResetRateLimit, requireTurnstile('reset_request'), forgotPassword);
router.post('/auth/reset-password', passwordResetRateLimit, resetPassword);
router.post('/auth/update-profile', requireAuth, profileWriteRateLimit, updateProfile);
router.post('/auth/github/token', authenticationRateLimit, exchangeGithubToken);

export default router;
