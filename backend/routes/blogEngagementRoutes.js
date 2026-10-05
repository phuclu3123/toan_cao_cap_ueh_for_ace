import express from 'express';
import {
  createBlogComment,
  getBlogEngagement,
  toggleCommentLike,
  updateBlogReaction,
} from '../controllers/blogEngagementController.js';
import { createRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const blogReactionRateLimit = createRateLimit({
  namespace: 'blog-reaction',
  windowMs: 60 * 60 * 1000,
  max: 120
});
const blogCommentRateLimit = createRateLimit({
  namespace: 'blog-comment',
  windowMs: 60 * 60 * 1000,
  max: 15
});
const blogLikeRateLimit = createRateLimit({
  namespace: 'blog-comment-like',
  windowMs: 60 * 60 * 1000,
  max: 120
});

router.get('/blog/:slug/engagement', getBlogEngagement);
router.post('/blog/:slug/reactions', blogReactionRateLimit, updateBlogReaction);
router.post('/blog/:slug/comments', blogCommentRateLimit, createBlogComment);
router.post('/blog/:slug/comments/:commentId/like', blogLikeRateLimit, toggleCommentLike);

export default router;
