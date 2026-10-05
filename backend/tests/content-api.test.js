import assert from 'node:assert/strict';
import test from 'node:test';

import communityRoutes from '../routes/communityRoutes.js';
import resourceRoutes from '../routes/resourceRoutes.js';
import {
  createPost,
  deletePost,
  updatePost
} from '../controllers/communityController.js';
import {
  createResource,
  getResources,
  incrementResourceView
} from '../controllers/resourceController.js';
import { createBlogComment, updateBlogReaction } from '../controllers/blogEngagementController.js';
import { subscribe, submitContact } from '../controllers/contactController.js';
import BlogEngagement from '../models/BlogEngagement.js';
import CommunityPost from '../models/CommunityPost.js';
import Resource from '../models/Resource.js';

const createResponse = () => ({
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

const student = {
  id: 'content-api-student',
  username: 'content-api-student@example.com',
  name: 'Content API Student',
  role: 'Student'
};

const owner = {
  id: 'owner-user',
  username: 'luphuc321@gmail.com',
  name: 'System Owner',
  role: 'Admin'
};

const routeMiddlewareNames = (router, path, method) => {
  const layer = router.stack.find(
    (entry) => entry.route?.path === path && entry.route.methods[method]
  );
  return layer?.route?.stack.map((entry) => entry.handle.name) || [];
};

test('destructive community routes and resource upload require authentication', () => {
  assert.ok(routeMiddlewareNames(communityRoutes, '/community/posts/:id', 'delete').includes('requireAuth'));
  assert.ok(routeMiddlewareNames(communityRoutes, '/community/posts/:id/answers/:answerId', 'put').includes('requireAuth'));
  assert.ok(routeMiddlewareNames(communityRoutes, '/community/posts/:id/answers/:answerId/comments/:commentId', 'delete').includes('requireAuth'));
  assert.ok(routeMiddlewareNames(resourceRoutes, '/resources', 'post').includes('requireAuth'));
});

test('mutable content models detect concurrent writes and resource views are persisted fields', () => {
  assert.equal(CommunityPost.schema.options.optimisticConcurrency, true);
  assert.equal(BlogEngagement.schema.options.optimisticConcurrency, true);
  assert.ok(Resource.schema.path('views'));
});

test('community post ownership is derived from the authenticated session', async () => {
  const createRes = createResponse();
  await createPost({
    authUser: student,
    body: {
      title: 'Một câu hỏi kiểm thử hợp lệ',
      content: 'Nội dung câu hỏi kiểm thử đủ dài để được máy chủ chấp nhận.',
      subject: 'calc1',
      difficulty: 'standard',
      author: { id: 'spoofed-owner', email: owner.username, isAdmin: true }
    }
  }, createRes);

  assert.equal(createRes.statusCode, 201);
  assert.equal(createRes.payload.post.author.id, student.id);
  const postId = createRes.payload.post.id;

  const forbiddenRes = createResponse();
  await updatePost({
    params: { id: postId },
    authUser: { id: 'other-user', username: 'other@example.com', role: 'Student' },
    body: { title: 'Một tiêu đề bị sửa trái phép' }
  }, forbiddenRes);
  assert.equal(forbiddenRes.statusCode, 403);

  const ownerUpdateRes = createResponse();
  await updatePost({
    params: { id: postId },
    authUser: owner,
    body: { title: 'Tiêu đề do chủ sở hữu cập nhật' }
  }, ownerUpdateRes);
  assert.equal(ownerUpdateRes.statusCode, 200);

  const deleteRes = createResponse();
  await deletePost({ params: { id: postId }, authUser: student, body: {} }, deleteRes);
  assert.equal(deleteRes.statusCode, 200);
});

test('resource catalog works without MongoDB and upload cannot trust body role fields', async () => {
  const listRes = createResponse();
  await getResources({}, listRes);
  assert.equal(listRes.statusCode, 200);
  assert.equal(listRes.payload.success, true);
  assert.ok(listRes.payload.resources.documentsData.length > 0);

  const spoofedRes = createResponse();
  await createResource({
    authUser: student,
    body: {
      type: 'documentsData',
      item: { title: 'Spoofed upload' },
      adminRole: 'Admin',
      email: owner.username
    }
  }, spoofedRes);
  assert.equal(spoofedRes.statusCode, 403);

  const offlineOwnerRes = createResponse();
  await createResource({
    authUser: owner,
    body: { type: 'documentsData', item: { title: 'Tài liệu hợp lệ' } }
  }, offlineOwnerRes);
  assert.equal(offlineOwnerRes.statusCode, 503);

  const viewRes = createResponse();
  await incrementResourceView({ params: { id: 'ap1' } }, viewRes);
  assert.equal(viewRes.statusCode, 202);
  assert.equal(viewRes.payload.success, true);
});

test('public forms and blog writes reject malformed input before storage', async () => {
  const subscribeRes = createResponse();
  await subscribe({ body: { email: 'not-an-email' } }, subscribeRes);
  assert.equal(subscribeRes.statusCode, 400);

  const contactRes = createResponse();
  await submitContact({ body: { name: 'A', email: 'bad', message: 'x' } }, contactRes);
  assert.equal(contactRes.statusCode, 400);

  const reactionRes = createResponse();
  await updateBlogReaction({
    params: { slug: 'valid-blog-slug' },
    body: { clientId: 'x', reaction: 'love' }
  }, reactionRes);
  assert.equal(reactionRes.statusCode, 400);

  const commentRes = createResponse();
  await createBlogComment({
    params: { slug: '../invalid' },
    body: { clientId: 'reader-12345678', authorName: 'Reader', content: 'A comment' }
  }, commentRes);
  assert.equal(commentRes.statusCode, 400);
});
