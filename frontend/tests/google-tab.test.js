import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import {
  beginGoogleTabSignIn, completeGoogleTab, GOOGLE_TAB_RESULT,
  GOOGLE_TAB_STORAGE_KEY, prepareGoogleTab
} from '../src/services/googleTabService.js';

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalChannel = globalThis.BroadcastChannel;
const origin = 'http://localhost:5173';
const callbackUrl = `${origin}/auth/google`;
const requestId = '00000000-0000-4000-8000-000000000001';
const apiKey = 'public-web-test-key';
let records;
let storage;
let calls;

beforeEach(() => {
  records = new Map();
  storage = { getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value), removeItem: (key) => records.delete(key) };
  calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url === '/api/auth/providers') return Response.json({ providers: { google: { enabled: true } } });
    if (url.includes('createAuthUri')) return Response.json({
      sessionId: 'firebase-session',
      authUri: `https://accounts.google.com/o/oauth2/v2/auth?state=bound-state&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}`
    });
    if (url.includes('signInWithIdp')) return Response.json({ providerId: 'google.com', idToken: 'verified-by-backend' });
    if (url === '/api/auth/sync') return Response.json({ success: true, user: { id: 'server-user' } });
    throw new Error(`Unexpected endpoint: ${url}`);
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
  globalThis.BroadcastChannel = originalChannel;
});

test('Google tab binds the code flow to the callback, session and expiring state', async () => {
  await prepareGoogleTab({ requestId, origin, storage, apiKey });
  const transaction = JSON.parse(storage.getItem(GOOGLE_TAB_STORAGE_KEY));
  assert.equal(transaction.sessionId, 'firebase-session');
  assert.equal(transaction.state, 'bound-state');
  assert.equal(transaction.callbackUrl, callbackUrl);
  assert.ok(transaction.expiresAt > Date.now());
  const body = JSON.parse(calls[1].options.body);
  assert.equal(body.authFlowType, 'CODE_FLOW');
  assert.equal(body.continueUri, callbackUrl);
});

test('Google callback consumes its session and syncs only the Firebase-issued token', async () => {
  await prepareGoogleTab({ requestId, origin, storage, apiKey });
  const result = await completeGoogleTab({ requestUri: `${callbackUrl}?code=one-use-code&state=bound-state`, storage, apiKey });
  assert.deepEqual(result, { requestId });
  assert.equal(storage.getItem(GOOGLE_TAB_STORAGE_KEY), null);
  const exchange = calls.find((call) => call.url.includes('signInWithIdp'));
  assert.equal(JSON.parse(exchange.options.body).sessionId, 'firebase-session');
  const sync = calls.find((call) => call.url === '/api/auth/sync');
  assert.deepEqual(JSON.parse(sync.options.body), { idToken: 'verified-by-backend' });
  assert.equal(sync.options.credentials, 'include');
  await assert.rejects(completeGoogleTab({ requestUri: `${callbackUrl}?code=replay&state=bound-state`, storage, apiKey }), /hết hạn/);
});

test('Google callback rejects altered state, expired sessions and a different callback before exchange', async () => {
  await prepareGoogleTab({ requestId, origin, storage, apiKey });
  const saved = storage.getItem(GOOGLE_TAB_STORAGE_KEY);
  for (const requestUri of [
    `${callbackUrl}?code=code&state=attacker`,
    `https://other.example/auth/google?code=code&state=bound-state`
  ]) await assert.rejects(completeGoogleTab({ requestUri, storage, apiKey }), /không hợp lệ/);
  storage.setItem(GOOGLE_TAB_STORAGE_KEY, JSON.stringify({ ...JSON.parse(saved), expiresAt: 1 }));
  await assert.rejects(completeGoogleTab({ requestUri: `${callbackUrl}?code=code&state=bound-state`, storage, apiKey }), /hết hạn/);
  assert.equal(calls.length, 2);
});

test('Google denial consumes the valid transaction without creating a session', async () => {
  await prepareGoogleTab({ requestId, origin, storage, apiKey });
  await assert.rejects(completeGoogleTab({ requestUri: `${callbackUrl}?error=access_denied&state=bound-state`, storage, apiKey }), /hủy/);
  assert.equal(storage.getItem(GOOGLE_TAB_STORAGE_KEY), null);
  assert.equal(calls.length, 2);
});

test('Google tab signals cannot fabricate a user and opening never uses popup features', async () => {
  let channel;
  let opened;
  globalThis.BroadcastChannel = class {
    constructor(name) { this.name = name; channel = this; }
    close() {}
  };
  globalThis.window = {
    location: { origin }, addEventListener() {}, removeEventListener() {},
    open: (...args) => { opened = args; return { closed: true }; }
  };
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/auth/me');
    return Response.json({ user: { id: 'backend-confirmed' } });
  };
  const pending = beginGoogleTabSignIn();
  assert.equal(opened.length, 2);
  assert.equal(opened[1], '_blank');
  const id = new URL(opened[0], origin).searchParams.get('request');
  channel.onmessage({ data: { type: GOOGLE_TAB_RESULT, requestId: id, success: true, user: { id: 'forged' } } });
  assert.equal((await pending).id, 'backend-confirmed');
});

test('closing the login dialog can abort its tab wait without reopening a dialog', async () => {
  globalThis.BroadcastChannel = class { close() {} };
  globalThis.window = { location: { origin }, addEventListener() {}, removeEventListener() {}, open: () => ({}) };
  const controller = new AbortController();
  const pending = beginGoogleTabSignIn({ signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});
