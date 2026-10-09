import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getSessionCookieOptions,
  isSessionVersionCurrent
} from '../services/sessionService.js';
import {
  hashPassword,
  needsPasswordRehash,
  verifyPassword
} from '../utils/passwordHelper.js';
import { getPublicAuthProviders } from '../controllers/authController.js';
import {
  DEFAULT_FIREBASE_PROJECT_ID,
  getConfiguredFirebaseProjectId,
  verifyFirebaseIdToken
} from '../services/firebaseTokenService.js';

test('session cookies are HttpOnly and production-safe', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSameSite = process.env.SESSION_COOKIE_SAME_SITE;
  const previousSecure = process.env.SESSION_COOKIE_SECURE;
  const previousDomain = process.env.SESSION_COOKIE_DOMAIN;

  try {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_COOKIE_SAME_SITE = 'none';
    process.env.SESSION_COOKIE_SECURE = 'false';
    process.env.SESSION_COOKIE_DOMAIN = '.toancaocapueh.id.vn';

    const options = getSessionCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.secure, true);
    assert.equal(options.sameSite, 'none');
    assert.equal(options.path, '/');
    assert.equal(options.priority, 'high');
    assert.equal(options.domain, '.toancaocapueh.id.vn');
    assert.ok(options.maxAge >= 24 * 60 * 60 * 1000);
    assert.equal(getSessionCookieOptions(45_000).maxAge, 45_000);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousSameSite === undefined) delete process.env.SESSION_COOKIE_SAME_SITE;
    else process.env.SESSION_COOKIE_SAME_SITE = previousSameSite;
    if (previousSecure === undefined) delete process.env.SESSION_COOKIE_SECURE;
    else process.env.SESSION_COOKIE_SECURE = previousSecure;
    if (previousDomain === undefined) delete process.env.SESSION_COOKIE_DOMAIN;
    else process.env.SESSION_COOKIE_DOMAIN = previousDomain;
  }
});

test('password hashing is asynchronous and never accepts plaintext storage', async () => {
  const password = 'correct-horse-battery-staple';
  const pendingHash = hashPassword(password);

  assert.equal(typeof pendingHash?.then, 'function');
  const storedHash = await pendingHash;
  assert.match(storedHash, /^scrypt\$/);
  assert.equal(await verifyPassword(password, storedHash), true);
  assert.equal(await verifyPassword('wrong-password', storedHash), false);
  assert.equal(await verifyPassword(password, password), false);
  assert.equal(needsPasswordRehash(storedHash), false);
});

test('password changes invalidate every session issued under an older version', () => {
  assert.equal(isSessionVersionCurrent({}, {}), true);
  assert.equal(
    isSessionVersionCurrent({ sessionVersion: 2 }, { sessionVersion: 2 }),
    true
  );
  assert.equal(
    isSessionVersionCurrent({ sessionVersion: 2 }, { sessionVersion: 3 }),
    false
  );
});

test('legacy password rehash uses compare-and-set instead of saving a stale user', async () => {
  const source = await readFile(
    new URL('../controllers/authController.js', import.meta.url),
    'utf8'
  );

  assert.match(source, /\{ _id: user\._id, password: originalPasswordHash \}/);
  assert.doesNotMatch(source, /user\.password\s*=\s*await hashPassword\(password\)/);
  assert.match(source, /Another login or password reset won the race/);
});

