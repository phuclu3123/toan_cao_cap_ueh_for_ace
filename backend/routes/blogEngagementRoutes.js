import express from 'express';
import {
  createBlogComment,
  getBlogEngagement,
  toggleCommentLike,
  updateBlogReaction,
} from '../controllers/blogEngagementController.js';

const router = express.Router();

router.get('/blog/:slug/engagement', getBlogEngagement);
router.post('/blog/:slug/reactions', updateBlogReaction);
router.post('/blog/:slug/comments', createBlogComment);
router.post('/blog/:slug/comments/:commentId/like', toggleCommentLike);

export default router;
