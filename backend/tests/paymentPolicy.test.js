import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyPayOSWebhook,
  createPayOSSignature,
  isStrictPayOSPaidSignal,
  normalizePaymentResponse,
  paymentResultUrls,
  persistPayOSCreateResult,
  resolvePaymentStatus,
  resolveBuyerEmail,
  safeCompareSignature,
  shouldMarkCreateFailure,
  shouldReconcilePayment,
  validatePayOSCreateResponse,
  verifyPayOSDataSignature
} from '../controllers/paymentController.js';
import { getCourseOffering } from '../config/courseCatalog.js';
import { getPaidEnrollmentRepairAction } from '../services/enrollmentService.js';

test('a non-paid or out-of-order webhook never downgrades PAID', () => {
  assert.equal(resolvePaymentStatus('PAID', false), 'PAID');
  assert.equal(resolvePaymentStatus('PAID', true), 'PAID');
  assert.equal(resolvePaymentStatus('CREATING', false), 'PENDING');
  assert.equal(resolvePaymentStatus('PENDING', false), 'PENDING');
  assert.equal(resolvePaymentStatus('FAILED', false), 'FAILED');
});

test('the server course catalog is the authority for payment amounts', () => {
  assert.equal(getCourseOffering('tu-hoc-toan-cao-cap').amount, 349000);
  assert.equal(getCourseOffering('lop-tu-hoc-sql').amount, 0);
  assert.equal(getCourseOffering('thuc-chien-k46-k50').amount, 4100000);
  assert.equal(getCourseOffering('thuc-chien-k51').amount, 3900000);
  assert.equal(getCourseOffering('unknown-course'), null);
});

test('payment responses do not expose ownership, buyer or webhook data', () => {
  const response = normalizePaymentResponse({
    orderCode: 123,
    courseId: 'tu-hoc-toan-cao-cap',
    amount: 349000,
    status: 'PENDING',
    userId: 'private-user-id',
    username: 'private@example.com',
    buyerPhone: '0900000000',
    webhookData: { accountNumber: 'private' }
  });

  assert.equal(response.orderCode, 123);
  assert.equal(response.courseId, 'tu-hoc-toan-cao-cap');
  assert.equal(Object.hasOwn(response, 'userId'), false);
  assert.equal(Object.hasOwn(response, 'username'), false);
  assert.equal(Object.hasOwn(response, 'buyerPhone'), false);
  assert.equal(Object.hasOwn(response, 'webhookData'), false);
});

test('PayOS signatures use the canonical sorted fields and constant-time validation', () => {
  const checksumKey = 'test-checksum-key';
  const data = {
    returnUrl: 'https://example.com/payment/result',
    orderCode: 1712345678901,
    description: 'TCC678901',
    cancelUrl: 'https://example.com/payment/result?cancelled=1',
    amount: 349000
  };
  const signature = createPayOSSignature(data, checksumKey);

  assert.match(signature, /^[a-f0-9]{64}$/);
  assert.equal(verifyPayOSDataSignature(data, signature, checksumKey), true);
  assert.equal(verifyPayOSDataSignature({ ...data, amount: 1 }, signature, checksumKey), false);
  assert.equal(safeCompareSignature(signature, 'not-a-signature'), false);
});

test('paid enrollment repair creates only missing rows and preserves revocations', () => {
  assert.equal(getPaidEnrollmentRepairAction(null), 'CREATE');
  assert.equal(getPaidEnrollmentRepairAction({ status: 'ACTIVE' }), 'KEEP_ACTIVE');
  assert.equal(getPaidEnrollmentRepairAction({ status: 'REVOKED' }), 'KEEP_REVOKED');
});

test('buyer email is bound to the authenticated account', () => {
  const authUser = { username: ' Student@Example.com ' };
  assert.equal(resolveBuyerEmail(undefined, authUser), 'student@example.com');
  assert.equal(resolveBuyerEmail('student@example.com', authUser), 'student@example.com');
  assert.throws(
    () => resolveBuyerEmail('attacker@example.com', authUser),
    (error) => error.statusCode === 400 && error.code === 'BUYER_EMAIL_MISMATCH'
  );
});

