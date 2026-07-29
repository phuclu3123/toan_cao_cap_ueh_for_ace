import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { coursesData } from '../src/data/coursesData.js';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const readSource = (path) => readFileSync(join(root, path), 'utf8');

const listSourceFiles = (directory = root) => {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? listSourceFiles(path)
      : [path];
  });
};

test('course access is not granted from localStorage', () => {
  const source = listSourceFiles()
    .filter((path) => /\.(?:js|jsx)$/.test(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  assert.doesNotMatch(source, /ueh_tcc_enrolled_courses/);
});

test('checkout uses a server-priced idempotent PayOS order', () => {
  const checkout = readSource('components/modals/CourseEnrollmentModal.jsx');

  assert.match(checkout, /apiFetch\('\/api\/orders'/);
  assert.match(checkout, /'Idempotency-Key': idempotencyKeyRef\.current/);
  assert.match(checkout, /courseId: course\.id/);
  assert.doesNotMatch(checkout, /orderCode:\s*(?:newOrderCode|Math\.)/);
  assert.doesNotMatch(checkout, /amount:\s*(?:finalPrice|listedPrice)/);
  assert.match(checkout, /payment\.entitlement\?\.allowed/);
});

test('authenticated API calls always include the session cookie', () => {
  const apiClient = readSource('utils/apiClient.js');
  assert.match(apiClient, /credentials:\s*'include'/);
});

test('premium playback sources and paid text are redacted from the frontend catalog', () => {
  const catalog = readSource('data/coursesData.js');
  const courseDetail = readSource('pages/CourseDetail.jsx');

  assert.doesNotMatch(catalog, /videoUrl|commondatastorage|youtu\.be|78djtj2N9QI|WDSHTnrv8JI/);
  assert.doesNotMatch(catalog, /Bộ tài liệu đính kèm gồm/);
  assert.match(courseDetail, /\/api\/courses\/\$\{encodeURIComponent\(course\.id\)\}\/lessons\//);
  assert.match(courseDetail, /activeLesson\?\.media\?\.provider === 'youtube'/);
});

test('free SQL enrollment is required after the public sample lesson', () => {
  const sqlCourse = coursesData.find((course) => course.id === 'lop-tu-hoc-sql');
  const lessons = sqlCourse.chapters.flatMap((chapter) => chapter.lessons);

  assert.equal(lessons.find((lesson) => lesson.id === 'sql-1-1').isLocked, false);
  assert.equal(lessons.find((lesson) => lesson.id === 'sql-1-2').isLocked, true);
  assert.equal(lessons.find((lesson) => lesson.id === 'sql-1-3').isLocked, true);
});

test('Firebase sync sends a verified ID token and has no fabricated users', () => {
  const navbar = readSource('components/Navbar.jsx');

  assert.match(navbar, /firebaseUser\.getIdToken\(\)/);
  assert.match(navbar, /JSON\.stringify\(\{ idToken \}\)/);
  assert.doesNotMatch(navbar, /google-user-|github-user-|mockFirebaseUser/);
});
