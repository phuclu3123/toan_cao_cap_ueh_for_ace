import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';
import { CONSENT_SETTINGS_EVENT, readConsent, saveConsent } from '../utils/cookieConsent';
import '../assets/styles/CookieConsent.css';

export default function CookieConsent() {
  const [consent, setConsent] = useState(readConsent);
  const [settings, setSettings] = useState(false);
  const [preferences, setPreferences] = useState(() => readConsent()?.preferences || false);
  const [message, setMessage] = useState('');
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  useEffect(() => {
    const handleOpen = () => { setPreferences(readConsent()?.preferences || false); setSettings(true); };
    window.addEventListener(CONSENT_SETTINGS_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, handleOpen);
  }, []);
  useEffect(() => {
    if (!settings) return;
    returnFocusRef.current = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => { dialog.close(); returnFocusRef.current?.focus?.(); };
  }, [settings]);
  // Apply only the choice made by the visitor; essential authentication stays available.
  const handleSave = (allowPreferences) => {
    const result = saveConsent(allowPreferences);
    setConsent(result.value);
    setSettings(false);
    setMessage(result.persisted ? 'Đã lưu lựa chọn về cookie và dữ liệu trên thiết bị.' : 'Đã áp dụng cho phiên này. Trình duyệt hiện không cho phép lưu lựa chọn.');
  };
  return <>
    {!consent && !settings && <section className="cookie-banner privacy-ui" aria-label="Lựa chọn cookie">
      <div className="cookie-copy"><ShieldCheck size={22} aria-hidden="true" /><div>
        <p className="cookie-eyebrow">Cookie & quyền riêng tư</p>
        <h2>Cho phép lưu dữ liệu học tập?</h2>
        <p>UEH TCC dùng cookie cần thiết để duy trì đăng nhập và bảo mật. Khi bạn cho phép, tiến độ học và thẻ tự tạo sẽ được lưu trên thiết bị này.</p>
        <button className="privacy-link" onClick={() => setSettings(true)}>Chi tiết và tùy chỉnh <ChevronRight size={14} aria-hidden="true" /></button>
      </div></div>
      <div className="cookie-actions"><button onClick={() => handleSave(false)}>Chỉ dùng cần thiết</button><button className="privacy-primary" onClick={() => handleSave(true)}>Cho phép lưu</button></div>
    </section>}
    {settings && <dialog className="cookie-dialog privacy-ui" ref={dialogRef} aria-labelledby="cookie-title" onCancel={() => setSettings(false)}>
      <div className="cookie-dialog-heading"><div><p className="privacy-caption">UEH TCC · Quyền riêng tư</p><h2 id="cookie-title">Tùy chọn cookie và lưu trữ</h2></div><button className="privacy-icon" onClick={() => setSettings(false)} aria-label="Đóng tùy chọn cookie"><X size={20} /></button></div>
      <p>Bạn quyết định dữ liệu nào được ghi nhớ trên trình duyệt. Có thể thay đổi bất cứ lúc nào tại “Cài đặt cookie” ở cuối trang.</p>
      <div className="cookie-category"><div><h3>Cần thiết</h3><p>Duy trì phiên đăng nhập, bảo vệ yêu cầu xác thực và lưu lựa chọn cookie. Không thể tắt trong trang này.</p></div><span className="privacy-status">Luôn bật</span></div>
      <div className="cookie-category"><div><h3>Lưu dữ liệu học tập trên thiết bị</h3><p>Lưu thẻ tự tạo, đánh dấu và lịch ôn tập giữa các lần truy cập. Nếu tắt, bạn vẫn học được trong phiên hiện tại; bản lưu trên thiết bị sẽ bị xóa. Hãy xuất thẻ trước khi tắt nếu cần giữ lại.</p></div><label className="cookie-switch"><input type="checkbox" checked={preferences} onChange={event => setPreferences(event.target.checked)} /><span aria-hidden="true" /><span className="privacy-sr">Cho phép lưu dữ liệu học tập</span></label></div>
      <p className="privacy-detail">Tùy chọn này áp dụng cho tính năng học tập mới. Cookie đăng nhập và các thiết lập giao diện hiện có được quản lý riêng. Trang này không bổ sung cookie quảng cáo hoặc công cụ phân tích.</p>
      <div className="cookie-dialog-actions"><button onClick={() => handleSave(false)}>Chỉ dùng cần thiết</button><button className="privacy-primary" onClick={() => handleSave(preferences)}>Lưu lựa chọn</button></div>
    </dialog>}
    <div className="privacy-sr" role="status">{message}</div>
  </>;
}
