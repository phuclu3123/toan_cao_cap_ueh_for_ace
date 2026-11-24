import express from 'express';
import {
  getMyCourseAccess,
  getMyEnrollments
} from './enrollmentController.js';
import { requireAuth } from '../../identity/index.js';

const router = express.Router();

router.get('/enrollments/me', requireAuth, getMyEnrollments);
router.get('/courses/:courseId/access', requireAuth, getMyCourseAccess);

export default router;

