import assert from 'node:assert/strict';
import test from 'node:test';
import { claimChunkRecovery, isRecoverableChunkError } from '../src/utils/chunkRecovery.js';

test('only chunk transport errors qualify for automatic reload', () => {
  assert.equal(isRecoverableChunkError(new Error('Failed to fetch dynamically imported module: /assets/page-old.js')), true);
  assert.equal(isRecoverableChunkError(new Error('Importing a module script failed.')), true);
  assert.equal(isRecoverableChunkError(new SyntaxError("CommunitySidebar does not provide an export named 'default'")), false);
  assert.equal(isRecoverableChunkError(new TypeError('Cannot read properties of undefined')), false);
});

test('the same broken chunk receives only one recovery attempt', () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key), setItem: (key, value) => entries.set(key, value) };
  assert.equal(claimChunkRecovery(storage, 'recovery', '/assets/page-v1.js'), true);
  assert.equal(claimChunkRecovery(storage, 'recovery', '/assets/page-v1.js'), false);
  assert.equal(claimChunkRecovery(storage, 'recovery', '/assets/page-v2.js'), true);
});

test('blocked storage cannot create an automatic reload loop', () => {
  const storage = { getItem: () => { throw new Error('Storage denied'); } };
  assert.equal(claimChunkRecovery(storage, 'recovery', 'chunk'), false);
});
