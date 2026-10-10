import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleUpvotePost,
  toggleSavePost,
  getSavedPostIds,
  reportCommunityContent,
  addAnswer,
  voteAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  addCommentToAnswer,
  updateComment,
  deleteComment,
  getLeaderboard,
  getStats,
  getCommunityUserProfile
} from '../controllers/communityController.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';
import { createRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const canonicalUserKey = (req) => req.authUser?.id || req.authUser?.uid || req.ip;
const communityReadRateLimit = createRateLimit({
  namespace: 'community-read',
  windowMs: 15 * 60 * 1000,
  max: 300
});
const communityPublishRateLimit = createRateLimit({
  namespace: 'community-publish',
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyGenerator: canonicalUserKey,
  message: 'Bạn đã đăng quá nhiều nội dung. Vui lòng chờ trước khi tiếp tục.'
});
const communityInteractionRateLimit = createRateLimit({
  namespace: 'community-interaction',
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: canonicalUserKey
});

// Question routes
router.get('/community/posts', communityReadRateLimit, optionalAuth, getPosts);
router.get('/community/saved', requireAuth, communityReadRateLimit, getSavedPostIds);
router.get('/community/posts/:id', communityReadRateLimit, optionalAuth, getPostById);
router.post('/community/posts', requireAuth, communityPublishRateLimit, createPost);
router.put('/community/posts/:id', requireAuth, communityInteractionRateLimit, updatePost);
router.delete('/community/posts/:id', requireAuth, communityInteractionRateLimit, deletePost);
router.post('/community/posts/:id/upvote', requireAuth, communityInteractionRateLimit, toggleUpvotePost);
router.post('/community/posts/:id/save', requireAuth, communityInteractionRateLimit, toggleSavePost);
router.post('/community/reports', requireAuth, communityPublishRateLimit, reportCommunityContent);

// Answer routes
router.post('/community/posts/:id/answers', requireAuth, communityPublishRateLimit, addAnswer);
router.post('/community/posts/:id/answers/:answerId/vote', requireAuth, communityInteractionRateLimit, voteAnswer);
router.put('/community/posts/:id/answers/:answerId', requireAuth, communityInteractionRateLimit, updateAnswer);
router.delete('/community/posts/:id/answers/:answerId', requireAuth, communityInteractionRateLimit, deleteAnswer);
router.post('/community/posts/:id/answers/:answerId/accept', requireAuth, communityInteractionRateLimit, acceptAnswer);
router.post('/community/posts/:id/answers/:answerId/comments', requireAuth, communityPublishRateLimit, addCommentToAnswer);
router.put('/community/posts/:id/answers/:answerId/comments/:commentId', requireAuth, communityInteractionRateLimit, updateComment);
router.delete('/community/posts/:id/answers/:answerId/comments/:commentId', requireAuth, communityInteractionRateLimit, deleteComment);

// Stats & Leaderboard
router.get('/community/leaderboard', communityReadRateLimit, getLeaderboard);
router.get('/community/stats', communityReadRateLimit, getStats);
router.get('/community/users/:id', communityReadRateLimit, optionalAuth, getCommunityUserProfile);

export default router;
