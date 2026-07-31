import express from 'express';
import { signup, login, syncFirebaseAuth, forgotPassword, resetPassword, updateProfile, exchangeGithubToken, getMe } from '../controllers/authController.js';

import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/auth/me', requireAuth, getMe);
router.post('/signup', signup);
router.post('/login', login);
router.post('/auth/sync', syncFirebaseAuth);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/update-profile', updateProfile);
router.post('/auth/github/token', exchangeGithubToken);

export default router;
