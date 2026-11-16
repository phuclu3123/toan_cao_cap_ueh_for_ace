import { useEffect, useState } from 'react';
import { completeGoogleTab, GOOGLE_TAB_STORAGE_KEY, notifyGoogleTabResult, prepareGoogleTab } from '../services/googleTabService';
import '../assets/styles/NotFoundPage.css';

let task;

const runAuthTab = () => {
  if (task) return task;
  task = (async () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code') || url.searchParams.has('error') || url.searchParams.has('state')) {
      // Remove the one-use code from the address bar before making any requests.
      history.replaceState(null, '', url.pathname);
      const transaction = JSON.parse(sessionStorage.getItem(GOOGLE_TAB_STORAGE_KEY) || 'null');
      try {
        const { requestId } = await completeGoogleTab({ requestUri: url.href });
        notifyGoogleTabResult(requestId, true);
      } catch (error) {
        if (transaction?.requestId) notifyGoogleTabResult(transaction.requestId, false);
        throw error;
      }
      // Give the original tab time to receive the signal before closing.
      setTimeout(() => window.close(), 500);
      return 'Đăng nhập thành công. Bạn có thể quay lại tab website.';
    }
    const requestId = url.searchParams.get('request');
    try {
      const authUri = await prepareGoogleTab({ requestId });
      window.location.replace(authUri);
      return 'Đang chuyển đến Google…';
    } catch (error) {
      if (requestId) notifyGoogleTabResult(requestId, false);
      throw error;
    }
  })();
  return task;
};

export default function GoogleAuthTab() {
  const [message, setMessage] = useState('Đang mở đăng nhập Google…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    runAuthTab().then((text) => {
      if (active) setMessage(text);
    }).catch((error) => {
      if (!active) return;
      setFailed(true);
      setMessage(error.message || 'Không thể hoàn tất đăng nhập Google.');
    });
    return () => { active = false; };
  }, []);

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <h1>Đăng nhập Google</h1>
        <p role={failed ? 'alert' : 'status'}>{message}</p>
        <a href="/" className="btn btn-primary">Về website</a>
      </div>
    </main>
  );
}
