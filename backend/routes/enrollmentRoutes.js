import express from 'express';
import {
  getMyCourseAccess,
  getMyEnrollments
} from '../controllers/enrollmentController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/enrollments/me', requireAuth, getMyEnrollments);
router.get('/courses/:courseId/access', requireAuth, getMyCourseAccess);

export default router;

