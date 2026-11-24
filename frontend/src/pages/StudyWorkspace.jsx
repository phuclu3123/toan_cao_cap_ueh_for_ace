import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, Layers, ListChecks, Pencil, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import useStudyStorage from '../hooks/useStudyStorage';
import { studyTopics, studyTopicIds } from '../data/studyManifest';
import { parseStudy, validatePersonalCard } from '../utils/studyModel';
import { cleanStudyTitle } from '../utils/studyLabels';
import { openCookieSettings } from '../utils/cookieConsent';
import StudyTheory from '../components/study/StudyTheory';
import StudyCards from '../components/study/StudyCards';
import StudyQuiz from '../components/study/StudyQuiz';
import StudyPersonal from '../components/study/StudyPersonal';
import StudyProgress from '../components/study/StudyProgress';
import StudyCardEditor from '../components/study/StudyCardEditor';
import '../assets/styles/StudyWorkspace.css';
import '../assets/styles/StudyCraft.css';

import { loadStudyTopic, loadStudyTopics } from '../services/studyContentService';
import { useAuth } from '../contexts/AuthContext';
import StudyContentEditor from '../components/study/StudyContentEditor';
import BrandLoader from '../components/ui/BrandLoader';
import FlashcardGate from '../components/study/FlashcardGate';

