import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import {
  beginGithubOAuth,
  GITHUB_OAUTH_MODE_KEY,
  GITHUB_OAUTH_STATE_KEY
} from '../src/services/oauthService.js';

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalSessionStorage = globalThis.sessionStorage;

let storage;

beforeEach(() => {
  storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
  globalThis.sessionStorage = originalSessionStorage;
});

const providerResponse = () => Response.json({
  providers: {
    github: { enabled: true, clientId: 'public-client-id' }
  }
});

test('GitHub OAuth opens an account-selection popup with state protection', async () => {
  let popupUrl = '';
  const popup = {
    closed: false,
    location: { replace: (url) => { popupUrl = url; } },
    focus: () => {},
    close: () => { popup.closed = true; }
  };
  globalThis.window = {
    screenX: 20,
    screenY: 30,
    outerWidth: 1440,
    outerHeight: 900,
    open: () => popup,
    location: { assign: () => assert.fail('popup flow should not replace the main window') }
  };
  globalThis.fetch = async () => providerResponse();

  const result = await beginGithubOAuth();
  const url = new URL(popupUrl);

  assert.equal(result.mode, 'popup');
  assert.equal(result.popup, popup);
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.pathname, '/login/oauth/authorize');
  assert.equal(url.searchParams.get('client_id'), 'public-client-id');
  assert.equal(url.searchParams.get('scope'), 'user:email');
  assert.equal(url.searchParams.get('prompt'), 'select_account');
  assert.equal(url.searchParams.get('state'), sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY));
  assert.equal(sessionStorage.getItem(GITHUB_OAUTH_MODE_KEY), 'popup');
});

test('GitHub OAuth falls back to a full-page redirect when popups are blocked', async () => {
  let assignedUrl = '';
  globalThis.window = {
    screenX: 0,
    screenY: 0,
    outerWidth: 1280,
    outerHeight: 800,
    open: () => null,
    location: { assign: (url) => { assignedUrl = url; } }
  };
  globalThis.fetch = async () => providerResponse();

  const result = await beginGithubOAuth();

  assert.equal(result.mode, 'redirect');
  assert.match(assignedUrl, /^https:\/\/github\.com\/login\/oauth\/authorize\?/);
  assert.ok(sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY));
  assert.equal(sessionStorage.getItem(GITHUB_OAUTH_MODE_KEY), 'redirect');
});

test('GitHub OAuth closes the reserved popup and clears state when unavailable', async () => {
  let popupClosed = false;
  const popup = {
    closed: false,
    location: { replace: () => {} },
    focus: () => {},
    close: () => { popupClosed = true; }
  };
  globalThis.window = {
    screenX: 0,
    screenY: 0,
    outerWidth: 1280,
    outerHeight: 800,
    open: () => popup,
    location: { assign: () => {} }
  };
  globalThis.fetch = async () => Response.json({
    providers: { github: { enabled: false, clientId: null } }
  });

  await assert.rejects(beginGithubOAuth(), /chưa được cấu hình/);
  assert.equal(popupClosed, true);
  assert.equal(sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY), null);
  assert.equal(sessionStorage.getItem(GITHUB_OAUTH_MODE_KEY), null);
});
