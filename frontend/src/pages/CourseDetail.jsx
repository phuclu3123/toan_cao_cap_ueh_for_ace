import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  FolderOpen,
  GraduationCap,
  Library,
  Loader2,
  LockKeyhole,
  Pause,
  Play,
  ShieldAlert,
  ShieldCheck,
  SkipForward,
  Users,
  Video,
  X,
  Flag,
  CheckCircle
} from 'lucide-react';
import CourseEnrollmentModal from '../components/modals/CourseEnrollmentModal';
import { getCourseById } from '../data/coursesData';
import { apiFetch } from '../utils/apiClient';
import NotFoundPage from './NotFoundPage';
import '../assets/styles/Courses.css';

const COURSE_TONES = Object.freeze({
  'tu-hoc-toan-cao-cap': 'emerald',
  'lop-tu-hoc-sql': 'cobalt',
  'thuc-chien-k46-k50': 'terracotta',
  'thuc-chien-k51': 'plum'
});

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const useAccessibleDialog = (isOpen, dialogRef, initialFocusRef, onClose) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [dialogRef, initialFocusRef, isOpen, onClose]);
};

const getProgressKey = (courseId, lessonId) => (
  `course_playback_progress_${courseId}_${lessonId}`
);

const getSavedProgress = (courseId, lessonId) => {
  try {
    const value = Number(localStorage.getItem(getProgressKey(courseId, lessonId)));
    return Number.isFinite(value) && value > 5 ? value : 0;
  } catch {
    return 0;
  }
};

const saveProgress = (courseId, lessonId, time) => {
  if (!Number.isFinite(time) || time < 5) return;
  try {
    localStorage.setItem(getProgressKey(courseId, lessonId), String(Math.floor(time)));
  } catch {
    // Playback progress is optional and never grants course access.
  }
};

const getYouTubeEmbedUrl = (videoId) => (
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
);

export default function CourseDetail() {
  const { slug } = useParams();
  const course = getCourseById(slug);

  if (!course) return <NotFoundPage />;
  return <CourseDetailContent key={course.id} course={course} />;
}

