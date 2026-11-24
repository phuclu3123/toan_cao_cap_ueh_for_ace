export function handleApplicationError(err, req, res, _next) {
  if (res.headersSent) return;
  console.error('[Error caught by Global Handler]:', err.message);
  const nestStatus = typeof err.getStatus === 'function' ? err.getStatus() : undefined;
  const status = Number.isInteger(err.status) ? err.status : Number.isInteger(nestStatus) ? nestStatus : 500;
  if (status === 404 && /^\/api(?:\/|$)/.test(req.path)) return res.status(404).json({ success: false, code: 'API_NOT_FOUND', message: 'API endpoint does not exist.' });
  const message = status < 500 || process.env.NODE_ENV === 'development' ? err.message || 'Request failed.' : 'An internal server error occurred.';
  return res.status(status).json({ success: false, message, ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}) });
}
