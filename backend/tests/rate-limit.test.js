import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimit } from '../middleware/rateLimit.js';

const createResponse = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    payload: null,
    setHeader(name, value) {
      headers.set(name, value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    headers
  };
};

test('rate limiter allows requests up to its configured maximum', () => {
  const limiter = createRateLimit({
    namespace: `test-allow-${Date.now()}`,
    windowMs: 60_000,
    max: 2
  });
  const req = { ip: '203.0.113.10' };
  let nextCalls = 0;

  limiter(req, createResponse(), () => { nextCalls += 1; });
  limiter(req, createResponse(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
});

test('rate limiter rejects excess requests with retry metadata', () => {
  const limiter = createRateLimit({
    namespace: `test-reject-${Date.now()}`,
    windowMs: 60_000,
    max: 1
  });
  const req = { ip: '203.0.113.11' };
  let nextCalls = 0;

  limiter(req, createResponse(), () => { nextCalls += 1; });
  const blockedResponse = createResponse();
  limiter(req, blockedResponse, () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(blockedResponse.statusCode, 429);
  assert.equal(blockedResponse.payload.code, 'RATE_LIMITED');
  assert.ok(Number(blockedResponse.headers.get('Retry-After')) > 0);
});
