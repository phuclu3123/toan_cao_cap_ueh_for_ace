import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { Download, KeyRound, RefreshCw, Users } from 'lucide-react';
import { createCourseKeys, disableCourseKey, grantCourseEmail, listCourseAdmin, revokeCourseMember } from '../services/courseAccessService';
import '../assets/styles/FlashcardAccess.css';
import '../assets/styles/CourseUnlock.css';

const labels = { ACTIVE: 'Có quyền', REVOKED: 'Đã thu hồi', UNUSED: 'Chưa dùng', USED: 'Đã dùng', DISABLED: 'Vô hiệu hóa', PAYOS: 'Thanh toán PayOS', KEY: 'Mã kích hoạt', ADMIN: 'Admin cấp', FREE: 'Miễn phí', GRANT: 'Cấp quyền', RESTORE: 'Khôi phục', REVOKE: 'Thu hồi', REDEEM: 'Dùng key', ISSUE_KEYS: 'Tạo key', DISABLE_KEY: 'Vô hiệu hóa key' };
const date = (value) => value ? new Date(value).toLocaleString('vi-VN') : 'Không giới hạn';

export default function CourseAdminPanel({ course }) {
  const [kind, setKind] = useState('members');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [codes, setCodes] = useState([]);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const blocker = useBlocker(codes.length > 0);
  useEffect(() => {
    if (!codes.length) return;
    const handleUnload = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [codes.length]);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Bạn đã lưu các key vừa tạo? Rời trang sẽ không xem lại được mã đầy đủ.')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true); setListing(null);
      listCourseAdmin(course.id, kind, page, query, controller.signal).then((value) => { if (active) { setListing(value); setError(''); } }).catch((failure) => { if (active && failure.name !== 'AbortError') setError(failure.message); }).finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [course.id, kind, page, query, refresh]);
  const handleWork = async (work, success) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await work(); setMessage(success); setRefresh((value) => value + 1); }
    catch (failure) { setError(failure.message || 'Chưa thực hiện được thao tác.'); }
    finally { setBusy(false); }
  };
  const handleGrant = (event) => { event.preventDefault(); handleWork(() => grantCourseEmail(course.id, { email: email.trim() }), 'Đã cấp quyền khóa học.'); };
  const handleIssue = (event) => { event.preventDefault(); handleWork(async () => { const result = await createCourseKeys(course.id, { count: Number(count), activateBefore: deadline ? new Date(deadline).toISOString() : null }); setCodes(result.codes); }, 'Đã tạo key. Hãy lưu mã trước khi rời trang.'); };
  const handleAction = (action, row) => {
    const prompt = action === 'revoke' ? `Thu hồi quyền khóa học của ${row.username}?` : action === 'restore' ? `Khôi phục quyền khóa học cho ${row.username}?` : 'Vô hiệu hóa key chưa sử dụng này?';
    if (!window.confirm(prompt)) return;
    const reason=action==='revoke'?window.prompt('Lý do thu hồi (sẽ ghi trong email gửi học viên):',''):'';
    if(reason===null) return;
    if(action==='revoke' && reason.trim().length<5) {setError('Vui lòng ghi rõ lý do thu hồi, tối thiểu 5 ký tự.');return;}
    handleWork(() => action === 'revoke' ? revokeCourseMember(course.id, row.userId,reason) : action === 'restore' ? grantCourseEmail(course.id, { email: row.username, restore: true }) : disableCourseKey(course.id, row._id), 'Đã cập nhật quyền khóa học.');
  };
  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([codes.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `keys-${course.id}.txt`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="fc-access course-admin-panel" id="course-admin" aria-labelledby="course-admin-title">
    <header><h2 id="course-admin-title">Quản lý quyền khóa học</h2><p className="fc-muted">Quản trị viên Phúc · {course.title}. Quyền cấp từ thanh toán, key và email được quản lý chung tại đây.</p></header>
    <div className="course-admin-forms">
      <form onSubmit={handleGrant}><h3><Users size={18} /> Cấp bằng email</h3><label htmlFor="course-grant-email">Email đã đăng ký website</label><input id="course-grant-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={busy} /><button className="fc-primary" disabled={busy}>Cấp quyền</button></form>
      <form onSubmit={handleIssue}><h3><KeyRound size={18} /> Tạo key khóa học</h3><label htmlFor="course-key-count">Số lượng</label><input id="course-key-count" type="number" min={1} max={50} value={count} onChange={(event) => setCount(event.target.value)} required disabled={busy || codes.length > 0} /><label htmlFor="course-key-deadline">Hạn kích hoạt (tùy chọn)</label><input id="course-key-deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} disabled={busy || codes.length > 0} /><button className="fc-primary" disabled={busy || codes.length > 0}>Tạo key mới</button></form>
    </div>
    {codes.length > 0 && <div className="fc-new-codes"><h3>Lưu key vừa tạo</h3><p className="fc-help">Mã đầy đủ chỉ hiển thị lần này. Mỗi key dùng cho một tài khoản, quyền học không hết hạn và admin có thể thu hồi.</p>{codes.map((code) => <code key={code}>{code}</code>)}<div className="fc-actions"><button type="button" className="fc-primary" onClick={handleDownload}><Download size={16} /> Tải danh sách key</button><button type="button" className="fc-secondary" onClick={() => { if (window.confirm('Bạn đã lưu toàn bộ key?')) setCodes([]); }}>Đã lưu, đóng danh sách</button></div></div>}
    {error && <p className="fc-error" role="alert">{error}</p>}{message && <p className="fc-success" role="status">{message}</p>}
    <div className="fc-tabs" role="tablist" aria-label="Quản lý khóa học">{[['members', 'Học viên'], ['keys', 'Key đã cấp'], ['audit', 'Lịch sử']].map(([id, label]) => <button type="button" key={id} role="tab" aria-selected={kind === id} onClick={() => { setKind(id); setPage(1); }}>{label}</button>)}<button type="button" aria-label="Làm mới danh sách" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={16} /></button></div>
    {kind === 'members' && <form className="course-admin-search" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}><input aria-label="Tìm email học viên" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo email" /><button className="fc-secondary">Tìm</button></form>}
    {loading ? <p role="status">Đang tải danh sách…</p> : !listing?.items?.length ? <p className="fc-muted">Chưa có dữ liệu phù hợp.</p> : <div className="fc-table-scroll"><table><thead><tr>{(kind === 'members' ? ['Tài khoản', 'Trạng thái', 'Nguồn cấp', 'Thao tác'] : kind === 'keys' ? ['Key', 'Trạng thái', 'Người dùng / hạn kích hoạt', 'Thao tác'] : ['Thời điểm', 'Thao tác', 'Tài khoản / key', 'Người thực hiện']).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{listing.items.map((row) => <tr key={row._id}>{kind === 'members' ? <><td>{row.username}</td><td>{labels[row.status]}</td><td>{labels[row.source] || row.source}</td><td><button type="button" className="fc-secondary" disabled={busy} onClick={() => handleAction(row.status === 'REVOKED' ? 'restore' : 'revoke', row)}>{row.status === 'REVOKED' ? 'Khôi phục' : 'Thu hồi'}</button></td></> : kind === 'keys' ? <><td>{row.label}</td><td>{row.status === 'UNUSED' && row.activateBefore && new Date(row.activateBefore).getTime() <= now ? 'Hết hạn' : labels[row.status]}</td><td>{row.usedEmail || date(row.activateBefore)}</td><td>{row.status === 'UNUSED' && <button type="button" className="fc-secondary" disabled={busy} onClick={() => handleAction('disable', row)}>Vô hiệu hóa</button>}</td></> : <><td>{date(row.createdAt)}</td><td>{labels[row.action] || row.action}</td><td>{row.email || row.keyId || '—'}</td><td>{row.actorId}</td></>}</tr>)}</tbody></table></div>}
    <div className="fc-pagination"><span>{listing ? `${listing.total} kết quả · Trang ${listing.page}/${listing.pages}` : ''}</span><button type="button" className="fc-secondary" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button><button type="button" className="fc-secondary" disabled={loading || !listing || page >= listing.pages} onClick={() => setPage((value) => value + 1)}>Sau</button></div>
  </section>;
}
