import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient.js';
import { ensureGoogleOAuthAvailable } from './oauthService.js';
import { syncFirebaseIdTokenWithBackend } from './authService.js';

export const GOOGLE_TAB_PATH = '/auth/google';
export const GOOGLE_TAB_RESULT = 'ueh-tcc:google-tab-result';
export const GOOGLE_TAB_STORAGE_KEY = 'ueh_tcc_google_tab';
const MAX_AGE_MS = 5 * 60 * 1000;
const viteEnv = import.meta.env || {};

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
      finish(new Error('Đăng nhập Google chưa hoàn tất. Hãy kiểm tra tab đăng nhập.'));
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
    customParameter: { prompt: 'select_account' }
  }, apiKey);
  const authUrl = new URL(payload.authUri);
  const state = authUrl.searchParams.get('state');
  if (authUrl.origin !== 'https://accounts.google.com' || !state || !payload.sessionId
      || authUrl.searchParams.get('redirect_uri') !== callbackUrl
      || authUrl.searchParams.get('response_type') !== 'code') {
    throw new Error('Không nhận được đường dẫn đăng nhập Google hợp lệ.');
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
    returnSecureToken: true
  }, apiKey);
  if (payload.needConfirmation || payload.providerId !== 'google.com' || !payload.idToken) {
    throw new Error('Không thể xác thực tài khoản Google. Vui lòng dùng phương thức đăng nhập đã liên kết.');
  }
  await syncFirebaseIdTokenWithBackend(payload.idToken);
  return { requestId: transaction.requestId };
};

export const notifyGoogleTabResult = (requestId, success) => {
  const result = { type: GOOGLE_TAB_RESULT, requestId, success };
  if (typeof BroadcastChannel === 'function') {
    const channel = new BroadcastChannel(`${GOOGLE_TAB_RESULT}:${requestId}`);
    channel.postMessage(result);
    channel.close();
  }
  try { window.opener?.postMessage(result, window.location.origin); } catch { /* COOP can sever opener. */ }
};
