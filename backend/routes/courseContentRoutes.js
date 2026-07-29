import express from 'express';
import { getCourseLessonContent } from '../controllers/courseContentController.js';

const router = express.Router();

router.get('/courses/:courseId/lessons/:lessonId/content', getCourseLessonContent);

export default router;
