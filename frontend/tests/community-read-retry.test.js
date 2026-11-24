import assert from 'node:assert/strict';
import test from 'node:test';
import { retryCommunityRead } from '../src/utils/retryCommunityRead.js';

test('community read recovers after a transient invalid gateway response', async () => {
  let calls = 0;
  const waits = [];
  const result = await retryCommunityRead(async () => {
    calls += 1;
    if (calls < 3) throw Object.assign(new Error('Invalid JSON'), { status: 502 });
    return { posts: [] };
  }, { wait: async delay => waits.push(delay) });
  assert.deepEqual(result, { posts: [] });
  assert.equal(calls, 3);
  assert.deepEqual(waits, [400, 1000]);
});

test('community read stops after its bounded retries', async () => {
  let calls = 0;
  await assert.rejects(retryCommunityRead(async () => {
    calls += 1;
    throw new TypeError('Failed to fetch');
  }, { wait: async () => {} }), /Failed to fetch/);
  assert.equal(calls, 3);
});

test('community read never retries auth, validation, or not-found failures', async () => {
  for (const status of [400, 401, 403, 404, 409, 429, 500]) {
    let calls = 0;
    await assert.rejects(retryCommunityRead(async () => {
      calls += 1;
      throw Object.assign(new Error('Rejected'), { status });
    }, { wait: async () => assert.fail('Unexpected retry') }), /Rejected/);
    assert.equal(calls, 1);
  }
});
