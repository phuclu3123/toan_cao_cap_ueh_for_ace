import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock, Clock3, Eye, FileText, FolderOpen, GripVertical, GraduationCap, Library, Loader2, LockKeyhole, Maximize2, Minimize2, Play, ShieldCheck, Users, Video
} from 'lucide-react';
import CourseEnrollmentModal from '../components/modals/CourseEnrollmentModal';
import { useGlobalPlayer } from '../contexts/GlobalPlayerContext';
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

export default function CourseDetail() {
  const { slug } = useParams();
  const course = getCourseById(slug);

  if (!course) return <NotFoundPage />;
  return <CourseDetailContent key={course.id} course={course} />;
}

function CourseDetailContent({ course }) {
  const { playLesson, setAccessDeniedStatus } = useGlobalPlayer();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(() => (
    Object.fromEntries(course.chapters.map((chapter) => [chapter.id, true]))
  ));
  const [loadingLessonId, setLoadingLessonId] = useState(null);
  const [notice, setNotice] = useState('');
  const [showEnrollment, setShowEnrollment] = useState(false);

  // Floating Study Timer States
  const [isTimerCollapsed, setIsTimerCollapsed] = useState(false);
  const [customPos, setCustomPos] = useState(null);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const timerRef = useRef(null);
  const dragState = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  const allLessons = useMemo(
    () => course.chapters.flatMap((chapter) => chapter.lessons || []),
    [course.chapters]
  );
  const firstLesson = allLessons[0];
  const hasCourseAccess = isAdmin || isEnrolled;
  const courseTone = COURSE_TONES[course.id] || 'emerald';

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
      setLoadingLessonId(null);
      setNotice('');
      setShowEnrollment(false);
      refreshCourseAccess();
    };

    window.addEventListener('ueh-tcc-session-changed', handleSessionChanged);
    return () => {
      window.removeEventListener('ueh-tcc-session-changed', handleSessionChanged);
    };
  }, [refreshCourseAccess]);

  const openLesson = async (lesson) => {
    setLoadingLessonId(null);
    setNotice('');

    if (lesson.isLocked && !accessLoading && !hasCourseAccess) {
      setAccessDeniedStatus({
        isDenied: true,
        reason: accessStatus === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED'
      });
      return;
    }

    setLoadingLessonId(lesson.id);

    // BYPASS: If lesson already has a videoUrl (like YouTube), play it directly
    if (lesson.type === 'video' && lesson.videoUrl) {
      const ytMatch = lesson.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      let media = ytMatch ? { provider: 'youtube', videoId: ytMatch[1] } : { url: lesson.videoUrl };
      playLesson(course, { ...lesson, media }, allLessons, courseTone);
      setLoadingLessonId(null);
      return;
    }

    try {
      const response = await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(lesson.id)}/content`);
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setIsAdmin(false);
        setIsEnrolled(false);
        setAccessStatus(response.status);
        setAccessDeniedStatus({
          isDenied: true,
          reason: response.status === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED'
        });
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
        throw new Error(payload.message || 'Nội dung bài học chưa sẵn sàng.');
      }

      playLesson(course, {
        ...lesson,
        ...(content.media ? { media: content.media } : {}),
        ...(content.type === 'text' ? { content: content.content } : {})
      }, allLessons, courseTone);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setNotice(error.message || 'Không thể mở bài học lúc này. Vui lòng thử lại.');
      }
    } finally {
      setLoadingLessonId(null);
    }
  };


  const handleEnrollmentSuccess = (_courseId, entitlement) => {
    if (!entitlement?.allowed) return;
    setIsEnrolled(true);
    setAccessStatus(null);
    refreshCourseAccess();
  };

  const handleTimerPointerDown = (e) => {
    if (e.target.closest('.btn-timer-collapse')) return;

    if (window.getComputedStyle(timerRef.current).position !== 'fixed') {
        const rect = timerRef.current.getBoundingClientRect();
        timerRef.current.style.position = 'fixed';
        timerRef.current.style.left = `${rect.left}px`;
        timerRef.current.style.top = `${rect.top}px`;
        timerRef.current.style.zIndex = 99999;
    }

    const currentLeft = parseInt(timerRef.current.style.left) || 10;
    const currentTop = parseInt(timerRef.current.style.top) || 10;

    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: currentLeft,
      initialTop: currentTop
    };

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      if (!dragState.current.isDragging) return;

      const dx = moveEvent.clientX - dragState.current.startX;
      const dy = moveEvent.clientY - dragState.current.startY;

      let newX = dragState.current.initialLeft + dx;
      let newY = dragState.current.initialTop + dy;

      newX = Math.max(10, Math.min(window.innerWidth - timerRef.current.offsetWidth - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - timerRef.current.offsetHeight - 10, newY));

      timerRef.current.style.left = `${newX}px`;
      timerRef.current.style.top = `${newY}px`;
    };

    const handlePointerUp = () => {
      dragState.current.isDragging = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const finalX = parseInt(timerRef.current.style.left);
      const finalY = parseInt(timerRef.current.style.top);
      if (!isNaN(finalX) && !isNaN(finalY)) {
         setCustomPos({ x: finalX, y: finalY });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalStudySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderStudyTimerWidget = (isModalContext = false) => {
    const styleProp = customPos
      ? { position: 'fixed', left: `${customPos.x}px`, top: `${customPos.y}px`, zIndex: 99999, transform: 'none' }
      : { zIndex: 99999 };

    const classNameProp = `floating-study-widget ${!customPos ? (isModalContext ? 'under-video-anchor' : 'top-right-anchor') : ''} ${isTimerCollapsed ? 'collapsed' : ''}`;
    const progressPercent = allLessons.length > 0 ? Math.round((0 / allLessons.length) * 100) : 0;

    return (
      <div
        ref={timerRef}
        className={classNameProp}
        style={{ touchAction: 'none', ...styleProp }}
        onPointerDown={handleTimerPointerDown}
      >
        <div className="timer-drag-handle" title="Kéo thả để di chuyển vị trí">
          <GripVertical size={16} />
        </div>

        {!isTimerCollapsed ? (
          <>
            <div className="timer-badge-active">
              <Clock size={16} />
              <span>Đã học: {Math.floor(totalStudySeconds / 60)} phút {totalStudySeconds % 60}s</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Tiến độ: {progressPercent}%</span>
              <div className="progress-widget-bar">
                <div className="progress-widget-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <button type="button" className="btn-timer-collapse" onClick={(e) => { e.stopPropagation(); setIsTimerCollapsed(true); }}>
              <Minimize2 size={12} />
            </button>
          </>
        ) : (
          <>
            <div className="timer-badge-active">
              <Clock size={15} />
              <span>{Math.floor(totalStudySeconds / 60)}m {totalStudySeconds % 60}s ({progressPercent}%)</span>
            </div>
            <button type="button" className="btn-timer-collapse" onClick={(e) => { e.stopPropagation(); setIsTimerCollapsed(false); }}>
              <Maximize2 size={12} />
            </button>
          </>
        )}
      </div>
    );
  };




  return (
    <div className={`course-detail-page cd-tone-${courseTone}`}>
      {createPortal(renderStudyTimerWidget(false), document.body)}
      <header className="cd-hero">
        <div className="container cd-hero__inner">
          <Link to="/courses" className="cd-back-link">
            <ArrowLeft size={17} aria-hidden="true" />
            Tất cả khóa học
          </Link>

          <div className="cd-hero__grid">
            <div className="cd-hero__copy">
              <span className="cd-kicker">
                <GraduationCap size={16} aria-hidden="true" />
                {course.tag}
              </span>
              <h1>{course.title}</h1>
              <p>{course.desc}</p>

              <div className="cd-meta-grid" aria-label="Thông tin khóa học">
                <span><BookOpen size={18} /> {allLessons.length} bài hiện có</span>
                <span><FolderOpen size={18} /> {course.sectionsCount} phần</span>
                <span><Clock3 size={18} /> {course.duration}</span>
                <span><Users size={18} /> {course.studentsCount} học viên</span>
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
                    Xem bài học đầu tiên
                  </button>
                )}
                <a href="#curriculum" className="cd-button cd-button--secondary">
                  Xem lộ trình
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>

            <figure className="cd-hero__art">
              <div className="cd-art-orbit cd-art-orbit--one" aria-hidden="true" />
              <div className="cd-art-orbit cd-art-orbit--two" aria-hidden="true" />
              <div className="cd-art-card">
                <img src={course.image} alt={`Ảnh bìa ${course.title}`} />
                <figcaption>
                  <span>{course.badge}</span>
                  <strong>{course.instructor}</strong>
                </figcaption>
              </div>
              <span className="cd-art-formula" aria-hidden="true">{course.artFormula || '∫ · ∇ · det(A)'}</span>
            </figure>
          </div>
        </div>
      </header>

      <main className="cd-main">
        <div className="container cd-layout">
          <section id="curriculum" className="cd-curriculum" aria-labelledby="curriculum-title">
            <div className="cd-section-heading">
              <div>
                <span className="cd-eyebrow">Lộ trình học</span>
                <h2 id="curriculum-title">Nội dung khóa học</h2>
              </div>
              <p>Chọn bài xem thử hoặc đăng nhập đúng tài khoản đã kích hoạt để mở nội dung có khóa.</p>
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
                        {(chapter.lessons || []).length} bài
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
                                <small>{lesson.subtitle} · {lesson.duration}</small>
                              </span>
                              <span className={`cd-lesson__state ${lockedForUser ? 'is-locked' : ''}`}>
                                {isLoading ? (
                                  <><Loader2 size={15} className="spinner" /> Đang mở</>
                                ) : lockedForUser ? (
                                  <><LockKeyhole size={15} /> Cần quyền học</>
                                ) : lesson.isLocked ? (
                                  <><Play size={15} /> Vào học</>
                                ) : (
                                  <><Eye size={15} /> Xem thử</>
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

          <aside className="cd-enrollment" aria-label="Đăng ký khóa học">
            <div className="cd-enrollment__cover">
              <img src={course.image} alt="" />
              <span>{course.tag}</span>
            </div>

            <div className="cd-enrollment__body">
              {hasCourseAccess ? (
                <div className="cd-access-badge">
                  <CheckCircle2 size={18} />
                  {isAdmin ? 'Quyền chủ sở hữu' : 'Khóa học đã kích hoạt'}
                </div>
              ) : (
                <span className="cd-enrollment__eyebrow">Quyền học trọn khóa</span>
              )}

              <div className="cd-price">
                {course.isFree ? (
                  <strong>Miễn phí</strong>
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
                  <><Loader2 size={18} className="spinner" /> Đang kiểm tra quyền</>
                ) : hasCourseAccess ? (
                  <><Play size={18} fill="currentColor" /> Vào học ngay</>
                ) : course.isFree ? (
                  <><BookOpen size={18} /> Kích hoạt miễn phí</>
                ) : (
                  <><ShieldCheck size={18} /> Đăng ký khóa học</>
                )}
              </button>

              <p className="cd-enrollment__trust">
                Quyền học được xác nhận từ máy chủ và gắn với tài khoản của bạn.
              </p>

              <Link to="/resources" className="cd-resource-link">
                <Library size={17} />
                Khám phá thư viện học liệu
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </main>









\n      <CourseEnrollmentModal
        isOpen={showEnrollment}
        onClose={() => setShowEnrollment(false)}
        course={course}
        onEnrollSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}
