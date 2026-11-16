import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import express from 'express';
import { validateStudyContent, saveStudyContent, seedStudyContent } from '../services/studyContent.js';
import { createStudyContentRouter } from '../routes/studyContentRoutes.js';

const topics = JSON.parse(await readFile(new URL('../data/flashcard-topics.json', import.meta.url), 'utf8'));
test('All 10 published chapters validate and regenerate the same cards', () => {
  for (const topic of topics) assert.deepEqual(validateStudyContent(topic, topic).flashcards, topic.flashcards);
});
test('Malformed content, unknown scenes, duplicates and orphan quiz references are rejected', () => {
  const cases = [
    t => { t.lesson.sections[0] = null; },
    t => { t.lesson.sections[0].scene = 'unknown'; },
    t => { t.lesson.sections.push(t.lesson.sections[0]); },
    t => { t.quiz[0] = null; },
    t => { t.quiz[0].sectionId = 'missing'; },
    t => { t.quiz[0].correctIndex = 5; },
    t => { t.quiz[0].options[0] = t.quiz[0].options[1]; },
    t => { t.lesson.sections[0].content = 'x'.repeat(30001); },
  ];
  for (const mutate of cases) { const input = structuredClone(topics[0]); mutate(input); assert.throws(() => validateStudyContent(input, topics[0]), { status: 422 }); }
});
test('Untrusted derived cards are ignored and edited recalls regenerate cards', () => {
  const input = structuredClone(topics[4]);
  input.flashcards = [{ id: 'injected' }];
  input.lesson.sections[0].recalls[0].front = 'Edited question';
  input.lesson.sections[0].recall.front = 'Stale copy';
  input.$set = { version: 100 };
  const result = validateStudyContent(input, topics[4]);
  assert.ok(result.flashcards.some(c => c.front === 'Edited question'));
  assert.ok(!result.flashcards.some(c => c.id === 'injected'));
  assert.equal(result.$set, undefined);
});
test('Atomic save compares version, retains five revisions and refuses stale writes', async () => {
  let query, update, stale = false;
  const model = {
    findOne: () => ({ lean: async () => ({ content: topics[0], version: 3 }) }),
    findOneAndUpdate: (q, u) => { query = q; update = u; return { lean: async () => stale ? null : ({ content: u.$set.content, version: 4 }) }; },
  };
  const dependencies = { model, ensureDatabase: () => {} };
  const result = await saveStudyContent(topics[0].id, 3, topics[0], 'owner@example.com', dependencies);
  assert.equal(result.version, 4); assert.equal(query.version, 3); assert.equal(update.$push.revisions.$slice, -5); assert.equal(update.$push.revisions.$each[0].version, 3);
  stale = true;
  await assert.rejects(saveStudyContent(topics[0].id, 3, topics[0], 'owner@example.com', dependencies), { status: 409 });
});
test('Seed only inserts missing chapters and never updates existing content', async () => {
  let calls = 0;
  const model = { collection: { createIndex: async () => 'id_1' }, updateOne: async (_filter, update, options) => { calls++; assert.deepEqual(Object.keys(update), ['$setOnInsert']); assert.equal(options.upsert, true); return { upsertedCount: 0 }; } };
  assert.equal(await seedStudyContent({ model, ensureDatabase: () => {} }), 0); assert.equal(calls, 10);
});
test('HTTP: public reads, 404, owner write guard and database outage', async t => {
  const originalOwner = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = 'owner@example.com';
  t.after(() => { if (originalOwner === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = originalOwner; });
  let readyState = 1;
  const model = { find: () => ({ select: () => ({ lean: async () => [{ content: topics[0], version: 1 }] }) }), findOne: ({ id }) => ({ select: () => ({ lean: async () => id === topics[0].id ? { content: topics[0], version: 1 } : null }) }) };
  const ensureDatabase = () => { if (!readyState) throw Object.assign(new Error('Unavailable'), { status: 503 }); };
  const app = express(); app.use(express.json());
  const authenticate = (req, res, next) => { if (!req.get('x-test-role')) return res.sendStatus(401); req.authUser = { role: req.get('x-test-role'), username: 'student@example.com' }; next(); };
  app.use('/api', createStudyContentRouter({ authenticate, model, ensureDatabase }));
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message }));
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/flashcards/topics`;
  const listing = await fetch(base); assert.equal(listing.status, 200); assert.equal(listing.headers.get('cache-control'), 'no-store'); assert.equal((await listing.json()).topics[0].id, topics[0].id);
  const detail = await (await fetch(`${base}/${topics[0].id}`)).json(); assert.deepEqual(detail.topic, topics[0]); assert.equal(detail.revisions, undefined);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
  assert.equal((await fetch(`${base}/${topics[0].id}`, { method: 'PUT' })).status, 401);
  for (const role of ['Student','Admin']) assert.equal((await fetch(`${base}/${topics[0].id}`, { method: 'PUT', headers: { 'x-test-role': role } })).status, 403);
  readyState = 0;
  assert.equal((await fetch(base)).status, 503);
});
