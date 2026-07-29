import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePaymentResponse,
  resolvePaymentStatus
} from '../controllers/paymentController.js';
import { getCourseOffering } from '../config/courseCatalog.js';

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
