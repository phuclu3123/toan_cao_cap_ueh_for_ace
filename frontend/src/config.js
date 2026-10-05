const configuredApiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// The production site is served by Netlify, which transparently proxies /api
// to Render. Keeping calls on the public site origin makes the HttpOnly
// session cookie first-party instead of relying on a cross-site Render cookie.
const isCanonicalProductionHost = typeof window !== 'undefined'
  && import.meta.env.PROD
  && window.location.hostname === 'toancaocapueh.id.vn';

export const API_BASE_URL = isCanonicalProductionHost ? '' : configuredApiBaseUrl;
