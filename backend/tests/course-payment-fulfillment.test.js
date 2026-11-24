import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Payment from '../src/modules/commerce/payments/persistence/Payment.js';
import SupportPayment from '../src/modules/commerce/payments/persistence/SupportPayment.js';
import WebhookEvent from '../src/modules/commerce/payments/persistence/WebhookEvent.js';
import Enrollment from '../src/modules/access/persistence/Enrollment.js';
import { PromotionReservation } from '../src/modules/commerce/persistence/CourseCommerce.js';
import { handleWebhook } from '../src/modules/commerce/payments/http/paymentController.js';
import { createPayOSSignature, paymentBelongsToUser } from '../src/modules/commerce/payments/application/paymentService.js';

const query = (value, transaction) => ({
  session(session) { assert.equal(session, transaction); return this; },
  lean: async () => value,
  then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); }
});
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('stable order owner ID takes priority over a reused email; legacy orders keep their fallback', () => {
  const user = { id: 'new-account', username: 'reused@example.test', role: 'Student' };
  assert.equal(paymentBelongsToUser({ userId: 'old-account', username: user.username }, user), false);
  assert.equal(paymentBelongsToUser({ userId: user.id, username: 'old-email@example.test' }, user), true);
  assert.equal(paymentBelongsToUser({ username: user.username }, user), true);
  assert.equal(paymentBelongsToUser({ username: 'someone-else@example.test' }, user), false);
});

function fixture(t, { revoked = false, failGrant = false } = {}) {
  t.mock.method(SupportPayment,'findOne',async()=>null);
  const descriptor = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
  Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, value: 1 });
  t.after(() => { if (descriptor) Object.defineProperty(mongoose.connection, 'readyState', descriptor); else delete mongoose.connection.readyState; });
  const keys = ['PAYOS_CLIENT_ID', 'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY'];
  const previous = keys.map(key => process.env[key]);
  keys.forEach(key => { process.env[key] = 'fixture-only'; });
  t.after(() => keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; }));
  const state = { payment: { orderCode: 1712345678901, userId: 'existing-stable-user', username: 'student@example.test', courseId: 'tu-hoc-toan-cao-cap', amount: 10000, status: 'PENDING', paymentLinkId: 'fixture-link' }, enrollment: revoked ? { userId: 'existing-stable-user', courseId: 'tu-hoc-toan-cao-cap', status: 'REVOKED', source: 'ADMIN' } : null, events: [], grants: 0 };
  const transaction = {
    async withTransaction(work) {
      const before = structuredClone(state);
      try { await work(); } catch (error) { Object.assign(state, before); throw error; }
    }, async endSession() {}
  };
  t.mock.method(mongoose, 'startSession', async () => transaction);
  t.mock.method(Payment, 'findOne', () => {
    const document = { ...state.payment, async save(options) { assert.equal(options.session, transaction); const { save: _save, ...data } = this; state.payment = data; } };
    return query(document, transaction);
  });
  t.mock.method(PromotionReservation, 'findOne', () => query(null, transaction));
  t.mock.method(Enrollment, 'findOne', () => query(state.enrollment, transaction));
  t.mock.method(Enrollment, 'findOneAndUpdate', (filter, update) => {
    const result = query(null, transaction);
    result.lean = async () => {
      if (failGrant) throw new Error('Fixture enrollment failure');
      state.grants += 1; state.enrollment = { ...filter, ...update.$set, ...update.$setOnInsert };
      return state.enrollment;
    };
    return result;
  });
  t.mock.method(WebhookEvent, 'create', async ([event], options) => {
    assert.equal(options.session, transaction);
    if (state.events.some(item => item.fingerprint === event.fingerprint)) throw Object.assign(new Error('Duplicate event'), { code: 11000 });
    state.events.push(event); return [event];
  });
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Webhook tests must not call a bank or email provider'); });
  t.mock.method(console, 'error', () => {});
  const body = (extra = {}) => {
    const data = { orderCode: state.payment.orderCode, amount: 10000, code: '00', paymentLinkId: 'fixture-link', reference: 'fixture-reference', ...extra };
    return { success: true, code: '00', data, signature: createPayOSSignature(data, 'fixture-only') };
  };
  return { state, body };
}

test('signed paid webhook activates the exact account once, including duplicate delivery', async t => {
  const { state, body } = fixture(t);
  const paid = body();
  const first = response(); await handleWebhook({ body: paid }, first);
  assert.equal(first.statusCode, 200); assert.equal(first.body.ignored, false);
  assert.equal(state.payment.status, 'PAID');
  assert.equal(state.enrollment.userId, 'existing-stable-user');
  assert.equal(state.enrollment.status, 'ACTIVE'); assert.equal(state.enrollment.source, 'PAYOS');
  const second = response(); await handleWebhook({ body: paid }, second);
  assert.equal(second.body.duplicate, true); assert.equal(state.grants, 1); assert.equal(state.events.length, 1);
});

test('invalid signature and signed wrong amount never unlock a course', async t => {
  const { state, body } = fixture(t);
  const forged = body(); forged.data.amount = 1;
  const invalid = response(); await handleWebhook({ body: forged }, invalid);
  assert.equal(invalid.statusCode, 400);
  const wrong = response(); await handleWebhook({ body: body({ amount: 9999 }) }, wrong);
  assert.equal(wrong.body.reason, 'AMOUNT_MISMATCH');
  assert.equal(state.payment.status, 'PENDING'); assert.equal(state.enrollment, null); assert.equal(state.grants, 0);
});

test('fulfillment failure rolls back payment/event and leaves the webhook retryable', async t => {
  const { state, body } = fixture(t, { failGrant: true });
  const res = response(); await handleWebhook({ body: body() }, res);
  assert.equal(res.statusCode, 500); assert.equal(state.payment.status, 'PENDING');
  assert.equal(state.events.length, 0); assert.equal(state.enrollment, null);
});

test('a paid event records payment without undoing an admin revocation', async t => {
  const { state, body } = fixture(t, { revoked: true });
  const before = structuredClone(state.enrollment);
  const res = response(); await handleWebhook({ body: body() }, res);
  assert.equal(res.statusCode, 200); assert.equal(state.payment.status, 'PAID');
  assert.deepEqual(state.enrollment, before); assert.equal(state.grants, 0);
});
