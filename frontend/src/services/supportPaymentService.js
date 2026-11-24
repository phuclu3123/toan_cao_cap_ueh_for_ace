import { apiFetch, readApiJson } from '../utils/apiClient';
const storageKey='ueh_tcc_support_session_v1';
export function readSupportSession() {
  try {
    const raw=localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    const value=JSON.parse(raw);
    return value && /^[a-f0-9]{64}$/.test(value.token) && Number.isSafeInteger(value.amount) && value.amount>=5000 && value.amount<=10000000 && (!value.storedAt || Date.now()-value.storedAt<86400000) ? value : null;
  } catch { return null; }
}
export function storeSupportSession(value) {
  const data=value?JSON.stringify({...value,storedAt:Date.now()}):null;
  // Necessary receipt storage lets a PayOS return in another tab resume safely.
  for(const name of ['localStorage','sessionStorage']) {
    try {if(data) window[name].setItem(storageKey,data);else window[name].removeItem(storageKey);} catch { /* Current modal still holds the receipt. */ }
  }
}
export function createSupportToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export function safeSupportCheckout(value) {
  try { const url=new URL(value);return url.protocol==='https:' && !url.username && !url.password && (url.hostname==='payos.vn' || url.hostname.endsWith('.payos.vn')) ? url.href : null; } catch {return null;}
}
export async function supportRequest(path,token,options={}) {
  const response=await apiFetch(`/api/support/payments${path}`,{...options,headers:{'Content-Type':'application/json','X-Support-Token':token,...options.headers}});
  return (await readApiJson(response)).data;
}
