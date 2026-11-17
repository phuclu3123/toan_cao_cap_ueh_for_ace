import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { syncFirebaseUserWithBackend } from '../src/services/authService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('One Tap proof uses a fresh Firebase token and forwards tokens without raw profile/email', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return Response.json({ success: true, user: { id: 'stable-user', username: 'saved@example.test' } });
  };
  const user = { uid: 'one-tap-proof-user', getIdToken: async force => { assert.equal(force, true); return 'fresh-firebase-token'; } };
  const result = await syncFirebaseUserWithBackend(user, { googleIdToken: 'google-signed-proof' });
  assert.equal(result.id, 'stable-user');
  assert.deepEqual(JSON.parse(calls[0].options.body), { idToken: 'fresh-firebase-token', googleIdToken: 'google-signed-proof' });
  assert.equal(calls[0].options.credentials, 'include');
  assert.ok(calls[0].options.signal);
});

test('a proof-backed login does not join a stale background sync without Google proof', async () => {
  let releaseBackground;
  const background = new Promise(resolve => { releaseBackground = resolve; });
  const bodies = [];
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body); bodies.push(body);
    if (!body.googleIdToken) {
      await background;
      return Response.json({ code: 'GOOGLE_EMAIL_REQUIRED', message: 'Missing proof' }, { status: 422 });
    }
    return Response.json({ success: true, user: { id: 'same-uid-user', username: 'saved@example.test' } });
  };
  const user = { uid: 'racing-google-user', getIdToken: async () => 'firebase-token' };
  const silent = syncFirebaseUserWithBackend(user);
  const rejected = assert.rejects(silent, error => error.code === 'GOOGLE_EMAIL_REQUIRED');
  const verified = await syncFirebaseUserWithBackend(user, { googleIdToken: 'google-proof' });
  releaseBackground(); await rejected;
  assert.equal(verified.id, 'same-uid-user'); assert.equal(bodies.length, 2);
});

test('duplicate Firebase listeners and One Tap completion share one proof-backed request', async () => {
  let count = 0;
  globalThis.fetch = async () => { count += 1; return Response.json({ success: true, user: { id: 'one-user' } }); };
  const user = { uid: 'deduplicated-google-user', getIdToken: async () => 'firebase-token' };
  const options = { googleIdToken: 'google-proof' };
  const first = syncFirebaseUserWithBackend(user, options);
  const second = syncFirebaseUserWithBackend(user, options);
  assert.equal(first, second); await first; assert.equal(count, 1);
});

test('backend sync timeout becomes an actionable error without signing out or changing user storage', async () => {
  globalThis.fetch = async () => { throw new DOMException('timed out', 'TimeoutError'); };
  const user = { uid: 'timeout-google-user', getIdToken: async () => 'firebase-token' };
  await assert.rejects(syncFirebaseUserWithBackend(user), error => error.code === 'AUTH_SYNC_TIMEOUT');
});
