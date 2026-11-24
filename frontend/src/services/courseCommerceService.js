import { apiFetch, readApiJson } from '../utils/apiClient.js';

export const COMMERCE_EVENT = 'ueh-tcc-commerce-changed';
export const commerceRequest = async (path, body, signal) => readApiJson(await apiFetch(`/api/course-commerce${path}`, {
  signal: signal || AbortSignal.timeout(15_000),
  ...(body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}));
export const checkoutQuote = (courseId, promotionCode = '', signal) => commerceRequest('/quote', { courseId, promotionCode }, signal);
export const notifyCommerceChanged = () => window.dispatchEvent(new Event(COMMERCE_EVENT));
export const money = value => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
export const dateTime = value => value ? new Date(value).toLocaleString('vi-VN') : '—';
export const stampPayment = order => ({ ...order, clientReceivedAt: Number.isFinite(order.clientReceivedAt) ? order.clientReceivedAt : Date.now() });
export const paymentSecondsLeft = (order, now) => {
  const deadline = Date.parse(order?.expiresAt);
  if (!Number.isFinite(deadline)) return null;
  const serverNow = Date.parse(order.serverNow);
  const offset = Number.isFinite(serverNow) && Number.isFinite(order.clientReceivedAt) ? serverNow - order.clientReceivedAt : 0;
  return Math.max(0, Math.ceil((deadline - now - offset) / 1000));
};
export const paymentClock = seconds => seconds === null ? 'Chưa có thời hạn' : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
export const downloadJson = (value, filename) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
export async function downloadOrderReceipt(orderCode) {
  const payload = await readApiJson(await apiFetch(`/api/orders/${orderCode}/receipt`, { signal: AbortSignal.timeout(15_000) }));
  downloadJson(payload.data, `xac-nhan-don-${orderCode}.json`);
}
