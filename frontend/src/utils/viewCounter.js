import { API_BASE_URL } from '../config';

// Counts are snapshots returned by the server. Unknown stays unknown.
const recorded = new Map();
const pending = new Map();
export const getViewCount = id => recorded.get(id)?.views ?? null;
export const incrementViewCount = async id => {
  if (!id) return null;
  const recent = recorded.get(id);
  if (recent && Date.now() - recent.recordedAt < 600000) return recent.views;
  if (pending.has(id)) return pending.get(id);
  const request = fetch(`${API_BASE_URL}/api/resources/view/${encodeURIComponent(id)}`, { method: 'POST', credentials: 'include' }).then(async response => {
    const result = await response.json();
    if (!response.ok || !result.success || !result.persisted || !Number.isSafeInteger(result.views)) return null;
    recorded.set(id, { views: result.views, recordedAt: Date.now() });
    return result.views;
  }).catch(() => null).finally(() => pending.delete(id));
  pending.set(id, request);
  return request;
};
export const formatViewCount = count => Number.isSafeInteger(count) ? count.toLocaleString('vi-VN') : '—';
