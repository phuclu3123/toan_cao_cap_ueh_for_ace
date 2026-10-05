import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addCommentToAnswer,
  updateComment,
  deleteComment,
  SEED_COMMUNITY_POSTS
} from '../controllers/communityController.js';

const createMockRes = () => ({
  statusCode: 200,
  payload: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  }
});

const owner = {
  id: 'comment-test-user',
  username: 'comment-owner@example.com',
  name: 'Comment Owner',
  role: 'Student'
};

test('comment CRUD uses the authenticated actor, exact ids, and ownership checks', async () => {
  const samplePost = SEED_COMMUNITY_POSTS[0];
  const postId = samplePost.id;
  const answerId = samplePost.answers[0].id;

  const addRes = createMockRes();
  await addCommentToAnswer({
    params: { id: postId, answerId },
    authUser: owner,
    body: {
      content: 'Bài giải rất chuẩn xác và rõ ràng!',
      author: { id: 'spoofed-admin', isAdmin: true }
    }
  }, addRes);

  assert.equal(addRes.statusCode, 201);
  assert.equal(addRes.payload.success, true);
  assert.equal(addRes.payload.comment.author.id, owner.id);
  assert.notEqual(addRes.payload.comment.author.id, 'spoofed-admin');
  const commentId = addRes.payload.comment.id;

  const wrongUserRes = createMockRes();
  await updateComment({
    params: { id: postId, answerId, commentId },
    authUser: { id: 'different-user', username: 'different@example.com', role: 'Student' },
    body: { content: 'Không được phép sửa bình luận này.' }
  }, wrongUserRes);
  assert.equal(wrongUserRes.statusCode, 403);

  const updateRes = createMockRes();
  await updateComment({
    params: { id: postId, answerId, commentId },
    authUser: owner,
    body: { content: 'Nội dung đã cập nhật.' }
  }, updateRes);
  assert.equal(updateRes.statusCode, 200);
  assert.equal(updateRes.payload.comment.content, 'Nội dung đã cập nhật.');

  const missingAnswerRes = createMockRes();
  await addCommentToAnswer({
    params: { id: postId, answerId: 'missing-answer' },
    authUser: owner,
    body: { content: 'Không được gắn nhầm vào lời giải đầu tiên.' }
  }, missingAnswerRes);
  assert.equal(missingAnswerRes.statusCode, 404);

  const deleteRes = createMockRes();
  await deleteComment({
    params: { id: postId, answerId, commentId },
    authUser: owner,
    body: {}
  }, deleteRes);
  assert.equal(deleteRes.statusCode, 200);

  const secondDeleteRes = createMockRes();
  await deleteComment({
    params: { id: postId, answerId, commentId },
    authUser: owner,
    body: {}
  }, secondDeleteRes);
  assert.equal(secondDeleteRes.statusCode, 404);
});
