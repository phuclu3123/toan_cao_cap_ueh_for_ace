import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Enrollment from '../src/modules/access/persistence/Enrollment.js';
import Payment from '../src/modules/commerce/payments/persistence/Payment.js';
import { createOrder, createPayOSSignature, getPaymentStatus } from '../src/modules/commerce/payments/http/paymentController.js';
import { getCourseAccess } from '../src/modules/access/application/enrollmentService.js';

import { CourseOffer, CoursePromotion, PromotionUsage, PromotionReservation, CommerceAudit, CourseCheckoutSession } from '../src/modules/commerce/persistence/CourseCommerce.js';
import { initializeCourseCommerce, getCheckoutView, clearCheckoutOrder, quoteCheckout } from '../src/modules/commerce/application/courseCommerceService.js';
import { PURCHASE_TERMS } from '../src/modules/commerce/config/purchaseTerms.js';
const query = value => ({ lean: async () => value, catch(reject) { return Promise.resolve(value).catch(reject); }, session() { return this; }, sort() { return this; }, select() { return this; }, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });

const courseId = 'tu-hoc-toan-cao-cap';
const student = { id: 'fixture-student', username: 'student@example.test', name: 'Student', role: 'Student' };
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const request = (user = student, overrides = {}) => ({
  authUser: user,
  body: { courseId, buyerName: 'Student', buyerEmail: user.username, buyerPhone: '0900000000', quote: { priceVersion: 0, promotionId: null, amount: 349000 }, purchaseConsent: { accepted: true, version: PURCHASE_TERMS.version, confirmation: PURCHASE_TERMS.confirmation, amount: 349000 } },
  get: name => name === 'Idempotency-Key' ? 'fixture-checkout-idempotency-123' : undefined,
  ...overrides
});

async function fixture(t, { connected = true, enrollment = null } = {}) {
  // No real connection, user, order, or enrollment is created in these tests.
  const descriptor = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
  Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, value: connected ? 1 : 0 });
  t.after(() => { if (descriptor) Object.defineProperty(mongoose.connection, 'readyState', descriptor); else delete mongoose.connection.readyState; });
  const keys = ['PAYOS_CLIENT_ID', 'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY', 'FRONTEND_URL'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  Object.assign(process.env, { PAYOS_CLIENT_ID: 'fixture-client', PAYOS_API_KEY: 'fixture-api', PAYOS_CHECKSUM_KEY: 'fixture-checksum', FRONTEND_URL: 'http://localhost:5173' });
  t.after(() => { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });
  const state = { enrollment, row: null, selection: null, offer: null, promotions: [], providerCalls: 0, enrollmentQueries: [], writes: 0 };
  t.mock.method(Enrollment, 'findOne', filter => {
    state.enrollmentQueries.push(filter);
    return { lean: async () => state.enrollment };
  });
  t.mock.method(Enrollment, 'findOneAndUpdate', () => { throw new Error('Unexpected enrollment write'); });
  for (const model of [CourseOffer, CoursePromotion, PromotionUsage, PromotionReservation, CommerceAudit, CourseCheckoutSession, Payment]) t.mock.method(model.collection, 'createIndex', async () => 'fixture-index');
  t.mock.method(mongoose.connection, 'transaction', async work => work({ fixture: true }));
  t.mock.method(CourseOffer, 'findOne', () => query(state.offer));
  t.mock.method(CoursePromotion, 'find', () => query(state.promotions));
  t.mock.method(PromotionUsage, 'find', () => query([]));
  t.mock.method(CourseCheckoutSession, 'findOne', () => query(state.selection));
  t.mock.method(CourseCheckoutSession, 'findOneAndUpdate', async (filter, update) => { state.selection = { ...filter, ...update.$set }; return state.selection; });
  t.mock.method(CourseCheckoutSession, 'updateOne', async (filter, update) => {
    if (update.$set && state.selection?.orderCode === filter.orderCode) Object.assign(state.selection, update.$set);
    if (!state.selection && update.$setOnInsert) state.selection = { ...filter, ...update.$setOnInsert };
    return { matchedCount: 1 };
  });
  t.mock.method(Payment, 'create', async data => {
    if (state.row) throw Object.assign(new Error('Duplicate fixture idempotency key'), { code: 11000 });
    state.writes += 1;
    state.row = { _id: 'fixture-payment', ...data[0] };
    return [state.row];
  });
  t.mock.method(Payment, 'findOne', () => query(state.row));
  if (connected) await initializeCourseCommerce();
  t.mock.method(Payment, 'findOneAndUpdate', async (_filter, update) => {
    Object.assign(state.row, update.$set);
    return state.row;
  });
  t.mock.method(Payment, 'updateOne', async () => { throw new Error('Unexpected payment update'); });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    state.providerCalls += 1;
    assert.equal(url, 'https://api-merchant.payos.vn/v2/payment-requests');
    assert.equal(options.method, 'POST');
    const body = JSON.parse(options.body);
    assert.equal(body.amount, 349000);
    assert.equal(body.buyerEmail, student.username);
    const signed = Object.fromEntries(['amount', 'cancelUrl', 'description', 'orderCode', 'returnUrl'].map(key => [key, body[key]]));
    assert.equal(body.signature, createPayOSSignature(signed, 'fixture-checksum'));
    const data = { orderCode: body.orderCode, amount: body.amount, status: 'PENDING', paymentLinkId: 'fixture-link', checkoutUrl: 'https://pay.payos.vn/web/fixture-link', qrCode: 'fixture-qr' };
    return { ok: true, json: async () => ({ code: '00', data, signature: createPayOSSignature(data, 'fixture-checksum') }) };
  });
  return state;
}

