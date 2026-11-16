export const CONSENT_KEY = 'ueh_tcc_consent_v1';
export const CONSENT_EVENT = 'ueh-tcc:consent-changed';
export const CONSENT_SETTINGS_EVENT = 'ueh-tcc:cookie-settings';
export const STUDY_STORAGE_KEY = 'ueh_tcc_study_v2';
export function readConsent() {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY));
    return value?.version === 1 && typeof value.preferences === 'boolean' ? value : null;
  } catch { return null; }
}
export function saveConsent(preferences) {
  const value = { version: 1, necessary: true, preferences: Boolean(preferences), updatedAt: new Date().toISOString() };
  let persisted = true;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    if (!value.preferences) [STUDY_STORAGE_KEY, 'ueh_tcc_flashcard_progress_v1', 'ueh_tcc_flashcard_starred_v1'].forEach(key => localStorage.removeItem(key));
  } catch { persisted = false; }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return { value, persisted };
}
export function openCookieSettings() { window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT)); }