test('Firebase sessions rotate and cannot outlive the verified ID token', async () => {
  const [authSource, tokenSource] = await Promise.all([
    readFile(new URL('../controllers/authController.js', import.meta.url), 'utf8'),
    readFile(new URL('../services/firebaseTokenService.js', import.meta.url), 'utf8')
  ]);

  assert.match(tokenSource, /expiresAt: payload\.exp \* 1000/);
  assert.match(authSource, /rotateSession\(req, res, user/);
  assert.match(authSource, /ttlMs: identity\.expiresAt - Date\.now\(\)/);
});

test('the public OAuth configuration never exposes the GitHub client secret', () => {
  const previousClientId = process.env.GITHUB_CLIENT_ID;
  const previousClientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    process.env.GITHUB_CLIENT_ID = 'public-github-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'server-only-github-client-secret';

    const providers = getPublicAuthProviders();
    assert.deepEqual(providers, {
      google: {
        enabled: Boolean(getConfiguredFirebaseProjectId())
      },
      github: {
        enabled: true,
        clientId: 'public-github-client-id'
      }
    });
    assert.equal(JSON.stringify(providers).includes(process.env.GITHUB_CLIENT_SECRET), false);
  } finally {
    if (previousClientId === undefined) delete process.env.GITHUB_CLIENT_ID;
    else process.env.GITHUB_CLIENT_ID = previousClientId;
    if (previousClientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
    else process.env.GITHUB_CLIENT_SECRET = previousClientSecret;
  }
});

test('Google OAuth availability reflects the Firebase verifier configuration', () => {
  const previousProjectId = process.env.FIREBASE_PROJECT_ID;
  const previousViteProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const previousAuthDisabled = process.env.FIREBASE_AUTH_DISABLED;

  try {
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.VITE_FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_AUTH_DISABLED;
    assert.equal(getConfiguredFirebaseProjectId(), DEFAULT_FIREBASE_PROJECT_ID);
    assert.equal(getPublicAuthProviders().google.enabled, true);

    process.env.VITE_FIREBASE_PROJECT_ID = 'toancaocapueh-preview';
    assert.equal(getPublicAuthProviders().google.enabled, true);

    process.env.FIREBASE_PROJECT_ID = '  toancaocapueh-auth  ';
    assert.equal(getPublicAuthProviders().google.enabled, true);

    process.env.FIREBASE_PROJECT_ID = '   ';
    assert.equal(getPublicAuthProviders().google.enabled, true);

    process.env.FIREBASE_AUTH_DISABLED = 'true';
    assert.equal(getPublicAuthProviders().google.enabled, false);
  } finally {
    if (previousProjectId === undefined) delete process.env.FIREBASE_PROJECT_ID;
    else process.env.FIREBASE_PROJECT_ID = previousProjectId;
    if (previousViteProjectId === undefined) delete process.env.VITE_FIREBASE_PROJECT_ID;
    else process.env.VITE_FIREBASE_PROJECT_ID = previousViteProjectId;
    if (previousAuthDisabled === undefined) delete process.env.FIREBASE_AUTH_DISABLED;
    else process.env.FIREBASE_AUTH_DISABLED = previousAuthDisabled;
  }
});

test('Firebase verification uses the same trimmed project ID as provider metadata', async () => {
  const previousProjectId = process.env.FIREBASE_PROJECT_ID;
  const previousViteProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const previousAuthDisabled = process.env.FIREBASE_AUTH_DISABLED;

  try {
    delete process.env.FIREBASE_AUTH_DISABLED;
    process.env.FIREBASE_PROJECT_ID = '   ';
    process.env.VITE_FIREBASE_PROJECT_ID = '  toancaocapueh-auth  ';

    assert.equal(getConfiguredFirebaseProjectId(), 'toancaocapueh-auth');
    await assert.rejects(
      verifyFirebaseIdToken('not-a-token'),
      (error) => error.code === 'INVALID_FIREBASE_TOKEN' && error.statusCode === 401
    );

    delete process.env.VITE_FIREBASE_PROJECT_ID;
    assert.equal(getConfiguredFirebaseProjectId(), DEFAULT_FIREBASE_PROJECT_ID);
    await assert.rejects(
      verifyFirebaseIdToken('not-a-token'),
      (error) => error.code === 'INVALID_FIREBASE_TOKEN' && error.statusCode === 401
    );

    process.env.FIREBASE_AUTH_DISABLED = 'true';
    assert.equal(getConfiguredFirebaseProjectId(), '');
    await assert.rejects(
      verifyFirebaseIdToken('not-a-token'),
      (error) => error.code === 'FIREBASE_AUTH_UNAVAILABLE' && error.statusCode === 503
    );
  } finally {
    if (previousProjectId === undefined) delete process.env.FIREBASE_PROJECT_ID;
    else process.env.FIREBASE_PROJECT_ID = previousProjectId;
    if (previousViteProjectId === undefined) delete process.env.VITE_FIREBASE_PROJECT_ID;
    else process.env.VITE_FIREBASE_PROJECT_ID = previousViteProjectId;
    if (previousAuthDisabled === undefined) delete process.env.FIREBASE_AUTH_DISABLED;
    else process.env.FIREBASE_AUTH_DISABLED = previousAuthDisabled;
  }
});

test('GitHub OAuth is enabled only when both trimmed credentials are configured', () => {
  const previousClientId = process.env.GITHUB_CLIENT_ID;
  const previousClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const cases = [
    {
      name: 'client ID only',
      clientId: 'public-github-client-id',
      clientSecret: undefined,
      expectedClientId: 'public-github-client-id'
    },
    {
      name: 'client secret only',
      clientId: undefined,
      clientSecret: 'server-only-github-client-secret',
      expectedClientId: null
    },
    {
      name: 'whitespace credentials',
      clientId: '   ',
      clientSecret: ' \t ',
      expectedClientId: null
    }
  ];

  try {
    for (const testCase of cases) {
      if (testCase.clientId === undefined) delete process.env.GITHUB_CLIENT_ID;
      else process.env.GITHUB_CLIENT_ID = testCase.clientId;
      if (testCase.clientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
      else process.env.GITHUB_CLIENT_SECRET = testCase.clientSecret;

      const providers = getPublicAuthProviders();
      assert.equal(providers.github.enabled, false, testCase.name);
      assert.equal(providers.github.clientId, testCase.expectedClientId, testCase.name);
      assert.equal(Object.hasOwn(providers.github, 'clientSecret'), false, testCase.name);
    }
  } finally {
    if (previousClientId === undefined) delete process.env.GITHUB_CLIENT_ID;
    else process.env.GITHUB_CLIENT_ID = previousClientId;
    if (previousClientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
    else process.env.GITHUB_CLIENT_SECRET = previousClientSecret;
  }
});
