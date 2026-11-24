/** Focused acceptance against a disposable database; never uses the application DB. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import dns from 'node:dns';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { chromium } from '../../frontend/node_modules/@playwright/test/index.mjs';
import User from '../src/modules/identity/persistence/User.js';
import CommunityPost from '../src/modules/community/persistence/CommunityPost.js';
import UserNotification from '../src/modules/notifications/persistence/UserNotification.js';
import communityRoutes from '../src/modules/community/http/communityRoutes.js';
import notificationRoutes from '../src/modules/notifications/http/notificationRoutes.js';
import blogRoutes from '../src/modules/blog/http/blogEngagementRoutes.js';
import { requireAuth } from '../src/modules/identity/index.js';
import { getMe } from '../src/modules/identity/http/authController.js';
import { issueSession } from '../src/modules/identity/application/sessionService.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
const resolvers = (process.env.MONGODB_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || '').split(',').map(value => value.trim()).filter(Boolean);
if (resolvers.length) dns.setServers(resolvers);
const uri = process.env.MONGODB_DIRECT_URI || process.env.MONGO_DIRECT_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
const database = `qa_comments_${Date.now()}_${randomUUID().slice(0, 8)}`;
const output = new URL('../../artifacts/community/comment-acceptance/', import.meta.url);
const report = { checks: [], browserErrors: [], mainDatabaseModified: false, temporaryDatabaseRemoved: false };
let server, browser, createdDatabase = false;
try {
  assert.ok(uri, 'MongoDB configuration is required');
  assert.match(database, /^qa_comments_\d+_[a-f0-9-]{8}$/);
  await mongoose.connect(uri, { dbName: database, serverSelectionTimeoutMS: 12000 });
  assert.equal(mongoose.connection.name, database); createdDatabase = true;
  const users = await User.create([
    { id: 'qa-comment-owner', name: 'Minh Anh', username: 'qa-owner@example.test' },
    { id: 'qa-comment-reader', name: 'Hoàng Phúc', username: 'qa-reader@example.test' },
    { id: 'qa-comment-other', name: 'Thanh Trúc', username: 'qa-other@example.test' },
  ]);
  const tokens = await Promise.all(users.map(user => issueSession({ setHeader() {}, cookie() {} }, user)));
  const app = express(); app.use(express.json({ limit: '3mb' }));
  app.get('/api/auth/me', requireAuth, getMe);
  app.use('/api', communityRoutes, notificationRoutes, blogRoutes);
  app.use((error, req, res, next) => { void next; res.status(error.statusCode || 500).json({ success: false, message: error.message }); });
  server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = async (user, path, method = 'GET', body) => {
    const response = await fetch(origin + '/api' + path, { method, headers: { Authorization: `Bearer ${tokens[user]}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, data: await response.json() };
  };
  const blogPath = '/blog/qa-real-discussion';
  const blogBody = { clientId: 'qa-reader-real-client', authorName: 'QA reader', content: 'A persisted discussion checked against MongoDB.' };
  const blogComment = await request(0, blogPath + '/comments', 'POST', blogBody);
  assert.equal(blogComment.status, 201);
  const loadedBlog = await request(0, blogPath + '/engagement?clientId=' + blogBody.clientId);
  assert.equal(loadedBlog.data.engagement.comments[0].content, blogBody.content);
  const blogId = loadedBlog.data.engagement.comments[0].commentId;
  const blogLike = await request(0, blogPath + '/comments/' + blogId + '/like', 'POST', { clientId: blogBody.clientId });
  assert.equal(blogLike.data.engagement.comments[0].likes, 1);
  const blogReaction = await request(0, blogPath + '/reactions', 'POST', { clientId: blogBody.clientId, reaction: 'useful' });
  assert.equal(blogReaction.data.engagement.reactions.useful, 1);
  report.checks.push('Blog comments persist across reload; comment likes and article reactions persist in MongoDB.');
  const post = await request(0, '/community/posts', 'POST', { title: 'Trao đổi về giới hạn và tính liên tục', content: '<p>Làm thế nào để hiểu điều kiện liên tục của hàm số tại một điểm?</p>', subject: 'calc1', tags: ['GioiHan'] });
  assert.equal(post.status, 201); const postId = post.data.post.id;
  const path = `/community/posts/${postId}`;
  const answer = await request(1, path + '/answers', 'POST', { content: '<p>Ta so sánh giới hạn của hàm số với giá trị tại điểm đang xét.</p>' });
  assert.equal(answer.status, 201); const answerPath = path + `/answers/${answer.data.answer.id}`;
  const comment = await request(0, answerPath + '/comments', 'POST', { content: 'Ở bước xét giới hạn bên trái, mình cần chú ý điều gì?' });
  assert.equal(comment.status, 201); const commentId = comment.data.comment.id;
  const commentPath = answerPath + `/comments/${commentId}`;
  const reply = await request(1, answerPath + '/comments', 'POST', { content: 'Bạn thay biểu thức ứng với x nhỏ hơn điểm đang xét nhé.', parentId: commentId });
  assert.equal(reply.data.comment.parentId, commentId);
  assert.equal((await request(1, answerPath + '/comments', 'POST', { content: 'Phản hồi không hợp lệ', parentId: 'missing' })).status, 400);
  report.checks.push('Authenticated comments and replies persist; invalid reply parents are rejected.');
  const like = liked => request(1, commentPath + '/like', 'PUT', { liked, accountId: users[1].id });
  assert.equal((await like(true)).data.comment.likesCount, 1);
  assert.equal((await like(true)).data.comment.likesCount, 1);
  const inbox = (await request(0, '/notifications')).data;
  assert.equal(inbox.notifications.length, 1); assert.equal(inbox.unreadCount, 1);
  assert.equal(inbox.notifications[0].actor.id, users[1].id);
  assert.ok(inbox.notifications[0].link.endsWith(`#comment-${commentId}`));
  assert.ok(Number.isFinite(Date.parse(inbox.notifications[0].createdAt)));
  assert.equal((await request(1, '/notifications')).data.notifications.length, 0);
  assert.equal((await request(2, '/notifications')).data.notifications.length, 0);
  report.checks.push('A real heart creates exactly one private inbox notification for the comment owner.');
  const noticeId = inbox.notifications[0].id;
  await request(2, `/notifications/${noticeId}/read`, 'POST', { accountId: users[2].id });
  assert.equal((await request(0, '/notifications')).data.unreadCount, 1);
  assert.equal((await request(1, commentPath + '/like', 'PUT', { liked: true, accountId: users[0].id })).status, 409);
  assert.equal((await request(1, commentPath, 'PUT', { content: 'Không được sửa bình luận của người khác' })).status, 403);
  report.checks.push('Other accounts cannot read or modify the owner inbox/comment; stale account writes are rejected.');
  await request(0, `/notifications/${noticeId}/read`, 'POST', { accountId: users[0].id });
  await like(false); await like(true);
  assert.equal((await request(0, '/notifications')).data.unreadCount, 0);
  assert.equal(await UserNotification.countDocuments(), 1);
  await request(0, commentPath + '/like', 'PUT', { liked: true, accountId: users[0].id });
  assert.equal(await UserNotification.countDocuments(), 1);
  report.checks.push('Read state survives undo/re-like; self hearts do not notify; duplicate clicks do not inflate counts.');
  const originalWrite = UserNotification.updateOne;
  try {
    UserNotification.updateOne = () => { throw new Error('Isolated acceptance: simulated inbox write failure'); };
    const failed = await request(2, commentPath + '/like', 'PUT', { liked: true, accountId: users[2].id });
    assert.ok(failed.status >= 500);
  } finally { UserNotification.updateOne = originalWrite; }
  const stored = await CommunityPost.findOne({ id: postId }).lean();
  assert.ok(!stored.answers[0].comments[0].likedBy.includes(users[2].id));
  report.checks.push('A failed notification write rolls back the heart transaction.');

  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const contexts = [];
  for (const index of [0, 1]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    contexts.push(context);
    await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
    await context.route('https://accounts.google.com/**', route => route.abort());
    await context.route('**/api/**', async route => {
      const incoming = route.request();
      const url = new URL(incoming.url());
      const response = await route.fetch({ url: origin + url.pathname + url.search, headers: { ...incoming.headers(), authorization: `Bearer ${tokens[index]}` } });
      await route.fulfill({ response });
    });
  }
  const ownerPage = await contexts[0].newPage();
  const readerPage = await contexts[1].newPage();
  for (const page of [ownerPage, readerPage]) page.on('pageerror', error => report.browserErrors.push(error.message));
  await ownerPage.goto(`${process.env.QA_UI_ORIGIN || 'http://localhost:5174'}/community/${postId}`);
  await readerPage.goto(`${process.env.QA_UI_ORIGIN || 'http://localhost:5174'}/community/${postId}`);
  await ownerPage.locator(`#comment-${commentId}`).waitFor();
  await readerPage.locator(`#comment-${commentId}`).waitFor();
  await readerPage.locator(`#comment-${commentId} .qa-comment-heart`).click(); // Undo the reader's earlier heart.
  await readerPage.locator(`#comment-${commentId} .qa-comment-heart[aria-pressed="false"]`).waitFor();
  await readerPage.locator(`#comment-${commentId} .qa-comment-heart`).click();
  await readerPage.locator(`#comment-${commentId} .qa-comment-heart[aria-pressed="true"]`).waitFor();
  await readerPage.locator('.qa-comment-actions button').filter({ hasText: 'Trả lời' }).first().click();
  await readerPage.locator('textarea[aria-label="Nội dung bình luận"]').fill('Mình bổ sung: nhớ kiểm tra cả giới hạn bên phải.');
  await readerPage.locator('.qa-comment-composer button[type="submit"]').click();
  await readerPage.getByText('Mình bổ sung: nhớ kiểm tra cả giới hạn bên phải.', { exact: true }).waitFor();
  await ownerPage.getByRole('button', { name: 'Xem thông báo', exact: true }).click();
  await ownerPage.locator('.notif-dropdown-popover').getByText('Bình luận của bạn được thả tim', { exact: true }).waitFor();
  await ownerPage.screenshot({ path: fileURLToPath(new URL('inbox.png', output)) });
  await ownerPage.getByRole('button', { name: 'Xem thông báo', exact: true }).click();
  await ownerPage.locator('.qa-discussion').scrollIntoViewIfNeeded();
  await ownerPage.screenshot({ path: fileURLToPath(new URL('comments-owner.png', output)) });
  await readerPage.locator('.qa-discussion').scrollIntoViewIfNeeded();
  await readerPage.screenshot({ path: fileURLToPath(new URL('comments-reader.png', output)) });
  await readerPage.setViewportSize({ width: 390, height: 900 });
  await readerPage.locator('.qa-discussion').scrollIntoViewIfNeeded();
  await readerPage.screenshot({ path: fileURLToPath(new URL('comments-mobile.png', output)) });
  assert.equal(await readerPage.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
  await ownerPage.setViewportSize({ width: 390, height: 900 });
  await ownerPage.getByRole('button', { name: 'Xem thông báo', exact: true }).click();
  const mobileInbox = ownerPage.locator('.notif-dropdown-popover:visible');
  await mobileInbox.getByText('Bình luận của bạn được thả tim', { exact: true }).waitFor();
  const box = await mobileInbox.boundingBox();
  assert.ok(box.x >= 0 && box.x + box.width <= 390);
  await ownerPage.screenshot({ path: fileURLToPath(new URL('inbox-mobile.png', output)) });
  assert.equal(report.browserErrors.length, 0);
  report.checks.push('Two isolated signed-in browser accounts: heart, nested reply, real inbox delivery; mobile has no horizontal overflow.');
  await request(0, '/notifications/clear', 'POST', { accountId: users[0].id, before: new Date().toISOString() });
  await like(false); await like(true);
  assert.equal((await request(0, '/notifications')).data.notifications.length, 0);
  assert.equal((await request(0, commentPath, 'PUT', { content: 'Cảm ơn, mình đã hiểu bước xét giới hạn.' })).status, 200);
  assert.equal((await request(0, commentPath, 'DELETE')).status, 200);
  const remaining = (await CommunityPost.findOne({ id: postId }).lean()).answers[0].comments;
  assert.ok(remaining.some(item => item.id === reply.data.comment.id));
  report.checks.push('Dismissed notifications stay dismissed; owner edits/deletes work and replies survive parent removal.');
  report.passed = true;
} catch (error) {
  report.passed = false; report.error = error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[redacted]'); process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (createdDatabase && mongoose.connection.name === database && /^qa_comments_\d+_[a-f0-9-]{8}$/.test(database)) {
    await mongoose.connection.dropDatabase(); report.temporaryDatabaseRemoved = true;
  }
  await mongoose.disconnect();
  await mkdir(output, { recursive: true });
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}
