import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Clock3, Download, LockKeyhole, RefreshCw, Server, ShieldCheck, Tag, Users, Wallet, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { coursesData } from '../data/coursesData';
import CourseAdminPanel from '../components/CourseAdminPanel';
import { commerceRequest, notifyCommerceChanged, downloadOrderReceipt, money, dateTime } from '../services/courseCommerceService';
import '../assets/styles/CourseCommerceAdmin.css';

const statusLabel = { CREATING: 'Đang tạo', PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', CANCELLED: 'Đã hủy', FAILED: 'Không thành công' };
const tabs = [['price', 'Giá & mở bán', Wallet], ['promotions', 'Ưu đãi', Tag], ['orders', 'Đơn hàng', Clock3], ['access', 'Quyền học', Users], ['audit', 'Lịch sử', ShieldCheck], ['server', 'Máy chủ', Server]];
const actionLabel = { UPDATE_PRICE: 'Cập nhật học phí', CREATE_PROMOTION: 'Tạo ưu đãi', TOGGLE_PROMOTION: 'Bật / tắt ưu đãi', CANCEL_ORDER: 'Yêu cầu hủy đơn', RECONCILE_ORDER: 'Đối soát PayOS' };

export default function CourseCommerceAdmin() {
  const { currentUser, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const course = coursesData.find(row => row.id === params.get('course')) || coursesData[0];
  if (loading) return <div className="commerce-admin admin-loading" role="status">Đang xác minh phiên quản trị…</div>;
  if (currentUser?.role !== 'Admin') return <div className="commerce-admin admin-empty"><LockKeyhole /><h1>Khu vực quản trị</h1><p>Đăng nhập tài khoản quản trị viên chính để tiếp tục.</p><Link to="/courses">Về khóa học</Link></div>;
  return <AdminWorkspace key={course.id} course={course} onCourseChange={id => setParams({ course: id })} />;
}

function AdminWorkspace({ course, onCourseChange }) {
  const [tab, setTab] = useState('price');
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadOverview = useCallback(async () => {
    setLoading(true);
    try { const result = await commerceRequest('/admin/overview'); setOverview(result.data); setError(''); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(loadOverview, 0); return () => window.clearTimeout(timer); }, [loadOverview, refresh]);
  const handleWork = async (work, success) => {
    if (busy) return false;
    setBusy(true); setError(''); setMessage('');
    try { await work(); setMessage(success); setRefresh(value => value + 1); notifyCommerceChanged(); return true; }
    catch (failure) { setError(failure.message || 'Chưa thực hiện được thao tác.'); return false; }
    finally { setBusy(false); }
  };
  const offer = overview?.courses.find(row => row.id === course.id);
  const paid = overview?.totals.find(row => row._id === 'PAID');
  return <div className="commerce-admin">
    <header className="admin-heading"><div><Link to="/courses" className="admin-back"><ArrowLeft size={15} /> Khóa học</Link><p className="admin-eyebrow">α∫M4A / QUẢN TRỊ</p><h1>Vận hành khóa học</h1><p>Học phí, ưu đãi và quyền học trong cùng một nơi.</p></div><button className="admin-button" onClick={loadOverview} disabled={loading || busy}><RefreshCw size={16} className={loading ? 'admin-spin' : ''} /> Làm mới</button></header>
    <p><Link to="/notifications/admin">Quản trị email & thông báo →</Link></p>
    {error && <div className="admin-alert is-error" role="alert">{error}</div>}
    {message && <div className="admin-alert is-success" role="status"><Check size={17} />{message}<button aria-label="Đóng thông báo" onClick={() => setMessage('')}><X size={16} /></button></div>}
    {!overview ? <div className="admin-sheet admin-empty"><ShieldCheck size={28} /><h2>{loading ? 'Đang kết nối hệ thống…' : 'Chưa tải được quản trị'}</h2><p>Các thao tác sẽ sẵn sàng sau khi máy chủ xác minh quyền.</p>{!loading && <button className="admin-button" onClick={loadOverview}>Thử lại</button>}</div> : <>
      <div className="admin-context"><label>Khóa học đang quản lý<select value={course.id} onChange={event => onCourseChange(event.target.value)} disabled={busy}>{coursesData.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label><Link to={`/course/${course.id}`} className="admin-button">Xem trang học <ArrowUpRight size={16} /></Link></div>
      <div className="admin-tabs" role="tablist" aria-label="Chức năng quản trị">{tabs.map(([id, label, Icon]) => <button id={`admin-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`admin-panel-${id}`} key={id} onClick={() => { setTab(id); setMessage(''); }}><Icon size={17} />{label}</button>)}</div>
      {tab === 'price' && <section className="admin-sheet" id="admin-panel-price" role="tabpanel" aria-labelledby="admin-tab-price"><div className="admin-section-heading"><div><p className="admin-eyebrow">CẤU HÌNH BÁN HÀNG</p><h2>Học phí & trạng thái</h2></div><span className={`admin-status ${offer?.isClosed ? '' : 'is-good'}`}>{offer?.isClosed ? 'Đang đóng bán' : 'Đang mở bán'}</span></div><PriceForm key={`${course.id}-${offer?.version}`} offer={offer} busy={busy} onSave={body => handleWork(() => commerceRequest(`/admin/${course.id}/price`, body), 'Đã lưu học phí và trạng thái bán.')} /><aside className="admin-note"><ShieldCheck size={19} /><div><strong>Đơn cũ giữ nguyên giá đã chốt</strong><p>Đóng bán chặn đăng ký mới. Quyền học đã cấp vẫn được giữ. Giá 0đ là đóng bán, không phải khóa học miễn phí.</p></div></aside></section>}
      {['orders', 'promotions', 'audit'].includes(tab) && <CommerceListing key={`${course.id}-${tab}`} course={course} kind={tab} refresh={refresh} busy={busy} onWork={handleWork} />}
      <section hidden={tab !== 'access'} id="admin-panel-access" role="tabpanel" aria-labelledby="admin-tab-access"><CourseAdminPanel course={course} /></section>
      {tab === 'server' && <section className="admin-sheet" id="admin-panel-server" role="tabpanel" aria-labelledby="admin-tab-server"><div className="admin-section-heading"><div><p className="admin-eyebrow">TÌNH TRẠNG DỊCH VỤ</p><h2>Kết nối & đối soát</h2></div><span className="admin-status is-good">{overview.server.environment}</span></div><div className="admin-health"><div><span>MongoDB</span><strong>{overview.server.database === 'connected' ? 'Đã kết nối' : 'Gián đoạn'}</strong></div><div><span>Module thương mại</span><strong>{overview.server.commerceReady ? 'Sẵn sàng' : 'Chưa sẵn sàng'}</strong></div><div><span>Cấu hình PayOS</span><strong>{overview.server.payosConfigured ? 'Đủ biến cấu hình' : 'Thiếu cấu hình'}</strong></div><div><span>Máy chủ đã chạy</span><strong>{Math.floor(overview.server.uptimeSeconds / 60)} phút</strong></div></div><div className="admin-note"><Clock3 size={19} /><div><strong>Đối soát tự động mỗi phút</strong><p>Đơn chờ được kiểm tra với PayOS theo đợt. Đơn quá hạn chỉ giải phóng lượt ưu đãi sau khi nhà cung cấp xác nhận hủy. Có thể đối soát riêng tại mục Đơn hàng.</p></div></div><div className="admin-financial"><span>Tất cả khóa học · đơn đã thanh toán</span><strong>{money(paid?.amount)}</strong><small>{paid?.count || 0} đơn · tổng tiền ghi nhận, chưa trừ hoàn trả hoặc phí</small></div><p className="admin-muted">Trang này chỉ hiển thị tình trạng cấu hình và dữ liệu vận hành. Quản lý biến môi trường, log, khởi động lại và tài nguyên máy chủ thực hiện trên nền tảng hosting.</p></section>}
      <footer className="admin-footer">Lữ Võ Hoàng Phúc · Quản trị Toán Cao Cấp <a href="mailto:luphuc321@gmail.com">luphuc321@gmail.com</a></footer>
    </>}
  </div>;
}

function PriceForm({ offer, busy, onSave }) {
  const [form, setForm] = useState({ amount: offer?.amount ?? 0, compareAtAmount: offer?.compareAtAmount ?? 0, status: offer?.status || 'CLOSED' });
  const handleSubmit = event => { event.preventDefault(); onSave({ amount: Number(form.amount), compareAtAmount: Number(form.compareAtAmount), status: Number(form.amount) === 0 ? 'CLOSED' : form.status, version: offer.version }); };
  return <form className="admin-form" onSubmit={handleSubmit}><div className="admin-form-grid"><label>Học phí bán (VNĐ)<input type="number" min="0" max="1000000000" step="1" required value={form.amount} disabled={busy} onChange={event => setForm({ ...form, amount: event.target.value, ...(Number(event.target.value) === 0 ? { status: 'CLOSED' } : {}) })} /><small>{money(form.amount)}</small></label><label>Giá tham chiếu (VNĐ)<input type="number" min="0" max="1000000000" step="1" required value={form.compareAtAmount} disabled={busy} onChange={event => setForm({ ...form, compareAtAmount: event.target.value })} /><small>Để 0 nếu không hiển thị giá so sánh.</small></label><label>Trạng thái bán<select value={form.status} disabled={busy || Number(form.amount) === 0} onChange={event => setForm({ ...form, status: event.target.value })}><option value="OPEN">Mở đăng ký & thanh toán</option><option value="CLOSED">Tạm đóng đăng ký</option></select></label></div><div className="admin-form-footer"><span>Phiên bản {offer?.version || 0} · {offer?.updatedAt ? `Lưu ${dateTime(offer.updatedAt)}` : 'Giá khởi tạo'}</span><button className="admin-button is-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div></form>;
}

function PromotionForm({ courseId, busy, onWork }) {
  const [form, setForm] = useState({ label: '', code: '', mode: 'CODE', type: 'PERCENT', value: 10, maxDiscount: '', maxUses: 100, perUserLimit: 1, startsAt: '', endsAt: '' });
  const field = (name, value) => setForm(current => ({ ...current, [name]: value }));
  const handleSubmit = async event => {
    event.preventDefault();
    const body = { ...form, value: Number(form.value), maxUses: Number(form.maxUses), perUserLimit: Number(form.perUserLimit), maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount), startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
    if (await onWork(() => commerceRequest(`/admin/${courseId}/promotions`, body), 'Đã tạo ưu đãi.')) setForm(current => ({ ...current, label: '', code: '' }));
  };
  return <details className="admin-promotion-create"><summary><Tag size={16} /> Tạo ưu đãi mới</summary><form className="admin-form" onSubmit={handleSubmit}><div className="admin-form-grid"><label>Tên ưu đãi<input required maxLength={100} value={form.label} onChange={event => field('label', event.target.value)} disabled={busy} /></label><label>Hình thức<select value={form.mode} onChange={event => field('mode', event.target.value)} disabled={busy}><option value="CODE">Nhập mã khi mua</option><option value="AUTO">Tự áp dụng tại checkout</option></select></label>{form.mode === 'CODE' && <label>Mã ưu đãi<input required minLength={3} maxLength={32} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}" value={form.code} onChange={event => field('code', event.target.value.toUpperCase())} placeholder="VD: TCC2026" disabled={busy} /></label>}<label>Loại giảm<select value={form.type} onChange={event => field('type', event.target.value)} disabled={busy}><option value="PERCENT">Phần trăm (%)</option><option value="FIXED">Số tiền (VNĐ)</option></select></label><label>Mức giảm<input type="number" min={1} max={form.type === 'PERCENT' ? 99 : 1000000000} required value={form.value} onChange={event => field('value', event.target.value)} disabled={busy} /></label><label>Giảm tối đa (VNĐ, tùy chọn)<input type="number" min={1} max={1000000000} value={form.maxDiscount} onChange={event => field('maxDiscount', event.target.value)} disabled={busy} /></label><label>Tổng lượt sử dụng<input type="number" min={1} max={1000000} required value={form.maxUses} onChange={event => field('maxUses', event.target.value)} disabled={busy} /></label><label>Lượt mỗi tài khoản<input type="number" min={1} max={form.maxUses} required value={form.perUserLimit} onChange={event => field('perUserLimit', event.target.value)} disabled={busy} /></label><label>Bắt đầu (giờ thiết bị)<input type="datetime-local" value={form.startsAt} onChange={event => field('startsAt', event.target.value)} disabled={busy} /></label><label>Kết thúc (tùy chọn)<input type="datetime-local" value={form.endsAt} onChange={event => field('endsAt', event.target.value)} disabled={busy} /></label></div><p className="admin-muted">Mỗi đơn dùng tối đa một ưu đãi. Khi không nhập mã, hệ thống chọn ưu đãi tự động hợp lệ có mức giảm cao nhất. Đơn đang chờ tạm giữ lượt đến khi được xác minh thanh toán hoặc hủy.</p><div className="admin-form-footer"><span>Không sửa mức giảm của ưu đãi đã tạo; tắt mã cũ và tạo mã mới để giữ lịch sử.</span><button className="admin-button is-primary" disabled={busy}>Tạo ưu đãi</button></div></form></details>;
}

function CommerceListing({ course, kind, refresh, busy, onWork }) {
  const [listing, setListing] = useState(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [observedAt, setObservedAt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true); setListing(null); setError('');
      commerceRequest(`/admin/${course.id}/list?${new URLSearchParams({ kind, page, status, search: query })}`, undefined, controller.signal).then(result => { if (active) { setListing(result); setObservedAt(Date.now()); } }).catch(failure => { if (active && failure.name !== 'AbortError') setError(failure.message); }).finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [course.id, kind, page, query, status, refresh, reload]);
  const handleDetail = async code => {
    setDetailBusy(true); setError('');
    try { setDetail((await commerceRequest(`/admin/orders/${code}`)).data); }
    catch (failure) { setError(failure.message); } finally { setDetailBusy(false); }
  };
  const handleOrderAction = async (action, row) => {
    if (action === 'cancel' && !window.confirm(`Yêu cầu PayOS hủy đơn #${row.orderCode} chưa thanh toán? Hệ thống sẽ kiểm tra lại giao dịch trước khi hủy.`)) return;
    if (await onWork(() => commerceRequest(`/admin/orders/${row.orderCode}/${action}`, {}), action === 'cancel' ? 'Đã kiểm tra và gửi yêu cầu hủy tới PayOS. Xem trạng thái mới của đơn.' : 'Đã đối soát trạng thái với PayOS.')) { setReload(value => value + 1); if (detail?.orderCode === row.orderCode) await handleDetail(row.orderCode); }
  };
  const title = kind === 'orders' ? 'Đơn hàng' : kind === 'promotions' ? 'Mã & chương trình ưu đãi' : 'Lịch sử vận hành';
  return <section className="admin-sheet" id={`admin-panel-${kind}`} role="tabpanel" aria-labelledby={`admin-tab-${kind}`}><div className="admin-section-heading"><div><p className="admin-eyebrow">{course.title.replace(/^\d+\.\s*/, '')}</p><h2>{title}</h2></div><span className="admin-muted">{listing ? `${listing.total} kết quả` : 'Đang cập nhật'}</span></div>
    {kind === 'promotions' && <PromotionForm courseId={course.id} busy={busy} onWork={onWork} />}
    {kind !== 'audit' && <form className="admin-filters" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}><input aria-label={kind === 'orders' ? 'Tìm email hoặc mã đơn' : 'Tìm mã ưu đãi'} placeholder={kind === 'orders' ? 'Tìm email hoặc mã đơn…' : 'Tìm mã ưu đãi…'} value={search} onChange={event => setSearch(event.target.value)} />{kind === 'orders' && <select aria-label="Lọc trạng thái đơn" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Mọi trạng thái</option>{Object.entries(statusLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>}<button className="admin-button">Tìm kiếm</button></form>}
    {error && <p role="alert" className="admin-alert is-error">{error} <button onClick={() => setReload(value => value + 1)}>Thử lại</button></p>}
    {detail && kind === 'orders' && <div className="admin-order-detail"><div className="admin-section-heading"><h3>Đơn #{detail.orderCode}</h3><button className="admin-icon-button" aria-label="Đóng chi tiết đơn" onClick={() => setDetail(null)}><X size={18} /></button></div><dl><div><dt>Học viên</dt><dd>{detail.buyerName || '—'}<small>{detail.buyerEmail || detail.username} · {detail.buyerPhone || '—'}</small></dd></div><div><dt>Thanh toán</dt><dd>{money(detail.amount)}<small>{statusLabel[detail.status]} · {dateTime(detail.createdAt)}</small></dd></div><div><dt>Ưu đãi trên đơn</dt><dd>{detail.pricingSnapshot?.promotionLabel || 'Không có'}<small>Giảm {money(detail.pricingSnapshot?.discountAmount)}</small></dd></div><div><dt>Điều khoản</dt><dd>{detail.purchaseConsent ? `Phiên bản ${detail.purchaseConsent.version}` : 'Đơn cũ chưa ghi nhận điều khoản theo cơ chế mới'}<small>{detail.purchaseConsent ? `Đã xác nhận ${dateTime(detail.purchaseConsent.acceptedAt)}` : 'Giữ nguyên dữ liệu và quyền đã cấp.'}</small></dd></div></dl>{detail.requiresReview && <p className="admin-alert is-error">Cần kiểm tra: giao dịch đến sau khi lượt ưu đãi đã được giải phóng.</p>}{detail.purchaseConsent?.document && <details><summary>Xem điều khoản đã chấp nhận</summary>{detail.purchaseConsent.document.sections.map(section => <section key={section.title}><h4>{section.title}</h4><p>{section.text}</p></section>)}</details>}<div className="admin-row-actions"><button className="admin-button" onClick={() => downloadOrderReceipt(detail.orderCode).catch(failure => setError(failure.message))}><Download size={15} /> Tải xác nhận</button>{['CREATING', 'PENDING'].includes(detail.status) && <><button className="admin-button" disabled={busy} onClick={() => handleOrderAction('reconcile', detail)}>Đối soát</button><button className="admin-button is-danger" disabled={busy} onClick={() => handleOrderAction('cancel', detail)}>Yêu cầu hủy</button></>}</div></div>}
    {loading ? <div className="admin-empty" role="status">Đang tải dữ liệu…</div> : !listing?.items?.length ? <div className="admin-empty"><p>{error ? 'Chưa hiển thị được dữ liệu.' : 'Chưa có dữ liệu phù hợp.'}</p></div> : <div className="admin-table-scroll"><table><thead><tr>{(kind === 'orders' ? ['Mã đơn / học viên', 'Số tiền', 'Trạng thái', 'Ngày tạo', ''] : kind === 'promotions' ? ['Ưu đãi', 'Mức giảm', 'Lượt dùng', 'Thời hạn', 'Trạng thái'] : ['Thời điểm', 'Thao tác', 'Người thực hiện', 'Chi tiết']).map((label, index) => <th key={index}>{label}</th>)}</tr></thead><tbody>{listing.items.map(row => <tr key={row._id}>{kind === 'orders' ? <><td><strong>#{row.orderCode}</strong><small>{row.username}</small></td><td>{money(row.amount)}{row.requiresReview && <small>Cần kiểm tra</small>}</td><td><span className={`admin-status ${row.status === 'PAID' ? 'is-good' : ''}`}>{statusLabel[row.status]}</span></td><td>{dateTime(row.createdAt)}</td><td><button className="admin-button" disabled={detailBusy} onClick={() => handleDetail(row.orderCode)}>Chi tiết</button></td></> : kind === 'promotions' ? <><td><strong>{row.label}</strong><small>{row.mode === 'AUTO' ? 'Tự động tại checkout' : row.code}</small></td><td>{row.type === 'PERCENT' ? `${row.value}%` : money(row.value)}{row.maxDiscount && <small>Tối đa {money(row.maxDiscount)}</small>}</td><td>{row.used} / {row.maxUses}<small>Đang giữ {row.reserved} · mỗi người {row.perUserLimit}</small></td><td><small>Từ {row.startsAt ? dateTime(row.startsAt) : 'ngay khi tạo'}</small><small>Đến {row.endsAt ? dateTime(row.endsAt) : 'không giới hạn'}</small></td><td><span className={`admin-status ${row.active ? 'is-good' : ''}`}>{!row.active ? 'Đã tắt' : row.endsAt && +new Date(row.endsAt) <= observedAt ? 'Hết hạn' : row.used + row.reserved >= row.maxUses ? 'Hết lượt khả dụng' : row.startsAt && +new Date(row.startsAt) > observedAt ? 'Chưa bắt đầu' : 'Đang bật'}</span><button className="admin-text-button" disabled={busy} onClick={() => { if (window.confirm(`${row.active ? 'Tắt' : 'Bật lại'} ưu đãi ${row.label}? Đơn đã tạo vẫn giữ nguyên giá.`)) onWork(() => commerceRequest(`/admin/${course.id}/promotions/${row._id}`, { active: !row.active, version: row.version }), 'Đã cập nhật trạng thái ưu đãi.'); }}>{row.active ? 'Tắt ưu đãi' : 'Bật lại'}</button></td></> : <><td>{dateTime(row.createdAt)}</td><td>{actionLabel[row.action] || row.action}</td><td>{row.actorId}</td><td><details><summary>Xem chi tiết</summary><pre>{JSON.stringify(row.details, null, 2)}</pre></details></td></>}</tr>)}</tbody></table></div>}
    <div className="admin-pagination"><span>Trang {listing?.page || page} / {listing?.pages || 1}</span><div><button className="admin-button" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Trước</button><button className="admin-button" disabled={loading || !listing || page >= listing.pages} onClick={() => setPage(value => value + 1)}>Sau</button></div></div>
  </section>;
}
