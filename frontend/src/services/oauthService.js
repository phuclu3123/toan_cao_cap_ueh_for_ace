import { apiFetch, readApiJson } from '../utils/apiClient';

export const GITHUB_OAUTH_STATE_KEY = 'ueh_tcc_github_oauth_state';

const createOAuthState = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
};

export const beginGithubOAuth = async () => {
  const payload = await readApiJson(await apiFetch('/api/auth/providers'));
  const clientId = payload?.providers?.github?.clientId;

  if (!payload?.providers?.github?.enabled || typeof clientId !== 'string' || !clientId.trim()) {
    throw new Error('Đăng nhập GitHub chưa được cấu hình trên máy chủ.');
  }

  const state = createOAuthState();
  sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', 'user:email');
  url.searchParams.set('state', state);
  window.location.assign(url.toString());
};