function CourseDetailContent({ course }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(() => (
    Object.fromEntries(course.chapters.map((chapter) => [chapter.id, true]))
  ));
  const [activeLesson, setActiveLesson] = useState(null);
  const [loadingLessonId, setLoadingLessonId] = useState(null);
  const [notice, setNotice] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [lockReason, setLockReason] = useState('ENROLLMENT_REQUIRED');
  const [showEnrollment, setShowEnrollment] = useState(false);

  // Floating Study Timer States
  const [isDraggingTimer, setIsDraggingTimer] = useState(false);
  const [isTimerCollapsed, setIsTimerCollapsed] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPos, setCustomPos] = useState(null);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);

  const handleTimerPointerDown = (e) => {
    setIsDraggingTimer(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDraggingTimer) {
        const newX = Math.max(10, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
        const newY = Math.max(10, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));
        setCustomPos({ x: newX, y: newY });
      }
    };
    const handlePointerUp = () => setIsDraggingTimer(false);

    if (isDraggingTimer) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingTimer, dragOffset]);

  // Timer counter
  useEffect(() => {
    let interval;
    if (showPlayer && activeLesson) {
      interval = setInterval(() => setTotalStudySeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showPlayer, activeLesson]);

  const renderStudyTimerWidget = (isModalContext = false) => {
    if (!hasCourseAccess) return null;

    const progressPercent = Math.min(100, Math.round((totalStudySeconds / 1800) * 100)); // Demo calculation
    const styleProp = customPos 
      ? { left: `${customPos.x}px`, top: `${customPos.y}px`, right: 'auto', bottom: 'auto', position: 'fixed' }
      : {};

    const classNameProp = `floating-study-widget ${isModalContext ? 'under-video-anchor' : 'top-right-anchor'} ${isTimerCollapsed ? 'collapsed' : ''}`;

    return (
      <div className={classNameProp} style={{ touchAction: 'none', ...styleProp }} onPointerDown={handleTimerPointerDown}>
        <div className="timer-drag-handle" title="K├⌐o thß║ú ─æß╗â di chuyß╗ân vß╗ï tr├¡" style={{ cursor: 'grab', padding: '8px' }}>
          <Clock3 size={16} />
        </div>
        {!isTimerCollapsed ? (
          <>
            <div className="timer-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock3 size={16} />
              <span>─É├ú hß╗ìc: {Math.floor(totalStudySeconds / 60)} ph├║t {totalStudySeconds % 60}s</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span>Tiß║┐n ─æß╗Ö: {progressPercent}%</span>
              <div className="progress-widget-bar" style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div className="progress-widget-fill" style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>
            <button type="button" className="btn-timer-collapse" onClick={(e) => { e.stopPropagation(); setIsTimerCollapsed(true); }} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Thu gß╗ìn
            </button>
          </>
        ) : (
          <>
            <div className="timer-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{Math.floor(totalStudySeconds / 60)}m</span>
            </div>
            <button type="button" className="btn-timer-collapse" onClick={(e) => { e.stopPropagation(); setIsTimerCollapsed(false); }} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Mß╗ƒ
            </button>
          </>
        )}
      </div>
    );
  };

  const contentRequestRef = useRef(null);
  const playerDialogRef = useRef(null);
  const playerCloseRef = useRef(null);
  const lockDialogRef = useRef(null);
  const lockCloseRef = useRef(null);
  const videoRef = useRef(null);

  const allLessons = useMemo(
    () => course.chapters.flatMap((chapter) => chapter.lessons || []),
    [course.chapters]
  );
  const hasCourseAccess = isAdmin || isEnrolled;
  const courseTone = COURSE_TONES[course.id] || 'emerald';

  const closePlayer = useCallback(() => {
    if (videoRef.current && activeLesson) {
      saveProgress(course.id, activeLesson.id, videoRef.current.currentTime);
      videoRef.current.pause();
    }
    setShowPlayer(false);
    setActiveLesson(null);
  }, [activeLesson, course.id]);

  const closeLockPrompt = useCallback(() => {
    setShowLockPrompt(false);
  }, []);

  useAccessibleDialog(showPlayer, playerDialogRef, playerCloseRef, closePlayer);
  useAccessibleDialog(showLockPrompt, lockDialogRef, lockCloseRef, closeLockPrompt);

  const refreshCourseAccess = useCallback(async () => {
    setAccessLoading(true);
    try {
      const response = await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/access`);
      const payload = await response.json().catch(() => ({}));
      const access = response.ok ? payload.data : null;
      setIsAdmin(access?.reason === 'OWNER');
      setIsEnrolled(Boolean(access?.allowed));
      setAccessStatus(response.ok ? null : response.status);
    } catch {
      setIsAdmin(false);
      setIsEnrolled(false);
      setAccessStatus(null);
    } finally {
      setAccessLoading(false);
    }
  }, [course.id]);

  useEffect(() => {
    const initialCheck = window.setTimeout(refreshCourseAccess, 0);
    return () => window.clearTimeout(initialCheck);
  }, [refreshCourseAccess]);

  useEffect(() => {
    const handleSessionChanged = () => {
      contentRequestRef.current?.abort();
      contentRequestRef.current = null;
      setLoadingLessonId(null);
      setNotice('');
      closePlayer();
      setShowLockPrompt(false);
      setShowEnrollment(false);
      refreshCourseAccess();
    };

    window.addEventListener('ueh-tcc-session-changed', handleSessionChanged);
    return () => {
      contentRequestRef.current?.abort();
      window.removeEventListener('ueh-tcc-session-changed', handleSessionChanged);
    };
  }, [closePlayer, refreshCourseAccess]);

  const openLesson = async (lesson) => {
    contentRequestRef.current?.abort();
    contentRequestRef.current = null;
    setLoadingLessonId(null);
    setNotice('');

    if (lesson.isLocked && !accessLoading && !hasCourseAccess) {
      setLockReason(accessStatus === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED');
      setShowLockPrompt(true);
      return;
    }

    const request = new AbortController();
    contentRequestRef.current = request;
    setLoadingLessonId(lesson.id);

    try {
      const response = await apiFetch(
        `/api/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(lesson.id)}/content`,
        { signal: request.signal }
      );
      const payload = await response.json().catch(() => ({}));
      if (contentRequestRef.current !== request) return;

      if (response.status === 401 || response.status === 403) {
        setIsAdmin(false);
        setIsEnrolled(false);
        setAccessStatus(response.status);
        setLockReason(response.status === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED');
        setShowLockPrompt(true);
        return;
      }

      const content = payload.data;
      if (
        !response.ok
        || !content
        || content.courseId !== course.id
        || content.lessonId !== lesson.id
        || content.type !== lesson.type
        || (lesson.type === 'video' && !content.media)
      ) {
        throw new Error(payload.message || 'Nß╗Öi dung b├ái hß╗ìc ch╞░a sß║╡n s├áng.');
      }

      setActiveLesson({
        ...lesson,
        ...(content.media ? { media: content.media } : {}),
        ...(content.type === 'text' ? { content: content.content } : {})
      });
      setShowPlayer(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setNotice(error.message || 'Kh├┤ng thß╗â mß╗ƒ b├ái hß╗ìc l├║c n├áy. Vui l├▓ng thß╗¡ lß║íi.');
      }
    } finally {
      if (contentRequestRef.current === request) {
        contentRequestRef.current = null;
        setLoadingLessonId(null);
      }
    }
  };

  const openEnrollment = () => {
    setShowLockPrompt(false);
    setShowEnrollment(true);
  };

  const handleEnrollmentSuccess = (_courseId, entitlement) => {
    if (!entitlement?.allowed) return;
    setIsEnrolled(true);
    setAccessStatus(null);
    setShowLockPrompt(false);
    refreshCourseAccess();
  };

  const handleNativeLoaded = (event) => {
    if (!activeLesson) return;
    const savedTime = getSavedProgress(course.id, activeLesson.id);
    if (savedTime > 0 && savedTime < event.currentTarget.duration - 3) {
      event.currentTarget.currentTime = savedTime;
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
    const nextLesson = allLessons[currentIndex + 1];
    if (!nextLesson) return;
    closePlayer();
    openLesson(nextLesson);
  };

  const firstLesson = allLessons[0];
  const activeIndex = activeLesson
    ? allLessons.findIndex((lesson) => lesson.id === activeLesson.id)
    : -1;
  const hasNextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1;

  return (
    <div className={`course-detail-page cd-tone-${courseTone}`}>
      <header className="cd-hero">
        <div className="container cd-hero__inner">
          <Link to="/courses" className="cd-back-link">
            <ArrowLeft size={17} aria-hidden="true" />
            Tß║Ñt cß║ú kh├│a hß╗ìc
          </Link>

          <div className="cd-hero__grid">
            <div className="cd-hero__copy">
              <span className="cd-kicker">
                <GraduationCap size={16} aria-hidden="true" />
                {course.tag}
              </span>
              <h1>{course.title}</h1>
              <p>{course.desc}</p>

              <div className="cd-meta-grid" aria-label="Th├┤ng tin kh├│a hß╗ìc">
                <span><BookOpen size={18} /> {allLessons.length} b├ái hiß╗çn c├│</span>
                <span><FolderOpen size={18} /> {course.sectionsCount} phß║ºn</span>
                <span><Clock3 size={18} /> {course.duration}</span>
                <span><Users size={18} /> {course.studentsCount} hß╗ìc vi├¬n</span>
              </div>

              <div className="cd-hero__actions">
                {firstLesson && (
                  <button
                    type="button"
                    className="cd-button cd-button--primary"
                    onClick={() => openLesson(firstLesson)}
                    disabled={loadingLessonId === firstLesson.id}
                  >
                    {loadingLessonId === firstLesson.id
                      ? <Loader2 size={18} className="spinner" />
                      : <Play size={18} fill="currentColor" />}
                    Xem b├ái hß╗ìc ─æß║ºu ti├¬n
                  </button>
                )}
                <a href="#curriculum" className="cd-button cd-button--secondary">
                  Xem lß╗Ö tr├¼nh
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>

            <figure className="cd-hero__art">
              <div className="cd-art-orbit cd-art-orbit--one" aria-hidden="true" />
              <div className="cd-art-orbit cd-art-orbit--two" aria-hidden="true" />
              {course.artSvg && (
                <div 
                  className="cd-art-svg-container"
                  dangerouslySetInnerHTML={{ __html: course.artSvg }}
                />
              )}
              <div className="cd-art-card">
                <img src={course.image} alt={`ß║ónh b├¼a ${course.title}`} />
                <figcaption>
                  <span>{course.badge}</span>
                  <strong>{course.instructor}</strong>
                </figcaption>
              </div>
              <span className="cd-art-formula" aria-hidden="true">{course.artFormula || course.mathFormula || 'Γê½ ┬╖ Γêç ┬╖ det(A)'}</span>
            </figure>
          </div>
        </div>
      </header>

      <main className="cd-main">
        <div className="container cd-layout">
          <section id="curriculum" className="cd-curriculum" aria-labelledby="curriculum-title">
            <div className="cd-section-heading">
              <div>
                <span className="cd-eyebrow">Lß╗Ö tr├¼nh hß╗ìc</span>
                <h2 id="curriculum-title">Nß╗Öi dung kh├│a hß╗ìc</h2>
              </div>
              <p>Chß╗ìn b├ái xem thß╗¡ hoß║╖c ─æ─âng nhß║¡p ─æ├║ng t├ái khoß║ún ─æ├ú k├¡ch hoß║ít ─æß╗â mß╗ƒ nß╗Öi dung c├│ kh├│a.</p>
            </div>

            {notice && (
              <div className="cd-notice" role="status">
                {notice}
              </div>
            )}

            <div className="cd-chapters">
              {course.chapters.map((chapter, chapterIndex) => {
                const isOpen = expandedChapters[chapter.id] !== false;
                return (
                  <article className="cd-chapter" key={chapter.id}>
                    <button
                      type="button"
                      className="cd-chapter__trigger"
                      aria-expanded={isOpen}
                      aria-controls={`chapter-${chapter.id}`}
                      onClick={() => {
                        setExpandedChapters((current) => ({
                          ...current,
                          [chapter.id]: !isOpen
                        }));
                      }}
                    >
                      <span className="cd-chapter__number">
                        {String(chapterIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="cd-chapter__title">
                        <small>{chapter.sectionLabel}</small>
                        <strong>{chapter.title}</strong>
                      </span>
                      <span className="cd-chapter__count">
                        {(chapter.lessons || []).length} b├ái
                        <ChevronDown size={18} aria-hidden="true" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="cd-lessons" id={`chapter-${chapter.id}`}>
                        {(chapter.lessons || []).map((lesson, lessonIndex) => {
                          const lockedForUser = lesson.isLocked && !hasCourseAccess;
                          const isLoading = loadingLessonId === lesson.id;
                          return (
                            <button
                              type="button"
                              className="cd-lesson"
                              key={lesson.id}
                              onClick={() => openLesson(lesson)}
                              disabled={isLoading}
                            >
                              <span className="cd-lesson__index">
                                {String(lessonIndex + 1).padStart(2, '0')}
                              </span>
                              <span className="cd-lesson__icon">
                                {lesson.type === 'video'
                                  ? <Video size={18} aria-hidden="true" />
                                  : <FileText size={18} aria-hidden="true" />}
                              </span>
                              <span className="cd-lesson__copy">
                                <strong>{lesson.title}</strong>
                                <small>{lesson.subtitle} ┬╖ {lesson.duration}</small>
                              </span>
                              <span className={`cd-lesson__state ${lockedForUser ? 'is-locked' : ''}`}>
                                {isLoading ? (
                                  <><Loader2 size={15} className="spinner" /> ─Éang mß╗ƒ</>
                                ) : lockedForUser ? (
                                  <><LockKeyhole size={15} /> Cß║ºn quyß╗ün hß╗ìc</>
                                ) : lesson.isLocked ? (
                                  <><Play size={15} /> V├áo hß╗ìc</>
                                ) : (
                                  <><Eye size={15} /> Xem thß╗¡</>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="cd-enrollment" aria-label="─É─âng k├╜ kh├│a hß╗ìc">
            <div className="cd-enrollment__cover">
              <img src={course.image} alt="" />
              <span>{course.tag}</span>
            </div>

            <div className="cd-enrollment__body">
              {hasCourseAccess ? (
                <div className="cd-access-badge">
                  <CheckCircle2 size={18} />
                  {isAdmin ? 'Quyß╗ün chß╗º sß╗ƒ hß╗»u' : 'Kh├│a hß╗ìc ─æ├ú k├¡ch hoß║ít'}
                </div>
              ) : (
                <span className="cd-enrollment__eyebrow">Quyß╗ün hß╗ìc trß╗ìn kh├│a</span>
              )}

              <div className="cd-price">
                {course.isFree ? (
                  <strong>Miß╗àn ph├¡</strong>
                ) : (
                  <>
                    <span>{course.originalPrice}</span>
                    <strong>{course.discountPrice}</strong>
                  </>
                )}
              </div>

              <ul className="cd-benefits">
                {course.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight}>
                    <Check size={17} aria-hidden="true" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="cd-button cd-button--primary cd-button--full"
                disabled={accessLoading}
                onClick={() => {
                  if (hasCourseAccess && firstLesson) {
                    openLesson(firstLesson);
                  } else {
                    setShowEnrollment(true);
                  }
                }}
              >
                {accessLoading ? (
                  <><Loader2 size={18} className="spinner" /> ─Éang kiß╗âm tra quyß╗ün</>
                ) : hasCourseAccess ? (
                  <><Play size={18} fill="currentColor" /> V├áo hß╗ìc ngay</>
                ) : course.isFree ? (
                  <><BookOpen size={18} /> K├¡ch hoß║ít miß╗àn ph├¡</>
                ) : (
                  <><ShieldCheck size={18} /> ─É─âng k├╜ kh├│a hß╗ìc</>
                )}
              </button>

              <p className="cd-enrollment__trust">
                Quyß╗ün hß╗ìc ─æ╞░ß╗úc x├íc nhß║¡n tß╗½ m├íy chß╗º v├á gß║»n vß╗¢i t├ái khoß║ún cß╗ºa bß║ín.
              </p>

              <Link to="/resources" className="cd-resource-link">
                <Library size={17} />
                Kh├ím ph├í th╞░ viß╗çn hß╗ìc liß╗çu
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      {/* Floating Study Timer Widget */}
      {!showVideoModal && renderStudyTimerWidget(false)}

      {/* Redesigned Report Error Flag Modal */}
      {showReportModal && createPortal(
        <div className="report-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <div>
                <h3>
                  <Flag size={20} color="#ef4444" /> Báo lỗi bài giảng cho Admin
                </h3>
                <p>Giúp1 đội ngũ UEH TCC sửa chưa sự cố nhanh nhất có thể.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981', fontWeight: '700' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '1rem' }}>đã gửi báo cáo sự cố thành công cho Admin!</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="report-modal-form">
                <div className="report-field-group">
                  <label>Loại sự cố gặp phải:</label>
                  <select
                    className="report-select"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Video bị đứng/lag">Video bị đứng / giật lag</option>
                    <option value="Lỗi âm thanh">Mất tiếng / Âm thanh bị méo</option>
                    <option value="Sai công thức">Sai đáp án / Sai công thức bài học</option>
                    <option value="Khác">Sự cố khác</option>
                  </select>
                </div>

                <div className="report-field-group">
                  <label>Mô tả thêm (Tùy chọn):</label>
                  <textarea
                    className="report-textarea"
                    rows={3}
                    placeholder="Mô tả cụ thể vị trí phút giây bị lỗi..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                  />
                </div>

                <div className="report-modal-footer">
                  <button type="button" className="btn-report-cancel" onClick={() => setShowReportModal(false)}>Hủy</button>
                  <button type="submit" className="btn-report-submit" disabled={reportLoading}>
                    {reportLoading ? 'Đang gữi...' : 'Gửi báo cáo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}


      {showPlayer && activeLesson && createPortal(
        <div
          className={`cd-dialog-backdrop cd-tone-${courseTone}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePlayer();
          }}
        >
          <section
            className="cd-player-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-title"
            ref={playerDialogRef}
            tabIndex={-1}
          >
            <header className="cd-player-dialog__header">
              <div>
                <span>{activeLesson.type === 'video' ? 'Video b├ái hß╗ìc' : 'B├ái giß║úng text'}</span>
                <h2 id="player-title">{activeLesson.title}</h2>
              </div>
              <button
                type="button"
                className="cd-icon-button"
                onClick={closePlayer}
                ref={playerCloseRef}
                aria-label="─É├│ng b├ái hß╗ìc"
              >
                <X size={20} />
              </button>
            </header>

            <div className="cd-player-dialog__body">
              {/* Anti-Piracy & UX Overlays */}
              {isYouTube && (
                <div className="video-canvas-click-overlay" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }}>
                  {showPlayPauseAnim && (
                    <div className="play-pause-pulse-icon">
                      {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
                    </div>
                  )}
                </div>
              )}
              {showTabPauseToast && (
                <div className="tab-pause-toast">
                  ⏋️ Video tự động tạm dừng do bạn vừa chuyển tab (Facebook/c뻯a sổ khác)
                </div>
              )}
              {showWatermark && (
                <div className="dynamic-watermark-overlay">
                  🔥 {watermarkText}
                </div>
              )}
              {!adminAccount && (
                <div className="random-micro-watermark" style={microPosStyle}>
                  🔥 {watermarkText || getStudentIdentifier()}
                </div>
              )}
              {showResumePrompt && (
                <div className="smart-resume-card">
                  <div className="resume-content">
                    <p>Phát hiện bạn đã xem bài này đến phút <strong>{Math.floor(resumeTime / 60)}:{(resumeTime % 60).toString().padStart(2, '0')}</strong>.</p>
                    <span>Bạn có muốn xem tiếp từ vị trí đó không?</span>
                  </div>
                  <div className="resume-actions">
                    <button type="button" className="btn-resume-yes" onClick={handleResumeYes}>Có, xem tiếp</button>
                    <button type="button" className="btn-resume-no" onClick={handleResumeNo}>Không, xem từ đầu</button>
                  </div>
                </div>
              )}
              {showDetToolsWarning && (
                <div className="devtools-warning-overlay">
                  <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                  <h2>CẢNH BÁO BÁO MẬT</h2>
                  <p>Eệ thống phát hiện bạn đang mở Developer Tools (F12).</p>
                  <p>Hành vi tải trộm/sao chép video sẽ bị <strong>khóa tài khoản vĩnh viễn</strong> và hủy toàn bộ kết quả học tập.</p>
                  <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>Vui lòng đóng Developer Tools (F12) để tiếp tục xem bài giảng.</p>
                </div>
              )}

              {activeLesson.type === 'video' ? (
                activeLesson?.media?.provider === 'youtube' ? (
                  <div className="cd-video-frame">
                    <iframe
                      src={getYouTubeEmbedUrl(activeLesson.media.videoId)}
                      title={activeLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="cd-video-frame">
                    <video
                      ref={videoRef}
                      src={activeLesson.media?.url}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={handleNativeLoaded}
                      onTimeUpdate={(event) => {
                        saveProgress(course.id, activeLesson.id, event.currentTarget.currentTime);
                      }}
                    />
                  </div>
                )
              ) : (
                <article className="cd-text-lesson">
                  <FileText size={24} aria-hidden="true" />
                  <p>{activeLesson.content || 'Nß╗Öi dung b├ái hß╗ìc ─æang ─æ╞░ß╗úc cß║¡p nhß║¡t.'}</p>
                </article>
              )}
            </div>

            {renderStudyTimerWidget(true)}
            <footer className="cd-player-dialog__footer">
              <span>
                <ShieldCheck size={16} />
                Nß╗Öi dung ─æ╞░ß╗úc cß║Ñp sau khi m├íy chß╗º kiß╗âm tra quyß╗ün hß╗ìc.
              </span>
              {hasNextLesson && (
                <button type="button" className="cd-button cd-button--primary" onClick={handleNextLesson}>
                  B├ái tiß║┐p theo
                  <SkipForward size={17} />
                </button>
              )}
            </footer>
            {renderStudyTimerWidget(true)}
          </section>
        </div>,
        document.body
      )}

      {showLockPrompt && createPortal(
        <div
          className={`cd-dialog-backdrop cd-tone-${courseTone}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLockPrompt();
          }}
        >
          <section
            className="cd-lock-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lock-dialog-title"
            aria-describedby="lock-dialog-description"
            ref={lockDialogRef}
            tabIndex={-1}
          >
            <button
              type="button"
              className="cd-icon-button cd-lock-dialog__close"
              onClick={closeLockPrompt}
              ref={lockCloseRef}
              aria-label="─É├│ng th├┤ng b├ío"
            >
              <X size={20} />
            </button>
            <span className="cd-lock-dialog__icon">
              <LockKeyhole size={26} />
            </span>
            <h2 id="lock-dialog-title">
              {lockReason === 'AUTH_REQUIRED'
                ? '─É─âng nhß║¡p ─æß╗â tiß║┐p tß╗Ñc hß╗ìc'
                : 'K├¡ch hoß║ít kh├│a hß╗ìc ─æß╗â mß╗ƒ b├ái'}
            </h2>
            <p id="lock-dialog-description">
              {lockReason === 'AUTH_REQUIRED'
                ? 'Phi├¬n ─æ─âng nhß║¡p ch╞░a c├│ hoß║╖c ─æ├ú hß║┐t hß║ín. H├úy ─æ─âng nhß║¡p ─æ├║ng t├ái khoß║ún hß╗ìc vi├¬n rß╗ôi thß╗¡ lß║íi.'
                : course.isFree
                ? 'B├ái ─æß║ºu ti├¬n l├á nß╗Öi dung xem thß╗¡. H├úy k├¡ch hoß║ít kh├│a hß╗ìc miß╗àn ph├¡ ─æß╗â mß╗ƒ c├íc b├ái tiß║┐p theo.'
                : 'B├ái hß╗ìc n├áy chß╗ë mß╗ƒ cho t├ái khoß║ún ─æ├ú ─æ─âng k├╜ v├á ─æ╞░ß╗úc hß╗ç thß╗æng x├íc nhß║¡n quyß╗ün hß╗ìc.'}
            </p>
            <button type="button" className="cd-button cd-button--primary cd-button--full" onClick={openEnrollment}>
              {course.isFree ? 'K├¡ch hoß║ít miß╗àn ph├¡' : 'Xem th├┤ng tin ─æ─âng k├╜'}
              <ArrowRight size={17} />
            </button>
          </section>
        </div>,
        document.body
      )}
      {/* Floating Study Timer Widget */}
      {renderStudyTimerWidget(false)}

      <CourseEnrollmentModal
        isOpen={showEnrollment}
        onClose={() => setShowEnrollment(false)}
        course={course}
        onEnrollSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}
