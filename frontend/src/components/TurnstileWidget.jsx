import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { loadTurnstile, turnstileEnabled } from '../services/turnstileService';

export default function TurnstileWidget({ action, ref }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const tokenRef = useRef('');
  const [status, setStatus] = useState('Đang chuẩn bị xác minh chống bot…');
  const enabled = turnstileEnabled();

  useImperativeHandle(ref, () => ({
    getToken() {
      if (!enabled) return '';
      if (!tokenRef.current) throw new Error('Vui lòng hoàn tất xác minh chống bot rồi thử lại.');
      return tokenRef.current;
    },
    reset() {
      tokenRef.current = '';
      if(enabled) setStatus('Đang xác minh lại chống bot…');
      if (widgetRef.current !== null) window.turnstile?.reset(widgetRef.current);
    }
  }), [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    loadTurnstile().then((api) => {
      if (disposed) return;
      widgetRef.current = api.render(containerRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        action,
        theme: 'auto',
        size: 'flexible',
        callback: (token) => { tokenRef.current = token; setStatus('Đã xác minh chống bot.'); },
        'expired-callback': () => { tokenRef.current = ''; setStatus('Xác minh đã hết hạn. Vui lòng xác minh lại.'); },
        'error-callback': () => { tokenRef.current = ''; setStatus('Không thể xác minh. Vui lòng thử lại hoặc tải lại trang.'); }
      });
    }).catch((error) => { if (!disposed) setStatus(error.message); });
    return () => {
      disposed = true;
      tokenRef.current = '';
      if (widgetRef.current !== null) window.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [action, enabled]);

  if (!enabled) return null;
  return (
    <div style={{ minWidth: 0, width: '100%', marginBlock: 12 }}>
      <div ref={containerRef} />
      <small role="status" aria-live="polite">{status}</small>
    </div>
  );
}
