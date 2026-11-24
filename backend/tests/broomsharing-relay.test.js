import test from 'node:test';
import assert from 'node:assert/strict';
import { isBroomSharingOrder, validateRelayDestination, forwardBroomSharingWebhook } from '../src/modules/commerce/payments/integrations/broomsharingWebhookRelay.js';

const destination = 'https://broomsharing-fixture.trycloudflare.com/api/payos/webhook';
const body = { code: '00', success: true, signature: 'signed-original', data: { orderCode: 20_000_000_000_000, amount: 2000 } };
const options = (changes = {}) => ({ hasCourseOrder: async () => false,
  readRelay: async () => ({ destination }), send: async () => ({ ok: true }), ...changes });

test('course and legacy desktop order ranges retain the original handler', () => {
  assert.equal(isBroomSharingOrder(Date.now()), false);
  assert.equal(isBroomSharingOrder(Date.now() * 1000), false);
  assert.equal(isBroomSharingOrder(10_000_000_000_000), true);
  assert.equal(isBroomSharingOrder(90_000_000_000_000), false);
  assert.equal(isBroomSharingOrder(NaN), false);
});
test('only exact public demo HTTPS webhook destinations can be registered', () => {
  assert.equal(validateRelayDestination(destination), destination);
  for (const invalid of ['http://127.0.0.1/api/payos/webhook', 'https://localhost/api/payos/webhook',
    'https://evil.example/api/payos/webhook', destination+'?x=1', destination+'#x',
    'https://user@broomsharing-fixture.trycloudflare.com/api/payos/webhook',
    'https://broomsharing-fixture.trycloudflare.com:8080/api/payos/webhook'])
    assert.throws(() => validateRelayDestination(invalid));
});
test('course ownership takes precedence even if an old order happens to be in the reserved range', async () => {
  let sent = false;
  assert.equal(await forwardBroomSharingWebhook(body, options({ hasCourseOrder: async () => true, send: async () => { sent=true; } })), false);
  assert.equal(sent, false);
});
test('original signed payload reaches Java without amount, signature or metadata modification', async () => {
  assert.equal(await forwardBroomSharingWebhook(body, options({ send: async (url, request) => {
    assert.equal(url, destination); assert.deepEqual(JSON.parse(request.body), body);
    assert.equal(request.redirect, 'error'); return { ok: true };
  }})), true);
});
test('offline Java endpoint returns retryable failure instead of losing a bank event', async () => {
  await assert.rejects(() => forwardBroomSharingWebhook(body, options({ send: async () => ({ ok: false }) })),
    (e) => e.statusCode === 503 && e.code === 'BROOMSHARING_RELAY_UNAVAILABLE');
});
test('network errors and redirect attempts are not acknowledged', async () => {
  await assert.rejects(() => forwardBroomSharingWebhook(body, options({ send: async () => { throw new Error('network'); } })),
    (e) => e.statusCode === 503);
});
test('a repeated event is forwarded again for Java to reconcile idempotently', async () => {
  let count=0; const dependencies=options({ send: async () => {count++;return {ok:true};} });
  await forwardBroomSharingWebhook(body,dependencies);await forwardBroomSharingWebhook(body,dependencies);
  assert.equal(count,2);
});
test('unconfigured relay leaves the original WEB_TCC behavior intact', async () => {
  assert.equal(await forwardBroomSharingWebhook(body,options({readRelay:async()=>null})),false);
});
