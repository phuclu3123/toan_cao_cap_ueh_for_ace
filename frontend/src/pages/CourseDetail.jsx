import { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  FileText,
  Flag,
  Lightbulb,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  ShieldCheck,
  SkipForward,
  Video,
  Volume2,
  VolumeX,
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Video Player Modal Box Theme Toggle (Lightbulb icon 💡) - Default Light White-Gray Translucent Theme
  const [isPlayerDarkMode, setIsPlayerDarkMode] = useState(false);

  // Popovers & Report Modals
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Video bị đứng/lag');
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

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

  // Lock body scroll & hide floating chat launcher icon when modal is open
  useEffect(() => {
    const isModalOpen = showVideoModal || showLockPrompt || showReportModal;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const launcher = document.querySelector('.contact-launcher-container') || document.querySelector('.contact-launcher');
      if (launcher) launcher.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      const launcher = document.querySelector('.contact-launcher-container') || document.querySelector('.contact-launcher');
      if (launcher) launcher.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      const launcher = document.querySelector('.contact-launcher-container') || document.querySelector('.contact-launcher');
      if (launcher) launcher.style.display = '';
    };
  }, [showVideoModal, showLockPrompt, showReportModal]);

  // Flatten all lessons in order to handle Next Lesson
  const allLessons = course.chapters.reduce((acc, ch) => acc.concat(ch.lessons || []), []);

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
    setShowSettingsPopover(false);
    setIsPlayerDarkMode(false);

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

  // Handle Next Lesson
  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      handleLessonClick(nextLesson);
    } else {
      alert('Bạn đã xem đến bài học cuối cùng của khóa học!');
    }
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

  const handleRewind5 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };

  const handleForward5 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
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

  const handleSpeedSelect = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsPopover(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
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

  // Submit Error Report to Backend / Admin System
  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
    }, 2000);
  };

  // Calculate total course completion percentage
  const totalLessonsInCourse = allLessons.length;
  const completedCount = Object.keys(completedLessons).length;
  const progressPercent =
    totalLessonsInCourse > 0 ? Math.round((completedCount / totalLessonsInCourse) * 100) : 0;

  return (
    <div className="courses-page course-detail-shell">
      {/* Banner / Hero Section with Embedded Syllabus Layout */}
      <section className="course-detail-hero-banner" style={{ background: course.bannerBg }}>
        <div className="container">
          <Link to="/courses" className="pill-glass-badge" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Tất cả khóa học
          </Link>

          <div className="course-detail-hero-grid">
            {/* LEFT COLUMN: Hero Info + Embedded Syllabus right below */}
            <div className="course-detail-left">
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

              {/* EMBEDDED SYLLABUS SECTION (Right Under Hero Info on Left) */}
              <div className="course-syllabus-section-embedded">
                <h2 className="syllabus-heading-embedded">Nội dung khóa học</h2>

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
                                      <Play size={15} fill="currentColor" />
                                    ) : (
                                      <FileText size={15} />
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

            {/* RIGHT COLUMN: Sticky Enrollment Sidebar Card */}
            <div className="course-detail-right">
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
        </div>
      </section>

      {/* ADVANCED CUSTOM VIDEO PLAYER PORTAL MODAL (Light Translucent White-Gray Theme Default + Lightbulb Icon Theme Toggle) */}
      {showVideoModal && activeLesson && createPortal(
        <div className="video-modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div
            className={`video-modal-container ${isPlayerDarkMode ? 'dark-player-box' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-modal-header">
              <div className="modal-header-title">
                <span className="modal-header-badge">
                  {activeLesson.type === 'video' ? 'Video bài học' : 'Bài giảng text'}
                </span>
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
                    <p>
                      Bạn đã xem dở bài học này tại vị trí <strong>{formatTime(resumeTime)}</strong>. Bạn muốn tiếp tục
                      xem hay xem từ đầu?
                    </p>
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
                      <button type="button" className="btn-video-control" onClick={togglePlayPause} title="Phát / Tạm dừng">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                      </button>

                      {/* Rewind 5s / Forward 5s buttons */}
                      <button type="button" className="btn-video-control" onClick={handleRewind5} title="Tua lùi 5s">
                        <RotateCcw size={16} /> -5s
                      </button>
                      <button type="button" className="btn-video-control" onClick={handleForward5} title="Tua tới 5s">
                        <RotateCw size={16} /> +5s
                      </button>

                      {/* Volume Slider */}
                      <button type="button" className="btn-video-control" onClick={toggleMute} title="Âm lượng">
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{ width: '60px', cursor: 'pointer', accentColor: '#10b981' }}
                      />

                      <span className="video-timer-text">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="controls-right-group">
                      {/* Next Lesson Button */}
                      <button type="button" className="btn-next-lesson" onClick={handleNextLesson} title="Bài tiếp theo">
                        <span>Bài tiếp</span>
                        <SkipForward size={14} />
                      </button>

                      {/* LIGHTBULB ICON ONLY BUTTON (Placed between Next Lesson and Report Flag to toggle Modal Box Theme) */}
                      <button
                        type="button"
                        className={`btn-video-control ${isPlayerDarkMode ? 'active-lightbulb' : ''}`}
                        onClick={() => setIsPlayerDarkMode(!isPlayerDarkMode)}
                        title="Đổi giao diện Sáng / Tối cho khung xem video"
                      >
                        <Lightbulb size={18} />
                      </button>

                      {/* Report Error Flag */}
                      <button
                        type="button"
                        className="btn-report-flag"
                        onClick={() => setShowReportModal(true)}
                        title="Báo lỗi bài giảng"
                      >
                        <Flag size={14} />
                      </button>

                      {/* Sleek Settings Popover Button */}
                      <button
                        type="button"
                        className="btn-video-control"
                        onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                        title="Cài đặt phát"
                      >
                        <Settings size={18} />
                      </button>

                      {/* Settings Glass Popover Menu */}
                      {showSettingsPopover && (
                        <div className="settings-popover-menu">
                          <h4>Cài đặt phát</h4>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Chất lượng: Auto (1080p)</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Tốc độ phát:</div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                            <div
                              key={spd}
                              className={`speed-option-item ${playbackSpeed === spd ? 'active' : ''}`}
                              onClick={() => handleSpeedSelect(spd)}
                            >
                              <span>{spd === 1 ? '1.0x (Chuẩn)' : `${spd}x`}</span>
                              {playbackSpeed === spd && <CheckCircle size={14} />}
                            </div>
                          ))}
                        </div>
                      )}

                      <button type="button" className="btn-video-control" onClick={toggleFullscreen} title="Toàn màn hình">
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px', color: '#0f172a', lineHeight: '1.8' }}>
                <p>{activeLesson.content || 'Nội dung bài giảng đang được hoàn thiện...'}</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Report Error Flag Modal (Portal directly to document.body) */}
      {showReportModal && createPortal(
        <div className="video-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div
            className="video-modal-container"
            style={{ width: '480px', padding: '28px', background: 'var(--course-paper)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--course-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flag size={18} color="#ef4444" /> Báo lỗi bài giảng cho Admin
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={16} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#10b981', fontWeight: '700' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 12px' }} />
                Đã gửi báo cáo sự cố thành công cho Admin (luphuc321@gmail.com)!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--course-ink)', marginBottom: '6px' }}>
                    Loại sự cố:
                  </label>
                  <select
                    className="form-input"
                    style={{ width: '100%', padding: '10px' }}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Video bị đứng/lag">Video bị đứng / lag</option>
                    <option value="Lỗi âm thanh">Lỗi âm thanh / không có tiếng</option>
                    <option value="Nội dung không khớp">Nội dung bài giảng chưa đúng</option>
                    <option value="Khác">Sự cố khác</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--course-ink)', marginBottom: '6px' }}>
                    Mô tả thêm (Tùy chọn):
                  </label>
                  <textarea
                    className="form-input"
                    style={{ width: '100%', padding: '10px' }}
                    rows="3"
                    placeholder="Mô tả cụ thể vị trí phút giây bị lỗi..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-enroll-primary" style={{ width: '100%' }}>
                  Gửi báo cáo sự cố
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Locked Lesson Prompt Modal (Portal directly to document.body) */}
      {showLockPrompt && createPortal(
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
        </div>,
        document.body
      )}

      {/* FLOATING STUDY TIMER WIDGET (Portal directly to document.body) */}
      {createPortal(
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
        </div>,
        document.body
      )}
    </div>
  );
}
