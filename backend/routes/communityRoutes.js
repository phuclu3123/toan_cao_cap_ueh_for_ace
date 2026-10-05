import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleUpvotePost,
  addAnswer,
  voteAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  addCommentToAnswer,
  updateComment,
  deleteComment,
  getLeaderboard,
  getStats
} from '../controllers/communityController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Question routes
router.get('/community/posts', getPosts);
router.get('/community/posts/:id', getPostById);
router.post('/community/posts', requireAuth, createPost);
router.put('/community/posts/:id', requireAuth, updatePost);
router.delete('/community/posts/:id', requireAuth, deletePost);
router.post('/community/posts/:id/upvote', requireAuth, toggleUpvotePost);

// Answer routes
router.post('/community/posts/:id/answers', requireAuth, addAnswer);
router.post('/community/posts/:id/answers/:answerId/vote', requireAuth, voteAnswer);
router.put('/community/posts/:id/answers/:answerId', requireAuth, updateAnswer);
router.delete('/community/posts/:id/answers/:answerId', requireAuth, deleteAnswer);
router.post('/community/posts/:id/answers/:answerId/accept', requireAuth, acceptAnswer);
router.post('/community/posts/:id/answers/:answerId/comments', requireAuth, addCommentToAnswer);
router.put('/community/posts/:id/answers/:answerId/comments/:commentId', requireAuth, updateComment);
router.delete('/community/posts/:id/answers/:answerId/comments/:commentId', requireAuth, deleteComment);

// Stats & Leaderboard
router.get('/community/leaderboard', getLeaderboard);
router.get('/community/stats', getStats);

export default router;
