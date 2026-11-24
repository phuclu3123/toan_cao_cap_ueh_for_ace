import assert from 'node:assert/strict';
import test from 'node:test';
import { paymentClock, paymentSecondsLeft, stampPayment } from '../src/services/courseCommerceService.js';
import { apiFetch } from '../src/utils/apiClient.js';

test('payment countdown uses the signed server deadline even with a skewed client clock', () => {
  const received = Date.parse('2026-11-23T10:00:00Z');
  const order = stampPayment({ clientReceivedAt: received, serverNow: '2026-11-23T10:10:00Z', expiresAt: '2026-11-23T10:40:00Z' });
  assert.equal(paymentSecondsLeft(order, received), 1800);
  assert.equal(paymentSecondsLeft(order, received + 60000), 1740);
  assert.equal(paymentSecondsLeft(order, received + 2000000), 0);
  assert.equal(paymentClock(1740), '29:00');
  assert.equal(stampPayment(order).clientReceivedAt, received);
});

test('legacy orders without a deadline do not receive an invented countdown', () => {
  assert.equal(paymentSecondsLeft({ orderCode: 1 }, Date.now()), null);
});

test('feature 401 requests a shared session check without replaying a financial write', async t => {
  const events = [];
  const previousWindow = globalThis.window;
  globalThis.window = { dispatchEvent: event => events.push(event.type) };
  t.after(() => { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls += 1;
    assert.equal(options.credentials, 'include');
    return new Response('{}', { status: 401 });
  });
  await apiFetch('/api/orders', { method: 'POST' });
  assert.equal(calls, 1);
  assert.deepEqual(events, ['ueh-tcc-auth-check-required']);
  await apiFetch('/api/auth/me');
  await apiFetch('/api/auth/session/refresh', { method: 'POST' });
  assert.equal(events.length, 1, 'authentication endpoints cannot recursively trigger /me');
});
