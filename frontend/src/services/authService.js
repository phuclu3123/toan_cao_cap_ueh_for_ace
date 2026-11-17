import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient.js';

const pendingFirebaseSyncs = new Map();

export const syncFirebaseIdTokenWithBackend = async (idToken, { googleIdToken } = {}) => {
  let response;
  try {
    response = await apiFetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ idToken, ...(googleIdToken ? { googleIdToken } : {}) })
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw Object.assign(new Error('Đồng bộ tài khoản mất quá lâu. Vui lòng thử đăng nhập lại.'), { code: 'AUTH_SYNC_TIMEOUT' });
    }
    throw error;
  }
  const data = await readApiJson(response);
  if (!data.success || !data.user) {
    throw new Error(data.message || 'Không thể đồng bộ phiên đăng nhập.');
  }
  return toClientUser(data.user);
};

export const syncFirebaseUserWithBackend = (firebaseUser, { googleIdToken } = {}) => {
  if (!firebaseUser || typeof firebaseUser.getIdToken !== 'function') {
    return Promise.reject(new Error('Dữ liệu người dùng không hợp lệ.'));
  }

  // A proof-backed attempt must not join an earlier background attempt that
  // lacked the proof. Tokens stay in memory and never become storage/cache keys.
  const identityKey = `${String(firebaseUser.uid || 'firebase-user')}:${googleIdToken ? 'google' : 'firebase'}`;
  const existingRequest = pendingFirebaseSyncs.get(identityKey);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const idToken = await firebaseUser.getIdToken(Boolean(googleIdToken));
    return syncFirebaseIdTokenWithBackend(idToken, { googleIdToken });
  })();

  pendingFirebaseSyncs.set(identityKey, request);
  request.finally(() => {
    if (pendingFirebaseSyncs.get(identityKey) === request) {
      pendingFirebaseSyncs.delete(identityKey);
    }
  }).catch(() => {});

  return request;
};
