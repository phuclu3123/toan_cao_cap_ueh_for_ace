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
  GripVertical,
  Lightbulb,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  ShieldAlert,
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
import CourseEnrollmentModal from '../components/modals/CourseEnrollmentModal';
import {
  isAdminAccount,
  getStudentIdentifier,
  isAccountLocked,
  lockAccountDueToViolation
} from '../utils/securityGuard';
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
            ((user.username && user.username.toLowerCase() === 'luphuc321@gmail.com') ||
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

  // Enrollment status state
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    const checkEnrollment = () => {
      try {
        const saved = localStorage.getItem('ueh_tcc_enrolled_courses');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.includes(course.id)) {
            setIsEnrolled(true);
            return;
          }
        }
      } catch (e) {}
      setIsEnrolled(false);
    };

    checkEnrollment();
    window.addEventListener('storage', checkEnrollment);
    return () => window.removeEventListener('storage', checkEnrollment);
  }, [course.id]);

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

  // Video Player Modal Box Theme Toggle (Lightbulb icon 💡) - Default Light Translucent Theme
  const [isPlayerDarkMode, setIsPlayerDarkMode] = useState(false);

  // Popovers & Report Modals
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Video bị đứng/lag');
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [videoQuality, setVideoQuality] = useState('hd1080');
  const [showPlayPauseAnim, setShowPlayPauseAnim] = useState(false);

  // Toast Notification & Sticky Resume States
  const [toastNotification, setToastNotification] = useState(null);
  const [lastActiveInfo, setLastActiveInfo] = useState(null);

  const showToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Smart Resume State
  const [resumeTime, setResumeTime] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Tab Switch Auto Pause Toast State
  const [showTabPauseToast, setShowTabPauseToast] = useState(false);

  // Floating Study Timer, Draggable & Smart Positioning States (Images 2 & 3)
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [completedLessons, setCompletedLessons] = useState({});
  const [customPos, setCustomPos] = useState(null); // null means default anchor
  const [isDraggingTimer, setIsDraggingTimer] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTimerCollapsed, setIsTimerCollapsed] = useState(false);

  // Auto-hide Control Bar after 2.5s mouse inactivity (Works in both normal & Fullscreen modes - YouTube / Netflix style)
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Reset controls on fullscreenchange
  useEffect(() => {
    if (!showVideoModal) return;

    const handleFSChange = () => {
      setAreControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setAreControlsVisible(false);
        }, 2500);
      }
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showVideoModal, isPlaying]);

  // Anti-Piracy Security States (DevTools, Dynamic Watermark, Multi-Device Concurrency)
  const [showDevToolsWarning, setShowDevToolsWarning] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [showConcurrentWarning, setShowConcurrentWarning] = useState(false);
  const [isAccLocked, setIsAccLocked] = useState(false);

  // Check Account Lock status on mount
  useEffect(() => {
    if (isAccountLocked()) {
      setIsAccLocked(true);
    }
  }, []);

  // DevTools & F12 Key / Context Menu Shield (Exempt Admin luphuc321@gmail.com)
  useEffect(() => {
    if (isAdminAccount()) return; // Admin luphuc321@gmail.com is 100% EXEMPT!

    const handleContextMenu = (e) => {
      if (showVideoModal) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDownSecurity = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (showVideoModal) {
          setShowDevToolsWarning(true);
          if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
            try { ytPlayerRef.current.pauseVideo(); } catch (err) {}
          } else if (videoRef.current) {
            try { videoRef.current.pause(); } catch (err) {}
          }
          setIsPlaying(false);
        }
        return false;
      }
    };

    const checkDevTools = () => {
      if (!showVideoModal) return;
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setShowDevToolsWarning(true);
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          try { ytPlayerRef.current.pauseVideo(); } catch (err) {}
        } else if (videoRef.current) {
          try { videoRef.current.pause(); } catch (err) {}
        }
        setIsPlaying(false);
      }
    };

    const interval = setInterval(checkDevTools, 2000);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDownSecurity, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDownSecurity, true);
    };
  }, [showVideoModal]);

  // Dynamic Watermark Sweep Trigger (Exact second-based 10-minute block check: 00:00-00:14, 10:00-10:14, 20:00-20:14, etc.)
  useEffect(() => {
    if (!showVideoModal || isAdminAccount()) {
      setShowWatermark(false);
      return;
    }

    const sec = Math.floor(currentTime);
    const secInBlock = sec % 600; // 600 seconds = 10 minutes

    // Trigger sweep during the first 14 seconds of every 10-minute block (works on rewind/seek too!)
    if (secInBlock >= 0 && secInBlock <= 14) {
      const identifier = getStudentIdentifier();
      setWatermarkText(identifier);
      setShowWatermark(true);
    } else {
      setShowWatermark(false);
    }
  }, [showVideoModal, currentTime]);

  // Random Micro-Watermark Corner Position State (Top/Bottom corners only to avoid obscuring lecture text)
  const [microPosStyle, setMicroPosStyle] = useState({ top: '16px', right: '20px' });

  // Periodically shift micro-watermark between top & bottom corners every 3 minutes
  useEffect(() => {
    if (!showVideoModal || isAdminAccount()) return;

    const cornerStyles = [
      { top: '16px', right: '20px', bottom: 'auto', left: 'auto' },  // Top-Right
      { top: '16px', left: '20px', bottom: 'auto', right: 'auto' },   // Top-Left
      { bottom: '76px', right: '20px', top: 'auto', left: 'auto' }, // Bottom-Right (above controls)
      { bottom: '76px', left: '20px', top: 'auto', right: 'auto' }   // Bottom-Left (above controls)
    ];

    const shiftPosition = () => {
      const nextCorner = cornerStyles[Math.floor(Math.random() * cornerStyles.length)];
      setMicroPosStyle(nextCorner);
    };

    shiftPosition();
    const interval = setInterval(shiftPosition, 180000);
    return () => clearInterval(interval);
  }, [showVideoModal]);

  // DOM Anti-Tampering Observer (Detects if anyone tries to delete or hide watermark nodes)
  useEffect(() => {
    if (!showVideoModal || isAdminAccount()) return;

    const frameEl = playerFrameRef.current;
    if (!frameEl) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (
              node.nodeType === 1 &&
              (node.classList?.contains('dynamic-watermark-overlay') ||
                node.classList?.contains('random-micro-watermark'))
            ) {
              // Watermark node was tampered/deleted! Instantly pause video!
              if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
                try { ytPlayerRef.current.pauseVideo(); } catch (err) {}
              } else if (videoRef.current) {
                try { videoRef.current.pause(); } catch (err) {}
              }
              setIsPlaying(false);
              setShowDevToolsWarning(true);
            }
          });
        }
      });
    });

    observer.observe(frameEl, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [showVideoModal]);
  useEffect(() => {
    if (!showVideoModal || isAdminAccount()) return;

    const scope = getUserScope();
    const sessionKey = `active_video_session_${scope}`;
    const currentSessionId = Math.random().toString(36).substring(2, 9);

    const checkConcurrentStreams = () => {
      try {
        const existingSession = localStorage.getItem(sessionKey);
        const now = Date.now();
        if (existingSession) {
          const parsed = JSON.parse(existingSession);
          if (parsed && parsed.sessionId !== currentSessionId && now - parsed.timestamp < 6000) {
            // Concurrent stream detected!
            setShowConcurrentWarning(true);
            const violationKey = `violation_start_${scope}`;
            const startTime = localStorage.getItem(violationKey);
            if (!startTime) {
              localStorage.setItem(violationKey, now.toString());
            } else {
              const elapsedMinutes = (now - parseInt(startTime)) / (1000 * 60);
              if (elapsedMinutes >= 30) {
                // 30 minutes violation exceeded -> LOCK ACCOUNT PERMANENTLY!
                lockAccountDueToViolation();
                setIsAccLocked(true);
                setShowVideoModal(false);
              }
            }
            return;
          }
        }
        // Update heartbeat timestamp for current session
        localStorage.setItem(
          sessionKey,
          JSON.stringify({ sessionId: currentSessionId, timestamp: now })
        );
        setShowConcurrentWarning(false);
      } catch (e) {}
    };

    const heartbeatInterval = setInterval(checkConcurrentStreams, 3000);
    checkConcurrentStreams();

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [showVideoModal]);

  const handleMouseMoveOnPlayer = () => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    const playing =
      isPlaying ||
      (ytPlayerRef.current &&
        typeof ytPlayerRef.current.getPlayerState === 'function' &&
        ytPlayerRef.current.getPlayerState() === 1);

    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setAreControlsVisible(false);
      }, 2500);
    }
  };

  const handleMouseLeavePlayer = () => {
    const playing =
      isPlaying ||
      (ytPlayerRef.current &&
        typeof ytPlayerRef.current.getPlayerState === 'function' &&
        ytPlayerRef.current.getPlayerState() === 1);

    if (playing) {
      setAreControlsVisible(false);
    }
  };

  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const playerFrameRef = useRef(null);

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Handle Dragging Floating Widget
  const handleTimerMouseDown = (e) => {
    setIsDraggingTimer(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingTimer) {
        const newX = Math.max(10, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
        const newY = Math.max(10, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));
        setCustomPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTimer(false);
    };

    if (isDraggingTimer) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimer, dragOffset]);

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
  const dynamicLessonsCount = allLessons.length;

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

  // User Scoped Storage Helper for Guest vs Logged-In Users & Cache Clearing Safety
  const getUserScope = () => {
    try {
      const savedUserStr = localStorage.getItem('ueh_tcc_user');
      if (savedUserStr) {
        const user = JSON.parse(savedUserStr);
        if (user && (user.id || user.email || user.username)) {
          return user.id || user.email || user.username;
        }
      }
    } catch (e) {}
    return 'guest';
  };

  const getSavedVideoPos = (lessonId) => {
    if (!lessonId) return null;
    const scope = getUserScope();
    try {
      const scopedVal = localStorage.getItem(`course_video_pos_${scope}_${lessonId}`);
      // Only fallback to legacy for guest if guest
      const legacyVal = scope === 'guest' ? localStorage.getItem(`course_video_pos_${lessonId}`) : null;
      const val = scopedVal || legacyVal;
      return val ? parseFloat(val) : null;
    } catch (e) {
      return null;
    }
  };

  const saveVideoPos = (lessonId, time) => {
    if (!lessonId || !time || time < 3) return;
    const scope = getUserScope();
    try {
      localStorage.setItem(`course_video_pos_${scope}_${lessonId}`, time.toString());
      if (scope === 'guest') {
        localStorage.setItem(`course_video_pos_${lessonId}`, time.toString());
      }
    } catch (e) {}
  };

  const removeSavedVideoPos = (lessonId) => {
    if (!lessonId) return;
    const scope = getUserScope();
    try {
      localStorage.removeItem(`course_video_pos_${scope}_${lessonId}`);
      localStorage.removeItem(`course_video_pos_${lessonId}`);
    } catch (e) {}
  };

  // Detect & Load Last Active Lesson on Page Load / Auth change / Mount
  useEffect(() => {
    const checkLastActive = () => {
      const scope = getUserScope();
      try {
        const savedStr = localStorage.getItem(`course_last_active_lesson_${scope}_${course.id}`);
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          if (parsed && parsed.lessonId && parsed.time > 5) {
            const targetLesson = allLessons.find((l) => l.id === parsed.lessonId);
            // Security Check: If lesson is locked and current user is guest & not admin, DO NOT SHOW BANNER!
            if (targetLesson && targetLesson.isLocked && scope === 'guest' && !isAdmin) {
              setLastActiveInfo(null);
              return;
            }
            setLastActiveInfo(parsed);
            return;
          }
        }
      } catch (e) {}
      setLastActiveInfo(null);
    };

    checkLastActive();
    window.addEventListener('storage', checkLastActive);
    return () => window.removeEventListener('storage', checkLastActive);
  }, [course.id, isAdmin, allLessons]);

  // Handle closing video modal with Toast Notification & Progress Persistence
  const closeVideoModal = () => {
    if (activeLesson) {
      let cur = currentTime;
      if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const t = ytPlayerRef.current.getCurrentTime();
          if (t && t > 0) cur = t;
        } catch (e) {}
      } else if (videoRef.current && videoRef.current.currentTime > 0) {
        cur = videoRef.current.currentTime;
      }

      if (cur && cur > 3) {
        saveVideoPos(activeLesson.id, cur);
        const scope = getUserScope();
        const info = {
          lessonId: activeLesson.id,
          time: cur,
          title: activeLesson.title
        };
        try {
          localStorage.setItem(`course_last_active_lesson_${scope}_${course.id}`, JSON.stringify(info));
        } catch (e) {}
        if (!(activeLesson.isLocked && scope === 'guest' && !isAdmin)) {
          setLastActiveInfo(info);
        }
        showToast(`✨ Đã tự động lưu tiến trình bài "${activeLesson.title}" tại ${formatTime(cur)}!`);
      }
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    } else if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {}
    }
    setIsPlaying(false);
    setShowVideoModal(false);
  };

  // Handle opening a lesson
  const handleLessonClick = (lesson) => {
    if (isAccLocked && !isAdminAccount()) {
      alert('⚠️ TÀI KHOẢN ĐÃ BỊ KHÓA VĨNH VIỄN: Phát hiện tài khoản của bạn vi phạm điều khoản xem video cùng lúc trên nhiều thiết bị quá 30 phút. Vui lòng liên hệ Admin (luphuc321@gmail.com) để được mở lại.');
      return;
    }
    if (lesson.isLocked && !isAdmin && !isEnrolled) {
      setActiveLesson(lesson);
      setShowLockPrompt(true);
      return;
    }

    setActiveLesson(lesson);
    setShowVideoModal(true);
    setCustomPos(null);
    setIsPlaying(false);
    setShowSettingsPopover(false);
    setIsPlayerDarkMode(false);

    const savedTime = getSavedVideoPos(lesson.id);
    if (savedTime && savedTime > 5) {
      setResumeTime(savedTime);
      setShowResumePrompt(true);
      showToast(`📌 Đã nạp vị trí lưu gần nhất của bài "${lesson.title}" tại ${formatTime(savedTime)}!`);
    } else {
      setResumeTime(null);
      setShowResumePrompt(false);
    }

    setCompletedLessons((prev) => ({ ...prev, [lesson.id]: true }));
  };

  // Handle Next Lesson Button
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

  const isYouTube = activeLesson?.videoUrl && /(?:youtu\.be\/|youtube\.com)/i.test(activeLesson.videoUrl);

  // Initialize YouTube IFrame Player API when modal opens for YouTube lessons
  useEffect(() => {
    if (!showVideoModal || !activeLesson) return;

    const videoId = extractYouTubeId(activeLesson.videoUrl);
    if (!videoId) return;

    const initYTPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }

      ytPlayerRef.current = new window.YT.Player('yt-player-element', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            const dur = event.target.getDuration();
            if (dur) setDuration(dur);

            // Check if saved position exists
            const savedTime = getSavedVideoPos(activeLesson.id);
            if (savedTime && savedTime > 5) {
              setResumeTime(savedTime);
              setShowResumePrompt(true);
              setIsPlaying(false);
              try {
                event.target.pauseVideo();
              } catch (e) {}
            } else {
              event.target.playVideo();
              setIsPlaying(true);
              setShowResumePrompt(false);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setShowTabPauseToast(false);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else if (window.YT.Player) {
      initYTPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [showVideoModal, activeLesson]);

  // Sync YouTube progress in real-time
  useEffect(() => {
    let interval = null;
    if (showVideoModal && isPlaying && isYouTube && !showResumePrompt) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const cur = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (cur !== undefined && cur !== null) {
            setCurrentTime(cur);
            if (activeLesson && cur > 3 && !showResumePrompt) {
              saveVideoPos(activeLesson.id, cur);
            }
          }
          if (dur && dur > 0) {
            setDuration(dur);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showVideoModal, isPlaying, isYouTube, activeLesson, showResumePrompt]);

  // Persistent Progress Save on F5 refresh, page exit, back/forward navigation or logout
  useEffect(() => {
    const saveCurrentProgress = () => {
      if (!activeLesson || showResumePrompt) return;
      let timeToSave = currentTime;
      if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const t = ytPlayerRef.current.getCurrentTime();
          if (t && t > 0) timeToSave = t;
        } catch (e) {}
      } else if (videoRef.current && videoRef.current.currentTime > 0) {
        timeToSave = videoRef.current.currentTime;
      }
      if (timeToSave && timeToSave > 3) {
        saveVideoPos(activeLesson.id, timeToSave);
        const scope = getUserScope();
        const info = { lessonId: activeLesson.id, time: timeToSave, title: activeLesson.title };
        try {
          localStorage.setItem(`course_last_active_lesson_${scope}_${course.id}`, JSON.stringify(info));
          localStorage.setItem(`course_last_active_lesson_${course.id}`, JSON.stringify(info));
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', saveCurrentProgress);
    window.addEventListener('pagehide', saveCurrentProgress);
    return () => {
      saveCurrentProgress();
      window.removeEventListener('beforeunload', saveCurrentProgress);
      window.removeEventListener('pagehide', saveCurrentProgress);
    };
  }, [activeLesson, isYouTube, currentTime, showResumePrompt]);

  // Listen to visibilitychange (Tab Switch Auto Pause)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
          setShowTabPauseToast(true);
        } else if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          setShowTabPauseToast(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isYouTube]);

  // Sync native HTML5 video time & save to localStorage
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (activeLesson && cur > 3) {
        saveVideoPos(activeLesson.id, cur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (isYouTube && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        setShowTabPauseToast(false);
        setShowResumePrompt(false);
      }
    } else if (videoRef.current) {
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
    if (isYouTube && ytPlayerRef.current) {
      const cur = ytPlayerRef.current.getCurrentTime() || 0;
      const target = Math.max(0, cur - 5);
      ytPlayerRef.current.seekTo(target, true);
      setCurrentTime(target);
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };

  const handleForward5 = () => {
    if (isYouTube && ytPlayerRef.current) {
      const cur = ytPlayerRef.current.getCurrentTime() || 0;
      const dur = ytPlayerRef.current.getDuration() || duration;
      const target = Math.min(dur, cur + 5);
      ytPlayerRef.current.seekTo(target, true);
      setCurrentTime(target);
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedSelect = (speed) => {
    setPlaybackSpeed(speed);
    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.setPlaybackRate(speed);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsPopover(false);
  };

  const toggleMute = () => {
    if (isYouTube && ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(val * 100);
      if (val === 0) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    } else if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
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
    if (resumeTime) {
      if (isYouTube && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(resumeTime, true);
        ytPlayerRef.current.playVideo();
      } else if (videoRef.current) {
        videoRef.current.currentTime = resumeTime;
        videoRef.current.play();
      }
      setIsPlaying(true);
    }
    setShowResumePrompt(false);
  };

  const handleResumeRestart = () => {
    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(0, true);
      ytPlayerRef.current.playVideo();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setIsPlaying(true);
    setShowResumePrompt(false);
    if (activeLesson) {
      removeSavedVideoPos(activeLesson.id);
    }
  };

  const triggerScreenPulseAnim = () => {
    setShowPlayPauseAnim(true);
    setTimeout(() => setShowPlayPauseAnim(false), 500);
  };

  const handleQualitySelect = (quality) => {
    setVideoQuality(quality);
    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackQuality === 'function') {
      try {
        ytPlayerRef.current.setPlaybackQuality(quality);
      } catch (e) {}
    }
  };

  // Global Keyboard Shortcuts for Video Player Modal (Space, Arrows, F, M, Esc)
  useEffect(() => {
    if (!showVideoModal) return;

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlayPause();
        triggerScreenPulseAnim();
      } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleRewind5();
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleForward5();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume((prev) => {
          const next = Math.min(1, parseFloat((prev + 0.1).toFixed(2)));
          handleVolumeChange({ target: { value: next } });
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume((prev) => {
          const next = Math.max(0, parseFloat((prev - 0.1).toFixed(2)));
          handleVolumeChange({ target: { value: next } });
          return next;
        });
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        closeVideoModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVideoModal, isPlaying, duration, volume, isMuted, activeLesson]);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
    }, 2000);
  };

  const totalLessonsInCourse = dynamicLessonsCount;
  const completedCount = Object.keys(completedLessons).length;
  const progressPercent =
    totalLessonsInCourse > 0 ? Math.round((completedCount / totalLessonsInCourse) * 100) : 0;

  // Study Timer Component Rendering Helper (Reusable for both Modal Bottom & Top-Right Anchor)
  const renderStudyTimerWidget = (isModalContext = false) => {
    const styleProp = customPos
      ? { position: 'fixed', left: `${customPos.x}px`, top: `${customPos.y}px` }
      : {};

    const classNameProp = `floating-study-widget ${isModalContext ? 'under-video-anchor' : 'top-right-anchor'} ${
      isTimerCollapsed ? 'collapsed' : ''
    }`;

    return (
      <div className={classNameProp} style={styleProp} onMouseDown={handleTimerMouseDown}>
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
            <button
              type="button"
              className="btn-timer-collapse"
              onClick={(e) => {
                e.stopPropagation();
                setIsTimerCollapsed(true);
              }}
              title="Thu gọn thanh đếm giờ"
            >
              <Minimize2 size={12} />
            </button>
          </>
        ) : (
          <>
            <div className="timer-badge-active">
              <Clock size={15} />
              <span>{Math.floor(totalStudySeconds / 60)}m {totalStudySeconds % 60}s ({progressPercent}%)</span>
            </div>
            <button
              type="button"
              className="btn-timer-collapse"
              onClick={(e) => {
                e.stopPropagation();
                setIsTimerCollapsed(false);
              }}
              title="Mở rộng thanh đếm giờ"
            >
              <Maximize2 size={12} />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="courses-page course-detail-shell"
      style={{ background: course.bannerBg || 'linear-gradient(135deg, #0e4e35 0%, #176b4a 60%, #063121 100%)', paddingBottom: 0 }}
    >
      {/* Banner / Hero Section */}
      <section className="course-detail-hero-banner" style={{ background: course.bannerBg }}>
        <div className="container">
          <Link to="/courses" className="pill-glass-badge" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Tất cả khóa học
          </Link>

          {/* STICKY RESUME LEARNING BANNER (When returning from Home or F5) */}
          {lastActiveInfo && !showVideoModal && (
            <div className="resume-course-banner">
              <div className="resume-banner-info">
                <span className="resume-banner-icon">📌</span>
                <div>
                  <strong>BẠN ĐANG HỌC DỞ:</strong> Bài <em>"{lastActiveInfo.title}"</em> (Vị trí đã lưu: <strong>{formatTime(lastActiveInfo.time)}</strong>)
                </div>
              </div>
              <button
                type="button"
                className="btn-resume-banner"
                onClick={() => {
                  const lesson = allLessons.find((l) => l.id === lastActiveInfo.lessonId) || allLessons[0];
                  if (lesson) handleLessonClick(lesson);
                }}
              >
                ▶ TIẾP TỤC HỌC NGAY
              </button>
            </div>
          )}

          <div className="course-detail-hero-grid">
            {/* LEFT COLUMN: Hero Info + Embedded Syllabus */}
            <div className="course-detail-left">
              <div className="course-detail-hero-info">
                <div className="hero-pill-badge-row">
                  <span className="pill-green-badge">{course.tag}</span>
                  <span className="pill-glass-badge">XEM TRƯỚC</span>
                </div>
                <h1>{course.title}</h1>

                <div className="course-hero-stats-bar">
                  <span className="stat-pill-item">📖 {dynamicLessonsCount} bài học</span>
                  <span className="stat-pill-item">📂 {course.sectionsCount} phần</span>
                  <span className="stat-pill-item">📄 {course.documentsCount} tài liệu</span>
                  <span className="stat-pill-item">⏰ {course.duration}</span>
                </div>
              </div>

              {/* EMBEDDED SYLLABUS SECTION */}
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
                          <span className="chapter-badge-count">{chapter.lessons ? chapter.lessons.length : 0} bài</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="lessons-list-group">
                          {chapter.lessons.map((lesson) => {
                            const isLockedForUser = lesson.isLocked && !isAdmin && !isEnrolled;

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
                                  {!lesson.isLocked || isEnrolled ? (
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
                      <span>{course.sectionsCount} phần, {dynamicLessonsCount} bài học</span>
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
                      if (isEnrolled || isAdmin) {
                        if (allLessons.length > 0) {
                          handleLessonClick(allLessons[0]);
                        }
                      } else {
                        setShowEnrollModal(true);
                      }
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>
                      {isEnrolled || isAdmin
                        ? '▶ Vào học ngay'
                        : course.isFree
                        ? 'Học ngay miễn phí'
                        : 'Đăng ký ngay'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADVANCED CUSTOM VIDEO PLAYER PORTAL MODAL */}
      {showVideoModal && activeLesson && createPortal(
        <div className="video-modal-backdrop" onClick={closeVideoModal}>
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
              <button type="button" className="modal-close-btn" onClick={closeVideoModal}>
                <X size={18} />
              </button>
            </div>

            {/* Video Player Frame with Auto-hide Controls on mouse inactivity */}
            {activeLesson.type === 'video' ? (
              <div
                className={`video-player-frame ${!areControlsVisible && isPlaying ? 'hide-controls' : ''}`}
                ref={playerFrameRef}
                onMouseMove={handleMouseMoveOnPlayer}
                onMouseLeave={handleMouseLeavePlayer}
              >
                {isYouTube ? (
                  <div id="yt-player-element" style={{ width: '100%', height: '100%', minHeight: '380px' }} />
                ) : (
                  <video
                    ref={videoRef}
                    src={activeLesson.videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }}
                  />
                )}

                {/* Canvas Screen Click Overlay for Direct Click-to-Play/Pause */}
                {isYouTube && (
                  <div className="video-canvas-click-overlay" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }}>
                    {showPlayPauseAnim && (
                      <div className="play-pause-pulse-icon">
                        {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Switch Auto Pause Toast */}
                {showTabPauseToast && (
                  <div className="tab-pause-toast">
                    ⏸️ Video tự động tạm dừng do bạn vừa chuyển tab (Facebook/cửa sổ khác)
                  </div>
                )}

                {/* Dynamic Anti-Piracy Watermark Overlay */}
                {showWatermark && (
                  <div key={`wm-${Math.floor(currentTime / 600)}`} className="dynamic-watermark-overlay">
                    🔒 {watermarkText}
                  </div>
                )}

                {/* Random Micro-Watermark (Positioned at corners so lecture content is 100% clear) */}
                {!isAdminAccount() && (
                  <div
                    className="random-micro-watermark"
                    style={microPosStyle}
                  >
                    🔒 {watermarkText || getStudentIdentifier()}
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
                      <button type="button" className="btn-video-control" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }} title="Phát / Tạm dừng (Space / K)">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                      </button>

                      {/* Rewind 5s / Forward 5s buttons */}
                      <button type="button" className="btn-video-control" onClick={handleRewind5} title="Tua lùi 5s (Phím mũi tên Trái / J)">
                        <RotateCcw size={16} /> -5s
                      </button>
                      <button type="button" className="btn-video-control" onClick={handleForward5} title="Tua tới 5s (Phím mũi tên Phải / L)">
                        <RotateCw size={16} /> +5s
                      </button>

                      {/* Volume Slider */}
                      <button type="button" className="btn-video-control" onClick={toggleMute} title="Âm lượng (Phím M)">
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

                      {/* LIGHTBULB ICON ONLY BUTTON */}
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
                        <div className="settings-popover-menu" onClick={(e) => e.stopPropagation()}>
                          <h4>Cài đặt phát</h4>
                          <div className="settings-section-title">Chất lượng:</div>
                          <div className="settings-option-list">
                            {[
                              { id: 'hd1080', label: '1080p (Full HD)' },
                              { id: 'hd720', label: '720p (HD)' },
                              { id: 'large', label: '480p' },
                              { id: 'medium', label: '360p' },
                              { id: 'auto', label: 'Tự động (Auto)' }
                            ].map((q) => (
                              <div
                                key={q.id}
                                className={`settings-option-item ${videoQuality === q.id ? 'active' : ''}`}
                                onClick={() => handleQualitySelect(q.id)}
                              >
                                <span>{q.label}</span>
                                {videoQuality === q.id && <CheckCircle size={14} />}
                              </div>
                            ))}
                          </div>

                          <div className="settings-section-title">Tốc độ phát:</div>
                          <div className="settings-option-list">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                              <div
                                key={spd}
                                className={`settings-option-item ${playbackSpeed === spd ? 'active' : ''}`}
                                onClick={() => handleSpeedSelect(spd)}
                              >
                                <span>{spd === 1 ? '1.0x (Chuẩn)' : `${spd}x`}</span>
                                {playbackSpeed === spd && <CheckCircle size={14} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="button" className="btn-video-control" onClick={toggleFullscreen} title="Toàn màn hình (Phím F)">
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

          {/* SMART FLOATING STUDY TIMER */}
          {renderStudyTimerWidget(true)}
        </div>,
        document.body
      )}

      {/* Redesigned Report Error Flag Modal (Fix Image 3) */}
      {showReportModal && createPortal(
        <div className="report-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <div>
                <h3>
                  <Flag size={20} color="#ef4444" /> Báo lỗi bài giảng cho Admin
                </h3>
                <p>Giúp đội ngũ UEH TCC sửa chữa sự cố nhanh nhất có thể.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981', fontWeight: '700' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '1rem' }}>Đã gửi báo cáo sự cố thành công cho Admin!</p>
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
                    rows="3"
                    placeholder="Mô tả cụ thể vị trí phút giây bị lỗi..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                  />
                </div>

                <button type="submit" className="report-btn-submit">
                  Gửi báo cáo sự cố ngay
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Locked Lesson Prompt Modal */}
      {showLockPrompt && createPortal(
        <div className="video-modal-backdrop" onClick={() => setShowLockPrompt(false)}>
          <div
            className="video-modal-container"
            style={{
              width: '440px',
              padding: '36px 30px',
              textAlign: 'center',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.22)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                margin: '0 auto 20px',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <Lock size={30} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>
              Bài học này đang bị khóa
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', marginBottom: '28px' }}>
              Bài học này dành riêng cho học viên đã đăng ký khóa học. Nếu bạn đã có tài khoản Admin, vui lòng đăng nhập để được mở khóa toàn bộ nội dung.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-enroll-primary"
                style={{ width: '100%', padding: '12px 24px', borderRadius: '12px', fontSize: '0.95rem' }}
                onClick={() => {
                  setShowLockPrompt(false);
                  setShowEnrollModal(true);
                }}
              >
                Đăng ký khóa học ngay
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastNotification && createPortal(
        <div className="floating-save-toast">
          <span>{toastNotification}</span>
        </div>,
        document.body
      )}

      {/* DEVTOOLS SECURITY SHIELD WARNING PORTAL */}
      {showDevToolsWarning && createPortal(
        <div className="devtools-warning-backdrop">
          <div className="devtools-warning-card">
            <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3>CẢNH BÁO BẢO MẬT</h3>
            <p>
              Phát hiện công cụ lập trình (DevTools / F12)! Màn hình video đã bị khóa tự động để bảo vệ bản quyền bài giảng UEH TCC.
            </p>
            <button
              type="button"
              className="btn-close-warning"
              onClick={() => setShowDevToolsWarning(false)}
            >
              Đóng và quay lại bài học
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* MULTI-DEVICE CONCURRENT STREAM VIOLATION BANNER */}
      {showConcurrentWarning && createPortal(
        <div className="device-violation-modal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={22} color="#ffffff" />
            <span>
              ⚠️ <strong>CẢNH BÁO AN NINH:</strong> Phát hiện tài khoản đang phát video trên 2+ thiết bị cùng lúc! Vui lòng tắt bớt. Sau 30 phút nếu tiếp tục vi phạm, tài khoản sẽ bị <strong>KHÓA VĨNH VIỄN</strong>.
            </span>
          </div>
        </div>,
        document.body
      )}

      {/* SMART FLOATING STUDY TIMER (When Video Modal is CLOSED - Image 3: Positioned at Top-Right Corner!) */}
      {!showVideoModal && createPortal(renderStudyTimerWidget(false), document.body)}

      {/* COURSE ENROLLMENT / REGISTRATION MODAL */}
      <CourseEnrollmentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        course={course}
        onEnrollSuccess={() => {
          setIsEnrolled(true);
          setShowLockPrompt(false);
          if (allLessons.length > 0) {
            handleLessonClick(allLessons[0]);
          }
        }}
      />
    </div>
  );
}