test('student without enrollment receives NOT_ENROLLED, not a server error', async t => {
  const state = await fixture(t);
  assert.deepEqual(await getCourseAccess(student, courseId), { allowed: false, reason: 'NOT_ENROLLED' });
  assert.deepEqual(state.enrollmentQueries, [{ userId: student.id, courseId }]);
  assert.equal(state.writes, 0);
});

test('student creates server-priced PayOS order, and duplicate submit reuses it', async t => {
  const state = await fixture(t);
  const req = request();
  req.body.amount = 1;
  const first = response();
  await createOrder(req, first);
  assert.equal(first.statusCode, 201);
  assert.equal(first.body.data.status, 'PENDING');
  assert.equal(first.body.data.amount, 349000);
  assert.equal(first.body.data.entitlement, undefined);
  assert.equal(first.body.data.checkoutUrl, 'https://pay.payos.vn/web/fixture-link');
  const second = response();
  await createOrder(req, second);
  assert.equal(second.statusCode, 200);
  assert.equal(second.body.data.orderCode, first.body.data.orderCode);
  assert.equal(state.providerCalls, 1);
  assert.equal(state.writes, 1);
});

test('database unavailable rejects checkout before contacting PayOS or storing an order', async t => {
  const state = await fixture(t, { connected: false });
  t.mock.method(console, 'error', () => {});
  const res = response();
  await createOrder(request(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, 'PAYMENT_STORE_UNAVAILABLE');
  assert.equal(state.enrollmentQueries.length, 0);
  assert.equal(state.providerCalls, 0);
  assert.equal(state.writes, 0);
});

for (const source of ['PAYOS', 'KEY', 'ADMIN']) test(`existing ${source} access skips checkout without overwriting the enrollment`, async t => {
  const enrollment = { userId: student.id, courseId, status: 'ACTIVE', source };
  const state = await fixture(t, { enrollment });
  const res = response();
  await createOrder(request(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.entitlement.allowed, true);
  assert.equal(state.providerCalls, 0);
  assert.equal(state.writes, 0);
  assert.equal(state.enrollment, enrollment);
});

test('owner skips checkout without creating an enrollment or querying student rights', async t => {
  const state = await fixture(t);
  const res = response();
  await createOrder(request({ ...student, username: 'luphuc321@gmail.com', role: 'Admin' }), res);
  assert.equal(res.body.data.entitlement.reason, 'OWNER');
  assert.equal(state.enrollmentQueries.length, 0);
  assert.equal(state.providerCalls, 0);
  assert.equal(state.writes, 0);
});

test('revoked enrollment cannot be repurchased or restored by reading a paid order', async t => {
  const enrollment = { userId: student.id, courseId, status: 'REVOKED', source: 'PAYOS' };
  const state = await fixture(t, { enrollment });
  const res = response();
  await createOrder(request(), res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, 'ACCESS_REVOKED');
  state.row = { orderCode: 1712345678901, userId: student.id, username: student.username, courseId, status: 'PAID', amount: 349000 };
  const status = response();
  await getPaymentStatus(request(student, { params: { orderCode: state.row.orderCode } }), status);
  assert.equal(status.statusCode, 200);
  assert.equal(status.body.data.entitlement.allowed, false);
  assert.equal(status.body.data.entitlement.reason, 'REVOKED');
  assert.equal(state.enrollment.status, 'REVOKED');
  assert.equal(state.providerCalls, 0);
  assert.equal(state.writes, 0);
});

test('closed zero-price courses reject orders without grants or PayOS calls', async t => {
  const state = await fixture(t);
  for (const id of ['lop-tu-hoc-sql', 'thuc-chien-k46-k50', 'thuc-chien-k51']) {
    const res = response();
    await createOrder(request(student, { body: { ...request().body, courseId: id } }), res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.code, 'COURSE_CLOSED');
  }
  assert.equal(state.providerCalls, 0);
  assert.equal(state.writes, 0);
});

test('new order persists selected payment; cancel selection cannot revive an older order', async t => {
  const state = await fixture(t);
  await createOrder(request(), response());
  const selected = await getCheckoutView(student, courseId);
  assert.equal(selected.phase, 'PAYMENT');
  assert.equal(selected.resumeAutomatically, true);
  assert.equal(selected.order.orderCode, state.row.orderCode);
  await clearCheckoutOrder(student.id, courseId, state.row.orderCode);
  assert.equal((await getCheckoutView(student, courseId)).order, null);
  assert.equal(state.row.amount, 349000);
  assert.ok(state.row.purchaseConsent.documentHash);
});

test('quotes use live admin price and discount instead of a legacy payment amount', async t => {
  const state = await fixture(t);
  state.offer = { amount: 10000, version: 7, status: 'OPEN' };
  state.promotions = [{ _id: 'fixture-promotion', code: 'TCC', mode: 'CODE', type: 'PERCENT', value: 20, active: true, maxUses: 10, perUserLimit: 1, used: 0, reserved: 0, version: 1 }];
  const quote = await quoteCheckout(courseId, student, 'tcc');
  assert.equal(quote.baseAmount, 10000);
  assert.equal(quote.amount, 8000);
  assert.equal(quote.priceVersion, 7);
});

test('stale price or missing consent never creates a payment', async t => {
  const state = await fixture(t);
  state.offer = { amount: 10000, version: 7, status: 'OPEN' };
  const stale = response(); await createOrder(request(), stale);
  assert.equal(stale.body.code, 'CHECKOUT_PRICE_CHANGED');
  state.offer = null;
  const req = request(); delete req.body.purchaseConsent;
  const missing = response(); await createOrder(req, missing);
  assert.equal(missing.body.code, 'PURCHASE_CONSENT_REQUIRED');
  assert.equal(state.writes, 0); assert.equal(state.providerCalls, 0);
});

test('a second tab with another key cannot create another waiting order', async t => {
  const state = await fixture(t);
  await createOrder(request(), response());
  const firstCode = state.row.orderCode;
  const req = request(); req.get = () => 'different-tab-idempotency-123';
  // Match real model lookup semantics for the second key.
  t.mock.method(Payment, 'findOne', filter => query(filter.idempotencyKey && filter.idempotencyKey !== state.row.idempotencyKey ? null : state.row));
  const second = response(); await createOrder(req, second);
  assert.equal(second.body.code, 'CHECKOUT_ACTIVE_ORDER');
  assert.equal(state.row.orderCode, firstCode);
  assert.equal(state.writes, 1); assert.equal(state.providerCalls, 1);
});
