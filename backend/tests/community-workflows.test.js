import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import {
  createPost, getPostById, deletePost, addAnswer, updateAnswer, deleteAnswer,
  acceptAnswer, toggleUpvotePost, voteAnswer, toggleSavePost, getSavedPostIds, getCommunityTags
} from '../src/modules/community/http/communityController.js';

const asker = { id: 'qa-workflow-asker', username: 'qa-asker@example.test', name: 'Asker', role: 'Student' };
const solver = { id: 'qa-workflow-solver', username: 'qa-solver@example.test', name: 'Solver', role: 'Student' };
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
const response = () => ({ statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(payload) { this.payload = payload; return this; } });
async function call(fn, user, params = {}, body = {}) {
  const res = response(); await fn({ authUser: user, params, body }, res); return res;
}

test('question, image answer, votes, acceptance and bookmarks complete without touching real accounts', async () => {
  assert.equal(mongoose.connection.readyState, 0);
  process.env.ALLOW_COMMUNITY_MEMORY_WRITES = 'true';
  const created = await call(createPost, asker, {}, { title: 'Kiểm tra định thức ma trận', content: 'Cho ma trận vuông A. Tìm định thức và giải thích các bước biến đổi.', subject: 'algebra', difficulty: 'standard', tags: ['MaTran'] });
  assert.equal(created.statusCode, 201);
  const id = created.payload.post.id;
  try {
    assert.equal(created.payload.post.canManage, true);
    const stranger = await call(getPostById, solver, { id });
    assert.equal(stranger.payload.post.canManage, false);
    const answered = await call(addAnswer, solver, { id }, { content: '<p>Ta biến đổi sơ cấp để được ma trận tam giác.</p>', image, altText: 'Sơ đồ biến đổi' });
    assert.equal(answered.statusCode, 201);
    assert.equal(answered.payload.answer.image, image);
    assert.equal(answered.payload.answer.canManage, true);
    const answerId = answered.payload.answer.id;
    assert.equal((await call(updateAnswer, asker, { id, answerId }, { content: 'Không được sửa lời giải của người khác.' })).statusCode, 403);
    const edited = await call(updateAnswer, solver, { id, answerId }, { content: 'Lấy tích các phần tử trên đường chéo chính.' });
    assert.equal(edited.payload.answer.image, image, 'text edit preserves attachment');
    assert.equal((await call(acceptAnswer, solver, { id, answerId })).statusCode, 403);
    const accepted = await call(acceptAnswer, asker, { id, answerId });
    assert.equal(accepted.payload.post.isAccepted, true);
    const up = await call(toggleUpvotePost, solver, { id }, { voteType: 'up' });
    assert.equal(up.payload.upvotes, 1);
    const undo = await call(toggleUpvotePost, solver, { id }, { voteType: 'up' });
    assert.equal(undo.payload.upvotes, 0);
    const answerVote = await call(voteAnswer, asker, { id, answerId }, { voteType: 'up' });
    assert.equal(answerVote.payload.upvotes, 1);
    await call(toggleSavePost, solver, { id });
    assert.ok((await call(getSavedPostIds, solver)).payload.savedPostIds.includes(id));
    assert.ok(!(await call(getSavedPostIds, asker)).payload.savedPostIds.includes(id));
    const removed = await call(deleteAnswer, solver, { id, answerId });
    assert.equal(removed.payload.post.answers.length, 0);
    assert.equal(removed.payload.post.isAccepted, false);
  } finally {
    await call(deletePost, asker, { id });
    delete process.env.ALLOW_COMMUNITY_MEMORY_WRITES;
  }
});

test('disconnected storage never reports a successful save by default', async () => {
  delete process.env.ALLOW_COMMUNITY_MEMORY_WRITES;
  const res = await call(createPost, asker, {}, { title: 'Không được lưu giả', content: 'Nội dung này phải giữ ở form khi dữ liệu không kết nối.' });
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.code, 'COMMUNITY_STORE_UNAVAILABLE');
});

test('tag directory filters and paginates the actual posts rather than a fixed list', async () => {
  process.env.ALLOW_COMMUNITY_MEMORY_WRITES = 'true';
  const res = response();
  await getCommunityTags({ query: { search: 'lagrange', page: '1', limit: '1' } }, res);
  assert.equal(res.statusCode, 200);
  assert.ok(res.payload.tags.every(item => item.tag.includes('lagrange')));
  assert.ok(res.payload.tags.length <= 1);
  assert.ok(res.payload.tags.every(item => item.count > 0));
  assert.equal(res.payload.degraded, true);
  delete process.env.ALLOW_COMMUNITY_MEMORY_WRITES;
});
