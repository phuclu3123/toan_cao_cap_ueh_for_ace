import assert from 'node:assert/strict';
import test from 'node:test';
import { paginationPages } from '../src/utils/pagination.js';
test('pagination remains bounded for a large forum', () => {
  assert.deepEqual(paginationPages(1, 3), [1, 2, 3]);
  assert.deepEqual(paginationPages(500, 1000), [1, '…', 499, 500, 501, '…', 1000]);
  assert.ok(paginationPages(1, 1000).length <= 8);
  assert.ok(paginationPages(1000, 1000).length <= 8);
  assert.deepEqual(paginationPages(-2, 0), [1]);
});
