import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/modules/identity/persistence/User.js';
import CommunityPost from '../src/modules/community/persistence/CommunityPost.js';
import { createPost, getPostById, getPosts, addAnswer, addCommentToAnswer, acceptAnswer,
  toggleUpvotePost, voteAnswer, toggleSavePost, getSavedPostIds, deletePost, getLeaderboard
} from '../src/modules/community/http/communityController.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
const resolvers = (process.env.MONGODB_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || '').split(',').map(value => value.trim()).filter(Boolean);
if (resolvers.length) dns.setServers(resolvers);
const uri = process.env.MONGODB_DIRECT_URI || process.env.MONGO_DIRECT_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
const database = 'qa_community_' + Date.now() + '_' + randomUUID().slice(0, 8);
let createdDatabase = false;
const checks = [];
async function call(fn, user, params = {}, body = {}, query = {}) {
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.body = data; return this; } };
  await fn({ authUser: user, params, body, query }, res);
  return res;
}
try {
  assert.ok(uri, 'MongoDB configuration is required');
  assert.match(database, /^qa_community_\d+_[a-f0-9-]{8}$/);
  await mongoose.connect(uri, { dbName: database, serverSelectionTimeoutMS: 12000 });
  assert.equal(mongoose.connection.name, database);
  const asker = await User.create({ id: 'qa-asker', uid: 'qa-firebase-asker', username: 'asker@example.test', name: 'QA Asker', role: 'Student', avatar: 'https://example.test/real-profile.png' });
  const solver = await User.create({ id: 'qa-solver', username: 'solver@example.test', name: 'QA Solver', role: 'Student' });
  createdDatabase = true;
  const created = await call(createPost, asker, {}, { title: 'Kiểm tra giới hạn hàm số', content: '<p>Cho hàm số liên tục. Hãy giải thích giới hạn bằng định nghĩa.</p>', subject: 'calc1', tags: ['GioiHan'] });
  assert.equal(created.statusCode, 201);
  assert.equal(created.body.persisted, true);
  const id = created.body.post.id;
  assert.equal((await CommunityPost.findOne({ id }).lean()).views, 0);
  checks.push('new posts persist in MongoDB with zero fabricated interactions');

  await User.updateOne({ id: asker.id }, { $set: { name: 'Updated Canonical Name', avatar: 'https://example.test/' + 'a'.repeat(1200) + '.png' } });
  const feed = await call(getPosts, asker, {}, {}, { limit: 10 });
  assert.equal(feed.body.degraded, false);
  assert.equal(feed.body.posts[0].author.name, 'Updated Canonical Name');
  assert.ok(feed.body.posts[0].author.avatar.length > 1000);
  assert.equal(Object.hasOwn(feed.body.posts[0].author, 'email'), false);
  checks.push('feed resolves current canonical profile and complete avatar without exposing email');

  await call(getPostById, asker, { id }, {}, { recordView: 'false' });
  assert.equal((await CommunityPost.findOne({ id }).lean()).views, 0);
  await call(getPostById, solver, { id });
  assert.equal((await CommunityPost.findOne({ id }).lean()).views, 1);
  checks.push('only reading the thread records a view; editor fetch does not');

  const answered = await call(addAnswer, solver, { id }, { content: '<p>Dùng định nghĩa giới hạn để chọn delta theo epsilon.</p>' });
  assert.equal(answered.statusCode, 201);
  const answerId = answered.body.answer.id;
  const comment = await call(addCommentToAnswer, asker, { id, answerId }, { content: 'Cảm ơn, mình đã hiểu cách chọn delta.' });
  assert.equal(comment.statusCode, 201);
  await call(acceptAnswer, asker, { id, answerId });
  await call(voteAnswer, asker, { id, answerId }, { voteType: 'up' });
  const voted = await call(toggleUpvotePost, solver, { id }, { voteType: 'up' });
  assert.equal(voted.body.upvotes, 1);
  let stored = await CommunityPost.findOne({ id }).lean();
  assert.equal(stored.upvotedBy.length, 1);
  assert.equal(stored.answers[0].upvotes, 1);
  assert.equal(stored.answers[0].comments.length, 1);
  assert.equal(stored.answers[0].isAccepted, true);
  checks.push('answers, comments, accepted answer and votes persist with authenticated ownership');

  await call(toggleSavePost, solver, { id });
  assert.ok((await call(getSavedPostIds, solver)).body.savedPostIds.includes(id));
  assert.ok(!(await call(getSavedPostIds, asker)).body.savedPostIds.includes(id));
  assert.equal((await call(deletePost, solver, { id })).statusCode, 403);
  checks.push('bookmarks are private and another member cannot delete the question');
  const leaders = (await call(getLeaderboard, null)).body.leaderboard;
  assert.equal(leaders.length, 2);
  assert.ok(leaders.every(user => user.id === asker.id || user.id === solver.id));
  checks.push('leaderboard derives only from actual persisted contributions');
  await call(toggleUpvotePost, solver, { id }, { voteType: 'up' });
  stored = await CommunityPost.findOne({ id }).lean();
  assert.equal(stored.upvotes, 0);
  checks.push('undoing a vote removes its real score without accumulating fake counts');
} catch (error) {
  process.exitCode = 1;
  console.error(error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[redacted]'));
} finally {
  let cleaned = false;
  if (createdDatabase && mongoose.connection.readyState === 1 && mongoose.connection.name === database && /^qa_community_\d+_[a-f0-9-]{8}$/.test(database)) {
    await mongoose.connection.dropDatabase(); cleaned = true;
  }
  await mongoose.disconnect();
  const report = { database, checks, count: checks.length, passed: !process.exitCode, testDatabaseRemoved: cleaned, mainDatabaseModified: false };
  const output = new URL('../../artifacts/community/mongo-integration.json', import.meta.url);
  await mkdir(new URL('./', output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}