test('signed create response must match the reserved order and trusted checkout origin', () => {
  const payment = { orderCode: 1712345678901, amount: 349000 };
  const valid = {
    orderCode: payment.orderCode,
    amount: payment.amount,
    status: 'PENDING',
    paymentLinkId: 'link-123',
    checkoutUrl: 'https://pay.payos.vn/web/link-123',
    qrCode: 'qr-data'
  };

  assert.deepEqual(validatePayOSCreateResponse(valid, payment), {
    paymentLinkId: 'link-123',
    checkoutUrl: 'https://pay.payos.vn/web/link-123',
    qrCode: 'qr-data'
  });
  for (const invalid of [
    { ...valid, orderCode: payment.orderCode + 1 },
    { ...valid, amount: 1 },
    { ...valid, checkoutUrl: 'https://payos.vn.attacker.example/checkout' },
    { ...valid, checkoutUrl: 'http://pay.payos.vn/web/link-123' }
  ]) {
    assert.throws(
      () => validatePayOSCreateResponse(invalid, payment),
      (error) => error.statusCode === 502 && error.code === 'PAYOS_INVALID_RESPONSE'
    );
  }
});

test('only a complete PayOS paid event is accepted and all unknown cases are classified', () => {
  const payment = { amount: 349000, paymentLinkId: 'link-123' };
  const webhook = {
    success: true,
    code: '00',
    data: { code: '00', amount: 349000, paymentLinkId: 'link-123' }
  };

  assert.equal(isStrictPayOSPaidSignal(webhook), true);
  assert.deepEqual(classifyPayOSWebhook(webhook, payment), { accepted: true, reason: null });
  assert.deepEqual(
    classifyPayOSWebhook({ ...webhook, data: { ...webhook.data, code: undefined } }, payment),
    { accepted: false, reason: 'NON_SUCCESS_EVENT' }
  );
  assert.deepEqual(classifyPayOSWebhook(webhook, null), {
    accepted: false,
    reason: 'UNKNOWN_ORDER'
  });
  assert.deepEqual(
    classifyPayOSWebhook({ ...webhook, data: { ...webhook.data, amount: 1 } }, payment),
    { accepted: false, reason: 'AMOUNT_MISMATCH' }
  );
  assert.deepEqual(
    classifyPayOSWebhook(
      { ...webhook, data: { ...webhook.data, paymentLinkId: 'other-link' } },
      payment
    ),
    { accepted: false, reason: 'PAYMENT_LINK_MISMATCH' }
  );
});

test('reconciliation is throttled per pending order', () => {
  const now = Date.parse('2026-10-05T00:00:10.000Z');
  assert.equal(shouldReconcilePayment({ status: 'PENDING' }, now), true);
  assert.equal(shouldReconcilePayment({
    status: 'PENDING',
    providerStatusCheckedAt: new Date(now - 4_999)
  }, now), false);
  assert.equal(shouldReconcilePayment({
    status: 'CREATING',
    providerStatusCheckedAt: new Date(now - 5_000)
  }, now), true);
  assert.equal(shouldReconcilePayment({ status: 'PAID' }, now), false);
});

test('only a definitive provider rejection marks create as failed', () => {
  assert.equal(shouldMarkCreateFailure({ code: 'PAYOS_REJECTED' }), true);
  assert.equal(shouldMarkCreateFailure({ code: 'PAYOS_UNAVAILABLE' }), false);
  assert.equal(shouldMarkCreateFailure({ code: 'PAYOS_INVALID_RESPONSE' }), false);
});

test('create response persistence preserves a webhook status that won the race', async () => {
  const calls = [];
  const paid = { _id: 'payment-id', status: 'PAID' };
  const paymentModel = {
    async findOneAndUpdate(filter, update) {
      calls.push({ filter, update });
      return calls.length === 1 ? null : paid;
    },
    async findById() {
      throw new Error('findById should not be needed when PAID reload succeeds');
    }
  };
  const result = await persistPayOSCreateResult(
    { _id: 'payment-id', status: 'CREATING' },
    {
      paymentLinkId: 'link-123',
      checkoutUrl: 'https://pay.payos.vn/web/link-123',
      qrCode: 'qr-data'
    },
    paymentModel
  );

  assert.equal(result, paid);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].update.$set.status, 'PENDING');
  assert.deepEqual(calls[1].filter.status, { $in: ['PENDING', 'PAID'] });
  assert.equal(Object.hasOwn(calls[1].update.$set, 'status'), false);
});

test('development payment result URLs target the Vite frontend', () => {
  const previous = {
    frontend: process.env.FRONTEND_URL,
    client: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV
  };
  try {
    delete process.env.FRONTEND_URL;
    delete process.env.CLIENT_URL;
    process.env.NODE_ENV = 'development';
    const urls = paymentResultUrls({});
    assert.equal(urls.returnUrl, 'http://localhost:5173/payment/result');
    assert.equal(urls.cancelUrl, 'http://localhost:5173/payment/result?cancelled=1');
  } finally {
    for (const [name, value] of [
      ['FRONTEND_URL', previous.frontend],
      ['CLIENT_URL', previous.client],
      ['NODE_ENV', previous.nodeEnv]
    ]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
