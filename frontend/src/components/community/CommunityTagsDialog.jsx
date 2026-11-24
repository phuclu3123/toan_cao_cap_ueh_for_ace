import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { communityService } from '../../services/communityService';

export default function CommunityTagsDialog({ isOpen, onClose, onSelect }) {
  const ref = useRef(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ tags: [], totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const dialog = ref.current;
    if (isOpen) dialog.showModal(); else if (dialog.open) dialog.close();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try { const data = await communityService.fetchTags({ search: query, page }); if (active) setResult(data); }
      catch (error) { if (active) setError(error.message || 'Không tải được chủ đề.'); }
      finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [isOpen, query, page, retry]);
  return <dialog ref={ref} className="qa-tags-dialog" aria-labelledby="qa-tags-title" onCancel={onClose}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="qa-tags-dialog-body">
      <div className="qa-heading-row"><div><h2 id="qa-tags-title">Khám phá chủ đề</h2><p>Thẻ trong các câu hỏi của cộng đồng.</p></div><button type="button" onClick={onClose} aria-label="Đóng chủ đề"><X size={20} /></button></div>
      <label className="qa-search-box"><Search size={18} /><input autoFocus aria-label="Tìm chủ đề" placeholder="Tên chủ đề…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>
      {error ? <p role="alert">{error} <button type="button" onClick={() => setRetry(retry + 1)}>Thử lại</button></p> : loading ? <p role="status">Đang tìm chủ đề…</p> : <>
        <div className="qa-tags-directory">{result.tags.map(item => <button type="button" key={item.tag} onClick={() => onSelect(item.tag.replace(/^#/, ''))}><strong>{item.tag.replace(/^#/, '')}</strong><span>{item.count} câu hỏi</span></button>)}</div>
        {result.tags.length === 0 && <p>Chưa có chủ đề phù hợp. Hãy thử từ khóa khác.</p>}
        {result.totalPages > 1 && <div className="qa-tags-paging"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button><span>Trang {page}/{result.totalPages}</span><button type="button" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>Tiếp</button></div>}
      </>}
    </div>
  </dialog>;
}
