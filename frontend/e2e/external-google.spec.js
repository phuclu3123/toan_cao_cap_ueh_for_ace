import { expect, test } from '@playwright/test';
import { createGoogleAuthFixture } from './helpers/google-auth-fixture.js';

for (const flow of ['tab', 'one-tap']) for (const mode of ['new', 'legacy', 'canonical']) {
  test(`${flow} with Firebase email absent: ${mode} account completes safely`, async ({ page, context }) => {
    const fixture = createGoogleAuthFixture(mode);
    let loggedInUser = null;
    const syncBodies = [];
    try {
      await context.route('https://challenges.cloudflare.com/**', route => route.abort());
      await context.route('https://accounts.google.com/gsi/client*', route => route.fulfill({ contentType: 'application/javascript', body: `
        window.google = { accounts: { id: {
          initialize(options) { window.__oneTapCallback = options.callback; },
          prompt() {}, cancel() {}, disableAutoSelect() {}, renderButton() {},
          revoke() {}, storeCredential() {}
        } } };
      ` }));
      await context.route('**/api/**', async route => {
        const path = new URL(route.request().url()).pathname;
        if (path === '/api/auth/providers') return route.fulfill({ json: { providers: { google: { enabled: true }, github: { enabled: false } } } });
        if (path === '/api/auth/sync') {
          const body = route.request().postDataJSON(); syncBodies.push(body);
          try {
            loggedInUser = await fixture.resolve(body);
            return route.fulfill({ headers: { 'set-cookie': 'ueh_tcc_session=browser-google-fixture-session; Path=/; HttpOnly; SameSite=Lax' }, json: { success: true, user: loggedInUser } });
          } catch (error) {
            return route.fulfill({ status: error.statusCode || 500, json: { success: false, code: error.code, message: error.message } });
          }
        }
        if (path === '/api/auth/me') return route.fulfill(loggedInUser
          ? { json: { success: true, user: loggedInUser, enrollments: [] } }
          : { status: 401, json: { success: false, code: 'AUTH_REQUIRED', message: 'Vui lòng đăng nhập.' } });
        return route.fulfill({ json: { success: true, data: [], posts: [], resources: [], notifications: [], stats: { trendingTags: [] }, leaderboard: [], members: [] } });
      });
      await context.route('https://identitytoolkit.googleapis.com/**', async route => {
        const url = route.request().url();
        const body = route.request().postDataJSON();
        if (url.includes('createAuthUri')) {
          const authUri = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          for (const [key, value] of Object.entries({ redirect_uri: body.continueUri, state: 'signed-fixture-state', response_type: 'code', scope: 'openid email profile' })) authUri.searchParams.set(key, value);
          return route.fulfill({ json: { authUri: authUri.href, sessionId: 'signed-fixture-session' } });
        }
        if (url.includes('signInWithIdp')) {
          if (flow === 'one-tap') expect(new URLSearchParams(body.postBody).get('id_token')).toBe(fixture.googleToken);
          return route.fulfill({ json: { localId: fixture.uid, providerId: 'google.com', idToken: fixture.firebaseToken,
            oauthIdToken: fixture.googleToken, refreshToken: 'fixture-refresh-token', expiresIn: '3600',
            rawUserInfo: JSON.stringify({ sub: fixture.googleSub, email: fixture.email, email_verified: true }),
            isNewUser: mode === 'new' } });
        }
        if (url.includes('accounts:lookup')) return route.fulfill({ json: { users: [{ localId: fixture.uid,
          displayName: 'Google Display Name', emailVerified: false, createdAt: '1700000000000', lastLoginAt: String(Date.now()),
          providerUserInfo: [{ providerId: 'google.com', rawId: fixture.googleSub, email: fixture.email, displayName: 'Google Display Name' }] }] } });
        return route.fulfill({ status: 400, json: { error: { message: 'UNEXPECTED_FIXTURE_ENDPOINT' } } });
      });
      await context.route('https://securetoken.googleapis.com/**', route => route.fulfill({ json: {
        access_token: fixture.firebaseToken, id_token: fixture.firebaseToken, refresh_token: 'fixture-refresh-token',
        expires_in: '3600', token_type: 'Bearer', user_id: fixture.uid
      } }));
      await context.route('https://accounts.google.com/o/oauth2/v2/auth*', async route => {
        const url = new URL(route.request().url()); const callback = new URL(url.searchParams.get('redirect_uri'));
        callback.searchParams.set('code', 'fixture-one-use-code'); callback.searchParams.set('state', url.searchParams.get('state'));
        return route.fulfill({ status: 302, headers: { location: callback.href }, body: '' });
      });
      await page.goto('/');
      await expect(page.locator('#app-boot')).toHaveCount(0);
      await page.locator('.btn-login-nav').first().click();
      if (flow === 'tab') {
        const popup = context.waitForEvent('page');
        await page.getByRole('button', { name: 'Google', exact: true }).click();
        const authTab = await popup;
        await expect.poll(() => authTab.isClosed()).toBe(true);
      } else {
        await expect.poll(() => page.evaluate(() => typeof window.__oneTapCallback)).toBe('function');
        await page.evaluate(token => window.__oneTapCallback({ credential: token, select_by: 'user' }), fixture.googleToken);
      }
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ueh_tcc_user') || 'null')?.username)).toBe(fixture.email);
      expect(syncBodies.filter(body => body.googleIdToken)).toHaveLength(1);
      expect(fixture.state.rows).toHaveLength(1);
      expect(fixture.state.creates).toBe(mode === 'new' ? 1 : 0);
      const user = fixture.state.rows[0];
      expect(user.uid).toBe(fixture.uid); expect(user.firebaseUid).toBe(fixture.uid); expect(user.username).toBe(fixture.email);
      if (mode !== 'new') {
        expect(user.id).toBe('original-user-id'); expect(user._id).toBe('original-mongo-id');
        expect(user.name).toBe('Tên hồ sơ đã lưu'); expect(user.bio).toBe('Giới thiệu đã lưu');
        expect(user.progress).toEqual({ chapter: 7 }); expect(user.savedCards).toEqual(['saved-card-id']); expect(user.sessionVersion).toBe(3);
      }
      if (flow === 'one-tap') {
        const profile = await page.evaluate(async () => {
          const { auth } = await import('/src/firebase.js');
          return { email: auth.currentUser?.email, providerEmail: auth.currentUser?.providerData.find(item => item.providerId === 'google.com')?.email };
        });
        expect(profile).toEqual({ email: null, providerEmail: fixture.email });
      }
    } finally { await fixture.dispose(); }
  });
}