const modes = [{ id: 'lesson', label: 'Lý thuyết', Icon: BookOpen }, { id: 'flashcard', label: 'Thẻ ghi nhớ', Icon: Layers }, { id: 'quiz', label: 'Tự kiểm tra', Icon: ListChecks }, { id: 'personal', label: 'Thẻ của tôi', Icon: Pencil }, { id: 'progress', label: 'Tiến độ', Icon: SlidersHorizontal }];
export default function StudyWorkspace() {
  const { currentUser } = useAuth();
  return <FlashcardGate><StudyWorkspaceContent key={currentUser?.id || currentUser?.uid || 'guest'} /></FlashcardGate>;
}
function StudyWorkspaceContent() {
  const [params] = useSearchParams();
  const topicId = studyTopicIds.includes(params.get('topic')) ? params.get('topic') : studyTopicIds[0];
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [metadata, setMetadata] = useState(studyTopics);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([loadStudyTopic(topicId, controller.signal), loadStudyTopics(controller.signal)]).then(([data, listing]) => { if (!controller.signal.aborted) { setResult(data); setMetadata(listing.topics); setError(''); } }).catch(failure => { if (!controller.signal.aborted) { setError(failure.message); if ([401, 403].includes(failure.status)) window.dispatchEvent(new Event('ueh-tcc-flashcard-access-changed')); } });
    return () => controller.abort();
  }, [topicId, retry]);
  if (error) return <div className="study-workspace" role="alert"><h1>Chưa tải được học liệu</h1><p>{error}</p><button className="study-button" onClick={() => { setError(''); setRetry(value => value + 1); }}>Thử lại</button></div>;
  if (result?.topic.id !== topicId) return <BrandLoader label="Đang tải Flashcard & Bài học..." phase="content" />;
  return <LoadedStudyWorkspace key={topicId} topic={result.topic} version={result.version} metadata={metadata} onSaved={data => { setResult(data); setMetadata(previous => previous.map(t => t.id === data.topic.id ? { ...t, shortTitle: data.topic.shortTitle } : t)); }} />;
}
function LoadedStudyWorkspace({ topic, version, metadata, onSaved }) {
  const [params, setParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [contentEditor, setContentEditor] = useState(false);
  const hasApplications = topic.lesson.sections.some(s => s.group === 'applications');
  const availableModes = hasApplications ? [modes[0], { id: 'applications', label: 'Ứng dụng kinh tế', Icon: BookOpen }, ...modes.slice(1)] : modes;
  const selectedIsApplication = topic.lesson.sections.find(s => s.id === params.get('section'))?.group === 'applications';
  // Deep links from a card or quiz open the correct theory group.
  const handleTheory = section => handleNavigate(topic.lesson.sections.find(s => s.id === section)?.group === 'applications' ? 'applications' : 'lesson', topic.id, section);
  const requestedMode = availableModes.some(item => item.id === params.get('mode')) ? params.get('mode') : params.get('mode') === 'gizmo' ? 'flashcard' : 'lesson';
  const mode = requestedMode === 'lesson' && selectedIsApplication ? 'applications' : requestedMode;
  const lessonTopic = { ...topic, lesson: { ...topic.lesson, sections: topic.lesson.sections.filter(s => (mode === 'applications') === (s.group === 'applications')) } };
  const [chapterSearch, setChapterSearch] = useState('');
  const [showChapters, setShowChapters] = useState(false);
  const { study, setStudy, savedOnDevice, storageError } = useStudyStorage();
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);
  const personalCards = study.cards.filter(card => card.topicId === topic.id);
  const cards = useMemo(() => [...topic.flashcards, ...study.cards.filter(card => card.topicId === topic.id)], [topic, study.cards]);
  const matchingTopics = metadata.filter(item => `${item.shortTitle} ${item.category}`.toLocaleLowerCase('vi').includes(chapterSearch.toLocaleLowerCase('vi')));
  // URL selection preserves deep links and browser Back/Forward behavior.
  const handleNavigate = (nextMode, nextTopic = topic.id, section = '') => {
    setParams({ topic: nextTopic, mode: nextMode, ...(section ? { section } : {}) });
    setShowChapters(false); setNotice('');
  };
  const handleCreateCard = section => setEditor({ topicId: topic.id, type: 'concept', front: section ? `Trình bày: ${cleanStudyTitle(section.title)}` : '', back: section?.content || '', conditions: section?.conditions || '', source: section ? topic.references[0] || '' : '' });
  const handleSaveCard = draft => {
    const valid = validatePersonalCard(draft, studyTopicIds);
    if (!valid) return false;
    if (!draft.id && study.cards.length >= 500) { setNotice('Bộ thẻ đã đạt giới hạn 500 thẻ trên thiết bị. Hãy xuất và sắp xếp lại bộ thẻ.'); return false; }
    setStudy(previous => ({ ...previous, cards: [...previous.cards.filter(card => card.id !== valid.id), valid] }));
    setEditor(null); setNotice(savedOnDevice ? 'Đã lưu thẻ trên thiết bị này.' : 'Đã thêm thẻ vào phiên học. Có thể xuất thẻ để giữ lại.');
    return true;
  };
  // Exports contain authored cards only, without account/session data.
  const handleExport = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, cards: study.cards }, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ueh-tcc-the-ca-nhan.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const handleImport = async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('Tệp tối đa 2 MB.');
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.cards) || data.cards.length > 500 || data.cards.some(card => !validatePersonalCard(card, studyTopicIds))) throw new Error('Tệp không đúng định dạng α∫M4A hoặc có trường vượt giới hạn.');
      const imported = parseStudy(data, studyTopicIds).cards;
      const merged = new Map(study.cards.map(card => [card.id, card])); imported.forEach(card => merged.set(card.id, card));
      if (merged.size > 500) throw new Error('Sau khi nhập, bộ thẻ vượt giới hạn 500 thẻ.');
      setStudy(previous => ({ ...previous, cards: [...merged.values()] })); setNotice(`Đã nhập ${imported.length} thẻ vào các chuyên đề tương ứng.`);
    } catch (error) { setNotice(`Không thể nhập: ${error.message}`); }
  };
  const handleDelete = id => {
    setStudy(previous => ({ ...previous, cards: previous.cards.filter(card => card.id !== id), starred: previous.starred.filter(key => key !== id), reviews: Object.fromEntries(Object.entries(previous.reviews).filter(([key]) => key !== id)) }));
    setNotice('Đã xóa thẻ cá nhân.');
  };
  return <div className="study-workspace">
    <div className="study-topline"><Link to="/courses"><ArrowLeft size={15} /> Học tập</Link><span>Không gian ôn tập Toán cao cấp</span></div>
    <div className="study-shell"><aside className={`study-sidebar ${showChapters ? 'is-open' : ''}`} aria-label="Danh sách chuyên đề">
      <div className="study-sidebar-title"><BookOpen size={18} /><h2>Nội dung học tập</h2><button className="study-icon mobile-only" onClick={() => setShowChapters(false)} aria-label="Đóng danh sách chuyên đề"><X size={18} /></button></div>
      <label className="study-search"><Search size={16} /><input aria-label="Tìm chuyên đề" placeholder="Tìm chuyên đề…" value={chapterSearch} onChange={event => setChapterSearch(event.target.value)} /></label>
      <nav className="study-chapters">{matchingTopics.map(item => <button key={item.id} className={item.id === topic.id ? 'is-active' : ''} onClick={() => handleNavigate(mode, item.id)} aria-current={item.id === topic.id ? 'page' : undefined}><span className="study-chapter-number">{String(item.order).padStart(2, '0')}</span><span>{item.shortTitle}<small>{item.category}</small></span>{item.id === topic.id && <ChevronRight size={14} />}</button>)}{matchingTopics.length === 0 && <p className="study-muted study-search-empty">Không có chuyên đề phù hợp.</p>}</nav>
      <div className="study-sidebar-note"><FileText size={17} /><p>Học từ giả thiết đến kết luận.<br />Ghi nhớ cả điều kiện áp dụng.</p></div>
    </aside><div className="study-sheet">
      <button className="study-chapter-picker mobile-only" onClick={() => setShowChapters(value => !value)} aria-expanded={showChapters}><span>Chuyên đề {topic.order} · {topic.shortTitle}</span><ChevronDown size={16} /></button>
      <header className="study-heading"><div><p className="study-breadcrumb">{topic.category} <span>/</span> Chuyên đề {String(topic.order).padStart(2, '0')}</p><h1>{topic.shortTitle}</h1><p className="study-muted">Hiểu bản chất. Ghi nhớ có điều kiện. Vận dụng chính xác.</p></div><button className="study-button" onClick={() => handleCreateCard()}><Plus size={16} /> Tạo thẻ</button></header>
      {currentUser?.role === 'Admin' && <div className="study-row-actions"><button className="study-button" onClick={() => setContentEditor(true)}>Biên tập học liệu</button><Link className="study-button" to="/admin/flashcards">Quản lý quyền Flashcard</Link></div>}
      <div className="study-meta"><span>{topic.lesson.sections.length} mục lý thuyết</span><span>{cards.length} thẻ ghi nhớ</span><span>{topic.quiz.length} câu tự kiểm tra</span><span className="study-storage">{savedOnDevice ? 'Lưu trên thiết bị' : 'Đang học trong phiên này'} <button onClick={openCookieSettings} aria-label="Thay đổi cách lưu dữ liệu học tập">Tùy chọn</button></span></div>
      <nav className="study-tabs" aria-label="Chế độ học">{availableModes.map(({ id, label, Icon }) => <Link key={id} to={`?topic=${topic.id}&mode=${id}`} aria-current={mode === id ? 'page' : undefined}><Icon size={16} />{label}</Link>)}</nav>
      {storageError && <p className="study-notice" role="alert">Không thể lưu trên thiết bị do giới hạn trình duyệt. Hãy xuất thẻ để giữ lại.</p>}
      {notice && <div className="study-notice" role="status">{notice}<button className="study-icon" onClick={() => setNotice('')} aria-label="Đóng thông báo"><X size={16} /></button></div>}
      {topic.draft && <details className="study-draft"><summary>Học liệu đang rà soát <ChevronDown size={14} /></summary><p>Nội dung hiện có phục vụ duyệt giao diện. Công thức, đáp án và dẫn chiếu đề thi của chuyên đề này chưa được đối chiếu toàn bộ. Không dùng để suy ra cấu trúc đề thi hiện hành. Phần phương trình vi phân ở đây chỉ xét cấp một.</p></details>}
      <div className="study-content">
        {(mode === 'lesson' || mode === 'applications') && <StudyTheory key={`${topic.id}:${mode}`} topic={lessonTopic} selectedSection={params.get('section')} onSection={section => handleNavigate(mode, topic.id, section)} onReview={section => handleNavigate('flashcard', topic.id, section)} onCreate={handleCreateCard} />}
        {mode === 'flashcard' && <StudyCards key={`${topic.id}:${params.get('section') || ''}`} cards={cards} study={study} setStudy={setStudy} initialSection={params.get('section')} onTheory={handleTheory} />}
        {mode === 'quiz' && <StudyQuiz key={topic.id} topic={topic} onTheory={handleTheory} onComplete={result => setStudy(previous => ({ ...previous, quizzes: [...previous.quizzes, { ...result, topicId: topic.id, at: Date.now() }].slice(-50) }))} />}
        {mode === 'personal' && <StudyPersonal cards={personalCards} onCreate={() => handleCreateCard()} onEdit={setEditor} onDelete={handleDelete} onExport={handleExport} onImport={() => fileRef.current?.click()} savedOnDevice={savedOnDevice} />}
        {mode === 'progress' && <StudyProgress topic={topic} cards={cards} study={study} onStudy={() => handleNavigate('flashcard')} />}
      </div><input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} hidden aria-label="Nhập tệp thẻ" />
    </div></div>{contentEditor && <StudyContentEditor topic={topic} version={version} onSaved={onSaved} onClose={() => setContentEditor(false)} />}{editor && <StudyCardEditor key={editor.id || 'new'} card={editor} onSave={handleSaveCard} onClose={() => setEditor(null)} savedOnDevice={savedOnDevice} />}
  </div>;
}
