import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getEmailDeliveryConfiguration,
  getPasswordResetReadiness,
  getPasswordResetSecret,
  reportPasswordResetReadiness
} from '../config/passwordResetConfig.js';

test('production password reset requires a stable private secret and email delivery', () => {
  const readiness = getPasswordResetReadiness({ NODE_ENV: 'production' });

  assert.equal(readiness.ready, false);
  assert.equal(readiness.status, 'unavailable');
  assert.equal(readiness.secretSource, null);
  assert.equal(readiness.emailProvider, null);
  assert.match(readiness.issues.join(' '), /OTP_SECRET/);
  assert.match(readiness.issues.join(' '), /RESEND_API_KEY/);
});

test('OTP_SECRET is preferred and no secret value appears in readiness diagnostics', () => {
  const env = {
    NODE_ENV: 'production',
    OTP_SECRET: `  ${'a'.repeat(64)}  `,
    SESSION_SECRET: 'session-secret-must-not-win',
    RESEND_API_KEY: '  private-resend-key  ',
    RESEND_FROM_EMAIL: '  "UEH TCC <no-reply@example.com>"  '
  };
  const secret = getPasswordResetSecret(env);
  const readiness = getPasswordResetReadiness(env);

  assert.equal(secret.value, 'a'.repeat(64));
  assert.equal(secret.source, 'OTP_SECRET');
  assert.equal(readiness.ready, true);
  assert.equal(readiness.emailProvider, 'resend');
  assert.equal(getEmailDeliveryConfiguration(env).resend.from, 'UEH TCC <no-reply@example.com>');
  assert.equal(JSON.stringify(readiness).includes(secret.value), false);
  assert.equal(JSON.stringify(readiness).includes('private-resend-key'), false);
});

test('development gets a process-stable OTP pepper but production never does', () => {
  const first = getPasswordResetSecret({ NODE_ENV: 'development' });
  const second = getPasswordResetSecret({ NODE_ENV: 'development' });
  const production = getPasswordResetSecret({ NODE_ENV: 'production' });

  assert.equal(first.ephemeral, true);
  assert.equal(first.value, second.value);
  assert.ok(first.value.length >= 64);
  assert.equal(production.value, '');
});

test('email settings are trimmed, validate SMTP pairs, and never enable mocks in production', () => {
  const smtp = getEmailDeliveryConfiguration({
    NODE_ENV: 'production',
    EMAIL_USER: '  sender@example.com ',
    EMAIL_PASS: ' app-password ',
    EMAIL_HOST: ' smtp.example.com ',
    EMAIL_PORT: 'invalid',
    EMAIL_SECURE: ' TRUE ',
    ALLOW_MOCK_EMAIL: 'true'
  });
  const partial = getEmailDeliveryConfiguration({
    NODE_ENV: 'production',
    EMAIL_USER: 'sender@example.com'
  });

  assert.equal(smtp.smtp.enabled, true);
  assert.equal(smtp.smtp.user, 'sender@example.com');
  assert.equal(smtp.smtp.password, 'app-password');
  assert.equal(smtp.smtp.host, 'smtp.example.com');
  assert.equal(smtp.smtp.port, 587);
  assert.equal(smtp.smtp.secure, true);
  assert.equal(smtp.mockEnabled, false);
  assert.equal(partial.smtp.enabled, false);
  assert.equal(partial.smtp.partiallyConfigured, true);
});

test('readiness logging is credential-free and points to missing Render variables', () => {
  const messages = [];
  const readiness = reportPasswordResetReadiness({
    env: {
      NODE_ENV: 'production',
      EMAIL_USER: 'sender@example.com',
      EMAIL_PASS: 'do-not-log-this'
    },
    logger: {
      info: (message) => messages.push(message),
      warn: (message) => messages.push(message)
    }
  });

  assert.equal(readiness.ready, false);
  assert.match(messages.join(' '), /OTP_SECRET/);
  assert.equal(messages.join(' ').includes('do-not-log-this'), false);
  assert.equal(messages.join(' ').includes('sender@example.com'), false);
});
