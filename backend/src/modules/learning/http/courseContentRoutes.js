import express from 'express';
import { getCourseLessonContent } from './courseContentController.js';

const router = express.Router();

router.get('/courses/:courseId/lessons/:lessonId/content', getCourseLessonContent);

export default router;
