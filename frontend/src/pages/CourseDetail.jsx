import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  FileText,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Video,
  X
} from 'lucide-react';
import { getCourseById } from '../data/coursesData';
import { LanguageContext } from '../App';
import NotFoundPage from './NotFoundPage';
import '../assets/styles/Home.css';
import '../assets/styles/Courses.css';

export default function CourseDetail() {
  const { id } = useParams();
  const { language } = useContext(LanguageContext);
  const course = getCourseById(id);

  if (!course) {
    return <NotFoundPage />;
  }

  // Admin Check helper
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const savedUserStr = localStorage.getItem('ueh_tcc_user');
      if (savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          if (
            user &&
            (user.role === 'Admin' ||
              (user.username && user.username.toLowerCase() === 'luphuc321@gmail.com') ||
              (user.email && user.email.toLowerCase() === 'luphuc321@gmail.com'))
          ) {
            setIsAdmin(true);
            return;
          }
        } catch (e) {}
      }
      setIsAdmin(false);
    };

    checkAdminStatus();
    window.addEventListener('storage', checkAdminStatus);
    return () => window.removeEventListener('storage', checkAdminStatus);
  }, []);

  // Accordion open state for chapters
  const [expandedChapters, setExpandedChapters] = useState({
    'ch-1': true,
    'ch-2': true,
    'ch-3': true,
    'ch-4': true
  });

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // Video Modal & Player States
  const [activeLesson, setActiveLesson] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Smart Resume State
  const [resumeTime, setResumeTime] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Tab Switch Auto Pause Toast State
  const [showTabPauseToast, setShowTabPauseToast] = useState(false);

  // Floating Study Timer & Progress States
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [completedLessons, setCompletedLessons] = useState({});

  const videoRef = useRef(null);
  const playerFrameRef = useRef(null);

  // Floating Study Timer Counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalStudySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format mm:ss or hh:mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle opening a lesson
  const handleLessonClick = (lesson) => {
    // If lesson is locked AND user is NOT admin
    if (lesson.isLocked && !isAdmin) {
      setActiveLesson(lesson);
      setShowLockPrompt(true);
      return;
    }

    // Open video or text lesson
    setActiveLesson(lesson);
    setShowVideoModal(true);
    setIsPlaying(false);

    // Check if saved timestamp exists in localStorage
    const savedTime = localStorage.getItem(`course_video_pos_${lesson.id}`);
    if (savedTime && parseFloat(savedTime) > 5) {
      setResumeTime(parseFloat(savedTime));
      setShowResumePrompt(true);
    } else {
      setResumeTime(null);
      setShowResumePrompt(false);
    }

    // Mark as completed in study progress tracker
    setCompletedLessons((prev) => ({ ...prev, [lesson.id]: true }));
  };

  // Listen to visibilitychange (Tab Switch Auto Pause)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          setShowTabPauseToast(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Sync video time & save to localStorage
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (activeLesson && cur > 3) {
        localStorage.setItem(`course_video_pos_${activeLesson.id}`, cur.toString());
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setShowTabPauseToast(false);
        setShowResumePrompt(false);
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (e) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!playerFrameRef.current) return;
    if (!document.fullscreenElement) {
      playerFrameRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleResumeContinue = () => {
    if (videoRef.current && resumeTime) {
      videoRef.current.currentTime = resumeTime;
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowResumePrompt(false);
  };

  const handleResumeRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowResumePrompt(false);
  };

  // Calculate total course completion percentage
  const totalLessonsInCourse = course.chapters.reduce(
    (acc, ch) => acc + (ch.lessons ? ch.lessons.length : 0),
    0
  );
  const completedCount = Object.keys(completedLessons).length;
  const progressPercent =
    totalLessonsInCourse > 0 ? Math.round((completedCount / totalLessonsInCourse) * 100) : 0;

  return (
    <div className="courses-page course-detail-shell">
      {/* Banner / Hero Section (Image 2 Design) */}
      <section className="course-detail-hero-banner" style={{ background: course.bannerBg }}>
        <div className="container">
          <Link to="/courses" className="pill-glass-badge" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Tất cả khóa học
          </Link>

          <div className="course-detail-hero-grid">
            <div className="course-detail-hero-info">
              <div className="hero-pill-badge-row">
                <span className="pill-green-badge">{course.tag}</span>
                <span className="pill-glass-badge">XEM TRƯỚC</span>
              </div>
              <h1>{course.title}</h1>

              <div className="course-hero-stats-bar">
                <span className="stat-pill-item">📖 {course.lessonsCount} bài học</span>
                <span className="stat-pill-item">📂 {course.sectionsCount} phần</span>
                <span className="stat-pill-item">📄 {course.documentsCount} tài liệu</span>
                <span className="stat-pill-item">⏰ {course.duration}</span>
              </div>
            </div>

            {/* Right Enrollment Sidebar Card (Image 2) */}
            <div className="course-enroll-sidebar-card">
              <div className="sidebar-card-cover">
                <img src={course.image} alt={course.title} />
              </div>
              <div className="sidebar-card-body">
                {isAdmin && (
                  <div className="admin-unlocked-banner">
                    <Crown size={18} />
                    <span>Tài khoản Admin: Bạn có quyền xem FULL tất cả bài học!</span>
                  </div>
                )}

                <h3>Khóa học này bao gồm</h3>
                <div className="sidebar-benefits-list">
                  <div className="sidebar-benefit-item">
                    <CheckCircle size={16} />
                    <span>Học online trên nền tảng UEH TCC</span>
                  </div>
                  <div className="sidebar-benefit-item">
                    <CheckCircle size={16} />
                    <span>{course.sectionsCount} phần, {course.lessonsCount} bài học</span>
                  </div>
                  <div className="sidebar-benefit-item">
                    <CheckCircle size={16} />
                    <span>{course.documentsCount} tài liệu lớp học đính kèm</span>
                  </div>
                  <div className="sidebar-benefit-item">
                    <CheckCircle size={16} />
                    <span>Video HD sắc nét và bài giảng text</span>
                  </div>
                </div>

                <div className="sidebar-price-box">
                  {!course.isFree && <span className="sidebar-price-old">{course.originalPrice}</span>}
                  <div className="sidebar-price-new">{course.discountPrice}</div>
                  <span className="sidebar-price-label">{course.priceNote}</span>
                </div>

                <button
                  type="button"
                  className="btn-enroll-primary"
                  onClick={() => {
                    alert('Đã gửi yêu cầu đăng ký! Admin luphuc321@gmail.com sẽ liên hệ cấp quyền học ngay lập tức.');
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>{course.isFree ? 'Học ngay miễn phí' : 'Đăng ký ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Syllabus Section (Images 3 & 4) */}
      <div className="container course-syllabus-section">
        <div style={{ maxWidth: '820px' }}>
          <h2 className="syllabus-heading">Nội dung khóa học</h2>

          {course.chapters.map((chapter) => {
            const isOpen = expandedChapters[chapter.id] !== false;
            return (
              <div className="chapter-accordion-card" key={chapter.id}>
                <div className="chapter-accordion-header" onClick={() => toggleChapter(chapter.id)}>
                  <div className="chapter-title-group">
                    <span className="chapter-section-tag">{chapter.sectionLabel}</span>
                    <span className="chapter-title-text">{chapter.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="chapter-badge-count">{chapter.lessonsCount || chapter.lessons.length} bài</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isOpen && (
                  <div className="lessons-list-group">
                    {chapter.lessons.map((lesson) => {
                      const isLockedForUser = lesson.isLocked && !isAdmin;

                      return (
                        <div
                          className="lesson-item-row"
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="lesson-info-left">
                            <div className={`lesson-icon-circle ${isLockedForUser ? 'locked' : 'watchable'}`}>
                              {lesson.type === 'video' ? (
                                <Play size={16} fill="currentColor" />
                              ) : (
                                <FileText size={16} />
                              )}
                            </div>
                            <div className="lesson-text-details">
                              <span className="lesson-title-name">{lesson.title}</span>
                              <span className="lesson-subtitle-type">{lesson.subtitle}</span>
                            </div>
                          </div>

                          <div className="lesson-action-area">
                            {!lesson.isLocked ? (
                              <span className="badge-btn-xem">
                                <Play size={12} fill="currentColor" /> XEM
                              </span>
                            ) : isAdmin ? (
                              <span className="badge-btn-admin-view">
                                <Crown size={12} /> ADMIN XEM
                              </span>
                            ) : (
                              <span className="badge-btn-khoa">
                                <Lock size={12} /> KHÓA
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM VIDEO PLAYER MODAL (Image 5 Design) */}
      {showVideoModal && activeLesson && (
        <div className="video-modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div className="modal-header-title">
                <span className="modal-header-badge">{activeLesson.type === 'video' ? 'Video bài học' : 'Bài giảng text'}</span>
                <h3>{activeLesson.title}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowVideoModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Video Player Frame */}
            {activeLesson.type === 'video' ? (
              <div className="video-player-frame" ref={playerFrameRef}>
                <video
                  ref={videoRef}
                  src={activeLesson.videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlayPause}
                />

                {/* Tab Switch Auto Pause Toast */}
                {showTabPauseToast && (
                  <div className="tab-pause-toast">
                    ⏸️ Video tự động tạm dừng do bạn vừa chuyển tab (Facebook/cửa sổ khác)
                  </div>
                )}

                {/* Smart Resume Prompt Overlay */}
                {showResumePrompt && (
                  <div className="smart-resume-card">
                    <h4>XEM TIẾP BÀI HỌC?</h4>
                    <p>Bạn đã xem dở bài học này tại vị trí <strong>{formatTime(resumeTime)}</strong>. Bạn muốn tiếp tục xem hay xem từ đầu?</p>
                    <div className="resume-btn-actions">
                      <button type="button" className="btn-resume-continue" onClick={handleResumeContinue}>
                        ▶ Tiếp tục xem ({formatTime(resumeTime)})
                      </button>
                      <button type="button" className="btn-resume-restart" onClick={handleResumeRestart}>
                        <RotateCcw size={14} /> Xem từ đầu
                      </button>
                    </div>
                  </div>
                )}

                {/* Overlay Controls */}
                <div className="video-overlay-controls">
                  <div className="video-progress-scrubber" onClick={handleSeek}>
                    <div
                      className="video-progress-fill"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="video-controls-bottom-bar">
                    <div className="controls-left-group">
                      <button type="button" className="btn-video-control" onClick={togglePlayPause}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                      </button>
                      <span className="video-timer-text">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="controls-right-group">
                      <select className="speed-selector-select" value={playbackSpeed} onChange={handleSpeedChange}>
                        <option value="0.5">0.5x (Chậm)</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x (Chuẩn)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x (Nhanh)</option>
                      </select>

                      <button type="button" className="btn-video-control" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px', color: '#ffffff', background: '#0f172a', lineHeight: '1.8' }}>
                <p>{activeLesson.content || 'Nội dung bài giảng đang được hoàn thiện...'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Locked Lesson Prompt Modal */}
      {showLockPrompt && (
        <div className="video-modal-backdrop" onClick={() => setShowLockPrompt(false)}>
          <div
            className="video-modal-container"
            style={{ width: '480px', padding: '32px', textAlign: 'center', background: 'var(--course-paper)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--course-gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--course-gold)' }}>
              <Lock size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--course-ink)', marginBottom: '12px' }}>
              Bài học này đang bị khóa
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--course-muted)', marginBottom: '24px' }}>
              Bài học dành riêng cho học viên đã đăng ký khóa học. Nếu bạn là Admin <strong>luphuc321@gmail.com</strong>, hãy đăng nhập để được mở khóa FULL tất cả bài học!
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" className="btn-resume-continue" onClick={() => setShowLockPrompt(false)}>
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Study Timer & Progress Widget (Đồng hồ lơ lửng & Tiết học) */}
      <div className="floating-study-widget">
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
      </div>
    </div>
  );
}
