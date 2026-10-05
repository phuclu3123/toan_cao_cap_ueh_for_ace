import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
  new URL('../src/services/communityService.js', import.meta.url),
  'utf8'
);

test('community writes use authenticated backend endpoints', () => {
  assert.match(source, /async createPost\(postData\)/);
  assert.match(source, /apiFetch\('\/api\/community\/posts'/);
  assert.match(source, /\/answers\/\$\{answerId\}\/vote/);
  assert.match(source, /\/answers\/\$\{answerId\}\/accept/);
  assert.match(source, /async votePost\(postId/);
  assert.match(source, /toggleAcceptAnswer\(postId/);
});

test('answer deletion has one backend-backed implementation', () => {
  assert.equal((source.match(/async deleteAnswer\(/g) || []).length, 1);
  assert.equal((source.match(/\n\s*deleteAnswer\(/g) || []).length, 0);
  assert.match(source, /apiFetch\(`\/api\/community\/posts\/\$\{postId\}\/answers\/\$\{answerId\}`/);
});
