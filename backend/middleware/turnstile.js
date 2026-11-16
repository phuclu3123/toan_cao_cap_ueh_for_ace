// Verify every protected request on the server, including direct API calls.
export const requireTurnstile = (action) => async (req, res, next) => {
  const mode = process.env.TURNSTILE_MODE || 'auto';
  const siteKey = process.env.TURNSTILE_SITE_KEY || '';
  const secret = process.env.TURNSTILE_SECRET_KEY || '';
  if (mode === 'off' || (mode === 'auto' && !siteKey && !secret)) return next();

  const hostnames = (process.env.TURNSTILE_HOSTNAMES || '')
    .split(',').map((host) => host.trim().toLowerCase()).filter(Boolean);
  if (!['auto', 'required'].includes(mode) || !siteKey || !secret || !hostnames.length) {
    return res.status(503).json({ success: false, code: 'TURNSTILE_CONFIG', message: 'Chưa cấu hình đầy đủ xác minh chống bot.' });
  }
  const token = req.body?.['cf-turnstile-response'];
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return res.status(422).json({ success: false, code: 'TURNSTILE_REQUIRED', message: 'Vui lòng hoàn tất xác minh chống bot rồi thử lại.' });
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Siteverify unavailable');
    const result = await response.json();
    if (result.success !== true || result.action !== action ||
        typeof result.hostname !== 'string' || !hostnames.includes(result.hostname.toLowerCase())) {
      return res.status(403).json({ success: false, code: 'TURNSTILE_REJECTED', message: 'Xác minh chống bot không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.' });
    }
    return next();
  } catch {
    return res.status(503).json({ success: false, code: 'TURNSTILE_UNAVAILABLE', message: 'Chưa thể xác minh chống bot. Vui lòng thử lại sau.' });
  }
};
