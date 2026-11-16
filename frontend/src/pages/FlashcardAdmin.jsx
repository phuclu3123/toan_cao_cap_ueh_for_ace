import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker } from 'react-router-dom';
import { ArrowLeft, Download, KeyRound, Search, Upload, Users, X } from 'lucide-react';
import FlashcardGate from '../components/study/FlashcardGate';
import { createFlashcardKeys, disableFlashcardKey, grantFlashcardEmails, listFlashcardAdmin, revokeFlashcardMember } from '../services/flashcardAccessService';
import '../assets/styles/FlashcardAccess.css';

const labels = { ACTIVE: 'Có quyền', REVOKED: 'Đã thu hồi', EXPIRED: 'Hết hạn', UNUSED: 'Chưa dùng', USED: 'Đã sử dụng', DISABLED: 'Vô hiệu hóa',
  GRANT: 'Cấp quyền', RESTORE: 'Khôi phục', REVOKE: 'Thu hồi', REDEEM: 'Kích hoạt key', ISSUE_KEYS: 'Tạo key', DISABLE_KEY: 'Vô hiệu hóa key' };
const date = value => value ? new Date(value).toLocaleString('vi-VN') : 'Không giới hạn';
const isoDate = value => value ? new Date(value).toISOString() : null;
const download = (name, value) => {
  const url = URL.createObjectURL(new Blob([value], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function FlashcardAdmin() {
  return <FlashcardGate adminOnly><AdminWorkspace /></FlashcardGate>;
}
function AdminWorkspace() {
  const [tab, setTab] = useState('members');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [listing, setListing] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emails, setEmails] = useState('');
  const [expiry, setExpiry] = useState('');
  const [reason, setReason] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(1);
  const [keyDeadline, setKeyDeadline] = useState('');
  const [accessDays, setAccessDays] = useState('');
  const [codes, setCodes] = useState([]);
  const blocker = useBlocker(codes.length > 0);
  const [action, setAction] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionExpiry, setActionExpiry] = useState('');
  const [actionError, setActionError] = useState('');
  const fileRef = useRef(null);
  const dialogRef = useRef(null);
  // Keys cannot be recovered from a hash; warn before discarding the sole copy.
  useEffect(() => {
    if (!codes.length) return undefined;
    const handleBeforeUnload = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [codes.length]);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Bạn đã lưu các mã vừa tạo? Rời trang sẽ không thể xem lại toàn bộ mã.')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    const controller = new AbortController();
    // Loading is reset by the user's navigation handler; a stale page is never actionable.
    listFlashcardAdmin(tab, page, query, controller.signal).then(data => {
      if (!controller.signal.aborted) { setListing(data); setError(''); }
    }).catch(failure => { if (!controller.signal.aborted) setError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [tab, page, query, refresh]);
  useEffect(() => {
    if (action && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [action]);
  // Reload server state after every mutation instead of guessing the resulting rows.
  const handleRefresh = () => { setLoading(true); setRefresh(value => value + 1); };
  const handleTab = next => { setTab(next); setPage(1); setQuery(''); setSearch(''); setLoading(true); setError(''); };
  const handlePage = next => { setPage(next); setLoading(true); };
  const handleSearch = event => { event.preventDefault(); setQuery(search); setPage(1); handleRefresh(); };
  // Accept a JSON list of registered emails or {"emails": [...]} and validate before submitting.
  const handleImport = async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > 100000) throw new Error('Tệp JSON tối đa 100 KB.');
      const parsed = JSON.parse(await file.text());
      const values = Array.isArray(parsed) ? parsed : parsed.emails;
      if (!Array.isArray(values) || !values.length || values.length > 100 || values.some(value => typeof value !== 'string')) throw new Error('Tệp cần chứa danh sách từ 1 đến 100 email.');
      setEmails(values.join('\n')); setResults([]); setError('');
    } catch (failure) { setError(`Không thể nhập tệp: ${failure.message}`); }
  };
  // The API reports a separate result for each email; unknown accounts are never created.
  const handleGrant = async event => {
    event.preventDefault(); setBusy(true); setError(''); setResults([]);
    try {
      const values = emails.split(/[\s,;]+/).filter(Boolean);
      if (!values.length || values.length > 100) throw new Error('Nhập từ 1 đến 100 email.');
      const data = await grantFlashcardEmails({ emails: values, expiresAt: isoDate(expiry), reason });
      setResults(data.results); handleRefresh();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  // Raw keys exist only in this response and this component's memory.
  const handleCreateKeys = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await createFlashcardKeys({ count: Number(count), activateBefore: isoDate(keyDeadline), accessDays: accessDays ? Number(accessDays) : null });
      setCodes(data.codes); handleRefresh();
    } catch (failure) { setError(`${failure.message} Nếu mất kết nối, hãy kiểm tra danh sách mã trước khi tạo lại.`); }
    finally { setBusy(false); }
  };
  const handleOpenAction = (kind, row) => { setAction({ kind, row }); setActionReason(''); setActionExpiry(''); setActionError(''); };
  const handleCloseAction = () => { if (!busy) { dialogRef.current?.close(); setAction(null); } };
  // Destructive changes and restores require a separate, named confirmation in the UI.
  const handleConfirm = async event => {
    event.preventDefault(); setBusy(true); setActionError('');
    try {
      if (action.kind === 'revoke') await revokeFlashcardMember(action.row.userId, actionReason);
      else if (action.kind === 'disable') await disableFlashcardKey(action.row._id);
      else {
        const data = await grantFlashcardEmails({ emails: [action.row.email], expiresAt: isoDate(actionExpiry), reason: actionReason, restore: action.kind === 'restore' });
        if (!data.results[0]?.success) throw new Error(data.results[0]?.message || 'Chưa cập nhật được quyền.');
      }
      dialogRef.current?.close(); setAction(null); handleRefresh();
    } catch (failure) { setActionError(failure.message); }
    finally { setBusy(false); }
  };
  const actionTitle = action?.kind === 'revoke' ? 'Thu hồi quyền Flashcard' : action?.kind === 'disable' ? 'Vô hiệu hóa mã' : action?.kind === 'restore' ? 'Khôi phục quyền Flashcard' : 'Cập nhật thời hạn quyền';
  return <main className="fc-access fc-admin">
    <header className="fc-admin-heading"><div><Link className="fc-back" to="/flashcards"><ArrowLeft size={15} /> Trở về Flashcard</Link><p className="fc-eyebrow">UEH TCC / Quản trị</p><h1>Quyền truy cập Flashcard</h1><p className="fc-muted">Cấp cho tài khoản đã đăng ký hoặc phát mã kích hoạt một lần.</p></div><button className="fc-secondary" onClick={handleRefresh} disabled={loading}>Làm mới</button></header>
    <nav className="fc-tabs" aria-label="Quản trị Flashcard">{[['members', 'Người được cấp quyền'], ['keys', 'Mã kích hoạt'], ['audit', 'Lịch sử thay đổi']].map(([id, title]) => <button key={id} onClick={() => handleTab(id)} aria-current={tab === id ? 'page' : undefined}>{title}</button>)}</nav>
    {error && <p className="fc-alert" role="alert">{error}</p>}
    {tab === 'members' && <section className="fc-admin-section"><div><Users size={22} /><h2>Cấp qua email</h2><p className="fc-muted">Tối đa 100 email mỗi lần. Email chưa đăng ký sẽ được báo lỗi riêng.</p><button className="fc-secondary" onClick={() => fileRef.current?.click()} disabled={busy}><Upload size={15} /> Nhập JSON</button><p className="fc-help">Định dạng: ["email1@gmail.com", "email2@gmail.com"]</p><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={handleImport} /></div>
      <form className="fc-form-panel" onSubmit={handleGrant}><label htmlFor="fc-emails">Email đã đăng ký</label><textarea id="fc-emails" rows={4} value={emails} onChange={event => setEmails(event.target.value)} placeholder="Mỗi email một dòng" maxLength={26000} required disabled={busy} />
        <div className="fc-form-pair"><div><label htmlFor="fc-expiry">Hết hạn quyền (tùy chọn)</label><input id="fc-expiry" type="datetime-local" value={expiry} onChange={event => setExpiry(event.target.value)} disabled={busy} /></div><div><label htmlFor="fc-reason">Ghi chú (tùy chọn)</label><input id="fc-reason" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} disabled={busy} /></div></div>
        <p className="fc-help">Để trống thời hạn để cấp không giới hạn. Tài khoản đã bị thu hồi cần dùng nút Khôi phục trong danh sách.</p><button className="fc-primary" disabled={busy}>{busy ? 'Đang xử lý…' : 'Cấp quyền Flashcard'}</button>
        {results.length > 0 && <div className="fc-import-results" aria-live="polite"><p><strong>{results.filter(item => item.success).length}/{results.length}</strong> email được cấp quyền</p>{results.map(item => <p key={item.email} className={item.success ? 'fc-success' : 'fc-error'}>{item.email}: {item.success ? 'Đã cấp quyền' : item.message}</p>)}</div>}
      </form></section>}
    {tab === 'keys' && <section className="fc-admin-section"><div><KeyRound size={22} /><h2>Phát mã mới</h2><p className="fc-muted">Mã không gắn sẵn email. Tài khoản kích hoạt hợp lệ đầu tiên sẽ nhận quyền.</p><p className="fc-help">Mỗi mã dùng một lần. Tài khoản đang có quyền sẽ không tiêu thụ thêm mã.</p></div>
      <form className="fc-form-panel" onSubmit={handleCreateKeys}><div className="fc-form-pair"><div><label htmlFor="fc-key-count">Số lượng mã</label><input id="fc-key-count" type="number" min="1" max="50" value={count} onChange={event => setCount(event.target.value)} required disabled={busy || codes.length > 0} /></div><div><label htmlFor="fc-access-days">Quyền có hiệu lực bao nhiêu ngày?</label><input id="fc-access-days" type="number" min="1" max="3650" placeholder="Không giới hạn" value={accessDays} onChange={event => setAccessDays(event.target.value)} disabled={busy || codes.length > 0} /></div></div>
        <label htmlFor="fc-key-deadline">Hạn kích hoạt mã (tùy chọn)</label><input id="fc-key-deadline" type="datetime-local" value={keyDeadline} onChange={event => setKeyDeadline(event.target.value)} disabled={busy || codes.length > 0} /><p className="fc-help">Thời hạn quyền được tính từ lúc kích hoạt. Hạn kích hoạt chỉ áp dụng khi mã chưa sử dụng.</p>
        <button className="fc-primary" disabled={busy || codes.length > 0}>{busy ? 'Đang tạo mã…' : 'Tạo mã kích hoạt'}</button>
      </form></section>}
    {codes.length > 0 && <section className="fc-new-codes" aria-label="Mã vừa tạo"><h2>{codes.length} mã vừa tạo</h2><p>Hãy tải xuống và cất giữ trước khi rời trang. Hệ thống không hiển thị lại toàn bộ mã.</p><textarea aria-label="Danh sách mã vừa tạo" readOnly value={codes.join('\n')} rows={Math.min(8, codes.length + 1)} spellCheck={false} /><div className="fc-actions"><button className="fc-primary" onClick={() => download('ueh-tcc-flashcard-keys.txt', codes.join('\n'))}><Download size={16} /> Tải danh sách mã</button><button className="fc-secondary" onClick={() => { if (window.confirm('Bạn đã lưu toàn bộ mã? Sau khi ẩn sẽ không xem lại được.')) setCodes([]); }}>Đã lưu, ẩn mã</button></div></section>}
    <section className="fc-list-section" aria-busy={loading}>
      <div className="fc-list-heading"><h2>{tab === 'members' ? 'Danh sách quyền' : tab === 'keys' ? 'Danh sách mã' : 'Nhật ký quản trị'}</h2>{tab === 'members' && <form className="fc-search" onSubmit={handleSearch}><input aria-label="Tìm phần đầu email được cấp quyền" placeholder="Tìm phần đầu email…" value={search} onChange={event => setSearch(event.target.value)} maxLength={100} /><button className="fc-secondary" aria-label="Tìm kiếm"><Search size={16} /></button></form>}</div>
      {loading ? <p className="fc-empty" role="status">Đang tải danh sách…</p> : error ? <p className="fc-empty">Danh sách chưa sẵn sàng. Hãy làm mới để thử lại.</p> : !listing?.items.length ? <p className="fc-empty">{tab === 'members' ? 'Chưa có quyền phù hợp. Bạn có thể cấp bằng email ở phía trên.' : tab === 'keys' ? 'Chưa có mã kích hoạt. Tạo mã mới để bắt đầu.' : 'Chưa có thay đổi nào được ghi nhận.'}</p> : <div className="fc-table-scroll"><table><thead><tr>{(tab === 'members' ? ['Tài khoản', 'Trạng thái', 'Nguồn cấp', 'Hết hạn', 'Thao tác'] : tab === 'keys' ? ['Mã nhận diện', 'Trạng thái', 'Hạn kích hoạt', 'Quyền sau kích hoạt', 'Thao tác'] : ['Thời điểm', 'Thay đổi', 'Tài khoản / mã', 'Người thực hiện', 'Ghi chú']).map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{listing.items.map(row => <tr key={row._id}>
        {tab === 'members' ? <><td><strong>{row.email}</strong><small>{row.userId}</small></td><td><span className={`fc-status fc-status-${row.effectiveStatus.toLowerCase()}`}>{labels[row.effectiveStatus]}</span></td><td>{row.source === 'ADMIN' ? 'Admin' : 'Key'}</td><td>{date(row.expiresAt)}</td><td><div className="fc-row-actions">{row.status === 'REVOKED' ? <button className="fc-secondary" onClick={() => handleOpenAction('restore', row)}>Khôi phục</button> : <><button className="fc-secondary" onClick={() => handleOpenAction('update', row)}>Thời hạn</button><button className="fc-secondary" onClick={() => handleOpenAction('revoke', row)}>Thu hồi</button></>}</div></td></> : tab === 'keys' ? <><td><strong>{row.label}</strong><small>{row._id}</small>{row.usedBy && <small>Người dùng: {row.usedEmail || row.usedBy}<br />{date(row.usedAt)}</small>}</td><td><span className={`fc-status fc-status-${row.status.toLowerCase()}`}>{row.status === 'UNUSED' && row.activateBefore && new Date(row.activateBefore) <= new Date() ? 'Hết hạn kích hoạt' : labels[row.status]}</span></td><td>{date(row.activateBefore)}</td><td>{row.accessDays ? `${row.accessDays} ngày` : 'Không giới hạn'}</td><td>{row.status === 'UNUSED' && <button className="fc-secondary" onClick={() => handleOpenAction('disable', row)}>Vô hiệu hóa</button>}</td></> : <><td>{date(row.createdAt)}</td><td>{labels[row.action] || row.action}</td><td>{row.email || row.keyId || '—'}</td><td>{row.actorId}</td><td>{row.reason || '—'}</td></>}
      </tr>)}</tbody></table></div>}
      <div className="fc-pagination"><span>{listing && !loading ? `${listing.total} kết quả · Trang ${listing.page}/${listing.pages}` : ''}</span><button className="fc-secondary" disabled={loading || page <= 1} onClick={() => handlePage(page - 1)}>Trước</button><button className="fc-secondary" disabled={loading || !listing || page >= listing.pages} onClick={() => handlePage(page + 1)}>Sau</button></div>
    </section>
    <dialog ref={dialogRef} className="fc-access fc-dialog" onCancel={event => { if (busy) event.preventDefault(); else setAction(null); }}><form onSubmit={handleConfirm}><div className="fc-dialog-heading"><h2>{actionTitle}</h2><button type="button" className="fc-secondary" aria-label="Đóng" onClick={handleCloseAction} disabled={busy}><X size={17} /></button></div><p>{action?.row.email || action?.row.label}</p>
      {['update', 'restore'].includes(action?.kind) && <><label htmlFor="fc-action-expiry">Hết hạn quyền mới (để trống: không giới hạn)</label><input id="fc-action-expiry" type="datetime-local" value={actionExpiry} onChange={event => setActionExpiry(event.target.value)} disabled={busy} /></>}
      {action?.kind !== 'disable' && <><label htmlFor="fc-action-reason">Lý do / ghi chú</label><textarea id="fc-action-reason" value={actionReason} onChange={event => setActionReason(event.target.value)} maxLength={500} rows={3} disabled={busy} /></>}
      <p className="fc-help">{action?.kind === 'revoke' ? 'Sau khi thu hồi, người dùng không thể tự mở lại bằng mã khác. Chỉ admin được khôi phục.' : action?.kind === 'disable' ? 'Mã này sẽ không còn dùng để kích hoạt. Quyền đã cấp không bị ảnh hưởng.' : 'Thao tác này sẽ được ghi vào lịch sử quản trị.'}</p><p className="fc-error" role="alert">{actionError}</p><div className="fc-actions"><button type="button" className="fc-secondary" onClick={handleCloseAction} disabled={busy}>Hủy</button><button className="fc-primary" disabled={busy}>{busy ? 'Đang xử lý…' : 'Xác nhận'}</button></div>
    </form></dialog>
  </main>;
}
