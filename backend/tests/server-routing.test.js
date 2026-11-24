import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { app } from '../server.js';

let server;
let baseUrl;

test('service origin accepts GET and HEAD hosting probes', async () => {
  const get = await fetch(baseUrl);
  assert.equal(get.status, 200);
  assert.equal((await get.json()).health, '/api/health');
  const head = await fetch(baseUrl, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('BroomSharing relay setup requires the existing private setup token', async () => {
  const response = await fetch(`${baseUrl}/api/payos/relay/broomsharing`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination: 'https://demo.trycloudflare.com/api/payos/webhook' })
  });
  assert.equal(response.status, 401);
});

test('relay setup rejects internal destinations before attempting any database write', async () => {
  const previous = process.env.PAYOS_CONFIRM_TOKEN;
  process.env.PAYOS_CONFIRM_TOKEN = 'fixture-only-admin-token';
  try {
    const response = await fetch(`${baseUrl}/api/payos/relay/broomsharing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-payos-confirm-token': 'fixture-only-admin-token' },
      body: JSON.stringify({ destination: 'http://127.0.0.1/api/payos/webhook' })
    });
    assert.equal(response.status, 400);
  } finally {
    if (previous === undefined) delete process.env.PAYOS_CONFIRM_TOKEN;
    else process.env.PAYOS_CONFIRM_TOKEN = previous;
  }
});

test('deployed webhook capability fingerprint identifies the BroomSharing relay build', async () => {
  const response = await fetch(`${baseUrl}/api/payos/webhook`);
  assert.equal((await response.json()).relayVersion, 'broomsharing-v1');
});

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('health endpoint reports the real database state', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(payload.status, /^(ok|degraded)$/);
  assert.equal(typeof payload.database.configured, 'boolean');
  assert.match(payload.database.status, /^(disconnected|connected|connecting|disconnecting|unknown)$/);
  assert.match(payload.passwordReset.status, /^(ready|unavailable)$/);
  assert.deepEqual(Object.keys(payload.passwordReset), ['status']);
});

test('course content routes are mounted on the HTTP application', async () => {
  const response = await fetch(
    `${baseUrl}/api/courses/thuc-chien-k46-k50/lessons/k50-1-1/content`
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.preview, true);
});

test('unknown API endpoints return a structured 404 response', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`);
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.success, false);
  assert.equal(payload.code, 'API_NOT_FOUND');
});

test('OAuth provider metadata exposes no server secret', async () => {
  const response = await fetch(`${baseUrl}/api/auth/providers`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(typeof payload.providers.google.enabled, 'boolean');
  assert.equal(typeof payload.providers.github.enabled, 'boolean');
  assert.equal(Object.hasOwn(payload.providers.github, 'clientId'), true);
  assert.equal(Object.hasOwn(payload.providers.github, 'clientSecret'), false);
  assert.match(response.headers.get('cache-control') || '', /no-store/i);
});

test('order creation requires an authenticated server session', async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 'tu-hoc-toan-cao-cap' })
  });
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.code, 'AUTH_REQUIRED');
});

test('cookie-authenticated writes reject an untrusted browser origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Cookie: 'ueh_tcc_session=this-is-an-untrusted-cookie-value-long-enough',
      Origin: 'https://attacker.example'
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.code, 'CSRF_ORIGIN_REJECTED');
});

test('legacy payment return URL only redirects and preserves a valid order code', async () => {
  const response = await fetch(`${baseUrl}/payment/success?orderCode=1712345678901`, {
    redirect: 'manual'
  });
  const location = new URL(response.headers.get('location'));

  assert.equal(response.status, 302);
  assert.equal(location.pathname, '/payment/result');
  assert.equal(location.searchParams.get('orderCode'), '1712345678901');
});
