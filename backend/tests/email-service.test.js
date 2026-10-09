import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { sendOtpEmail } from '../services/emailService.js';

const ENV_KEYS = [
  'NODE_ENV',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'ALLOW_MOCK_EMAIL'
];

const originalEnvironment = new Map();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  originalEnvironment.clear();
  for (const key of ENV_KEYS) {
    originalEnvironment.set(key, process.env[key]);
    delete process.env[key];
  }
});

afterEach(() => {
  for (const [key, value] of originalEnvironment) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
});

test('Resend delivery uses trimmed server credentials and sender values', async () => {
  process.env.NODE_ENV = 'production';
  process.env.RESEND_API_KEY = '  resend-private-key  ';
  process.env.RESEND_FROM_EMAIL = '  UEH TCC <no-reply@example.com>  ';
  let capturedRequest;
  globalThis.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return Response.json({ id: 'email-id-1' });
  };

  const result = await sendOtpEmail(
    'student@example.com',
    'Sinh viên',
    '123456',
    new Date(Date.now() + 600_000).toISOString()
  );
  const body = JSON.parse(capturedRequest.options.body);

  assert.equal(result.success, true);
  assert.equal(result.isMock, false);
  assert.equal(capturedRequest.url, 'https://api.resend.com/emails');
  assert.equal(capturedRequest.options.headers.Authorization, 'Bearer resend-private-key');
  assert.equal(body.from, 'UEH TCC <no-reply@example.com>');
  assert.deepEqual(body.to, ['student@example.com']);
  assert.match(body.html, /123456/);
});

test('production fails closed when no real email provider is configured', async () => {
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_MOCK_EMAIL = 'true';

  await assert.rejects(
    sendOtpEmail(
      'student@example.com',
      'Sinh viên',
      '123456',
      new Date(Date.now() + 600_000).toISOString()
    ),
    (error) => error.code === 'EMAIL_DELIVERY_UNAVAILABLE'
  );
});
