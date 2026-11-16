import { expect, test } from '@playwright/test';
import process from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '../../backend/services/sessionService.js';

const backendRequire = createRequire(new URL('../../backend/package.json', import.meta.url));
const { serialize } = backendRequire('cookie');
const sessionToken = 'google-tab-browser-test-session-token-123456789';

// Exercise the real backend cookie options and the browser's cookie policy.
// In local runs, this also catches accidentally restoring a production domain.
const localSessionCookie = () => {
  const envPath = new URL('../../backend/.env', import.meta.url);
  const localEnv = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  const keys = ['NODE_ENV', 'SESSION_COOKIE_DOMAIN', 'SESSION_COOKIE_SECURE', 'SESSION_COOKIE_SAME_SITE'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.NODE_ENV = 'development';
    for (const key of keys) {
      const value = localEnv.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1].trim();
      if (value === undefined) {
        if (key !== 'NODE_ENV') delete process.env[key];
      } else process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
    const options = getSessionCookieOptions();
    delete options.maxAge;
    return serialize(SESSION_COOKIE_NAME, sessionToken, options);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
};

test('Google opens a normal tab and the original page reads the authenticated backend session', async ({ page, context }) => {
  let exchangeCount = 0;
  const sessionCookie = localSessionCookie();
  const user = { id: 'google-tab-test-user', username: 'tab-test@example.test', name: 'Google Tab Test', role: 'Student' };
  await context.route('https://accounts.google.com/gsi/client*', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await context.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/providers') {
      await route.fulfill({ json: { providers: { google: { enabled: true }, github: { enabled: false } } } });
    } else if (path === '/api/auth/sync') {
      expect(route.request().postDataJSON()).toEqual({ idToken: 'firebase-token-for-test' });
      exchangeCount += 1;
      await route.fulfill({ headers: { 'set-cookie': sessionCookie }, json: { success: true, user } });
    } else if (path === '/api/auth/me') {
      const authenticated = (await route.request().allHeaders()).cookie?.includes(`${SESSION_COOKIE_NAME}=${sessionToken}`);
      await route.fulfill(authenticated
        ? { json: { success: true, user } }
        : { status: 401, json: { success: false, code: 'AUTH_REQUIRED', message: 'Vui lòng đăng nhập để tiếp tục.' } });
    } else {
      await route.fulfill({ json: {
        success: true, data: [], posts: [], resources: [], notifications: [],
        stats: { trendingTags: [] }, leaderboard: [], members: []
      } });
    }
  });
  await context.route('https://identitytoolkit.googleapis.com/v1/accounts:*', async (route) => {
    if (route.request().url().includes('createAuthUri')) {
      const body = route.request().postDataJSON();
      expect(body.authFlowType).toBe('CODE_FLOW');
      const authUri = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUri.searchParams.set('redirect_uri', body.continueUri);
      authUri.searchParams.set('state', 'bound-test-state');
      authUri.searchParams.set('response_type', 'code');
      await route.fulfill({ json: { authUri: authUri.href, sessionId: 'bound-firebase-session' } });
    } else if (route.request().url().includes('signInWithIdp')) {
      const body = route.request().postDataJSON();
      expect(body.sessionId).toBe('bound-firebase-session');
      expect(new URL(body.requestUri).searchParams.get('code')).toBe('one-use-test-code');
      await route.fulfill({ json: { providerId: 'google.com', idToken: 'firebase-token-for-test' } });
    } else {
      await route.fulfill({ status: 400, json: { error: { message: 'UNEXPECTED_TEST_REQUEST' } } });
    }
  });
  await context.route('https://accounts.google.com/o/oauth2/v2/auth*', async (route) => {
    const authUrl = new URL(route.request().url());
    const callback = new URL(authUrl.searchParams.get('redirect_uri'));
    callback.searchParams.set('code', 'one-use-test-code');
    callback.searchParams.set('state', authUrl.searchParams.get('state'));
    await route.fulfill({ status: 302, headers: { location: callback.href }, body: '' });
  });
  await page.addInitScript(() => {
    const originalOpen = window.open.bind(window);
    window.open = (...args) => {
      window.__authTabOpenArguments = args;
      return originalOpen(...args);
    };
  });
  await page.goto('/');
  await page.locator('.btn-login-nav').first().click();
  const newTabPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Google', exact: true }).click();
  const authTab = await newTabPromise;
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ueh_tcc_user') || 'null')?.id)).toBe(user.id);
  expect(await page.evaluate(() => window.__authTabOpenArguments)).toHaveLength(2);
  expect(await page.evaluate(() => window.__authTabOpenArguments[1])).toBe('_blank');
  expect(exchangeCount).toBe(1);
  const cookie = (await context.cookies()).find((item) => item.name === SESSION_COOKIE_NAME);
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.domain).toBe('127.0.0.1');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(page.url()).not.toContain('/auth/google');
  await expect.poll(() => authTab.isClosed()).toBe(true);
});
