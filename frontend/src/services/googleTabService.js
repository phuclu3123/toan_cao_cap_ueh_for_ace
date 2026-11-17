import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient.js';
import { ensureGoogleOAuthAvailable } from './oauthService.js';
import { syncFirebaseIdTokenWithBackend } from './authService.js';

export const GOOGLE_TAB_PATH = '/auth/google';
export const GOOGLE_TAB_RESULT = 'ueh-tcc:google-tab-result';
export const GOOGLE_TAB_STORAGE_KEY = 'ueh_tcc_google_tab';
const MAX_AGE_MS = 5 * 60 * 1000;
const viteEnv = import.meta.env || {};
const GOOGLE_AUTH_ERRORS = Object.freeze({
  GOOGLE_EMAIL_REQUIRED: 'Chưa hoàn tất đồng bộ email. Hãy bấm Google hoặc One Tap để đăng nhập lại.',
  INVALID_GOOGLE_IDENTITY: 'Danh tính Google chưa khớp với phiên đăng nhập. Vui lòng đăng nhập lại đúng tài khoản.',
  GOOGLE_AUTH_NOT_CONFIGURED: 'Máy chủ chưa sẵn sàng đồng bộ email Google. Vui lòng liên hệ quản trị viên.',
  GOOGLE_AUTH_UNAVAILABLE: 'Tạm thời chưa xác minh được Google. Vui lòng thử lại.',
  AUTH_SYNC_TIMEOUT: 'Đồng bộ tài khoản mất quá lâu. Vui lòng thử đăng nhập lại.',
  ACCOUNT_LINK_CONFLICT: 'Email và danh tính Google đang gắn với hai tài khoản khác nhau. Vui lòng liên hệ quản trị viên để kiểm tra.',
  INVALID_FIREBASE_TOKEN: 'Phiên xác thực Google chưa hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
});

const firebaseRequest = async (method, body, apiKey) => {
  if (!apiKey) throw new Error('Chưa cấu hình Firebase API key.');
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000)
    }
  );
  const payload = await response.json();
  if (!response.ok) {
    // Never expose the response body: it can contain provider credentials.
    throw new Error('Google không thể hoàn tất xác thực. Vui lòng bắt đầu đăng nhập lại.');
  }
  return payload;
};

// Open synchronously without popup dimensions so the browser can use a normal tab.
export const beginGoogleTabSignIn = ({ signal } = {}) => new Promise((resolve, reject) => {
  const requestId = crypto.randomUUID();
  const channel = typeof BroadcastChannel === 'function'
    ? new BroadcastChannel(`${GOOGLE_TAB_RESULT}:${requestId}`)
    : null;
  let tab;
  let timer;
  let checking = false;
  let settled = false;

  const cleanup = () => {
    clearTimeout(timer);
    channel?.close();
    window.removeEventListener('message', handleMessage);
    signal?.removeEventListener('abort', handleAbort);
  };
  const finish = (error, user) => {
    if (settled) return;
    settled = true;
    cleanup();
    if (error) reject(error);
    else resolve(user);
  };
  const handleResult = async (payload) => {
    if (settled || checking || payload?.type !== GOOGLE_TAB_RESULT || payload.requestId !== requestId) return;
    if (!payload.success) {
      finish(new Error(Object.hasOwn(GOOGLE_AUTH_ERRORS, payload.code)
        ? GOOGLE_AUTH_ERRORS[payload.code] : 'Đăng nhập Google chưa hoàn tất. Hãy kiểm tra tab đăng nhập.'));
      return;
    }
    checking = true;
    try {
      // Read the HttpOnly session ourselves; messages never grant a login.
      const data = await readApiJson(await apiFetch('/api/auth/me'));
      if (!data.user) throw new Error('Chưa nhận được phiên đăng nhập từ Google.');
      finish(null, toClientUser(data.user));
    } catch (error) {
      finish(error);
    }
  };
  function handleMessage(event) {
    if (event.origin !== window.location.origin || event.source !== tab) return;
    void handleResult(event.data);
  }
  function handleAbort() {
    finish(new DOMException('Đã hủy đăng nhập Google.', 'AbortError'));
  }
  if (signal?.aborted) {
    handleAbort();
    return;
  }
  signal?.addEventListener('abort', handleAbort, { once: true });
  window.addEventListener('message', handleMessage);
  if (channel) channel.onmessage = (event) => { void handleResult(event.data); };
  tab = window.open(`${GOOGLE_TAB_PATH}?request=${encodeURIComponent(requestId)}`, '_blank');
  if (!tab) {
    finish(new Error('Trình duyệt đã chặn tab Google. Hãy cho phép mở tab rồi thử lại.'));
    return;
  }
  // Google may isolate the tab with COOP, which can make tab.closed read true
  // even while it is open. Wait for a same-origin result instead of polling it.
  timer = setTimeout(() => finish(new Error('Phiên đăng nhập Google đã hết hạn. Vui lòng thử lại.')), MAX_AGE_MS);
});

