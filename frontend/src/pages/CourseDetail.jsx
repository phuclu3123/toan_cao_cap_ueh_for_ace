import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock3, Eye, FileText, FolderOpen, GraduationCap, Library, Loader2, LockKeyhole, Play, RefreshCw, ShieldCheck, Users, Video
} from 'lucide-react';
import CourseUnlockModal from '../components/modals/CourseUnlockModal';
import useCourseCatalog from '../hooks/useCourseCatalog';
import { useAuth } from '../contexts/AuthContext';
import { COURSE_ACCESS_EVENT } from '../services/courseAccessService';
import CourseStudyDock from '../components/CourseStudyDock';
import CourseContinueWatching from '../components/CourseContinueWatching';
import { useGlobalPlayer } from '../contexts/GlobalPlayerContext';
import { apiFetch, readApiJson } from '../utils/apiClient';
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
  const { courses } = useCourseCatalog();
  const course = courses.find(row => row.id === slug);

  if (!course) return <NotFoundPage />;
  return <CourseDetailContent key={course.id} course={course} />;
}

function CourseDetailContent({ course }) {
  const { playLesson } = useGlobalPlayer();
  const { currentUser, loading: authLoading, syncUserFromBackend } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [expandedChapters, setExpandedChapters] = useState(() => (
    Object.fromEntries(course.chapters.map((chapter) => [chapter.id, true]))
  ));
  const [loadingLessonId, setLoadingLessonId] = useState(null);
  const [notice, setNotice] = useState('');
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState('payment');

  const accessRequestIdRef = useRef(0);
  const accessIdentityRef = useRef(null);
  const lessonRequestIdRef = useRef(0);

  const allLessons = useMemo(
    () => course.chapters.flatMap((chapter) => chapter.lessons || []),
    [course.chapters]
  );
  const firstLesson = allLessons[0];
  const hasCourseAccess = isAdmin || isEnrolled;
  const courseTone = COURSE_TONES[course.id] || 'emerald';
  const userId = currentUser?.id || '';

  const refreshCourseAccess = useCallback(async () => {
    const requestId = ++accessRequestIdRef.current;
    const identity = userId || null;
    if (identity !== accessIdentityRef.current) {
      accessIdentityRef.current = identity;
      setIsAdmin(false);
      setIsEnrolled(false);
    }
    if (authLoading || !userId) {
      setIsAdmin(false);
      setIsEnrolled(false);
      setAccessError('');
      setAccessLoading(authLoading);
      return;
    }
    setAccessLoading(true);
    try {
      const response = await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/access`, { signal: AbortSignal.timeout(12_000) });
      if (response.status === 401) { await syncUserFromBackend(); throw new Error('COURSE_ACCESS_UNAVAILABLE'); }
      const payload = response.ok ? await readApiJson(response) : null;
      if (!response.ok && response.status !== 401 && response.status !== 403) throw new Error('COURSE_ACCESS_UNAVAILABLE');
      const access = response.ok ? payload.data : null;
      if (response.ok && typeof access?.allowed !== 'boolean') throw new Error('COURSE_ACCESS_UNAVAILABLE');
      if (requestId === accessRequestIdRef.current) {
        setAccessError('');
        setIsAdmin(access?.reason === 'OWNER');
        setIsEnrolled(Boolean(access?.allowed));
      }
    } catch {
      // Keep the last confirmed UI state during a temporary outage so newly
      // issued keys are not discarded. Every content/admin request still checks
      // the server; identity changes above always clear the previous rights.
      if (requestId === accessRequestIdRef.current) setAccessError('Chưa kết nối được hệ thống quyền học. Bạn vẫn có thể xem thử; đăng ký và kích hoạt sẽ tiếp tục khi kết nối ổn định.');
    } finally {
      if (requestId === accessRequestIdRef.current) setAccessLoading(false);
    }
  }, [course.id, userId, authLoading, syncUserFromBackend]);

  useEffect(() => {
    const initialCheck = window.setTimeout(refreshCourseAccess, 0);
    return () => window.clearTimeout(initialCheck);
  }, [refreshCourseAccess]);

  useEffect(() => {
    const handleChanged = (event) => { if (!event.detail?.courseId || event.detail.courseId === course.id) refreshCourseAccess(); };
    const handleFocus = () => refreshCourseAccess();
    window.addEventListener(COURSE_ACCESS_EVENT, handleChanged);
    window.addEventListener('focus', handleFocus);
    return () => { window.removeEventListener(COURSE_ACCESS_EVENT, handleChanged); window.removeEventListener('focus', handleFocus); };
  }, [course.id, refreshCourseAccess]);

  useEffect(() => {
    const handleSessionChanged = () => {
      lessonRequestIdRef.current += 1;
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
    if (course.isClosed && !hasCourseAccess) return;
    const requestId = ++lessonRequestIdRef.current;
    setLoadingLessonId(lesson.id);
    setNotice('');
    try {
      const result = await playLesson(course, lesson, allLessons, courseTone, { accessAllowed: hasCourseAccess });
      if (requestId === lessonRequestIdRef.current && result?.message) setNotice(result.message);
      if (result?.opened && lesson.isLocked) refreshCourseAccess();
    } finally { if (requestId === lessonRequestIdRef.current) setLoadingLessonId(null); }
  };

  const handleEnrollmentSuccess = (_courseId, entitlement) => {
    if (!entitlement?.allowed) return;
    setIsEnrolled(true);
    refreshCourseAccess();
  };

  return (
    <div className={`course-detail-page cd-tone-${courseTone}`}>
      <CourseStudyDock courseId={course.id} tone={courseTone} />
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
                <span><BookOpen size={18} /> {Number.isInteger(course.lessonsCount) ? `${course.lessonsCount} bài hiện có` : 'Nội dung đang chuẩn bị'}</span>
                {Number.isInteger(course.sectionsCount) && <span><FolderOpen size={18} /> {course.sectionsCount} phần</span>}
                <span><Clock3 size={18} /> {course.duration}</span>
                {Number.isInteger(course.studentsCount) && <span><Users size={18} /> {course.studentsCount} học viên</span>}
              </div>

              <div className="cd-hero__actions">
                {firstLesson && (
                  <button
                    type="button"
                    className="cd-button cd-button--primary"
                    onClick={() => openLesson(firstLesson)}
                    disabled={(course.isClosed && !hasCourseAccess) || loadingLessonId === firstLesson.id}
                  >
                    {loadingLessonId === firstLesson.id
                      ? <Loader2 size={18} className="spinner" />
                      : <Play size={18} fill="currentColor" />}
                    {course.isClosed && !hasCourseAccess ? 'Khóa học tạm đóng' : 'Xem bài học đầu tiên'}
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
              <p>{course.isClosed && !hasCourseAccess ? 'Khóa học đang tạm đóng. Bạn có thể xem trước lộ trình bên dưới.' : course.previewMode ? 'Chọn bài giảng để bắt đầu. Bạn có thể quay lại và tiếp tục đúng đoạn đang xem.' : 'Chọn bài xem thử hoặc đăng nhập đúng tài khoản đã kích hoạt để mở nội dung có khóa.'}</p>
            </div>

            {notice && (
              <div className="cd-notice" role="status">
                {notice}
              </div>
            )}
            {accessError && <div className="cd-notice" role="alert"><span>{accessError}</span><button type="button" className="course-unlock-entry" disabled={accessLoading} onClick={refreshCourseAccess}><RefreshCw size={16} className={accessLoading ? 'spinner' : ''} />{accessLoading ? 'Đang kết nối…' : 'Thử lại kết nối'}</button></div>}

            <CourseContinueWatching course={course} onContinue={openLesson} />
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
                              disabled={(course.isClosed && !hasCourseAccess) || isLoading}
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
                                {course.isClosed && !hasCourseAccess ? (
                                  <><LockKeyhole size={15} /> Tạm đóng</>
                                ) : isLoading ? (
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
              {course.isClosed && !hasCourseAccess ? (
                <span className="cd-enrollment__eyebrow">Khóa học tạm đóng</span>
              ) : hasCourseAccess ? (
                <div className="cd-access-badge">
                  <CheckCircle2 size={18} />
                  {isAdmin ? 'Quyền chủ sở hữu' : 'Khóa học đã kích hoạt'}
                </div>
              ) : (
                <span className="cd-enrollment__eyebrow">Quyền học trọn khóa</span>
              )}

              <div className="cd-price">
                {course.isClosed ? (
                  <strong>{course.discountPrice}</strong>
                ) : course.isFree ? (
                  <strong>Miễn phí</strong>
                ) : (
                  <>
                    {course.originalPrice !== course.discountPrice && <span>{course.originalPrice}</span>}
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
                disabled={(course.isClosed && !hasCourseAccess) || accessLoading}
                onClick={() => {
                  if (course.isClosed && !hasCourseAccess) return;
                  if (hasCourseAccess && firstLesson) {
                    openLesson(firstLesson);
                  } else {
                    setUnlockMethod('payment');
                    setShowEnrollment(true);
                  }
                }}
              >
                {course.isClosed && !hasCourseAccess ? (
                  <><LockKeyhole size={18} /> Tạm đóng đăng ký</>
                ) : accessLoading ? (
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
                {hasCourseAccess ? 'Quyền học đã được máy chủ xác nhận cho tài khoản này.' : course.isClosed ? 'Tạm đóng thanh toán. Key đã được cấp vẫn có thể kích hoạt.' : 'Mở khóa bằng thanh toán PayOS hoặc key do admin cấp.'}
              </p>
              {!hasCourseAccess && <button type="button" className="course-unlock-entry" onClick={() => { setUnlockMethod('key'); setShowEnrollment(true); }}><LockKeyhole size={16} /> Tôi có mã kích hoạt</button>}
              {isAdmin && <Link to={`/admin/courses?course=${course.id}`} className="course-unlock-entry"><ShieldCheck size={16} /> Quản trị khóa học</Link>}

              <Link to="/resources" className="cd-resource-link">
                <Library size={17} />
                Khám phá thư viện học liệu
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </main>









      <CourseUnlockModal
        isOpen={showEnrollment}
        initialMethod={unlockMethod}
        onClose={() => setShowEnrollment(false)}
        course={course}
        onUnlocked={(_courseId, access) => { handleEnrollmentSuccess(_courseId, access); setShowEnrollment(false); }}
      />
    </div>
  );
}
