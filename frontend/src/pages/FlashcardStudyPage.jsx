import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen, Sparkles, CheckCircle2, AlertTriangle, Lightbulb,
  RotateCw, ChevronLeft, ChevronRight, Star, Shuffle,
  Grid, Compass, Award, BrainCircuit, HelpCircle, ArrowRight,
  Check, X, ShieldAlert, Cpu
} from 'lucide-react';
import MathRenderer from '../components/MathRenderer';
import { flashcardTopics, getTopicById } from '../data/flashcardsData';
import { studyTopics } from '../data/studyCurriculum';
import '../assets/styles/FlashcardStudyPage.css';

const STORAGE_KEY_PROGRESS = 'ueh_tcc_flashcard_progress_v1';
const STORAGE_KEY_STARRED = 'ueh_tcc_flashcard_starred_v1';

export default function FlashcardStudyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTopicId = searchParams.get('topic') || 'chuyen-de-1';
  const initialMode = searchParams.get('mode') || 'lesson';

  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  const [activeMode, setActiveMode] = useState(initialMode); // 'lesson' | 'flashcard' | 'gizmo' | 'quiz'

  // Current topic data
  const currentTopic = useMemo(() => {
    const topic = studyTopics.find(item => item.id === selectedTopicId) || getTopicById(selectedTopicId);
    if (!topic) return null;
    const sections = new Map((topic.lesson?.sections || []).map(section => [section.id, section]));
    const cardLabels = { formula: 'Công thức', trap: 'Ngộ nhận cần tránh', concept: 'Khái niệm', 'quick-calc': 'Tính nhanh' };
    return {
      ...topic,
      flashcards: topic.flashcards.map(card => {
        const section = sections.get(card.sectionId);
        return {
          ...card,
          category: card.category || cardLabels[card.type] || 'Ôn tập',
          source: card.source || section?.references?.[0] || topic.references?.[0] || '',
          trapWarning: card.trapWarning || (card.type === 'trap' ? section?.trap?.explanation : undefined),
        };
      }),
    };
  }, [selectedTopicId]);

  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'formula' | 'trap' | 'starred'
  const [isGridView, setIsGridView] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCardIds, setShuffledCardIds] = useState([]);
  const [revealedGridIds, setRevealedGridIds] = useState([]);

  // Starred cards stored in localStorage
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STARRED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Spaced Repetition (Gizmo) mastery progress stored in localStorage
  const [masteryData, setMasteryData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});

  // Sync topic in URL query
  const handleSelectTopic = (id) => {
    setSelectedTopicId(id);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setFilterType('all');
    setIsGridView(false);
    setIsShuffled(false);
    setShuffledCardIds([]);
    setRevealedGridIds([]);
    setQuizAnswers({});
    setSearchParams({ topic: id, mode: activeMode });
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSelectMode = (mode) => {
    setActiveMode(mode);
    setIsFlipped(false);
    setSearchParams({ topic: selectedTopicId, mode });
  };

  const handleSetFilter = (filter) => {
    setFilterType(filter);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleToggleGridReveal = (cardId) => {
    setRevealedGridIds(previous => previous.includes(cardId)
      ? previous.filter(id => id !== cardId)
      : [...previous, cardId]);
  };

  const handleToggleShuffle = () => {
    if (isShuffled) {
      setIsShuffled(false);
      setShuffledCardIds([]);
    } else {
      const ids = currentTopic.flashcards.map(card => card.id);
      for (let i = ids.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      setShuffledCardIds(ids);
      setIsShuffled(true);
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Toggle star
  const handleToggleStar = useCallback((cardId, e) => {
    if (e) e.stopPropagation();
    if (filterType === 'starred') {
      // Removing a card from the active subset can leave the carousel index past its end.
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
    setStarredIds(prev => {
      const next = prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId];
      try {
        localStorage.setItem(STORAGE_KEY_STARRED, JSON.stringify(next));
      } catch {
        // Storage unavailable in strict privacy mode
      }
      return next;
    });
  }, [filterType]);

  // Filtered cards
  const displayCards = useMemo(() => {
    let list = [...currentTopic.flashcards];
    if (filterType === 'formula') {
      list = list.filter(c => c.type === 'formula');
    } else if (filterType === 'trap') {
      list = list.filter(c => c.type === 'trap');
    } else if (filterType === 'starred') {
      list = list.filter(c => starredIds.includes(c.id));
    }
    if (isShuffled && shuffledCardIds.length) {
      const order = new Map(shuffledCardIds.map((id, index) => [id, index]));
      list.sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER));
    }
    return list;
  }, [currentTopic, filterType, starredIds, isShuffled, shuffledCardIds]);

  const currentCard = displayCards[currentCardIndex] || displayCards[0] || null;

  // Next / Prev card
  const handleNextCard = useCallback(() => {
    if (displayCards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % displayCards.length);
  }, [displayCards.length]);

  const handlePrevCard = useCallback(() => {
    if (displayCards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + displayCards.length) % displayCards.length);
  }, [displayCards.length]);

  // Gizmo Grade action
  const handleGizmoGrade = useCallback((grade) => { // 'again' | 'hard' | 'good'
    if (!currentCard) return;
    const nextMastery = {
      ...masteryData,
      [currentCard.id]: {
        grade,
        topicId: selectedTopicId,
        updatedAt: Date.now()
      }
    };
    setMasteryData(nextMastery);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(nextMastery));
    } catch {
      // Storage unavailable in strict privacy mode
    }

    // Advance to next card
    handleNextCard();
  }, [currentCard, masteryData, selectedTopicId, handleNextCard]);

  // Calculate mastery statistics for current topic
  const topicMasteryStats = useMemo(() => {
    const total = currentTopic.flashcards.length;
    let goodCount = 0;
    let hardCount = 0;
    let againCount = 0;

    currentTopic.flashcards.forEach(card => {
      const entry = masteryData[card.id];
      if (entry) {
        if (entry.grade === 'good') goodCount += 1;
        else if (entry.grade === 'hard') hardCount += 1;
        else if (entry.grade === 'again') againCount += 1;
      }
    });

    const percent = total > 0 ? Math.round(((goodCount * 1.0 + hardCount * 0.5) / total) * 100) : 0;
    let rankTitle = 'Tân Binh Khởi Động';
    if (percent >= 85) rankTitle = '🏆 Chiến Thần Toán Cao Cấp';
    else if (percent >= 60) rankTitle = '🔥 Cứu Môn An Toàn (Mục tiêu 7.5+)';
    else if (percent >= 30) rankTitle = '⚡ Đang Bứt Phá Kiến Thức';

    return { total, goodCount, hardCount, againCount, percent, rankTitle };
  }, [currentTopic, masteryData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(e.target.tagName) || e.target.isContentEditable) return;

      if (activeMode === 'flashcard' || activeMode === 'gizmo') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          handleNextCard();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handlePrevCard();
        } else if (e.code === 'KeyS' && currentCard) {
          e.preventDefault();
          handleToggleStar(currentCard.id);
        } else if (activeMode === 'gizmo' && isFlipped) {
          if (e.key === '1') handleGizmoGrade('again');
          if (e.key === '2') handleGizmoGrade('hard');
          if (e.key === '3') handleGizmoGrade('good');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, isFlipped, currentCard, handleNextCard, handlePrevCard, handleGizmoGrade, handleToggleStar]);

  return (
    <div className="study-page-container">
      <div className="study-page-inner">
        {/* HERO BANNER */}
        <section className="study-hero">
          <div className="study-hero-badge">
            <Sparkles size={14} /> Không gian ôn tập · Toán cao cấp UEH
          </div>
          <h1 className="study-hero-title">
            Ôn tập có trọng tâm, ghi nhớ có kiểm tra
          </h1>
          <p className="study-hero-desc">
            Chọn một chuyên đề, tự nhắc lại định nghĩa và công thức trước khi xem lời giải, sau đó kiểm tra mức độ nắm vững bằng câu hỏi ngắn.
          </p>
          <div className="study-hero-stats">
            <div className="study-stat-item">
              <BookOpen size={16} /> {flashcardTopics.length} chuyên đề
            </div>
            <div className="study-stat-item">
              <RotateCw size={16} /> {currentTopic.flashcards.length} thẻ trong chuyên đề đang chọn
            </div>
            <div className="study-stat-item">
              <BrainCircuit size={16} /> {topicMasteryStats.goodCount} thẻ đã nắm vững
            </div>
            <div className="study-stat-item">
              <Award size={16} /> Tiến độ ôn tập: {topicMasteryStats.percent}%
            </div>
          </div>
        </section>

        {/* TOPIC SELECTOR HUB */}
        <section className="topics-nav-wrapper">
          <div className="topics-nav-header">
            <div className="topics-nav-title">
              <Compass size={18} /> Chọn chuyên đề
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              10 chuyên đề trọng tâm
            </span>
          </div>
          <div className="topics-scroll-dock">
            {flashcardTopics.map((topic, idx) => {
              const isActive = topic.id === selectedTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`topic-pill-btn ${isActive ? 'active' : ''}`}
                  aria-pressed={isActive}
                >
                  <span className="topic-pill-num">{idx + 1}</span>
                  <span>{topic.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ACTIVE TOPIC HEADER & QUOTE */}
        <div className="topic-header-card">
          <div className="topic-header-top">
            <span className="topic-category-badge">{currentTopic.category}</span>
            <span className="topic-examStat">
              <AlertTriangle size={14} /> {currentTopic.examStats}
            </span>
          </div>
          <h2 className="topic-header-title">{currentTopic.title}</h2>
          <div className="topic-quote-box">
            <Lightbulb size={20} style={{ color: '#0d7a5f', flexShrink: 0 }} />
            <span>{currentTopic.quote}</span>
          </div>
        </div>

        {/* 4-IN-1 STUDY MODE SWITCHER */}
        <div className="study-modes-bar">
          <button
            onClick={() => handleSelectMode('lesson')}
            className={`study-mode-tab ${activeMode === 'lesson' ? 'active' : ''}`}
            aria-pressed={activeMode === 'lesson'}
          >
            <BookOpen size={18} />
            <span>1. Bài Học Khái Niệm</span>
          </button>
          <button
            onClick={() => handleSelectMode('flashcard')}
            className={`study-mode-tab ${activeMode === 'flashcard' ? 'active' : ''}`}
            aria-pressed={activeMode === 'flashcard'}
          >
            <RotateCw size={18} />
            <span>2. Thẻ ghi nhớ ({currentTopic.flashcards.length})</span>
          </button>
          <button
            onClick={() => handleSelectMode('gizmo')}
            className={`study-mode-tab ${activeMode === 'gizmo' ? 'active' : ''}`}
            aria-pressed={activeMode === 'gizmo'}
          >
            <BrainCircuit size={18} />
            <span>3. Ôn tập lặp lại</span>
          </button>
          <button
            onClick={() => handleSelectMode('quiz')}
            className={`study-mode-tab ${activeMode === 'quiz' ? 'active' : ''}`}
            aria-pressed={activeMode === 'quiz'}
          >
            <HelpCircle size={18} />
            <span>4. Câu hỏi kiểm tra ({currentTopic.quiz.length})</span>
          </button>
        </div>

        {/* ==================================================================
            MODE 1: BÀI HỌC KHÁI NIỆM (BRILLIANT.ORG STYLE)
            ================================================================== */}
        {activeMode === 'lesson' && (
          <div className="lesson-container">
            {/* Tóm tắt trọng tâm */}
            <div className="lesson-summary-box">
              <h3 className="lesson-box-title">
                <Lightbulb size={18} /> Trọng Tâm Cốt Lõi Cần Nhớ
              </h3>
              <p className="lesson-summary-text">{currentTopic.lesson.summary}</p>
            </div>

            {/* Mục tiêu bài học */}
            <div className="lesson-objectives-box">
              <h3 className="lesson-box-title" style={{ color: '#0f172a' }}>
                <CheckCircle2 size={18} style={{ color: '#0d7a5f' }} /> Mục Tiêu Năng Lực Bài Học
              </h3>
              <ul className="lesson-objectives-list">
                {currentTopic.lesson.objectives.map((obj, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Các phần lý thuyết chuyên sâu */}
            {currentTopic.lesson.sections.map((sec, i) => (
              <div key={i} className="lesson-section-card">
                <h3 className="lesson-section-title">{sec.title}</h3>
                <div className="lesson-section-content">
                  <MathRenderer text={sec.content} />
                </div>
              </div>
            ))}

            {/* Bẫy đề thi UEH hay gặp */}
            <div className="lesson-traps-section">
              <h3 className="traps-section-title">
                <ShieldAlert size={20} /> Cảnh Báo: Các Bẫy Đề Thi UEH Thường Gặp
              </h3>
              <div className="traps-grid">
                {currentTopic.lesson.traps.map((tr, i) => (
                  <div key={i} className="trap-card">
                    <h4 className="trap-card-title">{tr.title}</h4>
                    <div className="trap-comparison">
                      <div className="trap-wrong">
                        <strong>❌ Cách làm / ngộ nhận SAI:</strong>
                        <p style={{ margin: '4px 0 0' }}>{tr.wrong}</p>
                      </div>
                      <div className="trap-right">
                        <strong>✅ Cách giải CHÍNH XÁC:</strong>
                        <p style={{ margin: '4px 0 0' }}>{tr.right}</p>
                      </div>
                    </div>
                    <p className="trap-explanation">💡 <em>Lý do bẫy:</em> {tr.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ví dụ mẫu kinh điển có lời giải từng bước */}
            <div className="lesson-example-card">
              <div className="example-card-header">
                <Lightbulb size={20} style={{ color: '#d97706' }} />
                <span>Ví Dụ Kinh Điển & Hướng Dẫn Giải Từng Bước</span>
              </div>
              <div className="example-question">
                <MathRenderer text={currentTopic.lesson.workedExample.question} />
              </div>
              <div className="example-steps">
                {currentTopic.lesson.workedExample.steps.map((st, i) => (
                  <div key={i} className="example-step-item">
                    <MathRenderer text={st} />
                  </div>
                ))}
              </div>
              <div className="example-casio-tip">
                <Cpu size={18} style={{ flexShrink: 0 }} />
                <span><strong>Mẹo Casio / Kiểm chứng:</strong> {currentTopic.lesson.workedExample.casioTip}</span>
              </div>
            </div>

            {/* CTA Banner chuyển sang Flashcard */}
            <div className="lesson-cta-banner">
              <div>
                <h4 className="lesson-cta-title">Bạn đã nắm chắc lý thuyết chuyên đề này?</h4>
                <p className="lesson-cta-desc">
                  Chuyển sang chế độ Flashcard 3D để kiểm tra tốc độ phản xạ và khắc sâu các công thức vào trí nhớ dài hạn!
                </p>
              </div>
              <button onClick={() => handleSelectMode('flashcard')} className="btn-switch-flashcard">
                Lật Thẻ Flashcard Ngay <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================
            MODE 2: FLASHCARD 3D LẬT THẺ (QUIZLET STYLE)
            ================================================================== */}
        {activeMode === 'flashcard' && (
          <div className="flashcards-workbench">
            {/* Toolbar lọc và công cụ */}
            <div className="flashcard-toolbar">
              <div className="flashcard-filter-group">
                <button
                  onClick={() => handleSetFilter('all')}
                  className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
                  aria-pressed={filterType === 'all'}
                >
                  Tất cả ({currentTopic.flashcards.length})
                </button>
                <button
                  onClick={() => handleSetFilter('formula')}
                  className={`filter-chip ${filterType === 'formula' ? 'active' : ''}`}
                  aria-pressed={filterType === 'formula'}
                >
                  Công thức ({currentTopic.flashcards.filter(card => card.type === 'formula').length})
                </button>
                <button
                  onClick={() => handleSetFilter('trap')}
                  className={`filter-chip ${filterType === 'trap' ? 'active' : ''}`}
                  aria-pressed={filterType === 'trap'}
                >
                  Bẫy thường gặp ({currentTopic.flashcards.filter(card => card.type === 'trap').length})
                </button>
                <button
                  onClick={() => handleSetFilter('starred')}
                  className={`filter-chip ${filterType === 'starred' ? 'active' : ''}`}
                  aria-pressed={filterType === 'starred'}
                >
                  <Star size={14} aria-hidden="true" /> Đã đánh dấu ({starredIds.filter(id => currentTopic.flashcards.some(c => c.id === id)).length})
                </button>
              </div>

              <div className="flashcard-tools-group">
                <button
                  onClick={handleToggleShuffle}
                  aria-label={isShuffled ? 'Tắt thứ tự xáo trộn' : 'Xáo trộn thứ tự thẻ'}
                  aria-pressed={isShuffled}
                  title={isShuffled ? 'Tắt xáo trộn' : 'Xáo trộn thẻ'}
                  className={`tool-icon-btn ${isShuffled ? 'active' : ''}`}
                >
                  <Shuffle size={18} />
                </button>
                <button
                  onClick={() => setIsGridView(prev => !prev)}
                  aria-label={isGridView ? 'Chuyển sang chế độ từng thẻ' : 'Xem thẻ dạng lưới'}
                  aria-pressed={isGridView}
                  title={isGridView ? 'Xem từng thẻ' : 'Xem dạng lưới'}
                  className={`tool-icon-btn ${isGridView ? 'active' : ''}`}
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>

            {/* Chế độ Grid View (Xem toàn bộ thẻ) */}
            {isGridView ? (
              <div className="cards-grid-view">
                {displayCards.length === 0 ? (
                  <div className="cards-grid-empty">
                    <p>Chưa có thẻ phù hợp với bộ lọc này.</p>
                    <button onClick={() => handleSetFilter('all')} className="filter-chip active">Xem tất cả thẻ</button>
                  </div>
                ) : displayCards.map((card) => (
                  <div key={card.id} className="grid-card-item">
                    <div className="grid-card-meta">
                      <span className={`card-tag ${card.type}`}>{card.category}</span>
                      <button
                        onClick={(e) => handleToggleStar(card.id, e)}
                        aria-label={starredIds.includes(card.id) ? 'Bỏ đánh dấu thẻ' : 'Đánh dấu thẻ'}
                        aria-pressed={starredIds.includes(card.id)}
                        className="grid-star-btn"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: starredIds.includes(card.id) ? '#eab308' : '#94a3b8' }}
                      >
                        <Star size={16} fill={starredIds.includes(card.id) ? '#eab308' : 'none'} />
                      </button>
                    </div>
                    <div className="grid-card-front">
                      <span className="grid-card-label">Câu hỏi</span>
                      <MathRenderer text={card.front} />
                    </div>
                    {revealedGridIds.includes(card.id) && <div className="grid-card-back">
                      <span className="grid-card-label">Gợi ý / lời giải</span>
                      <MathRenderer text={card.back} />
                    </div>}
                    <button className="grid-reveal-btn" onClick={() => handleToggleGridReveal(card.id)} aria-expanded={revealedGridIds.includes(card.id)}>
                      {revealedGridIds.includes(card.id) ? 'Ẩn lời giải' : 'Xem lời giải'}
                    </button>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '10px' }}>
                      Nguồn: {card.source}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Chế độ 3D Flashcard Lật Thẻ */
              <div>
                {displayCards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' }}>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>Không tìm thấy thẻ nào phù hợp với bộ lọc này.</p>
                    <button onClick={() => handleSetFilter('all')} className="filter-chip active" style={{ marginTop: '12px' }}>
                      Xem tất cả thẻ
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="card-scene" onClick={() => setIsFlipped(prev => !prev)} role="group" aria-label="Thẻ ghi nhớ; có thể lật để xem lời giải">
                      <div className={`card-object ${isFlipped ? 'is-flipped' : ''}`}>
                        {/* Mặt trước */}
                        <div className="card-face front" aria-hidden={isFlipped}>
                          <div className="card-meta-top">
                            <span className={`card-tag ${currentCard?.type}`}>{currentCard?.category}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="card-source-badge">{currentCard?.source}</span>
                              <button
                                onClick={(e) => handleToggleStar(currentCard?.id, e)}
                                aria-label={starredIds.includes(currentCard?.id) ? 'Bỏ đánh dấu thẻ' : 'Đánh dấu thẻ'}
                                aria-pressed={starredIds.includes(currentCard?.id)}
                                tabIndex={isFlipped ? -1 : 0}
                                className="card-star-btn"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: starredIds.includes(currentCard?.id) ? '#eab308' : '#94a3b8' }}
                              >
                                <Star size={20} fill={starredIds.includes(currentCard?.id) ? '#eab308' : 'none'} />
                              </button>
                            </div>
                          </div>

                          <div className="card-body-content">
                            <div className="card-front-text">
                              <MathRenderer text={currentCard?.front} />
                            </div>
                          </div>

                          <button className="card-hint-bottom card-flip-control" onClick={e => { e.stopPropagation(); setIsFlipped(true); }} aria-label="Lật thẻ để xem lời giải">
                            <RotateCw size={14} aria-hidden="true" /> Xem lời giải
                          </button>
                        </div>

                        {/* Mặt sau */}
                        <div className="card-face back" aria-hidden={!isFlipped}>
                          <div className="card-meta-top">
                            <span className="card-tag formula">✅ Lời giải & Công thức</span>
                              <button
                                onClick={(e) => handleToggleStar(currentCard?.id, e)}
                                aria-label={starredIds.includes(currentCard?.id) ? 'Bỏ đánh dấu thẻ' : 'Đánh dấu thẻ'}
                                aria-pressed={starredIds.includes(currentCard?.id)}
                                tabIndex={isFlipped ? 0 : -1}
                                className="card-star-btn"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: starredIds.includes(currentCard?.id) ? '#eab308' : '#94a3b8' }}
                            >
                              <Star size={20} fill={starredIds.includes(currentCard?.id) ? '#eab308' : 'none'} />
                            </button>
                          </div>

                          <div className="card-body-content">
                            <div className="card-back-text">
                              <MathRenderer text={currentCard?.back} />
                            </div>

                            {currentCard?.keyTakeaway && (
                              <div className="card-key-takeaway">
                                <Lightbulb size={16} style={{ flexShrink: 0 }} />
                                <MathRenderer text={currentCard.keyTakeaway} />
                              </div>
                            )}

                            {currentCard?.trapWarning && (
                              <div className="card-trap-warning">
                                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                <span>{currentCard.trapWarning}</span>
                              </div>
                            )}
                          </div>

                          <button className="card-hint-bottom card-flip-control" onClick={e => { e.stopPropagation(); setIsFlipped(false); }} aria-label="Lật lại mặt câu hỏi">
                            <RotateCw size={14} aria-hidden="true" /> Xem lại câu hỏi
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Điều khiển chuyển thẻ */}
                    <div className="card-nav-controls">
                      <button onClick={handlePrevCard} className="nav-arrow-btn">
                        <ChevronLeft size={18} /> Thẻ trước
                      </button>

                      <div className="card-counter-badge" aria-live="polite" aria-atomic="true">
                        Thẻ {currentCardIndex + 1} / {displayCards.length}
                      </div>

                      <button onClick={handleNextCard} className="nav-arrow-btn">
                        Thẻ tiếp <ChevronRight size={18} />
                      </button>
                    </div>

                    <div className="keyboard-shortcuts-hint">
                      Phím tắt: <kbd>Space</kbd> Lật thẻ • <kbd>←</kbd> <kbd>→</kbd> Chuyển thẻ • <kbd>S</kbd> Gắn sao
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================
            MODE 3: SPACED REPETITION (GIZMO.AI STYLE)
            ================================================================== */}
        {activeMode === 'gizmo' && (
          <div className="gizmo-container">
            {/* Thanh tiến độ Mastery */}
            <div className="gizmo-progress-card">
              <div className="gizmo-progress-header">
                <div className="gizmo-rank-title">
                  <BrainCircuit size={20} /> {topicMasteryStats.rankTitle}
                </div>
                <div className="gizmo-mastery-score">
                  {topicMasteryStats.percent}% Thuần Thục
                </div>
              </div>

              <div className="gizmo-progress-bar-bg">
                <div className="gizmo-progress-bar-fill" style={{ width: `${topicMasteryStats.percent}%` }} />
              </div>

              <div className="gizmo-stats-pills">
                <span className="pill-mastered">🟢 Đã thuộc: {topicMasteryStats.goodCount}</span>
                <span className="pill-reviewing">🟡 Hơi mơ hồ: {topicMasteryStats.hardCount}</span>
                <span className="pill-learning">🔴 Chưa thuộc: {topicMasteryStats.againCount}</span>
              </div>
            </div>

            {/* Flashcard đang xét */}
            <div className="card-scene" onClick={() => setIsFlipped(prev => !prev)}>
              <div className={`card-object ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="card-face front">
                  <div className="card-meta-top">
                    <span className="card-tag concept">Thử thách trí nhớ chủ động (Active Recall)</span>
                    <span className="card-source-badge">{currentCard?.source}</span>
                  </div>
                  <div className="card-body-content">
                    <div className="card-front-text">
                      <MathRenderer text={currentCard?.front} />
                    </div>
                  </div>
                  <div className="card-hint-bottom">
                    <RotateCw size={14} /> Nhấn để kiểm tra bạn nhớ đúng hay sai
                  </div>
                </div>

                <div className="card-face back">
                  <div className="card-meta-top">
                    <span className="card-tag formula">Đáp án chuẩn mực</span>
                  </div>
                  <div className="card-body-content">
                    <div className="card-back-text">
                      <MathRenderer text={currentCard?.back} />
                    </div>
                    {currentCard?.keyTakeaway && (
                      <div className="card-key-takeaway">
                        <Lightbulb size={16} /> <span>{currentCard.keyTakeaway}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-hint-bottom">
                    Đánh giá mức độ tự tin của bạn ở bên dưới:
                  </div>
                </div>
              </div>
            </div>

            {/* Các nút tự đánh giá Spaced Repetition */}
            {isFlipped && (
              <div className="gizmo-grading-bar">
                <button onClick={() => handleGizmoGrade('again')} className="gizmo-btn again">
                  🔴 Chưa thuộc
                  <span>Ôn lại ngay (Phím 1)</span>
                </button>
                <button onClick={() => handleGizmoGrade('hard')} className="gizmo-btn hard">
                  🟡 Hơi mơ hồ
                  <span>Cần củng cố (Phím 2)</span>
                </button>
                <button onClick={() => handleGizmoGrade('good')} className="gizmo-btn good">
                  🟢 Đã nắm vững
                  <span>Tuyệt vời! (Phím 3)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================
            MODE 4: TRẮC NGHIỆM PHẢN XẠ NHANH (KNOWT / EXAM MODE)
            ================================================================== */}
        {activeMode === 'quiz' && (
          <div className="quiz-container">
            {currentTopic.quiz.map((q, qIndex) => {
              const selectedOpt = quizAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={q.id} className="quiz-card">
                  <div className="quiz-header">
                    <span className="quiz-difficulty-tag">
                      Câu {qIndex + 1}: {q.difficulty} • Nguồn: {q.source}
                    </span>
                    {isAnswered && (
                      <span style={{ fontWeight: 800, color: isCorrect ? '#16a34a' : '#dc2626' }}>
                        {isCorrect ? '✅ CHÍNH XÁC' : '❌ CHƯA ĐÚNG'}
                      </span>
                    )}
                  </div>

                  <div className="quiz-question-text">
                    <MathRenderer text={q.question} />
                  </div>

                  <div className="quiz-options-list">
                    {q.options.map((opt, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex);
                      let optionClass = 'quiz-option-btn';

                      if (isAnswered) {
                        if (optIndex === q.correctIndex) {
                          optionClass += ' correct';
                        } else if (optIndex === selectedOpt) {
                          optionClass += ' incorrect';
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={isAnswered}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                          className={optionClass}
                        >
                          <span className="quiz-option-letter">{letter}</span>
                          <span style={{ flex: 1 }}>
                            <MathRenderer text={opt} />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Phản hồi và phân tích bẫy chi tiết */}
                  {isAnswered && (
                    <div className="quiz-feedback-box">
                      <div className={`quiz-feedback-title ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? <Check size={18} /> : <X size={18} />}
                        <span>{isCorrect ? 'Lời giải chi tiết:' : 'Giải thích đáp án đúng:'}</span>
                      </div>
                      <div className="quiz-feedback-text">
                        <MathRenderer text={q.explanation} />
                      </div>
                      <div className="quiz-distractorAnalysis">
                        <strong>⚠️ Nhận diện bẫy các phương án sai:</strong> {q.distractorAnalysis}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
