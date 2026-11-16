import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, KeyRound, LockKeyhole, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { loadFlashcardAccess, redeemFlashcardKey } from '../../services/flashcardAccessService';
import BrandLoader from '../ui/BrandLoader';
import { needsGoogleEmail } from '../../utils/accountIdentity';
import '../../assets/styles/FlashcardAccess.css';

export default function FlashcardGate({ children, adminOnly = false }) {
  const { currentUser, loading } = useAuth();
  const identity = currentUser?.id || currentUser?.uid || '';
  const [snapshot, setSnapshot] = useState(null);
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [clock, setClock] = useState(Date.now);
  // Refresh on focus and in visible tabs; backend independently authorizes every read.
  useEffect(() => {
    if (loading || !identity) return undefined;
    let cancelled = false;
    let controller;
    let running = false;
    const refresh = async () => {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const data = await loadFlashcardAccess(controller.signal);
        if (!cancelled) setSnapshot({ identity, access: data.access });
      } catch (error) {
        if (!cancelled) setSnapshot({ identity, error: error.status === 401 ? '' : 'Chưa kiểm tra được quyền truy cập. Vui lòng thử lại.', access: { allowed: false, status: error.status === 401 ? 'LOGIN' : 'ERROR' } });
      } finally { clearTimeout(timeout); running = false; }
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('ueh-tcc-flashcard-access-changed', refresh);
    return () => {
      cancelled = true; controller?.abort(); clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('ueh-tcc-flashcard-access-changed', refresh);
    };
  }, [identity, loading, retry]);
  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  // A successful redemption updates this tab immediately; no key is persisted.
  const handleRedeem = useCallback(async event => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const data = await redeemFlashcardKey(code);
      setCode(''); setSnapshot({ identity, access: data.access });
      window.dispatchEvent(new Event('ueh-tcc-flashcard-access-changed'));
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }, [code, identity]);
  // Open the existing authentication flow without losing the current study URL.
  const handleLogin = () => window.dispatchEvent(new Event('ueh-tcc-open-login'));
  const handleRetry = () => { setSnapshot(null); setRetry(value => value + 1); };

  if (loading || (identity && snapshot?.identity !== identity)) return <BrandLoader label="Đang kiểm tra quyền Flashcard…" phase="content" />;
  const access = snapshot?.identity === identity ? snapshot.access : null;
  const allowed = access?.allowed && (!access.expiresAt || new Date(access.expiresAt).getTime() > clock);
  if (allowed && (!adminOnly || access.isAdmin)) return children;
  const login = !identity || access?.status === 'LOGIN';
  const revoked = access?.status === 'REVOKED';
  const unavailable = access?.status === 'ERROR';
  return <main className="fc-access fc-lock">
    <div className="fc-lock-preview" aria-hidden="true" inert>
      <aside><BookOpen size={22} /><strong>Nội dung học tập</strong>{['Đại số tuyến tính', 'Giải tích một biến', 'Hàm nhiều biến', 'Ứng dụng kinh tế'].map(label => <p key={label}>{label}</p>)}</aside>
      <div><p>THẺ GHI NHỚ · TOÁN CAO CẤP</p><h2>Học từng ý. Nhớ lâu hơn.</h2><div className="fc-preview-card"><span>Câu hỏi mẫu</span><strong>Điều gì giúp bạn nhớ một công thức?</strong><p>Hiểu ý nghĩa và điều kiện áp dụng.</p></div></div>
    </div>
    <section className="fc-lock-panel" aria-labelledby="fc-lock-title">
      <span className="fc-lock-mark"><LockKeyhole size={25} strokeWidth={1.5} /></span>
      <p className="fc-eyebrow">UEH TCC / Flashcard</p>
      <h1 id="fc-lock-title">{adminOnly && !login ? 'Khu vực quản trị' : login ? 'Đăng nhập để tiếp tục' : unavailable ? 'Chưa kiểm tra được quyền' : revoked ? 'Quyền truy cập đã thu hồi' : 'Mở không gian ôn tập'}</h1>
      <p className="fc-muted">{adminOnly && !login ? 'Tài khoản này không có quyền quản trị Flashcard.' : login ? 'Đăng nhập tài khoản đã được cấp quyền hoặc để sử dụng mã kích hoạt.' : unavailable ? snapshot.error : revoked ? 'Vui lòng liên hệ quản trị viên để được khôi phục quyền Flashcard.' : 'Bạn chưa được cấp quyền Flashcard hoặc quyền đã hết hạn. Nhập mã được cung cấp, hoặc liên hệ quản trị viên để cấp qua email đã đăng ký.'}</p>
      {login ? <button className="fc-primary" onClick={handleLogin}>Đăng nhập <ArrowRight size={17} /></button> : unavailable ? <button className="fc-primary" onClick={handleRetry}><RefreshCw size={16} /> Thử lại</button> : !revoked && !adminOnly && <form onSubmit={handleRedeem}>
        <label htmlFor="fc-activation">Mã kích hoạt</label><div className="fc-key-input"><KeyRound size={18} /><input id="fc-activation" value={code} onChange={event => setCode(event.target.value)} maxLength={100} placeholder="TCC-…" autoComplete="off" spellCheck={false} required aria-describedby="fc-key-feedback" disabled={busy} /></div>
        <p id="fc-key-feedback" className="fc-error" role="status">{notice}</p>
        <button className="fc-primary" disabled={busy || !code.trim()}>{busy ? 'Đang kích hoạt…' : 'Mở khóa Flashcard'}<ArrowRight size={17} /></button>
      </form>}
      {!login && !unavailable && !adminOnly && needsGoogleEmail(currentUser) && <div className="fc-email-notice"><p>Để quản trị viên cấp quyền bằng Gmail, hãy hoàn tất liên kết email cho tài khoản này.</p><button className="fc-secondary" onClick={handleLogin}>Đồng bộ email Google</button></div>}
      {!login && !unavailable && !adminOnly && <a className="fc-contact" href="mailto:luphuc321@gmail.com?subject=Yeu%20cau%20cap%20quyen%20Flashcard">Liên hệ quản trị viên</a>}
      <Link className="fc-back" to="/">Trở về trang chủ</Link>
    </section>
  </main>;
}
