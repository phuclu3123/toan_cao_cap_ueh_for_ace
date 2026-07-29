import express from 'express';
import { signup, login, syncFirebaseAuth, forgotPassword, resetPassword, updateProfile, exchangeGithubToken } from '../controllers/authController.js';
import { getCurrentSession, logoutSession } from '../controllers/sessionController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  authenticationRateLimit,
  firebaseSyncRateLimit
} from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/signup', authenticationRateLimit, signup);
router.post('/login', authenticationRateLimit, login);
router.post('/auth/sync', firebaseSyncRateLimit, syncFirebaseAuth);
router.get('/auth/me', requireAuth, getCurrentSession);
router.post('/auth/logout', logoutSession);
router.post('/auth/forgot-password', authenticationRateLimit, forgotPassword);
router.post('/auth/reset-password', authenticationRateLimit, resetPassword);
router.post('/auth/update-profile', requireAuth, updateProfile);
router.post('/auth/github/token', authenticationRateLimit, exchangeGithubToken);

export default router;
