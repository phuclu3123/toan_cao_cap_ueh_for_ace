import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, BookOpen, ChevronLeft, ChevronRight, Layers, RotateCcw, Search, Shuffle, X } from 'lucide-react';
import { isDue, scheduleReview, shuffleCards } from '../../utils/studyModel';
import { typeLabels } from '../../utils/studyLabels';
import { MathText } from './StudyPrimitives';
import '../../assets/styles/StudyCards.css';

export default function StudyCards({ cards, study, setStudy, initialSection, onTheory }) {
  const [filter, setFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState(initialSection || '');
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(() => cards.map(card => card.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [instantFlip, setInstantFlip] = useState(false);
  const [reviewed, setReviewed] = useState([]);
  const [undo, setUndo] = useState(null);
  const [complete, setComplete] = useState(false);
  const [now, setNow] = useState(Date.now);
  const filtered = useMemo(() => order.map(id => cards.find(card => card.id === id)).filter(Boolean).filter(card => (!sectionFilter || card.sectionId === sectionFilter) && (!query || `${card.front} ${card.back}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))) && (filter === 'all' || filter === 'starred' && study.starred.includes(card.id) || filter === 'due' && isDue(study.reviews[card.id], now) || card.type === filter)), [order, cards, sectionFilter, query, filter, study.starred, study.reviews, now]);
  const card = filtered[Math.min(index, Math.max(0, filtered.length - 1))];
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  const handleMove = direction => { setIndex(value => Math.max(0, Math.min(filtered.length - 1, value + direction))); setFlipped(false); setComplete(false); };
  const handleFilter = value => { setFilter(value); setIndex(0); setFlipped(false); setComplete(false); setReviewed([]); };
  // Self-assessment updates a suggested review interval, not a mastery score.
  const handleRate = rating => {
    if (!card || !flipped) return;
    setUndo({ id: card.id, previous: study.reviews[card.id], index, reviewed });
    setStudy(previous => ({ ...previous, reviews: { ...previous.reviews, [card.id]: scheduleReview(previous.reviews[card.id], rating) } }));
    setReviewed([...new Set([...reviewed, card.id])]); setFlipped(false);
    if (filter === 'due') { if (filtered.length <= 1) setComplete(true); }
    else if (index < filtered.length - 1) setIndex(index + 1);
    else setComplete(true);
  };
  const handleUndo = () => {
    if (!undo) return;
    setStudy(previous => { const reviews = { ...previous.reviews }; if (undo.previous) reviews[undo.id] = undo.previous; else delete reviews[undo.id]; return { ...previous, reviews }; });
    setIndex(undo.index); setReviewed(undo.reviewed); setComplete(false); setFlipped(true); setUndo(null);
  };
  const handleStar = () => {
    if (!card) return;
    if (filter === 'starred' && study.starred.includes(card.id)) {
      // Removing the current card shrinks the filtered deck; restart at a valid index.
      setIndex(0);
      setFlipped(false);
      setComplete(false);
    }
    setStudy(previous => ({
      ...previous,
      starred: previous.starred.includes(card.id)
        ? previous.starred.filter(id => id !== card.id)
        : [...previous.starred, card.id],
    }));
  };
  useEffect(() => {
    const handleKey = event => {
      if (event.target.closest('input,textarea,select,button,a,dialog,[contenteditable="true"]') || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]')) return;
      if (event.code === 'Space' && card && !complete) { event.preventDefault(); setInstantFlip(true); setFlipped(value => !value); }
      if (event.key === 'ArrowRight') { setIndex(value => Math.min(Math.max(0, filtered.length - 1), value + 1)); setFlipped(false); }
      if (event.key === 'ArrowLeft') { setIndex(value => Math.max(0, value - 1)); setFlipped(false); }
    };
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, [card, filtered.length, complete]);
  return <div className="study-practice study-practice--focused">
    <div className="study-panel-heading"><div><h2>Ghi nhớ bằng cách tự trả lời</h2><p className="study-muted">Đọc câu hỏi, tự trình bày, rồi đối chiếu lời giải và điều kiện.</p></div><button className="study-button" onClick={() => { setOrder(shuffleCards(cards).map(item => item.id)); setIndex(0); setFlipped(false); setComplete(false); setReviewed([]); }}><Shuffle size={16} /> Trộn thẻ</button></div>
    <div className="study-filters"><label><span>Lọc thẻ</span><select value={filter} onChange={event => handleFilter(event.target.value)}><option value="all">Tất cả thẻ</option><option value="due">Đến lịch ôn</option><option value="starred">Đã đánh dấu</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="study-search"><Search size={16} /><input aria-label="Tìm trong bộ thẻ" placeholder="Tìm trong bộ thẻ…" value={query} onChange={event => { setQuery(event.target.value); setIndex(0); setFlipped(false); setComplete(false); }} /></label><span className="study-muted">{filtered.length} thẻ phù hợp</span></div>
    {sectionFilter && <div className="study-filter-note">Đang ôn mục lý thuyết vừa đọc.<button className="study-text-button" onClick={() => { setSectionFilter(''); setIndex(0); }}>Xem toàn bộ chuyên đề <X size={14} /></button></div>}
    {complete ? <div className="study-complete"><CheckMark /><h3>Đã hoàn tất lượt ôn này</h3><p>Bạn đã tự đánh giá {reviewed.length} thẻ. Lịch ôn tiếp theo đã được cập nhật.</p><div className="study-row-actions"><button className="study-button study-primary" onClick={() => { setComplete(false); setIndex(0); setReviewed([]); }}>Xem lại bộ thẻ</button>{undo && <button className="study-button" onClick={handleUndo}><RotateCcw size={16} /> Hoàn tác đánh giá cuối</button>}</div></div> : !card ? <div className="study-empty"><Layers size={28} /><h3>Chưa có thẻ trong lựa chọn này</h3><p>{filter === 'due' ? 'Các thẻ đã ôn chưa đến lịch tiếp theo. Bạn vẫn có thể xem toàn bộ thẻ.' : 'Thử thay bộ lọc hoặc đánh dấu thẻ bạn muốn ôn riêng.'}</p><button className="study-button" onClick={() => { handleFilter('all'); setQuery(''); setSectionFilter(''); }}>Xem tất cả thẻ</button>{undo && <button className="study-text-button" onClick={handleUndo}>Hoàn tác đánh giá cuối</button>}</div> : <>
      <div className="study-card-toolbar"><span className={`study-card-kind kind-${card.type}`}>{typeLabels[card.type]} {card.personal && '· Thẻ cá nhân'}</span><span role="status" aria-live="polite">Thẻ {Math.min(index + 1, filtered.length)} / {filtered.length}</span><button className={`study-icon ${study.starred.includes(card.id) ? 'is-marked' : ''}`} onClick={handleStar} aria-label={study.starred.includes(card.id) ? 'Bỏ đánh dấu thẻ' : 'Đánh dấu thẻ'} aria-pressed={study.starred.includes(card.id)}><Bookmark size={19} fill={study.starred.includes(card.id) ? 'currentColor' : 'none'} /></button></div>
      <div className="study-card-progress" role="progressbar" aria-label="Tiến độ bộ thẻ" aria-valuemin={0} aria-valuemax={filtered.length} aria-valuenow={index + 1} aria-valuetext={`Thẻ ${index + 1} trên ${filtered.length}`}>
        <span style={{ width: `${((index + 1) / filtered.length) * 100}%` }} />
      </div>
      <div className={`study-flashcard study-tactile-card ${flipped ? 'is-flipped' : ''}`} data-card-type={card.type} data-instant={instantFlip}>
        <div className="study-card-surface" role="button" tabIndex={0} aria-label={flipped ? 'Lật thẻ về câu hỏi' : 'Lật thẻ xem lời giải'} aria-pressed={flipped} onClick={event => { if (event.target.closest('a') || window.getSelection()?.toString()) return; setInstantFlip(event.detail === 0); setFlipped(value => !value); }} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'Enter' || event.code === 'Space') { event.preventDefault(); event.stopPropagation(); setInstantFlip(true); setFlipped(value => !value); } }}>
          <div className="study-card-faces"><div className="study-card-face study-card-front" aria-hidden={flipped} inert={flipped}><span className="study-card-label">Câu hỏi <span>Thử nhớ trước khi lật</span></span><MathText>{card.front}</MathText><span className="study-card-tap-hint"><RotateCcw size={15} />Lật thẻ xem đáp án</span></div><div className="study-card-face study-card-back" aria-hidden={!flipped} inert={!flipped}><span className="study-card-label">Đáp án <span>Đối chiếu cách hiểu của bạn</span></span><MathText>{card.back}</MathText><span className="study-card-tap-hint"><RotateCcw size={15} />Trở lại câu hỏi</span></div></div>
        </div>
      </div>
      <div className="study-card-navigation"><button className="study-icon" aria-label="Thẻ trước" disabled={index === 0} onClick={() => handleMove(-1)}><ChevronLeft size={20} /></button><span className="study-muted">Phím cách để lật · ← → để chuyển thẻ</span><button className="study-icon" aria-label="Thẻ tiếp theo" disabled={index >= filtered.length - 1} onClick={() => handleMove(1)}><ChevronRight size={20} /></button></div>
      {flipped && (card.conditions || card.keyTakeaway) && <div className="study-card-notes">
        {card.keyTakeaway && <div className="study-card-reminder"><span>Điểm cần nhớ</span><MathText>{card.keyTakeaway}</MathText></div>}
        {card.conditions && <details className="study-card-conditions" key={card.id}><summary>Điều kiện áp dụng <ChevronRight size={15} /></summary><MathText>{card.conditions}</MathText></details>}
      </div>}
      {flipped ? <div className="study-ratings" aria-label="Tự đánh giá mức ghi nhớ"><p>Khả năng tự trả lời của bạn?</p><div><button onClick={() => handleRate('again')}>Cần học lại<small>Ôn sau 1 phút</small></button><button onClick={() => handleRate('hard')}>Còn phân vân<small>Ôn sau 10 phút</small></button><button className="study-rating-good" onClick={() => handleRate('good')}>Đã hiểu và nhớ<small>Ôn sau {Math.round(scheduleReview(study.reviews[card.id], 'good', now).interval / 86_400_000)} ngày</small></button></div></div> : <p className="study-before-flip">Thử nêu cả công thức, điều kiện và một trường hợp áp dụng trước khi lật thẻ.</p>}
      <div className="study-practice-footer"><button className="study-text-button" onClick={() => onTheory(card.sectionId)}><BookOpen size={15} /> Xem lý thuyết liên quan</button>{undo && <button className="study-text-button" onClick={handleUndo}><RotateCcw size={14} /> Hoàn tác đánh giá</button>}<span className="study-muted">Đã tự đánh giá: {reviewed.length}</span></div>
    </>}
  </div>;
}
function CheckMark() { return <ArrowRight size={32} aria-hidden="true" />; }
