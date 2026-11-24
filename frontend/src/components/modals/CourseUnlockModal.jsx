import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, KeyRound, Loader2, LockKeyhole, LogIn, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch, readApiJson } from '../../utils/apiClient';
import { notifyCourseAccessChanged, redeemCourseKey } from '../../services/courseAccessService';
import CourseEnrollmentModal from './CourseEnrollmentModal';
import '../../assets/styles/CourseUnlock.css';

export default function CourseUnlockModal({ isOpen, course, onClose, onUnlocked, lessonTitle, initialMethod = 'payment' }) {
  const { currentUser } = useAuth();
  if (!isOpen || !course) return null;
  return <UnlockFlow key={`${course.id}:${currentUser?.id || 'guest'}`} course={course} onClose={onClose} onUnlocked={onUnlocked} lessonTitle={lessonTitle} initialMethod={initialMethod} />;
}
function UnlockFlow({ course, onClose, onUnlocked, lessonTitle, initialMethod }) {
  const [mode, setMode] = useState('choose');
  const liveRef = useRef(true);
  useEffect(() => { liveRef.current = true; return () => { liveRef.current = false; }; }, []);
  const handleSuccess = (courseId, access) => {
    if (!access?.allowed) return;
    notifyCourseAccessChanged(courseId);
    if (liveRef.current) onUnlocked?.(courseId, access);
  };
  if (mode === 'payment') return <CourseEnrollmentModal isOpen course={course} onClose={onClose} onEnrollSuccess={handleSuccess} />;
  return <UnlockChoices course={course} onClose={onClose} onUnlocked={handleSuccess} onPayment={() => setMode('payment')} lessonTitle={lessonTitle} initialMethod={initialMethod} />;
}
function UnlockChoices({ course, onClose, onUnlocked, onPayment, lessonTitle, initialMethod }) {
  const { currentUser, loading, sessionError, syncUserFromBackend } = useAuth();
  const [method, setMethod] = useState(course.isClosed ? 'key' : initialMethod);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [revoked, setRevoked] = useState(false);
  const [error, setError] = useState('');
  const [accessError, setAccessError] = useState('');
  const [checkAttempt, setCheckAttempt] = useState(0);

  const dialogRef = useRef(null);
  const liveRef = useRef(true);
  const busyRef = useRef(false);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    liveRef.current = true;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.stopImmediatePropagation(); if (!busyRef.current) closeRef.current(); }
      if (event.key !== 'Tab') return;
      const items = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')].filter((node) => node.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => { liveRef.current = false; document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKeyDown, true); if (previous?.isConnected) previous.focus?.({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    if (loading) return;
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    const start = window.setTimeout(async () => {
      if (!active) return;
      setChecking(true);
      setAccessError('');

      setRevoked(false);
      if (!currentUser) { window.clearTimeout(timeout); setChecking(false); return; }
      try {
        const requestAccess = async () => readApiJson(await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/access`, { signal: controller.signal }));
        let payload;
        try { payload = await requestAccess(); }
        catch (failure) {
          if (failure.status !== 401) throw failure;
          const verified = await syncUserFromBackend();
          if (!verified || !active) throw failure;
          payload = await requestAccess();
        }
        if (!active) return;
        if (typeof payload.data?.allowed !== 'boolean') throw new Error('Chưa nhận được kết quả xác nhận quyền học. Vui lòng thử lại.');
        if (payload.data?.allowed) { onUnlocked(course.id, payload.data); return; }
        setRevoked(payload.data?.reason === 'REVOKED');
      } catch {
        if (!active) return;
        setAccessError('Chưa kết nối được hệ thống quyền học. Vui lòng thử lại khi kết nối ổn định. Chưa tạo đơn thanh toán mới ở bước này.');
      } finally { window.clearTimeout(timeout); if (active) setChecking(false); }
    }, 0);
    return () => { active = false; window.clearTimeout(start); window.clearTimeout(timeout); controller.abort(); };
  // Callbacks may change during the access refresh; only identity/course starts a request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, currentUser?.id, loading, checkAttempt]);
  const handleRedeem = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    setError(''); setBusy(true); busyRef.current = true;
    try {
      const result = await redeemCourseKey(course.id, key.trim());
      if (liveRef.current && result.access?.allowed) onUnlocked(course.id, result.access);
    } catch (failure) {
      if (liveRef.current) {
        if (failure.status === 401) await syncUserFromBackend();
        setError(failure.message || 'Không thể kích hoạt mã lúc này.');
      }
    } finally { if (liveRef.current) setBusy(false); busyRef.current = false; }
  };
  const handleLogin = () => { onClose(); window.dispatchEvent(new Event('ueh-tcc-open-login')); };
  return createPortal(<div className="course-unlock-backdrop" onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section className="course-unlock" role="dialog" aria-modal="true" aria-labelledby="course-unlock-title" tabIndex={-1} ref={dialogRef}>
      <button type="button" className="course-unlock__close" aria-label="Đóng cửa sổ mở khóa" disabled={busy} onClick={onClose}><X size={20} /></button>
      <LockKeyhole size={25} className="course-unlock__icon" aria-hidden="true" />
      <h2 id="course-unlock-title">Mở khóa bài giảng</h2>
      <p className="course-unlock__course">{course.title}</p>
      {lessonTitle && <p className="course-unlock__lesson">{lessonTitle}</p>}
      {loading || checking ? <p className="course-unlock__status" role="status"><Loader2 size={18} className="spinner" /> Đang kiểm tra quyền học…</p> : sessionError ? <div className="course-unlock__retry"><p className="course-unlock__error" role="alert">{sessionError}</p><button type="button" className="course-unlock__primary" onClick={async () => { await syncUserFromBackend(); setCheckAttempt(attempt => attempt + 1); }}><RefreshCw size={17} /> Thử lại kết nối</button></div> : !currentUser ? <div className="course-unlock__login"><p>Đăng nhập để quyền học được lưu vào đúng tài khoản của bạn.</p><button type="button" className="course-unlock__primary" onClick={handleLogin}><LogIn size={18} /> Đăng nhập để tiếp tục</button></div> : accessError ? <div className="course-unlock__retry"><p className="course-unlock__error" role="alert">{accessError}</p><button type="button" className="course-unlock__primary" onClick={() => setCheckAttempt((attempt) => attempt + 1)}><RefreshCw size={17} /> Thử lại kết nối</button></div> : revoked ? <p className="course-unlock__error" role="alert">Quyền học đã bị thu hồi. Vui lòng liên hệ admin Phúc để khôi phục; không cần mua lại hoặc dùng mã khác.</p> : <>
        <div className="course-unlock__tabs" role="tablist" aria-label="Cách mở khóa"><button type="button" role="tab" aria-selected={method === 'payment'} disabled={busy || course.isClosed} onClick={() => { setMethod('payment'); setError(''); }}><CreditCard size={17} /> Thanh toán</button><button type="button" role="tab" aria-selected={method === 'key'} disabled={busy} onClick={() => { setMethod('key'); setError(''); }}><KeyRound size={17} /> Nhập key</button></div>
        {method === 'payment' ? <div className="course-unlock__payment"><span>Quyền học trọn khóa</span><strong>{course.discountPrice}</strong><p>Bạn có mã giảm giá? Nhập mã ở bước kiểm tra thông tin tiếp theo. Thanh toán qua PayOS; quyền học mở sau khi giao dịch được xác nhận.</p><button type="button" className="course-unlock__primary" disabled={busy} onClick={onPayment}><CreditCard size={18} /> Tiếp tục thanh toán</button></div> : <form onSubmit={handleRedeem} className="course-unlock__key"><label htmlFor="course-activation-key">Mã do admin cung cấp</label><input id="course-activation-key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="TCCK-…" autoComplete="off" spellCheck={false} maxLength={110} disabled={busy} required /><p>Mỗi mã chỉ kích hoạt một lần cho một tài khoản.</p><button type="submit" className="course-unlock__primary" disabled={busy || !key.trim()}>{busy ? <Loader2 size={17} className="spinner" /> : <KeyRound size={17} />} Kích hoạt khóa học</button></form>}
      </>}
      {error && <p className="course-unlock__error" role="alert">{error}</p>}
      <p className="course-unlock__footnote"><ShieldCheck size={15} /> Quyền học gắn với tài khoản và do admin quản lý.</p>
    </section>
  </div>, document.body);
}
