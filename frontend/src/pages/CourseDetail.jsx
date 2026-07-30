import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock, Clock3, Eye, FileText, FolderOpen, GripVertical, GraduationCap, Library, Loader2, LockKeyhole, Maximize2, Minimize2, Pause, Play, ShieldCheck, SkipForward, Users, Video, X,
  CheckCircle, Flag, Lightbulb, RotateCcw, RotateCw, Settings, Volume2, VolumeX
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


const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
  });
};

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerDarkMode, setIsPlayerDarkMode] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [videoQuality, setVideoQuality] = useState('hd1080');
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const playerFrameRef = useRef(null);
  const ytMountRef = useRef(null);
  const timerRef = useRef(null);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };
  const toggleFullscreen = () => {
    if (!playerFrameRef.current) return;
    if (!document.fullscreenElement) {
      playerFrameRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(newTime, true);
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = newTime;
    }
  };
  const handleRewind5 = () => {
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(ytPlayerRef.current.getCurrentTime() - 5, true);
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime -= 5;
    }
  };
  const handleForward5 = () => {
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(ytPlayerRef.current.getCurrentTime() + 5, true);
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime += 5;
    }
  };
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      isMuted ? ytPlayerRef.current.unMute() : ytPlayerRef.current.mute();
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.muted = !isMuted;
    }
  };
  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(v * 100);
      if (v > 0) ytPlayerRef.current.unMute();
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.volume = v;
      nativeVideoRef.current.muted = v === 0;
    }
  };
  const handleQualitySelect = (q) => setVideoQuality(q);
  const handleSpeedSelect = (s) => {
    setPlaybackSpeed(s);
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      ytPlayerRef.current.setPlaybackRate(s);
    } else if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = s;
    }
  };
  
  const handleMouseMoveOnPlayer = () => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setAreControlsVisible(false), 2500);
    }
  };
  const handleMouseLeavePlayer = () => {
    if (isPlaying) setAreControlsVisible(false);
  };


  const togglePlayPause = () => {
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      if (isPlaying) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    } else if (nativeVideoRef.current) {
      if (isPlaying) nativeVideoRef.current.pause();
      else nativeVideoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  const triggerScreenPulseAnim = () => {
    setShowPlayPauseAnim(true);
    setTimeout(() => setShowPlayPauseAnim(false), 500);
  };

  const allLessons = useMemo(
    () => course.chapters.flatMap((chapter) => chapter.lessons || []),
    [course.chapters]
  );

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

  const ytPlayerRef = useRef(null);
  const ytSaveIntervalRef = useRef(null);

  // Resume Prompt Logic
  const checkAndPromptResume = (savedTime) => {
    if (savedTime > 5) {
      setResumeTime(savedTime);
      setShowResumePrompt(true);
      // Native video pauses immediately via handleNativeLoaded below
      // YouTube pauses below in onReady
    }
  };

  // Visibility and BeforeUnload saving
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeLesson && showPlayer) {
        if (nativeVideoRef.current && !nativeVideoRef.current.paused) {
          nativeVideoRef.current.pause();
          setShowTabPauseToast(true);
          setTimeout(() => setShowTabPauseToast(false), 3000);
        } else if (ytPlayerRef.current && ytPlayerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
          ytPlayerRef.current.pauseVideo();
          setShowTabPauseToast(true);
          setTimeout(() => setShowTabPauseToast(false), 3000);
        }
      }
    };

    const handleBeforeUnload = () => {
      if (activeLesson) {
        if (activeLesson.media?.provider === 'youtube' && ytPlayerRef.current) {
           const time = ytPlayerRef.current.getCurrentTime();
           if (time) saveProgress(course.id, activeLesson.id, time);
        } else if (nativeVideoRef.current) {
           saveProgress(course.id, activeLesson.id, nativeVideoRef.current.currentTime);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeLesson, showPlayer, course.id]);

  // YouTube Player Initialization
  useEffect(() => {
    if (showPlayer && activeLesson?.type === 'video' && activeLesson.media?.provider === 'youtube') {
      let player;
            if (!ytMountRef.current) return;
      ytMountRef.current.innerHTML = ''; // Clear previous
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      ytMountRef.current.appendChild(container);
      
      loadYouTubeAPI().then((YT) => {
        player = new YT.Player(container, {
          videoId: activeLesson.media.videoId,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: (event) => {
              ytPlayerRef.current = event.target;
              const savedTime = getSavedProgress(course.id, activeLesson.id);
              if (savedTime > 5) {
                event.target.pauseVideo();
                checkAndPromptResume(savedTime);
              } else {
                event.target.playVideo();
              }
              
              ytSaveIntervalRef.current = setInterval(() => {
                const time = event.target.getCurrentTime();
                const dur = event.target.getDuration();
                if (time) {
                  setCurrentTime(time);
                  saveProgress(course.id, activeLesson.id, time);
                }
                if (dur) setDuration(dur);
              }, 1000);
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === YT.PlayerState.PLAYING);
            }
          }
        });
      });
      return () => {
        if (ytSaveIntervalRef.current) clearInterval(ytSaveIntervalRef.current);
        if (ytPlayerRef.current) {
          const time = ytPlayerRef.current.getCurrentTime();
          if (time) saveProgress(course.id, activeLesson.id, time);
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
        }
      };
    }
  }, [showPlayer, activeLesson, course.id]);

  // Handle YouTube custom controls (rewind/forward/speed) - using native keyboard since YouTube iframe captures focus
  useEffect(() => {
    if (!showPlayer || !activeLesson) return;

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      let isNative = nativeVideoRef.current != null;
      let isYT = activeLesson.media?.provider === 'youtube' && ytPlayerRef.current;
      
      if (!isNative && !isYT) return;

      const seekBy = (seconds) => {
        if (isYT) {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          ytPlayerRef.current.seekTo(currentTime + seconds, true);
        } else if (isNative) {
          nativeVideoRef.current.currentTime += seconds;
        }
      };

      const togglePlay = () => {
        if (isYT) {
          if (ytPlayerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
            ytPlayerRef.current.pauseVideo();
          } else {
            ytPlayerRef.current.playVideo();
          }
        } else if (isNative) {
          if (nativeVideoRef.current.paused) {
            nativeVideoRef.current.play();
          } else {
            nativeVideoRef.current.pause();
          }
        }
        triggerScreenPulseAnim();
      };

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          seekBy(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekBy(5);
          break;
        case ' ': // Space
          e.preventDefault();
          togglePlay();
          break;
        case 'n': // Next video
        case 'N':
          if (hasNextLesson) handleNextLesson();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPlayer, activeLesson, hasNextLesson]);
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

  const dragState = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  const handleTimerPointerDown = (e) => {
    if (e.target.closest('.btn-timer-collapse')) return;
    
    // Fallback if not fixed
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
      
      // Update DOM directly for buttery smooth 60fps drag without React re-renders!
      timerRef.current.style.left = `${newX}px`;
      timerRef.current.style.top = `${newY}px`;
    };

    const handlePointerUp = () => {
      dragState.current.isDragging = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      
      // Only update React state ONCE when dragging finishes!
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

  const progressPercent = 0; // fallback for now

    const renderStudyTimerWidget = (isModalContext = false) => {
    const styleProp = customPos
      ? { position: 'fixed', left: `${customPos.x}px`, top: `${customPos.y}px`, zIndex: 99999, transform: 'none' } // We let DOM style.left/top persist!
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

  const contentRequestRef = useRef(null);
  const playerDialogRef = useRef(null);
  const playerCloseRef = useRef(null);
  const lockDialogRef = useRef(null);
  const lockCloseRef = useRef(null);
  const nativeVideoRef = useRef(null);


  const hasCourseAccess = isAdmin || isEnrolled;
  const courseTone = COURSE_TONES[course.id] || 'emerald';

  const closePlayer = useCallback(() => {
    if (nativeVideoRef.current && activeLesson) {
      saveProgress(course.id, activeLesson.id, nativeVideoRef.current.currentTime);
      nativeVideoRef.current.pause();
    }
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      const time = ytPlayerRef.current.getCurrentTime();
      if (time) saveProgress(course.id, activeLesson.id, time);
      ytPlayerRef.current.pauseVideo();
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

    // BYPASS: If lesson already has a videoUrl (like YouTube), play it directly
    if (lesson.type === 'video' && lesson.videoUrl) {
      const ytMatch = lesson.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      let media = ytMatch ? { provider: 'youtube', videoId: ytMatch[1] } : { url: lesson.videoUrl };
      setActiveLesson({ ...lesson, media });
      setShowPlayer(true);
      setLoadingLessonId(null);
      return;
    }

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
        throw new Error(payload.message || 'Nội dung bài học chưa sẵn sàng.');
      }

      setActiveLesson({
        ...lesson,
        ...(content.media ? { media: content.media } : {}),
        ...(content.type === 'text' ? { content: content.content } : {})
      });
      setShowPlayer(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setNotice(error.message || 'Không thể mở bài học lúc này. Vui lòng thử lại.');
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
    if (savedTime > 5 && savedTime < event.currentTarget.duration - 3) {
      event.currentTarget.pause();
      checkAndPromptResume(savedTime);
    }
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
                <span>{activeLesson.type === 'video' ? 'Video bài học' : 'Bài giảng text'}</span>
                <h2 id="player-title">{activeLesson.title}</h2>
              </div>
              <button
                type="button"
                className="cd-icon-button"
                onClick={closePlayer}
                ref={playerCloseRef}
                aria-label="Đóng bài học"
              >
                <X size={20} />
              </button>
            </header>

            <div className="cd-player-dialog__body" style={{ padding: 0 }}>
              {activeLesson.type === 'video' ? (
                <div
                  className={`video-player-frame ${!areControlsVisible && isPlaying ? 'hide-controls' : ''}`}
                  ref={playerFrameRef}
                  onMouseMove={handleMouseMoveOnPlayer}
                  onMouseLeave={handleMouseLeavePlayer}
                  style={{ width: '100%', height: '100%', position: 'relative', background: '#000', overflow: 'hidden', cursor: (!areControlsVisible && isPlaying) ? 'none' : 'default' }}
                >
                  {activeLesson.media?.provider === 'youtube' ? (
                    <div ref={ytMountRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
                  ) : (
                    <video
                      ref={nativeVideoRef}
                      src={activeLesson.media?.url || activeLesson.videoUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }}
                      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  )}

                  {activeLesson.media?.provider === 'youtube' && (
                    <div className="video-canvas-click-overlay" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 60, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {showPlayPauseAnim && (
                        <div className="play-pause-pulse-icon" style={{background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(8px)', color: '#fff'}}>
                          {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="video-overlay-controls yt-theme" style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20, opacity: areControlsVisible || !isPlaying ? 1 : 0, transition: 'opacity 0.2s'}}>
                    <div className="video-progress-scrubber" onClick={handleSeek} style={{height: 5, background: 'rgba(255,255,255,0.3)', cursor: 'pointer', position: 'relative', transition: 'height 0.1s'}} onMouseEnter={(e) => e.currentTarget.style.height = '8px'} onMouseLeave={(e) => e.currentTarget.style.height = '5px'}>
                      <div className="video-progress-fill" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, height: '100%', background: 'var(--cd-accent)', transition: 'width 0.1s linear' }}>
                         <div style={{position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, background: 'var(--cd-accent)', borderRadius: '50%', opacity: 0, transition: 'opacity 0.1s'}} className="scrubber-thumb" />
                      </div>
                    </div>

                    <div className="video-controls-bottom-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff'}}>
                      <div className="controls-left-group" style={{display: 'flex', alignItems: 'center', gap: 16}}>
                        <button type="button" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }} title="Phát / Tạm dừng" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>

                        <button type="button" onClick={handleRewind5} title="Tua lùi 5s" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                          <RotateCcw size={20} />
                        </button>
                        <button type="button" onClick={handleForward5} title="Tua tới 5s" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                          <RotateCw size={20} />
                        </button>
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <button type="button" onClick={toggleMute} style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                          <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} style={{ width: '60px', cursor: 'pointer', accentColor: 'var(--cd-accent)' }} />
                        </div>

                        <span style={{fontSize: 13, fontFamily: 'Roboto, Arial, sans-serif', opacity: 0.9, userSelect: 'none'}}>
                          {formatTime(currentTime)} <span style={{opacity: 0.7}}>/</span> {formatTime(duration)}
                        </span>
                      </div>

                      <div className="controls-right-group" style={{display: 'flex', alignItems: 'center', gap: 16}}>
                        {hasNextLesson && (
                          <button type="button" onClick={handleNextLesson} title="Bài tiếp" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                            <SkipForward size={20} />
                          </button>
                        )}
                        <div style={{position: 'relative'}}>
                          <button type="button" onClick={() => setShowSettingsPopover(!showSettingsPopover)} title="Cài đặt phát" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                            <Settings size={20} />
                          </button>
                          {showSettingsPopover && (
                            <div className="settings-popover-menu" onClick={(e) => e.stopPropagation()} style={{position: 'absolute', bottom: '100%', right: 0, marginBottom: 16, background: 'rgba(28,28,28,0.95)', padding: '8px 0', borderRadius: 8, minWidth: 160, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>
                              <div style={{padding: '4px 16px', fontSize: 13, color: '#aaa', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 4}}>Tốc độ phát</div>
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                                <div key={spd} onClick={() => handleSpeedSelect(spd)} style={{padding: '8px 16px', cursor: 'pointer', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13}} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                  <span>{spd === 1 ? 'Chuẩn' : `${spd}x`}</span>
                                  {playbackSpeed === spd && <CheckCircle size={16} color="var(--cd-accent)" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button type="button" onClick={toggleFullscreen} title="Toàn màn hình" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <article className="cd-text-lesson" style={{ padding: '24px' }}>
                  <FileText size={24} aria-hidden="true" />
                  <p>{activeLesson.content || 'Nội dung bài học đang được cập nhật.'}</p>
                </article>
              )}
            </div>

            <footer className="cd-player-dialog__footer">
              <span>
                <ShieldCheck size={16} />
                Nội dung được cấp sau khi máy chủ kiểm tra quyền học.
              </span>
              {hasNextLesson && (
                <button type="button" className="cd-button cd-button--primary" onClick={handleNextLesson}>
                  Bài tiếp theo
                  <SkipForward size={17} />
                </button>
              )}
            </footer>
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
              aria-label="Đóng thông báo"
            >
              <X size={20} />
            </button>
            <span className="cd-lock-dialog__icon">
              <LockKeyhole size={26} />
            </span>
            <h2 id="lock-dialog-title">
              {lockReason === 'AUTH_REQUIRED'
                ? 'Đăng nhập để tiếp tục học'
                : 'Kích hoạt khóa học để mở bài'}
            </h2>
            <p id="lock-dialog-description">
              {lockReason === 'AUTH_REQUIRED'
                ? 'Phiên đăng nhập chưa có hoặc đã hết hạn. Hãy đăng nhập đúng tài khoản học viên rồi thử lại.'
                : course.isFree
                ? 'Bài đầu tiên là nội dung xem thử. Hãy kích hoạt khóa học miễn phí để mở các bài tiếp theo.'
                : 'Bài học này chỉ mở cho tài khoản đã đăng ký và được hệ thống xác nhận quyền học.'}
            </p>
            <button type="button" className="cd-button cd-button--primary cd-button--full" onClick={openEnrollment}>
              {course.isFree ? 'Kích hoạt miễn phí' : 'Xem thông tin đăng ký'}
              <ArrowRight size={17} />
            </button>
          </section>
        </div>,
        document.body
      )}

      
      {showResumePrompt && activeLesson && createPortal(
        <div className={`cd-dialog-backdrop cd-tone-${courseTone}`} style={{ zIndex: 10002 }}>
          <div className="cd-lock-dialog" style={{ textAlign: 'center', padding: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Tiếp tục xem bài học?</h3>
            <p style={{ marginBottom: '25px', color: 'var(--cd-color-text-secondary)' }}>
              Bạn đang xem tới <strong>{Math.floor(resumeTime / 60)} phút {Math.floor(resumeTime % 60)} giây</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="cd-button cd-button--secondary"
                onClick={() => {
                  setShowResumePrompt(false);
                  if (activeLesson.media?.provider === 'youtube' && ytPlayerRef.current) {
                    ytPlayerRef.current.seekTo(0);
                    ytPlayerRef.current.playVideo();
                  } else if (nativeVideoRef.current) {
                    nativeVideoRef.current.currentTime = 0;
                    nativeVideoRef.current.play();
                  }
                }}
              >
                Xem lại từ đầu
              </button>
              <button 
                className="cd-button cd-button--primary"
                onClick={() => {
                  setShowResumePrompt(false);
                  if (activeLesson.media?.provider === 'youtube' && ytPlayerRef.current) {
                    ytPlayerRef.current.seekTo(resumeTime);
                    ytPlayerRef.current.playVideo();
                  } else if (nativeVideoRef.current) {
                    nativeVideoRef.current.currentTime = resumeTime;
                    nativeVideoRef.current.play();
                  }
                }}
              >
                Tiếp tục xem
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {showTabPauseToast && createPortal(
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 20px', 
          borderRadius: '8px', zIndex: 10003, fontWeight: 'bold'
        }}>
          Video đã tự động tạm dừng vì bạn chuyển tab!
        </div>,
        document.body
      )}
\n      <CourseEnrollmentModal
        isOpen={showEnrollment}
        onClose={() => setShowEnrollment(false)}
        course={course}
        onEnrollSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}
