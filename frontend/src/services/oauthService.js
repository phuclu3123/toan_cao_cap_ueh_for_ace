import { apiFetch, readApiJson } from '../utils/apiClient.js';

export const GITHUB_OAUTH_STATE_KEY = 'ueh_tcc_github_oauth_state';
export const GITHUB_OAUTH_MODE_KEY = 'ueh_tcc_github_oauth_mode';
export const GITHUB_OAUTH_RESULT_MESSAGE = 'ueh-tcc:github-oauth-result';

const loadAuthProviders = async () => {
  const signal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(60_000)
    : undefined;
  try {
    const payload = await readApiJson(await apiFetch('/api/auth/providers', { signal }));
    return payload?.providers || {};
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new Error(
        'Máy chủ xác thực phản hồi quá lâu. Vui lòng thử lại.',
        { cause: error }
      );
    }
    throw error;
  }
};

const createOAuthState = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
};

export const beginGithubOAuth = async () => {
  const state = createOAuthState();
  sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);
  sessionStorage.setItem(GITHUB_OAUTH_MODE_KEY, 'popup');

  // Open synchronously while this function is still handling the user's
  // click; waiting for a cold Render instance first would make browsers block
  // the popup. The state is stored before opening so the child receives the
  // browser's initial sessionStorage copy and can validate GitHub's callback.
  const width = 560;
  const height = 720;
  const left = Math.max(0, Math.round((window.screenX || 0) + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round((window.screenY || 0) + (window.outerHeight - height) / 2));
  const popup = window.open(
    '',
    `ueh_tcc_github_${state.replaceAll('-', '').slice(0, 12)}`,
    `popup=yes,width=${width},height=${height},left=${left},top=${top}`
  );

  try {
    const providers = await loadAuthProviders();
    const clientId = providers.github?.clientId;

    if (!providers.github?.enabled || typeof clientId !== 'string' || !clientId.trim()) {
      throw new Error('Đăng nhập GitHub chưa được cấu hình trên máy chủ.');
    }

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('scope', 'user:email');
    url.searchParams.set('state', state);
    // GitHub otherwise reuses the currently active github.com session and may
    // skip its authorization screen entirely. Ask it to show the account picker
    // so users can deliberately choose which GitHub identity to link.
    url.searchParams.set('prompt', 'select_account');

    if (popup && !popup.closed) {
      popup.location.replace(url.toString());
      popup.focus();
      return { mode: 'popup', popup };
    }

    sessionStorage.setItem(GITHUB_OAUTH_MODE_KEY, 'redirect');
    window.location.assign(url.toString());
    return { mode: 'redirect', popup: null };
  } catch (error) {
    sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
    if (popup && !popup.closed) popup.close();
    throw error;
  }
};

export const ensureGoogleOAuthAvailable = async () => {
  const providers = await loadAuthProviders();
  if (!providers.google?.enabled) {
    throw new Error('Đăng nhập Google chưa được cấu hình trên máy chủ.');
  }
};
