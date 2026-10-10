import assert from 'node:assert/strict';
import test from 'node:test';

import communityRoutes from '../routes/communityRoutes.js';
import resourceRoutes from '../routes/resourceRoutes.js';
import {
  createPost,
  deletePost,
  getCommunityUserProfile,
  getLeaderboard,
  getPosts,
  getSavedPostIds,
  getStats,
  reportCommunityContent,
  toggleSavePost,
  toggleUpvotePost,
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
  assert.ok(routeMiddlewareNames(communityRoutes, '/community/posts/:id/save', 'post').includes('requireAuth'));
  assert.ok(routeMiddlewareNames(communityRoutes, '/community/reports', 'post').includes('requireAuth'));
  assert.ok(routeMiddlewareNames(resourceRoutes, '/resources', 'post').includes('requireAuth'));
});

test('community routes apply authentication-aware rate limits', () => {
  const createStack = routeMiddlewareNames(communityRoutes, '/community/posts', 'post');
  const voteStack = routeMiddlewareNames(communityRoutes, '/community/posts/:id/upvote', 'post');
  const listStack = routeMiddlewareNames(communityRoutes, '/community/posts', 'get');

  assert.ok(createStack.includes('requireAuth'));
  assert.equal(createStack.length, 3);
  assert.ok(voteStack.includes('requireAuth'));
  assert.equal(voteStack.length, 3);
  assert.equal(listStack.length, 3);
  assert.ok(listStack.includes('optionalAuth'));
});

test('public community feeds omit private authors, voter identities, and answer bodies', async () => {
  const listRes = createResponse();
  await getPosts({ query: { page: 1, limit: 3 }, authUser: null }, listRes);

  assert.equal(listRes.statusCode, 200);
  assert.equal(listRes.payload.success, true);
  assert.ok(listRes.payload.posts.length > 0);
  for (const post of listRes.payload.posts) {
    assert.equal(Object.hasOwn(post.author, 'email'), false);
    assert.equal(Object.hasOwn(post, '_id'), false);
    assert.equal(Object.hasOwn(post, '__v'), false);
    assert.equal(Object.hasOwn(post, 'answers'), false);
    assert.deepEqual(post.upvotedBy, []);
    assert.deepEqual(post.downvotedBy, []);
    assert.equal(typeof post.answersCount, 'number');
  }
});

test('community leaderboard is calculated from stored contributions without emails', async () => {
  const leaderboardRes = createResponse();
  await getLeaderboard({}, leaderboardRes);

  assert.equal(leaderboardRes.statusCode, 200);
  assert.ok(leaderboardRes.payload.leaderboard.length > 0);
  for (const contributor of leaderboardRes.payload.leaderboard) {
    assert.equal(Object.hasOwn(contributor, 'email'), false);
    assert.equal(typeof contributor.points, 'number');
    assert.ok(contributor.points >= 0);
  }
});

test('community statistics include authoritative trending tags', async () => {
  const statsRes = createResponse();
  await getStats({}, statsRes);

  assert.equal(statsRes.statusCode, 200);
  assert.ok(Array.isArray(statsRes.payload.stats.trendingTags));
  assert.ok(statsRes.payload.stats.trendingTags.length > 0);
  for (const item of statsRes.payload.stats.trendingTags) {
    assert.equal(typeof item.tag, 'string');
    assert.ok(item.tag.length > 0);
    assert.ok(item.count > 0);
  }
});

