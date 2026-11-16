import { apiFetch, readApiJson } from '../utils/apiClient';

const request = async (path, body, signal) => readApiJson(await apiFetch(`/api/flashcard-access${path}`, {
  signal, ...(body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}));
export const loadFlashcardAccess = signal => request('/me', undefined, signal);
export const redeemFlashcardKey = key => request('/redeem', { key });
export const listFlashcardAdmin = (kind, page, search, signal) => request(`/admin/${kind}?page=${page}&search=${encodeURIComponent(search)}`, undefined, signal);
export const grantFlashcardEmails = body => request('/admin/grants', body);
export const createFlashcardKeys = body => request('/admin/keys', body);
export const revokeFlashcardMember = (id, reason) => request(`/admin/members/${encodeURIComponent(id)}/revoke`, { reason });
export const disableFlashcardKey = id => request(`/admin/keys/${encodeURIComponent(id)}/disable`, {});
