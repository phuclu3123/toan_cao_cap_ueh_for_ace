let pendingScript;

export const turnstileEnabled = () => import.meta.env.VITE_TURNSTILE_MODE !== 'off' && (
  import.meta.env.VITE_TURNSTILE_MODE === 'required' || Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)
);

export const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (pendingScript) return pendingScript;
  pendingScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    window.uehTurnstileReady = () => resolve(window.turnstile);
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=uehTurnstileReady&render=explicit';
    script.async = true;
    const timeout = window.setTimeout(() => {
      script.remove();
      reject(new Error('Không tải được xác minh chống bot. Vui lòng tải lại trang.'));
    }, 20000);
    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error('Không tải được xác minh chống bot. Vui lòng tải lại trang.'));
    };
    script.onload = () => window.clearTimeout(timeout);
    document.head.appendChild(script);
  }).catch((error) => {
    pendingScript = undefined;
    throw error;
  });
  return pendingScript;
};
