import { useEffect, useState } from 'react';
import { Search, X, Plus, SlidersHorizontal, Tag, BookOpen, CheckCircle2, Clock, Bookmark } from 'lucide-react';
import { SUBJECT_CATEGORIES, DIFFICULTY_LEVELS } from '../../services/communityService';

// The same topic keeps its color after sorting, filtering or a refresh.
function topicTone(tag) {
  const key = tag.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
  if (/lagrange|cuctri|toiuu/.test(key)) return 'mint';
  if (/daoham|vitichphan|tichphan|viphan|giaitich/.test(key)) return 'sky';
  if (/matran|dinhthuc|tuyentinh|gauss|daiso|vecto/.test(key)) return 'lavender';
  if (/dethi|onluyen|olympic|k51|k50/.test(key)) return 'sun';
  return 'neutral';
}

export default function PostFilterBar({ activeSubject = 'all', activeDifficulty = 'all', activeStatus = 'all',
  activeSort = 'newest', activeTag = '', searchQuery = '', totalResults = 0, onSubjectChange,
  onDifficultyChange, onSearchChange, onTagChange, onClearFilters, onViewChange, onOpenCreate, onOpenTags,
  stats, trendingTags = [] }) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [expanded, setExpanded] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => onSearchChange?.(localSearch), 350);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);
  const tabs = [
    { id: 'all', label: 'Tất cả', icon: BookOpen, count: stats?.totalPosts },
    { id: 'unsolved', label: 'Chờ lời giải', icon: Clock, count: stats?.openCount },
    { id: 'solved', label: 'Đã giải', icon: CheckCircle2, count: stats?.solvedCount },
    { id: 'saved', label: 'Đã lưu', icon: Bookmark }
  ];
  const filtered = activeTag || searchQuery || activeSubject !== 'all' || activeDifficulty !== 'all';
  return <header className="qa-feed-header-section">
    <div className="qa-explore-row paper-surface" data-paper="sky">
      <div className="qa-explore-intro"><div className="qa-explore-title-group"><h1 className="qa-explore-heading">Hỏi đáp toán học</h1><span className="qa-explore-count-pill">{totalResults} bài toán</span></div><p>Một câu hỏi rõ. Mở thêm nhiều cách giải.</p></div>
      <button type="button" className="qa-ask-question-btn" onClick={onOpenCreate}><Plus size={18} /><span>Đặt câu hỏi</span></button>
    </div>
    <form className="qa-feed-search-form" onSubmit={event => { event.preventDefault(); onSearchChange(localSearch); }}>
      <Search size={18} className="qa-search-icon" />
      <input className="qa-feed-search-input" type="search" aria-label="Tìm kiếm câu hỏi" placeholder="Tìm bài toán hoặc chủ đề…" value={localSearch} onChange={event => setLocalSearch(event.target.value)} />
      {localSearch && <button type="button" className="qa-search-clear-btn" aria-label="Xóa từ khóa" onClick={() => { setLocalSearch(''); onSearchChange(''); }}><X size={16} /></button>}
      <button type="button" className="qa-inline-filter-toggle" aria-label="Bộ lọc" aria-expanded={expanded} aria-controls="qa-advanced-filters" onClick={() => setExpanded(!expanded)}><SlidersHorizontal size={17} /><span>Bộ lọc</span></button>
    </form>
    {(trendingTags.length > 0 || activeTag) && <div className="qa-popular-tags-strip"><span className="qa-tags-strip-label"><Tag size={14} />Chủ đề</span><div className="qa-tags-scroll-wrap">
      {(activeTag ? [{ tag: activeTag }] : trendingTags.slice(0, 3)).map(({ tag }) => <button type="button" key={tag} data-tone={topicTone(tag)} className={'qa-math-tag-pill' + (activeTag === tag ? ' is-selected' : '')} onClick={() => onTagChange(activeTag === tag ? '' : tag.replace(/^#/, ''))}>{tag.replace(/^#/, '')}{activeTag === tag && <X size={12} />}</button>)}
      <button type="button" className="qa-tag-directory-link" onClick={onOpenTags}>Tất cả chủ đề</button>
    </div></div>}
    <div className="qa-tabs-and-selects-bar">
      <div className="qa-filter-tabs-group qa-status-tabs" aria-label="Trạng thái câu hỏi">{tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" className={'qa-ftab-btn' + (activeStatus === id ? ' is-active' : '')} aria-pressed={activeStatus === id} onClick={() => onViewChange({ status: id })}><Icon size={14} /><span>{label}</span>{count != null && <small>{count}</small>}</button>)}</div>
      <select className="qa-sort-select" aria-label="Sắp xếp câu hỏi" value={activeSort} onChange={event => onViewChange({ sort: event.target.value })}><option value="newest">Mới nhất</option><option value="popular">Nhiều bình chọn</option><option value="mostViewed">Nhiều lượt xem</option><option value="oldest">Cũ nhất</option></select>
    </div>
    {expanded && <div className="qa-advanced-filters" id="qa-advanced-filters">
      <div><label htmlFor="qa-subject-select">Chuyên mục</label><select id="qa-subject-select" value={activeSubject} onChange={event => onSubjectChange(event.target.value)}>{SUBJECT_CATEGORIES.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></div>
      <div><label htmlFor="qa-difficulty-select">Mức độ</label><select id="qa-difficulty-select" value={activeDifficulty} onChange={event => onDifficultyChange(event.target.value)}>{DIFFICULTY_LEVELS.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></div>
      <div className="qa-mobile-sort"><label htmlFor="qa-mobile-sort">Sắp xếp kết quả</label><select id="qa-mobile-sort" value={activeSort} onChange={event => onViewChange({ sort: event.target.value })}><option value="newest">Mới nhất</option><option value="popular">Nhiều bình chọn</option><option value="mostViewed">Nhiều lượt xem</option><option value="oldest">Cũ nhất</option></select></div>
    </div>}
    {filtered && <div className="qa-filter-summary"><span>{totalResults} kết quả</span><button type="button" onClick={onClearFilters}>Xóa bộ lọc <X size={13} /></button></div>}
  </header>;
}
