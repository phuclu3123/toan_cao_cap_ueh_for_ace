import assert from 'node:assert/strict';
import test from 'node:test';

import { findCourseLessonContent } from '../config/courseContentCatalog.js';
import { getCourseLessonContent } from '../controllers/courseContentController.js';
import { getCourseAccess } from '../services/enrollmentService.js';

const createResponse = () => {
  const headers = new Map();
  return {
    headers,
    statusCode: 200,
    payload: null,
    set(name, value) {
      headers.set(name.toLowerCase(), value);
      return this;
    },
    vary(value) {
      const current = headers.get('vary');
      headers.set('vary', current ? `${current}, ${value}` : value);
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
};

test('locked lesson content requires an authenticated session', async () => {
  const req = {
    params: {
      courseId: 'thuc-chien-k46-k50',
      lessonId: 'k46-1-2'
    },
    headers: {}
  };
  const res = createResponse();

  await getCourseLessonContent(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.code, 'AUTH_REQUIRED');
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
  assert.equal(res.headers.get('vary'), 'Cookie');
  assert.equal(res.payload.data, undefined);
});

test('preview content is available without exposing any client-supplied source', async () => {
  const req = {
    params: {
      courseId: 'thuc-chien-k46-k50',
      lessonId: 'k50-1-1'
    },
    headers: {},
    body: { url: 'https://attacker.invalid/video' },
    query: { path: '../../private-content' }
  };
  const res = createResponse();

  await getCourseLessonContent(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.preview, true);
  assert.equal(res.payload.data.media.provider, 'youtube');
  assert.equal(res.payload.data.lessonId, 'k50-1-1');
  assert.notEqual(res.payload.data.media.url, req.body.url);
});

test('only the first SQL lesson is a public preview', () => {
  assert.equal(findCourseLessonContent('lop-tu-hoc-sql', 'sql-1-1').preview, true);
  assert.equal(findCourseLessonContent('lop-tu-hoc-sql', 'sql-1-2').preview, false);
  assert.equal(findCourseLessonContent('lop-tu-hoc-sql', 'sql-1-3').preview, false);
});

test('the verified owner role has course content access', async () => {
  const access = await getCourseAccess({
    id: 'owner',
    username: 'luphuc321@gmail.com',
    role: 'Admin'
  }, 'thuc-chien-k51');

  assert.equal(access.allowed, true);
  assert.equal(access.reason, 'OWNER');
});
