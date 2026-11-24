import { expect, test } from '@playwright/test';
import process from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '../../backend/src/modules/identity/application/sessionService.js';

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

for (const scenario of ['login', 'repair', 'email-error']) {
test(`Google ${scenario}: opens a normal tab and preserves the correct account/session`, async ({ page, context }, testInfo) => {
  let exchangeCount = 0;
  let callbackSessionReads = 0;
  const sessionCookie = localSessionCookie();
  const user = { id: 'google-tab-test-user', username: 'tab-test@example.test', name: 'Google Tab Test', role: 'Student' };
  let activeUser = scenario === 'login' ? null : { ...user, username: 'firebase-012345678901234567890123@users.invalid' };
  if (activeUser) await context.addCookies([{ name: SESSION_COOKIE_NAME, value: sessionToken, url: 'http://127.0.0.1:4173', httpOnly: true }]);
  await context.route('https://accounts.google.com/gsi/client*', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await context.route('https://challenges.cloudflare.com/**', (route) => route.abort());
  await context.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/providers') {
      await route.fulfill({ json: { providers: { google: { enabled: true }, github: { enabled: false } } } });
    } else if (path === '/api/auth/sync') {
      expect(route.request().postDataJSON()).toEqual({ idToken: 'firebase-token-for-test', googleIdToken: 'google-proof-for-test' });
      exchangeCount += 1;
      if (scenario === 'email-error') {
        await route.fulfill({ status: 422, json: { success: false, code: 'GOOGLE_EMAIL_REQUIRED', message: 'Google chưa cung cấp email đã xác minh.' } });
        return;
      }
      activeUser = user;
      await route.fulfill({ headers: { 'set-cookie': sessionCookie }, json: { success: true, user } });
    } else if (path === '/api/auth/me') {
      if (new URL(route.request().frame().url()).pathname === '/auth/google') callbackSessionReads += 1;
      const authenticated = (await route.request().allHeaders()).cookie?.includes(`${SESSION_COOKIE_NAME}=${sessionToken}`);
      await route.fulfill(authenticated && activeUser
        ? { json: { success: true, user: activeUser, enrollments: [] } }
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
      expect(body.oauthScope).toBe('email profile');
      expect(body.customParameter.prompt).toBe('select_account');
      const authUri = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUri.searchParams.set('redirect_uri', body.continueUri);
      authUri.searchParams.set('state', 'bound-test-state');
      authUri.searchParams.set('response_type', 'code');
      authUri.searchParams.set('scope', 'openid email profile');
      await route.fulfill({ json: { authUri: authUri.href, sessionId: 'bound-firebase-session' } });
    } else if (route.request().url().includes('signInWithIdp')) {
      const body = route.request().postDataJSON();
      expect(body.sessionId).toBe('bound-firebase-session');
      expect(new URL(body.requestUri).searchParams.get('code')).toBe('one-use-test-code');
      expect(body.returnIdpCredential).toBe(true);
      await route.fulfill({ json: { providerId: 'google.com', idToken: 'firebase-token-for-test', oauthIdToken: 'google-proof-for-test' } });
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
  await page.goto(scenario === 'login' ? '/' : '/account?tab=profile');
  const essentialCookies = page.getByRole('button', { name: 'Chỉ dùng cần thiết', exact: true });
  if (await essentialCookies.isVisible()) await essentialCookies.click();
  if (scenario === 'login') {
    const login=page.locator('.btn-login-nav:visible').first();
    if(await login.count()) await login.click();
    else {await page.getByRole('button',{name:'Mở menu',exact:true}).click();await page.getByRole('button',{name:'Đăng Nhập',exact:true}).last().click();}
  }
  else {
    await expect(page.locator('.profile-email-notice')).toBeVisible();
    await expect(page.locator('.profile-identity-copy')).not.toContainText('@users.invalid');
    await expect(page.getByRole('textbox', { name: 'Email / tài khoản' })).toHaveValue('Chưa liên kết email');
    await page.screenshot({ path: testInfo.outputPath('email-notice-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Đồng bộ email Google', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Đồng bộ email Google', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('email-notice-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Đồng bộ email Google', exact: true }).click();
  }
  const newTabPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Google', exact: true }).click();
  const authTab = await newTabPromise;
  if (scenario === 'email-error') {
    await expect(page.getByRole('dialog').getByText('Chưa hoàn tất đồng bộ email. Hãy bấm Google hoặc One Tap để đăng nhập lại.')).toBeVisible();
    await expect(authTab.getByRole('alert')).toBeVisible();
    await expect(authTab.locator('#app-boot')).toHaveCount(0);
    await expect(page.locator('.profile-email-notice')).toBeVisible();
    expect((await context.cookies()).find(item => item.name === SESSION_COOKIE_NAME)?.value).toBe(sessionToken);
    expect(exchangeCount).toBe(1);
    await page.reload();
    await expect(page.locator('.profile-email-notice')).toBeVisible();
    await authTab.close();
    return;
  }
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ueh_tcc_user') || 'null')?.id)).toBe(user.id);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ueh_tcc_user') || 'null')?.username)).toBe(user.username);
  expect(callbackSessionReads).toBe(0);
  expect(await page.evaluate(() => window.__authTabOpenArguments)).toHaveLength(2);
  expect(await page.evaluate(() => window.__authTabOpenArguments[1])).toBe('_blank');
  expect(exchangeCount).toBe(1);
  const cookie = (await context.cookies()).find((item) => item.name === SESSION_COOKIE_NAME);
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.domain).toBe('127.0.0.1');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(page.url()).not.toContain('/auth/google');
  await expect.poll(() => authTab.isClosed()).toBe(true);
  if (scenario === 'repair') {
    await expect(page.locator('.profile-email-notice')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Email / tài khoản' })).toHaveValue(user.username);
    await expect(page.getByRole('textbox', { name: 'Họ và tên' })).toHaveValue(user.name);
  }
});
}
