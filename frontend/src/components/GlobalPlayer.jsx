import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGlobalPlayer } from '../contexts/GlobalPlayerContext';
import { auth } from '../firebase';
import {
  Maximize2, Minimize2, Pause, Play, ShieldCheck, SkipForward, X,
  CheckCircle, RotateCcw, RotateCw, Settings, Volume2, VolumeX, FileText, LockKeyhole, ArrowRight
} from 'lucide-react';

const getProgressKey = (courseId, lessonId) => {
  let userId = 'guest';
  try {
    const savedUser = localStorage.getItem('ueh_tcc_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user && user.uid) userId = user.uid;
    }
  } catch { /* Browser storage can be unavailable in privacy mode. */ }
  if (userId === 'guest') userId = auth?.currentUser?.uid || 'guest';
  return `course_playback_progress_${userId}_${lessonId}`;
};

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
  } catch { /* Progress persistence is best-effort. */ }
};

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

export default function GlobalPlayer() {
  const {
    isOpen, isMinimized, courseId, course, activeLesson, allLessons, courseTone, customPos,
    loadingNext, accessDeniedStatus, closePlayer, toggleMinimize, playNextLesson, setCustomPos, setAccessDeniedStatus
  } = useGlobalPlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [showPlayPauseAnim, setShowPlayPauseAnim] = useState(false);
  const [resumePromptData, setResumePromptData] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showTabPauseToast, setShowTabPauseToast] = useState(false);

  const controlsTimeoutRef = useRef(null);
  const playerFrameRef = useRef(null);
  const ytMountRef = useRef(null);
  const nativeVideoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytSaveIntervalRef = useRef(null);
  const playerDialogRef = useRef(null);
  const playerDragState = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTimeUpdate = (e) => setCurrentTime(e.target.currentTime);
  const handleLoadedMetadata = (e) => setDuration(e.target.duration);

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

  const activeIndex = activeLesson ? allLessons.findIndex((lesson) => lesson.id === activeLesson.id) : -1;
  const hasNextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1;

  const handleNextLessonWrap = () => {
    if (activeLesson?.media?.provider === 'youtube' && ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const time = ytPlayerRef.current.getCurrentTime();
          if (time) saveProgress(courseId, activeLesson.media?.videoId || activeLesson.id, time);
        }
      } catch { /* The player may already be disposed. */ }
    } else if (nativeVideoRef.current) {
      saveProgress(courseId, activeLesson.media?.videoId || activeLesson.id, nativeVideoRef.current.currentTime);
    }
    playNextLesson();
  };

  const checkAndPromptResume = (savedTime) => {
    if (savedTime > 5) {
      setResumeTime(savedTime);
      setShowResumePrompt(true);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeLesson && isOpen) {
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
           if (time) saveProgress(courseId, activeLesson.media?.videoId || activeLesson.id, time);
        } else if (nativeVideoRef.current) {
           saveProgress(courseId, activeLesson.media?.videoId || activeLesson.id, nativeVideoRef.current.currentTime);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeLesson, isOpen, courseId]);

  useEffect(() => {
    if (isOpen && activeLesson?.type === 'video' && activeLesson.media?.provider === 'youtube') {
      if (!ytMountRef.current) return;
      ytMountRef.current.innerHTML = '';
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      ytMountRef.current.appendChild(container);

      const savedTime = getSavedProgress(courseId, activeLesson.media.videoId);
      loadYouTubeAPI().then((YT) => {
        new YT.Player(container, {
          videoId: activeLesson.media.videoId,
          playerVars: { autoplay: savedTime > 5 ? 0 : 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: (event) => {
              ytPlayerRef.current = event.target;
              if (savedTime > 5) {
                event.target.pauseVideo();
                setResumePromptData({ time: savedTime });
              } else {
                event.target.playVideo();
              }

              ytSaveIntervalRef.current = setInterval(() => {
                const time = event.target.getCurrentTime();
                const dur = event.target.getDuration();
                if (time) {
                  setCurrentTime(time);
                  saveProgress(courseId, activeLesson.media?.videoId || activeLesson.id, time);
                }
                if (dur) setDuration(dur);
              }, 1000);
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === YT.PlayerState.PLAYING);
              if (event.data === YT.PlayerState.PLAYING) setIsVideoEnded(false);
              if (event.data === YT.PlayerState.ENDED) setIsVideoEnded(true);
            }
          }
        });
      });
      return () => {
        if (ytSaveIntervalRef.current) clearInterval(ytSaveIntervalRef.current);
        if (ytPlayerRef.current) {
          try {
            if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
              const time = ytPlayerRef.current.getCurrentTime();
              if (time) saveProgress(courseId, activeLesson.media?.videoId || activeLesson.id, time);
            }
          } catch { /* The player may already be disposed. */ }
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
        }
      };
    }
  }, [isOpen, activeLesson, courseId]);

  useEffect(() => {
    if (!isOpen || !activeLesson) return;

    const handleKeyDown = (e) => {
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

      const doTogglePlay = () => {
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
          doTogglePlay();
          break;
        case 'n':
        case 'N':
          if (hasNextLesson) handleNextLessonWrap();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // Keyboard bindings are recreated with the active lesson/player state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeLesson, hasNextLesson]);

  const handlePlayerPointerDown = (e) => {
    if (!isMinimized) return;
    if (e.target.closest('button') || e.target.closest('.video-overlay-controls') || e.target.closest('.video-canvas-click-overlay')) return;
    // Don't drag if clicking on resize handle (usually bottom right edge)
    if (e.clientX > e.currentTarget.getBoundingClientRect().right - 20 && e.clientY > e.currentTarget.getBoundingClientRect().bottom - 20) return;

    if (window.getComputedStyle(playerDialogRef.current).position !== 'fixed') {
        const rect = playerDialogRef.current.getBoundingClientRect();
        playerDialogRef.current.style.position = 'fixed';
        playerDialogRef.current.style.left = `${rect.left}px`;
        playerDialogRef.current.style.top = `${rect.top}px`;
        playerDialogRef.current.style.margin = '0';
    }

    const currentLeft = parseInt(playerDialogRef.current.style.left) || 0;
    const currentTop = parseInt(playerDialogRef.current.style.top) || 0;

    playerDragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: currentLeft,
      initialTop: currentTop
    };

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      if (!playerDragState.current.isDragging) return;

      const dx = moveEvent.clientX - playerDragState.current.startX;
      const dy = moveEvent.clientY - playerDragState.current.startY;

      let newX = playerDragState.current.initialLeft + dx;
      let newY = playerDragState.current.initialTop + dy;

      newX = Math.max(10, Math.min(window.innerWidth - playerDialogRef.current.offsetWidth - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - playerDialogRef.current.offsetHeight - 10, newY));

      playerDialogRef.current.style.left = `${newX}px`;
      playerDialogRef.current.style.top = `${newY}px`;
      playerDialogRef.current.style.bottom = 'auto';
      playerDialogRef.current.style.right = 'auto';
    };

    const handlePointerUp = () => {
      playerDragState.current.isDragging = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const finalX = parseInt(playerDialogRef.current.style.left);
      const finalY = parseInt(playerDialogRef.current.style.top);
      if (!isNaN(finalX) && !isNaN(finalY)) {
         setCustomPos({ x: finalX, y: finalY });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleNativeLoaded = (event) => {
    if (!activeLesson) return;
    const savedTime = getSavedProgress(courseId, activeLesson.media?.videoId || activeLesson.id);
    if (savedTime > 5 && savedTime < event.currentTarget.duration - 3) {
      event.currentTarget.pause();
      checkAndPromptResume(savedTime);
    }
  };

  if (!isOpen || !activeLesson) return null;

  return createPortal(
    <>
      <div
        className={`cd-dialog-backdrop cd-tone-${courseTone} ${isMinimized ? 'minimized-player-container' : ''}`}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closePlayer();
        }}
        style={isMinimized ? { zIndex: 100100 } : { zIndex: 100100 }}
      >
        <section
          className="cd-player-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="player-title"
          ref={playerDialogRef}
          tabIndex={-1}
          onPointerDown={handlePlayerPointerDown}
          style={isMinimized && customPos ? { left: `${customPos.x}px`, top: `${customPos.y}px`, bottom: 'auto', right: 'auto' } : (isMinimized ? {} : { left: '', top: '', bottom: '', right: '', position: '', margin: '' })}
        >
          <header className="cd-player-dialog__header">
            <div>
              <span>{activeLesson.type === 'video' ? 'Video bài học' : 'Bài giảng text'}</span>
              <h2 id="player-title">{activeLesson.title}</h2>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '8px', zIndex: 50 }}>
              {activeLesson.type === 'video' && (
                <button
                  type="button"
                  className="cd-icon-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize();
                  }}
                  aria-label={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
                >
                  {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                </button>
              )}
              <button
                type="button"
                className="cd-icon-button"
                onClick={(e) => {
                  e.stopPropagation();
                  closePlayer();
                }}
                aria-label="Đóng bài học"
              >
                <X size={20} />
              </button>
            </div>
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
                    onLoadedData={handleNativeLoaded}
                    onEnded={() => setIsVideoEnded(true)}
                    onPlay={() => setIsVideoEnded(false)}
                    onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }}
                    style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                )}

                {resumePromptData && !isMinimized && (
                  <div id="yt-resume-prompt" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff', backdropFilter: 'blur(4px)'}}>
                    <div style={{background: '#1f1f1f', padding: '24px 32px', borderRadius: 12, maxWidth: 400, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'}}>
                      <h3 style={{marginTop: 0, marginBottom: 16, fontSize: 20}}>Tiếp tục bài học?</h3>
                      <p style={{marginBottom: 24, color: '#ccc', lineHeight: 1.5, fontSize: 15}}>
                        Bạn đang xem ở phút <strong style={{color: 'var(--cd-accent)', fontSize: 16}}>{formatTime(resumePromptData.time)}</strong>. Xem tiếp hay xem từ đầu?
                      </p>
                      <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setResumePromptData(null);
                            if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
                              ytPlayerRef.current.seekTo(resumePromptData.time, true);
                              ytPlayerRef.current.playVideo();
                            }
                        }} style={{padding: '10px 24px', background: 'var(--cd-accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'opacity 0.2s'}} onMouseEnter={e => e.currentTarget.style.opacity=0.9} onMouseLeave={e => e.currentTarget.style.opacity=1}>
                          Xem tiếp
                        </button>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setResumePromptData(null);
                            if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
                              ytPlayerRef.current.seekTo(0, true);
                              ytPlayerRef.current.playVideo();
                            }
                        }} style={{padding: '10px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.2s'}} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          Từ đầu
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeLesson.media?.provider === 'youtube' && (
                  <div className="video-canvas-click-overlay" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 60, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    {showPlayPauseAnim && (
                      <div className="play-pause-pulse-icon" style={{background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(8px)', color: '#fff'}}>
                        {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
                      </div>
                    )}
                    {isVideoEnded && hasNextLesson && !isMinimized && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleNextLessonWrap(); }} style={{marginTop: 20, padding: '12px 24px', background: 'var(--cd-accent)', color: '#fff', border: 'none', borderRadius: 30, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>
                        <SkipForward size={20} />
                        Bài tiếp theo
                      </button>
                    )}
                  </div>
                )}

                <div className="video-overlay-controls yt-theme" style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20, opacity: areControlsVisible || !isPlaying ? 1 : 0, transition: 'opacity 0.2s'}}>
                  <div className="video-progress-scrubber" onClick={handleSeek} style={{height: 5, background: 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'height 0.1s'}} onMouseEnter={(e) => e.currentTarget.style.height = '8px'} onMouseLeave={(e) => e.currentTarget.style.height = '5px'}>
                    <div className="video-progress-fill" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, height: '100%', background: 'var(--cd-accent)', boxShadow: '0 0 8px var(--cd-accent)', transition: 'width 0.1s linear' }}>
                        <div style={{position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, background: 'var(--cd-accent)', borderRadius: '50%', opacity: 0, transition: 'opacity 0.1s'}} className="scrubber-thumb" />
                    </div>
                  </div>

                  <div className="video-controls-bottom-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff'}}>
                    <div className="controls-left-group" style={{display: 'flex', alignItems: 'center', gap: 16}}>
                      <button type="button" onClick={() => { togglePlayPause(); triggerScreenPulseAnim(); }} title="Phát / Tạm dừng" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>

                      <button type="button" onClick={handleNextLessonWrap} title="Bài tiếp theo" disabled={!hasNextLesson} style={{background: 'none', border: 'none', color: '#fff', cursor: hasNextLesson ? 'pointer' : 'not-allowed', opacity: hasNextLesson ? 1 : 0.4, display: 'flex', alignItems: 'center', marginLeft: -4}}>
                        <SkipForward size={24} fill="currentColor" />
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
            <button
              type="button"
              className="cd-button cd-button--primary"
              onClick={handleNextLessonWrap}
              disabled={!hasNextLesson || loadingNext}
              style={!hasNextLesson ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {loadingNext ? 'Đang mở...' : 'Bài tiếp theo'}
              <SkipForward size={17} />
            </button>
          </footer>
        </section>
      </div>

      {accessDeniedStatus && (
        <div
          className={`cd-dialog-backdrop cd-tone-${courseTone}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAccessDeniedStatus(null);
          }}
          style={{ zIndex: 100101 }}
        >
          <section
            className="cd-lock-dialog"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="cd-icon-button cd-lock-dialog__close"
              onClick={() => setAccessDeniedStatus(null)}
            >
              <X size={20} />
            </button>
            <span className="cd-lock-dialog__icon">
              <LockKeyhole size={26} />
            </span>
            <h2 id="lock-dialog-title">
              {accessDeniedStatus.reason === 'AUTH_REQUIRED'
                ? 'Đăng nhập để tiếp tục học'
                : 'Kích hoạt khóa học để mở bài'}
            </h2>
            <p id="lock-dialog-description">
              {accessDeniedStatus.reason === 'AUTH_REQUIRED'
                ? 'Phiên đăng nhập chưa có hoặc đã hết hạn. Hãy đăng nhập đúng tài khoản học viên rồi thử lại.'
                : 'Bài học này chỉ mở cho tài khoản đã đăng ký và được hệ thống xác nhận quyền học.'}
            </p>
            <button type="button" className="cd-button cd-button--primary cd-button--full" onClick={() => {
              setAccessDeniedStatus(null);
              closePlayer();
              // In global player, we can't easily trigger the enrollment modal if they are not on course page.
              // We could navigate them to the course page.
              window.location.href = `/course/${course.slug}`;
            }}>
              Xem thông tin khóa học
              <ArrowRight size={17} />
            </button>
          </section>
        </div>
      )}

      {showResumePrompt && (
        <div id="native-resume-prompt" className={`cd-dialog-backdrop cd-tone-${courseTone}`} style={{ zIndex: 100102 }}>
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
                  if (nativeVideoRef.current) {
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
                  if (nativeVideoRef.current) {
                    nativeVideoRef.current.currentTime = resumeTime;
                    nativeVideoRef.current.play();
                  }
                }}
              >
                Tiếp tục xem
              </button>
            </div>
          </div>
        </div>
      )}

      {showTabPauseToast && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 20px',
          borderRadius: '8px', zIndex: 100103, fontWeight: 'bold'
        }}>
          Video đã tự động tạm dừng vì bạn chuyển tab!
        </div>
      )}
    </>,
    document.body
  );
}
