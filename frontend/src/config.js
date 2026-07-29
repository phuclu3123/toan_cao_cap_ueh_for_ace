// Production always uses Netlify's same-origin `/api` proxy so the HttpOnly
// session cookie is not turned into a cross-site cookie by a legacy
// VITE_API_URL value. Developers can still point Vite at another API origin.
export const API_BASE_URL = (
  import.meta.env.DEV ? import.meta.env.VITE_API_URL || '' : ''
).replace(/\/+$/, '');