test('community profiles are built from backend contributions instead of browser cache', async () => {
  const profileRes = createResponse();
  await getCommunityUserProfile({
    params: { id: 'user-phuc' },
    authUser: null
  }, profileRes);

  assert.equal(profileRes.statusCode, 200);
  assert.equal(profileRes.payload.profile.id, 'user-phuc');
  assert.ok(profileRes.payload.profile.postsCount > 0);
  assert.ok(profileRes.payload.posts.length > 0);
  assert.equal(Object.hasOwn(profileRes.payload.profile, 'email'), false);
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

test('community posts use the canonical account id and reject inline data images', async () => {
  const canonicalRes = createResponse();
  await createPost({
    authUser: {
      id: 'canonical-account-id',
      uid: 'provider-specific-id',
      username: 'canonical@example.com',
      name: 'Canonical User',
      role: 'Student'
    },
    body: {
      title: 'Câu hỏi kiểm thử mã tài khoản chuẩn',
      content: 'Nội dung hợp lệ đủ dài để tạo bài viết kiểm thử tài khoản chuẩn.',
      subject: 'calc1',
      difficulty: 'standard'
    }
  }, canonicalRes);

  assert.equal(canonicalRes.statusCode, 201);
  assert.equal(canonicalRes.payload.post.author.id, 'canonical-account-id');
  assert.equal(Object.hasOwn(canonicalRes.payload.post.author, 'email'), false);

  const unsafeRes = createResponse();
  await createPost({
    authUser: student,
    body: {
      title: 'Câu hỏi có ảnh nhúng không hợp lệ',
      content: '<p>Nội dung đủ dài</p><img src="data:image/png;base64,AAAA">',
      subject: 'calc1',
      difficulty: 'standard'
    }
  }, unsafeRes);
  assert.equal(unsafeRes.statusCode, 400);

  const deleteRes = createResponse();
  await deletePost({
    params: { id: canonicalRes.payload.post.id },
    authUser: { id: 'canonical-account-id', username: 'canonical@example.com', role: 'Student' },
    body: {}
  }, deleteRes);
  assert.equal(deleteRes.statusCode, 200);
});

test('community bookmarks are scoped to the authenticated canonical account', async () => {
  const createRes = createResponse();
  await createPost({
    authUser: student,
    body: {
      title: 'Bài viết kiểm thử chức năng lưu',
      content: 'Nội dung hợp lệ đủ dài để kiểm thử việc lưu bài vào tài khoản.',
      subject: 'calc1',
      difficulty: 'standard'
    }
  }, createRes);
  const postId = createRes.payload.post.id;

  const saveRes = createResponse();
  await toggleSavePost({ params: { id: postId }, authUser: student }, saveRes);
  assert.equal(saveRes.statusCode, 200);
  assert.equal(saveRes.payload.isSaved, true);

  const savedIdsRes = createResponse();
  await getSavedPostIds({ authUser: student }, savedIdsRes);
  assert.ok(savedIdsRes.payload.savedPostIds.includes(postId));

  const otherUserRes = createResponse();
  await getSavedPostIds({
    authUser: { id: 'different-bookmark-user', username: 'different-bookmark@example.com' }
  }, otherUserRes);
  assert.equal(otherUserRes.payload.savedPostIds.includes(postId), false);

  const unsaveRes = createResponse();
  await toggleSavePost({ params: { id: postId }, authUser: student }, unsaveRes);
  assert.equal(unsaveRes.payload.isSaved, false);

  const deleteRes = createResponse();
  await deletePost({ params: { id: postId }, authUser: student, body: {} }, deleteRes);
  assert.equal(deleteRes.statusCode, 200);
});

test('legacy provider ids are normalized when voting and saving with a canonical account', async () => {
  const legacyIdentity = {
    uid: 'legacy-provider-identity',
    username: 'legacy-provider@example.com',
    name: 'Legacy Provider',
    role: 'Student'
  };
  const canonicalIdentity = {
    id: 'canonical-provider-account',
    uid: 'legacy-provider-identity',
    username: 'legacy-provider@example.com',
    name: 'Legacy Provider',
    role: 'Student'
  };
  const createRes = createResponse();
  await createPost({
    authUser: legacyIdentity,
    body: {
      title: 'Bài viết kiểm thử định danh cũ',
      content: 'Nội dung hợp lệ dùng để kiểm thử chuyển đổi định danh nhà cung cấp.',
      subject: 'calc1',
      difficulty: 'standard'
    }
  }, createRes);
  const postId = createRes.payload.post.id;

  const firstVoteRes = createResponse();
  await toggleUpvotePost({ params: { id: postId }, authUser: legacyIdentity, body: { voteType: 'up' } }, firstVoteRes);
  assert.equal(firstVoteRes.payload.upvotes, 1);

  const canonicalVoteRes = createResponse();
  await toggleUpvotePost({ params: { id: postId }, authUser: canonicalIdentity, body: { voteType: 'up' } }, canonicalVoteRes);
  assert.equal(canonicalVoteRes.payload.upvotes, 0);
  assert.deepEqual(canonicalVoteRes.payload.upvotedBy, []);

  const firstSaveRes = createResponse();
  await toggleSavePost({ params: { id: postId }, authUser: legacyIdentity }, firstSaveRes);
  assert.equal(firstSaveRes.payload.isSaved, true);

  const canonicalSavedIdsRes = createResponse();
  await getSavedPostIds({ authUser: canonicalIdentity }, canonicalSavedIdsRes);
  assert.ok(canonicalSavedIdsRes.payload.savedPostIds.includes(postId));

  const canonicalProfileRes = createResponse();
  await getCommunityUserProfile({
    params: { id: canonicalIdentity.id },
    authUser: canonicalIdentity
  }, canonicalProfileRes);
  assert.equal(canonicalProfileRes.statusCode, 200);
  assert.equal(canonicalProfileRes.payload.profile.id, canonicalIdentity.id);
  assert.ok(canonicalProfileRes.payload.posts.some((post) => post.id === postId));

  const canonicalUnsaveRes = createResponse();
  await toggleSavePost({ params: { id: postId }, authUser: canonicalIdentity }, canonicalUnsaveRes);
  assert.equal(canonicalUnsaveRes.payload.isSaved, false);

  const deleteRes = createResponse();
  await deletePost({ params: { id: postId }, authUser: canonicalIdentity, body: {} }, deleteRes);
  assert.equal(deleteRes.statusCode, 200);
});

test('community reports validate target and reason before persistence', async () => {
  const invalidReasonRes = createResponse();
  await reportCommunityContent({
    authUser: student,
    body: { targetId: 'post-anything', reason: 'not-allowed', detail: '' }
  }, invalidReasonRes);
  assert.equal(invalidReasonRes.statusCode, 400);

  const unsafeDetailRes = createResponse();
  await reportCommunityContent({
    authUser: student,
    body: { targetId: 'post-anything', reason: 'spam', detail: '<script>alert(1)</script>' }
  }, unsafeDetailRes);
  assert.equal(unsafeDetailRes.statusCode, 400);
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
