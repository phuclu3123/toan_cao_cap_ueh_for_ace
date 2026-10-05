import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient';

const pendingFirebaseSyncs = new Map();

export const syncFirebaseUserWithBackend = (firebaseUser) => {
  if (!firebaseUser || typeof firebaseUser.getIdToken !== 'function') {
    return Promise.reject(new Error('Dữ liệu người dùng không hợp lệ.'));
  }

  const identityKey = String(firebaseUser.uid || 'firebase-user');
  const existingRequest = pendingFirebaseSyncs.get(identityKey);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const idToken = await firebaseUser.getIdToken();
    const response = await apiFetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await readApiJson(response);
    if (!data.success || !data.user) {
      throw new Error(data.message || 'Không thể đồng bộ phiên đăng nhập.');
    }
    return toClientUser(data.user);
  })();

  pendingFirebaseSyncs.set(identityKey, request);
  request.finally(() => {
    if (pendingFirebaseSyncs.get(identityKey) === request) {
      pendingFirebaseSyncs.delete(identityKey);
    }
  }).catch(() => {});

  return request;
};