export const prepareGoogleTab = async ({
  requestId,
  origin = window.location.origin,
  storage = sessionStorage,
  apiKey = viteEnv.VITE_FIREBASE_API_KEY
}) => {
  if (!/^[a-zA-Z0-9-]{20,100}$/.test(requestId || '')) {
    throw new Error('Hãy mở tab đăng nhập bằng nút Google trên website.');
  }
  await ensureGoogleOAuthAvailable();
  const callbackUrl = `${origin}${GOOGLE_TAB_PATH}`;
  const payload = await firebaseRequest('createAuthUri', {
    providerId: 'google.com',
    continueUri: callbackUrl,
    authFlowType: 'CODE_FLOW',
    // createAuthUri adds openid itself; email/profile must be requested explicitly.
    // Keep select_account, not consent: returning users are not forced to re-consent.
    oauthScope: 'email profile',
    customParameter: { prompt: 'select_account' }
  }, apiKey);
  const authUrl = new URL(payload.authUri);
  const state = authUrl.searchParams.get('state');
  const scopes = new Set((authUrl.searchParams.get('scope') || '').split(/\s+/));
  const hasEmail = scopes.has('email') || scopes.has('https://www.googleapis.com/auth/userinfo.email');
  const hasProfile = scopes.has('profile') || scopes.has('https://www.googleapis.com/auth/userinfo.profile');
  if (authUrl.origin !== 'https://accounts.google.com' || !state || !payload.sessionId
      || authUrl.searchParams.get('redirect_uri') !== callbackUrl
      || authUrl.searchParams.get('response_type') !== 'code') {
    throw new Error('Không nhận được đường dẫn đăng nhập Google hợp lệ.');
  }
  if (!scopes.has('openid') || !hasEmail || !hasProfile) {
    throw new Error('Chưa yêu cầu đủ thông tin email từ Google. Vui lòng thử đăng nhập lại.');
  }
  storage.setItem(GOOGLE_TAB_STORAGE_KEY, JSON.stringify({
    requestId, sessionId: payload.sessionId, state, callbackUrl, expiresAt: Date.now() + MAX_AGE_MS
  }));
  return authUrl.href;
};

export const completeGoogleTab = async ({
  requestUri,
  storage = sessionStorage,
  apiKey = viteEnv.VITE_FIREBASE_API_KEY
}) => {
  const callback = new URL(requestUri);
  const transaction = JSON.parse(storage.getItem(GOOGLE_TAB_STORAGE_KEY) || 'null');
  if (!transaction || transaction.expiresAt < Date.now()
      || transaction.callbackUrl !== `${callback.origin}${callback.pathname}`
      || !transaction.state || callback.searchParams.get('state') !== transaction.state) {
    throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Hãy bấm Google để thử lại.');
  }
  storage.removeItem(GOOGLE_TAB_STORAGE_KEY);
  if (callback.searchParams.has('error')) throw new Error('Bạn đã hủy hoặc từ chối đăng nhập Google.');
  if (!callback.searchParams.get('code')) throw new Error('Google không trả về mã xác thực.');
  const payload = await firebaseRequest('signInWithIdp', {
    requestUri,
    sessionId: transaction.sessionId,
    returnSecureToken: true,
    returnIdpCredential: true
  }, apiKey);
  if (payload.needConfirmation || payload.providerId !== 'google.com' || !payload.idToken) {
    throw new Error('Không thể xác thực tài khoản Google. Vui lòng dùng phương thức đăng nhập đã liên kết.');
  }
  // Only tokens are sent. Backend independently verifies Google email and
  // binds its subject to the signed Firebase identity before updating any user.
  await syncFirebaseIdTokenWithBackend(payload.idToken, { googleIdToken: payload.oauthIdToken });
  return { requestId: transaction.requestId };
};

export const notifyGoogleTabResult = (requestId, success, code) => {
  // Only an allowlisted failure code crosses tabs. Never broadcast tokens/profile data.
  const result = { type: GOOGLE_TAB_RESULT, requestId, success,
    ...(!success && Object.hasOwn(GOOGLE_AUTH_ERRORS, code) ? { code } : {}) };
  if (typeof BroadcastChannel === 'function') {
    const channel = new BroadcastChannel(`${GOOGLE_TAB_RESULT}:${requestId}`);
    channel.postMessage(result);
    channel.close();
  }
  try { window.opener?.postMessage(result, window.location.origin); } catch { /* COOP can sever opener. */ }
};
