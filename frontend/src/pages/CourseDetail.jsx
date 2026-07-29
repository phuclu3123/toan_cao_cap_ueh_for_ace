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
import { isAdminAccount, getStudentIdentifier } from '../utils/securityGuard';
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

  // Missing States
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Video bị đứng/lag');
  const [reportNote, setReportNote] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('');
  const [microPosStyle, setMicroPosStyle] = useState({ top: '10%', left: '10%' });
  const [resumeTime, setResumeTime] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showTabPauseToast, setShowTabPauseToast] = useState(false);
  const [showDetToolsWarning, setShowDetToolsWarning] = useState(false);
  const [showPlayPauseAnim, setShowPlayPauseAnim] = useState(false);

  const togglePlayPause = () => { setIsPlaying(!isPlaying); };
  const triggerScreenPulseAnim = () => {
    setShowPlayPauseAnim(true);
    setTimeout(() => setShowPlayPauseAnim(false), 500);
  };
  const adminAccount = isAdminAccount(course.id);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportNote('');
        setReportReason('Video bị đứng/lag');
      }, 2000);
    }, 1000);
  };

  const handleResumeYes = () => { setShowResumePrompt(false); };
  const handleResumeNo = () => { setShowResumePrompt(false); setResumeTime(0); };

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
        <div className="timer-drag-handle" title="Kâ”œâŒo thÃŸâ•‘Ãº â”€Ã¦ÃŸâ•—Ã¢ di chuyÃŸâ•—Ã¢n vÃŸâ•—Ã¯ trâ”œÂ¡" style={{ cursor: 'grab', padding: '8px' }}>
          <Clock3 size={16} />
        </div>
        {!isTimerCollapsed ? (
          <>
            <div className="timer-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock3 size={16} />
              <span>â”€Ã‰â”œÃº hÃŸâ•—Ã¬c: {Math.floor(totalStudySeconds / 60)} phâ”œâ•‘t {totalStudySeconds % 60}s</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span>TiÃŸâ•‘â”n â”€Ã¦ÃŸâ•—Ã–: {progressPercent}%</span>
              <div className="progress-widget-bar" style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div className="progress-widget-fill" style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>
            <button type="button" className="btn-timer-collapse" onClick={(e) => { e.stopPropagation(); setIsTimerCollapsed(true); }} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Thu gÃŸâ•—Ã¬n
            </button>
          </>
        ) : (
          <>
            <div className="timer-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{Math.floor(totalStudySeconds / 60)}m</span>
            </div>
            <button type="button" className="btn-timer-collapse" onClick={(e) => { e.stopPropagation(); setIsTimerCollapsed(false); }} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              MÃŸâ•—Æ’
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
        throw new Error(payload.message || 'NÃŸâ•—Ã–i dung bâ”œÃ¡i hÃŸâ•—Ã¬c châ•žâ–‘a sÃŸâ•‘â•¡n sâ”œÃ¡ng.');
      }

      setActiveLesson({
        ...lesson,
        ...(content.media ? { media: content.media } : {}),
        ...(content.type === 'text' ? { content: content.content } : {})
      });
      setShowPlayer(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setNotice(error.message || 'Khâ”œâ”¤ng thÃŸâ•—Ã¢ mÃŸâ•—Æ’ bâ”œÃ¡i hÃŸâ•—Ã¬c lâ”œâ•‘c nâ”œÃ¡y. Vui lâ”œâ–“ng thÃŸâ•—Â¡ lÃŸâ•‘Ã­i.');
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
            TÃŸâ•‘Ã‘t cÃŸâ•‘Ãº khâ”œâ”‚a hÃŸâ•—Ã¬c
          </Link>

          <div className="cd-hero__grid">
            <div className="cd-hero__copy">
              <span className="cd-kicker">
                <GraduationCap size={16} aria-hidden="true" />
                {course.tag}
              </span>
              <h1>{course.title}</h1>
              <p>{course.desc}</p>

              <div className="cd-meta-grid" aria-label="Thâ”œâ”¤ng tin khâ”œâ”‚a hÃŸâ•—Ã¬c">
                <span><BookOpen size={18} /> {allLessons.length} bâ”œÃ¡i hiÃŸâ•—Ã§n câ”œâ”‚</span>
                <span><FolderOpen size={18} /> {course.sectionsCount} phÃŸâ•‘Âºn</span>
                <span><Clock3 size={18} /> {course.duration}</span>
                <span><Users size={18} /> {course.studentsCount} hÃŸâ•—Ã¬c viâ”œÂ¬n</span>
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
                    Xem bâ”œÃ¡i hÃŸâ•—Ã¬c â”€Ã¦ÃŸâ•‘Âºu tiâ”œÂ¬n
                  </button>
                )}
                <a href="#curriculum" className="cd-button cd-button--secondary">
                  Xem lÃŸâ•—Ã– trâ”œÂ¼nh
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
                <img src={course.image} alt={`ÃŸâ•‘Ã³nh bâ”œÂ¼a ${course.title}`} />
                <figcaption>
                  <span>{course.badge}</span>
                  <strong>{course.instructor}</strong>
                </figcaption>
              </div>
              <span className="cd-art-formula" aria-hidden="true">{course.artFormula || course.mathFormula || 'Î“ÃªÂ½ â”¬â•– Î“ÃªÃ§ â”¬â•– det(A)'}</span>
            </figure>
          </div>
        </div>
      </header>

      <main className="cd-main">
        <div className="container cd-layout">
          <section id="curriculum" className="cd-curriculum" aria-labelledby="curriculum-title">
            <div className="cd-section-heading">
              <div>
                <span className="cd-eyebrow">LÃŸâ•—Ã– trâ”œÂ¼nh hÃŸâ•—Ã¬c</span>
                <h2 id="curriculum-title">NÃŸâ•—Ã–i dung khâ”œâ”‚a hÃŸâ•—Ã¬c</h2>
              </div>
              <p>ChÃŸâ•—Ã¬n bâ”œÃ¡i xem thÃŸâ•—Â¡ hoÃŸâ•‘â•–c â”€Ã¦â”€Ã¢ng nhÃŸâ•‘Â¡p â”€Ã¦â”œâ•‘ng tâ”œÃ¡i khoÃŸâ•‘Ãºn â”€Ã¦â”œÃº kâ”œÂ¡ch hoÃŸâ•‘Ã­t â”€Ã¦ÃŸâ•—Ã¢ mÃŸâ•—Æ’ nÃŸâ•—Ã–i dung câ”œâ”‚ khâ”œâ”‚a.</p>
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
                        {(chapter.lessons || []).length} bâ”œÃ¡i
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
                                <small>{lesson.subtitle} â”¬â•– {lesson.duration}</small>
                              </span>
                              <span className={`cd-lesson__state ${lockedForUser ? 'is-locked' : ''}`}>
                                {isLoading ? (
                                  <><Loader2 size={15} className="spinner" /> â”€Ã‰ang mÃŸâ•—Æ’</>
                                ) : lockedForUser ? (
                                  <><LockKeyhole size={15} /> CÃŸâ•‘Âºn quyÃŸâ•—Ã¼n hÃŸâ•—Ã¬c</>
                                ) : lesson.isLocked ? (
                                  <><Play size={15} /> Vâ”œÃ¡o hÃŸâ•—Ã¬c</>
                                ) : (
                                  <><Eye size={15} /> Xem thÃŸâ•—Â¡</>
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

          <aside className="cd-enrollment" aria-label="â”€Ã‰â”€Ã¢ng kâ”œâ•œ khâ”œâ”‚a hÃŸâ•—Ã¬c">
            <div className="cd-enrollment__cover">
              <img src={course.image} alt="" />
              <span>{course.tag}</span>
            </div>

            <div className="cd-enrollment__body">
              {hasCourseAccess ? (
                <div className="cd-access-badge">
                  <CheckCircle2 size={18} />
                  {isAdmin ? 'QuyÃŸâ•—Ã¼n chÃŸâ•—Âº sÃŸâ•—Æ’ hÃŸâ•—Â»u' : 'Khâ”œâ”‚a hÃŸâ•—Ã¬c â”€Ã¦â”œÃº kâ”œÂ¡ch hoÃŸâ•‘Ã­t'}
                </div>
              ) : (
                <span className="cd-enrollment__eyebrow">QuyÃŸâ•—Ã¼n hÃŸâ•—Ã¬c trÃŸâ•—Ã¬n khâ”œâ”‚a</span>
              )}

              <div className="cd-price">
                {course.isFree ? (
                  <strong>MiÃŸâ•—Ã n phâ”œÂ¡</strong>
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
                  <><Loader2 size={18} className="spinner" /> â”€Ã‰ang kiÃŸâ•—Ã¢m tra quyÃŸâ•—Ã¼n</>
                ) : hasCourseAccess ? (
                  <><Play size={18} fill="currentColor" /> Vâ”œÃ¡o hÃŸâ•—Ã¬c ngay</>
                ) : course.isFree ? (
                  <><BookOpen size={18} /> Kâ”œÂ¡ch hoÃŸâ•‘Ã­t miÃŸâ•—Ã n phâ”œÂ¡</>
                ) : (
                  <><ShieldCheck size={18} /> â”€Ã‰â”€Ã¢ng kâ”œâ•œ khâ”œâ”‚a hÃŸâ•—Ã¬c</>
                )}
              </button>

              <p className="cd-enrollment__trust">
                QuyÃŸâ•—Ã¼n hÃŸâ•—Ã¬c â”€Ã¦â•žâ–‘ÃŸâ•—Ãºc xâ”œÃ­c nhÃŸâ•‘Â¡n tÃŸâ•—Â½ mâ”œÃ­y chÃŸâ•—Âº vâ”œÃ¡ gÃŸâ•‘Â»n vÃŸâ•—Â¢i tâ”œÃ¡i khoÃŸâ•‘Ãºn cÃŸâ•—Âºa bÃŸâ•‘Ã­n.
              </p>

              <Link to="/resources" className="cd-resource-link">
                <Library size={17} />
                Khâ”œÃ­m phâ”œÃ­ thâ•žâ–‘ viÃŸâ•—Ã§n hÃŸâ•—Ã¬c liÃŸâ•—Ã§u
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
                  <Flag size={20} color="#ef4444" /> BÃ¡o lá»—i bÃ i giáº£ng cho Admin
                </h3>
                <p>GiÃºp1 Ä‘á»™i ngÅ© UEH TCC sá»­a chÆ°a sá»± cá»‘ nhanh nháº¥t cÃ³ thá»ƒ.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981', fontWeight: '700' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '1rem' }}>Ä‘Ã£ gá»­i bÃ¡o cÃ¡o sá»± cá»‘ thÃ nh cÃ´ng cho Admin!</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="report-modal-form">
                <div className="report-field-group">
                  <label>Loáº¡i sá»± cá»‘ gáº·p pháº£i:</label>
                  <select
                    className="report-select"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Video bá»‹ Ä‘á»©ng/lag">Video bá»‹ Ä‘á»©ng / giáº­t lag</option>
                    <option value="Lá»—i Ã¢m thanh">Máº¥t tiáº¿ng / Ã‚m thanh bá»‹ mÃ©o</option>
                    <option value="Sai cÃ´ng thá»©c">Sai Ä‘Ã¡p Ã¡n / Sai cÃ´ng thá»©c bÃ i há»c</option>
                    <option value="KhÃ¡c">Sá»± cá»‘ khÃ¡c</option>
                  </select>
                </div>

                <div className="report-field-group">
                  <label>MÃ´ táº£ thÃªm (TÃ¹y chá»n):</label>
                  <textarea
                    className="report-textarea"
                    rows={3}
                    placeholder="MÃ´ táº£ cá»¥ thá»ƒ vá»‹ trÃ­ phÃºt giÃ¢y bá»‹ lá»—i..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                  />
                </div>

                <div className="report-modal-footer">
                  <button type="button" className="btn-report-cancel" onClick={() => setShowReportModal(false)}>Há»§y</button>
                  <button type="submit" className="btn-report-submit" disabled={reportLoading}>
                    {reportLoading ? 'Äang gá»¯i...' : 'Gá»­i bÃ¡o cÃ¡o'}
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
                <span>{activeLesson.type === 'video' ? 'Video bâ”œÃ¡i hÃŸâ•—Ã¬c' : 'Bâ”œÃ¡i giÃŸâ•‘Ãºng text'}</span>
                <h2 id="player-title">{activeLesson.title}</h2>
              </div>
              <button
                type="button"
                className="cd-icon-button"
                onClick={closePlayer}
                ref={playerCloseRef}
                aria-label="â”€Ã‰â”œâ”‚ng bâ”œÃ¡i hÃŸâ•—Ã¬c"
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
                  â‹ï¸ Video tá»± Ä‘á»™ng táº¡m dá»«ng do báº¡n vá»«a chuyá»ƒn tab (Facebook/cë»¯a sá»• khÃ¡c)
                </div>
              )}
              {showWatermark && (
                <div className="dynamic-watermark-overlay">
                  ðŸ”¥ {watermarkText}
                </div>
              )}
              {!adminAccount && (
                <div className="random-micro-watermark" style={microPosStyle}>
                  ðŸ”¥ {watermarkText || getStudentIdentifier()}
                </div>
              )}
              {showResumePrompt && (
                <div className="smart-resume-card">
                  <div className="resume-content">
                    <p>PhÃ¡t hiá»‡n báº¡n Ä‘Ã£ xem bÃ i nÃ y Ä‘áº¿n phÃºt <strong>{Math.floor(resumeTime / 60)}:{(resumeTime % 60).toString().padStart(2, '0')}</strong>.</p>
                    <span>Báº¡n cÃ³ muá»‘n xem tiáº¿p tá»« vá»‹ trÃ­ Ä‘Ã³ khÃ´ng?</span>
                  </div>
                  <div className="resume-actions">
                    <button type="button" className="btn-resume-yes" onClick={handleResumeYes}>CÃ³, xem tiáº¿p</button>
                    <button type="button" className="btn-resume-no" onClick={handleResumeNo}>KhÃ´ng, xem tá»« Ä‘áº§u</button>
                  </div>
                </div>
              )}
              {showDetToolsWarning && (
                <div className="devtools-warning-overlay">
                  <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                  <h2>Cáº¢NH BÃO BÃO Máº¬T</h2>
                  <p>Eá»‡ thá»‘ng phÃ¡t hiá»‡n báº¡n Ä‘ang má»Ÿ Developer Tools (F12).</p>
                  <p>HÃ nh vi táº£i trá»™m/sao chÃ©p video sáº½ bá»‹ <strong>khÃ³a tÃ i khoáº£n vÄ©nh viá»…n</strong> vÃ  há»§y toÃ n bá»™ káº¿t quáº£ há»c táº­p.</p>
                  <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>Vui lÃ²ng Ä‘Ã³ng Developer Tools (F12) Ä‘á»ƒ tiáº¿p tá»¥c xem bÃ i giáº£ng.</p>
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
                  <p>{activeLesson.content || 'NÃŸâ•—Ã–i dung bâ”œÃ¡i hÃŸâ•—Ã¬c â”€Ã¦ang â”€Ã¦â•žâ–‘ÃŸâ•—Ãºc cÃŸâ•‘Â¡p nhÃŸâ•‘Â¡t.'}</p>
                </article>
              )}
            </div>

            {renderStudyTimerWidget(true)}
            <footer className="cd-player-dialog__footer">
              <span>
                <ShieldCheck size={16} />
                NÃŸâ•—Ã–i dung â”€Ã¦â•žâ–‘ÃŸâ•—Ãºc cÃŸâ•‘Ã‘p sau khi mâ”œÃ­y chÃŸâ•—Âº kiÃŸâ•—Ã¢m tra quyÃŸâ•—Ã¼n hÃŸâ•—Ã¬c.
              </span>
              {hasNextLesson && (
                <button type="button" className="cd-button cd-button--primary" onClick={handleNextLesson}>
                  Bâ”œÃ¡i tiÃŸâ•‘â”p theo
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
              aria-label="â”€Ã‰â”œâ”‚ng thâ”œâ”¤ng bâ”œÃ­o"
            >
              <X size={20} />
            </button>
            <span className="cd-lock-dialog__icon">
              <LockKeyhole size={26} />
            </span>
            <h2 id="lock-dialog-title">
              {lockReason === 'AUTH_REQUIRED'
                ? 'â”€Ã‰â”€Ã¢ng nhÃŸâ•‘Â¡p â”€Ã¦ÃŸâ•—Ã¢ tiÃŸâ•‘â”p tÃŸâ•—Ã‘c hÃŸâ•—Ã¬c'
                : 'Kâ”œÂ¡ch hoÃŸâ•‘Ã­t khâ”œâ”‚a hÃŸâ•—Ã¬c â”€Ã¦ÃŸâ•—Ã¢ mÃŸâ•—Æ’ bâ”œÃ¡i'}
            </h2>
            <p id="lock-dialog-description">
              {lockReason === 'AUTH_REQUIRED'
                ? 'Phiâ”œÂ¬n â”€Ã¦â”€Ã¢ng nhÃŸâ•‘Â¡p châ•žâ–‘a câ”œâ”‚ hoÃŸâ•‘â•–c â”€Ã¦â”œÃº hÃŸâ•‘â”t hÃŸâ•‘Ã­n. Hâ”œÃºy â”€Ã¦â”€Ã¢ng nhÃŸâ•‘Â¡p â”€Ã¦â”œâ•‘ng tâ”œÃ¡i khoÃŸâ•‘Ãºn hÃŸâ•—Ã¬c viâ”œÂ¬n rÃŸâ•—Ã´i thÃŸâ•—Â¡ lÃŸâ•‘Ã­i.'
                : course.isFree
                ? 'Bâ”œÃ¡i â”€Ã¦ÃŸâ•‘Âºu tiâ”œÂ¬n lâ”œÃ¡ nÃŸâ•—Ã–i dung xem thÃŸâ•—Â¡. Hâ”œÃºy kâ”œÂ¡ch hoÃŸâ•‘Ã­t khâ”œâ”‚a hÃŸâ•—Ã¬c miÃŸâ•—Ã n phâ”œÂ¡ â”€Ã¦ÃŸâ•—Ã¢ mÃŸâ•—Æ’ câ”œÃ­c bâ”œÃ¡i tiÃŸâ•‘â”p theo.'
                : 'Bâ”œÃ¡i hÃŸâ•—Ã¬c nâ”œÃ¡y chÃŸâ•—Ã« mÃŸâ•—Æ’ cho tâ”œÃ¡i khoÃŸâ•‘Ãºn â”€Ã¦â”œÃº â”€Ã¦â”€Ã¢ng kâ”œâ•œ vâ”œÃ¡ â”€Ã¦â•žâ–‘ÃŸâ•—Ãºc hÃŸâ•—Ã§ thÃŸâ•—Ã¦ng xâ”œÃ­c nhÃŸâ•‘Â¡n quyÃŸâ•—Ã¼n hÃŸâ•—Ã¬c.'}
            </p>
            <button type="button" className="cd-button cd-button--primary cd-button--full" onClick={openEnrollment}>
              {course.isFree ? 'Kâ”œÂ¡ch hoÃŸâ•‘Ã­t miÃŸâ•—Ã n phâ”œÂ¡' : 'Xem thâ”œâ”¤ng tin â”€Ã¦â”€Ã¢ng kâ”œâ•œ'}
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
