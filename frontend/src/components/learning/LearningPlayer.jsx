import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Check, ChevronDown, ExternalLink, ListVideo, Loader2, LockKeyhole, Maximize2, Minimize2, Monitor, Pause, Play, RotateCcw, RotateCw, Settings2, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useGlobalPlayer } from '../../contexts/GlobalPlayerContext';
import CourseUnlockModal from '../modals/CourseUnlockModal';
import { getCourseById } from '../../data/coursesData';
import { formatPlaybackTime as formatTime, getMediaKey, getPlaybackOwner, readPlaybackProgress, readPlayerPreferences, savePlaybackProgress, savePlayerPreferences } from '../../utils/coursePlaybackStorage';
import { describeYouTubeError, loadYouTubePlayerAPI } from '../../utils/youtubePlayer';
import '../../assets/styles/LearningPlayer.css';
import '../../assets/styles/PlayerFullscreen.css';

export default function LearningPlayer() {
  const state = useGlobalPlayer();
  const gate = state.accessDeniedStatus;
  const course = gate?.course || getCourseById(gate?.courseId || state.courseId);
  return <>
    {createPortal(state.isOpen && state.activeLesson ? <LessonViewer key={`${state.courseId}:${state.activeLesson.id}:${getMediaKey(state.activeLesson)}`} state={state} /> : null, document.body)}
    <CourseUnlockModal isOpen={Boolean(gate)} course={course} lessonTitle={gate?.lesson?.title}
      onClose={() => state.setAccessDeniedStatus(null)}
      onUnlocked={async () => {
        state.setAccessDeniedStatus(null);
        if (gate?.lesson) await state.playLesson(course, gate.lesson, gate.allLessons, gate.courseTone, { accessAllowed: true });
      }} />
  </>;
}

function LessonViewer({ state }) {
  const { activeLesson: lesson, courseId, course, allLessons, isMinimized, customPos, closePlayer, toggleMinimize, setCustomPos, loadingNext, playerNotice, playNextLesson, playLesson } = state;
  const [owner] = useState(getPlaybackOwner);
  const [saved] = useState(() => readPlaybackProgress(owner, courseId, lesson));
  const [preferences, setPreferences] = useState(readPlayerPreferences);
  const [resumePending, setResumePending] = useState(Boolean(saved && saved.time > 5 && !saved.completed));
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(lesson.type !== 'video');
  const [buffering, setBuffering] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(() => window.innerWidth >= 1000);
  const [theater, setTheater] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [canvasFeedback, setCanvasFeedback] = useState(null);
  const dialogRef = useRef(null);
  const mountRef = useRef(null);
  const nativeRef = useRef(null);
  const youtubeRef = useRef(null);
  const settingsRef = useRef(null);
  const dragRef = useRef(null);
  const hasStartedRef = useRef(false);
  const nextBusyRef = useRef(false);
  const sampleRef = useRef({ time: 0, duration: 0 });
  const prefsRef = useRef(preferences);
  const lastVolumeRef = useRef(preferences.volume || 1);
  const resumePendingRef = useRef(resumePending);
  const feedbackTimeoutRef = useRef(null);
  const youtube = lesson.media?.provider === 'youtube';
  const video = lesson.type === 'video';
  const activeIndex = allLessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = allLessons[activeIndex + 1];
  const hasNext = Boolean(nextLesson);
  const sourceUrl = youtube ? `https://www.youtube.com/watch?v=${encodeURIComponent(lesson.media.videoId)}&t=${Math.floor(time)}s` : lesson.media?.url;

  // Lưu đúng tài khoản lúc mở bài, kể cả khi phiên đăng nhập thay đổi sau đó.
  const persist = useCallback(() => {
    if (!hasStartedRef.current || !video) return;
    let current = sampleRef.current;
    try {
      if (youtubeRef.current?.getCurrentTime) current = { time: youtubeRef.current.getCurrentTime(), duration: youtubeRef.current.getDuration() };
      else if (nativeRef.current) current = { time: nativeRef.current.currentTime, duration: nativeRef.current.duration };
    } catch { /* Keep the last valid sample while a player is being disposed. */ }
    if (Number.isFinite(current.time) && Number.isFinite(current.duration)) sampleRef.current = current;
    savePlaybackProgress(owner, courseId, lesson, sampleRef.current.time, sampleRef.current.duration);
  }, [owner, courseId, lesson, video]);

  useEffect(() => {
    if (!state.accessDeniedStatus) return;
    persist();
    youtubeRef.current?.pauseVideo?.();
    nativeRef.current?.pause();
  }, [state.accessDeniedStatus, persist]);

  useEffect(() => {
    prefsRef.current = preferences;
    if (preferences.volume > 0) lastVolumeRef.current = preferences.volume;
    savePlayerPreferences(preferences);
    if (youtubeRef.current?.setVolume && ready) {
      youtubeRef.current.setVolume(preferences.volume * 100);
      if (preferences.volume === 0) youtubeRef.current.mute();
      else youtubeRef.current.unMute();
      youtubeRef.current.setPlaybackRate(preferences.speed);
    }
    if (nativeRef.current) {
      nativeRef.current.volume = preferences.volume;
      nativeRef.current.muted = preferences.volume === 0;
      nativeRef.current.playbackRate = preferences.speed;
    }
  }, [preferences, ready]);

  useEffect(() => { resumePendingRef.current = resumePending; }, [resumePending]);

  // Tạo/dọn iframe theo bài học, có timeout và lỗi rõ ràng thay vì màn hình đen.
  useEffect(() => {
    if (!youtube || !mountRef.current) return;
    let disposed = false;
    let instance;
    let poll;
    let lastSave = 0;
    setReady(false);
    setError('');
    setPlaying(false);
    const target = document.createElement('div');
    mountRef.current.replaceChildren(target);
    const timeout = window.setTimeout(() => {
      if (!disposed) setError('Video tải lâu hơn bình thường. Bạn có thể thử lại hoặc mở trên YouTube.');
    }, 20000);
    loadYouTubePlayerAPI().then((YT) => {
      if (disposed || !target.isConnected) return;
      instance = new YT.Player(target, {
        width: '100%', height: '100%', videoId: lesson.media.videoId,
        playerVars: { autoplay: resumePendingRef.current ? 0 : 1, controls: 0, playsinline: 1, rel: 0, fs: 0, iv_load_policy: 3, origin: window.location.origin, widget_referrer: window.location.href },
        events: {
          onReady: ({ target: player }) => {
            if (disposed) return;
            window.clearTimeout(timeout);
            youtubeRef.current = player;
            const frame = player.getIframe();
            frame.title = lesson.title;
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            frame.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
            player.setVolume(prefsRef.current.volume * 100);
            if (prefsRef.current.volume === 0) player.mute();
            player.setPlaybackRate(prefsRef.current.speed);
            setDuration(player.getDuration() || 0);
            setReady(true);
            setError('');
            if (!resumePendingRef.current) player.playVideo();
            poll = window.setInterval(() => {
              if (disposed) return;
              const current = player.getCurrentTime();
              const length = player.getDuration();
              if (Number.isFinite(current) && Number.isFinite(length)) {
                sampleRef.current = { time: current, duration: length };
                setTime(current);
                setDuration(length);
              }
              if (player.getPlayerState() === YT.PlayerState.PLAYING && Date.now() - lastSave > 5000) { persist(); lastSave = Date.now(); }
            }, 500);
          },
          onStateChange: ({ data }) => {
            if (disposed) return;
            setPlaying(data === YT.PlayerState.PLAYING);
            setBuffering(data === YT.PlayerState.BUFFERING);
            if (data === YT.PlayerState.PLAYING) { hasStartedRef.current = true; setResumePending(false); setEnded(false); setError(''); }
            if (data === YT.PlayerState.PAUSED) persist();
            if (data === YT.PlayerState.ENDED) { setEnded(true); persist(); }
          },
          onError: ({ data }) => { if (!disposed) { window.clearTimeout(timeout); setError(describeYouTubeError(data)); setPlaying(false); setBuffering(false); } },
          onAutoplayBlocked: () => { if (!disposed) { setPlaying(false); setMessage('Nhấn Phát để bắt đầu video.'); } }
        }
      });
      // Keep the instance immediately so closing before onReady also destroys it.
      youtubeRef.current = instance;
      const frame = instance.getIframe?.();
      if (frame) frame.referrerPolicy = 'strict-origin-when-cross-origin';
    }).catch((reason) => { if (!disposed) { window.clearTimeout(timeout); setError(reason.message); } });
    return () => {
      persist();
      disposed = true;
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      try { instance?.destroy(); } catch { /* Detached iframe. */ }
      youtubeRef.current = null;
    };
  }, [youtube, lesson, attempt, persist]);

  // Lưu khi đóng, đổi bài, chuyển tab hoặc rời web; không tự phát sau đăng nhập.
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) return;
      persist();
      if (!prefsRef.current.pauseOnHidden) return;
      if (youtubeRef.current?.getPlayerState?.() === 1) { youtubeRef.current.pauseVideo(); setMessage('Đã tạm dừng khi bạn chuyển tab.'); }
      else if (nativeRef.current && !nativeRef.current.paused) { nativeRef.current.pause(); setMessage('Đã tạm dừng khi bạn chuyển tab.'); }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', persist);
    const interval = window.setInterval(persist, 5000);
    return () => {
      persist();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', persist);
      window.removeEventListener('beforeunload', persist);
    };
  }, [persist]);

  const handlePlay = useCallback(() => {
    if (!ready || resumePending) return;
    setMessage('');
    if (youtubeRef.current?.playVideo) youtubeRef.current.playVideo();
    else nativeRef.current?.play().catch(() => setMessage('Trình duyệt đang chặn tự phát. Hãy nhấn Phát lại.'));
  }, [ready, resumePending]);

  const handleTogglePlay = useCallback(() => {
    if (!ready || resumePending) return;
    if (youtubeRef.current?.getPlayerState) {
      const status = youtubeRef.current.getPlayerState();
      if (status === 1 || status === 3) youtubeRef.current.pauseVideo();
      else handlePlay();
    } else if (nativeRef.current && !nativeRef.current.paused) nativeRef.current.pause();
    else handlePlay();
  }, [ready, resumePending, handlePlay]);

  const handleCanvasClick = () => {
    if (!ready || resumePending || error) return;
    handleTogglePlay();
    setCanvasFeedback(playing || buffering ? 'pause' : 'play');
    window.clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = window.setTimeout(() => setCanvasFeedback(null), 450);
  };
  useEffect(() => () => window.clearTimeout(feedbackTimeoutRef.current), []);

  const handleSeek = useCallback((value) => {
    const length = sampleRef.current.duration;
    if (!ready || !Number.isFinite(length) || length <= 0 || resumePending) return;
    const next = Math.max(0, Math.min(length, value));
    setTime(next);
    sampleRef.current.time = next;
    if (youtubeRef.current?.seekTo) youtubeRef.current.seekTo(next, true);
    else if (nativeRef.current) nativeRef.current.currentTime = next;
    setEnded(false);
  }, [ready, resumePending]);

  const handleResume = (startOver = false) => {
    if (!ready) return;
    const next = startOver ? 0 : duration > 0 ? Math.min(saved.time, Math.max(0, duration - 1)) : saved.time;
    resumePendingRef.current = false;
    setResumePending(false);
    setTime(next);
    sampleRef.current.time = next;
    if (youtubeRef.current?.seekTo) { youtubeRef.current.seekTo(next, true); youtubeRef.current.playVideo(); }
    else if (nativeRef.current) { nativeRef.current.currentTime = next; nativeRef.current.play().catch(() => setMessage('Nhấn Phát để tiếp tục.')); }
  };

  const handleNext = useCallback(async () => {
    if (!hasNext || loadingNext || nextBusyRef.current) return;
    nextBusyRef.current = true;
    persist();
    try { await playNextLesson(); } finally { nextBusyRef.current = false; }
  }, [hasNext, loadingNext, persist, playNextLesson]);

  const handleMute = useCallback(() => {
    setPreferences((value) => ({ ...value, volume: value.volume > 0 ? 0 : lastVolumeRef.current }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setCountdown(ended && preferences.autoNext && hasNext ? 5 : null), 0);
    return () => window.clearTimeout(timer);
  }, [ended, preferences.autoNext, hasNext]);
  useEffect(() => {
    if (countdown === null) return;
    const timer = window.setTimeout(() => {
      if (countdown === 0) { setCountdown(null); handleNext(); }
      else setCountdown((value) => value === null ? null : value - 1);
    }, countdown === 0 ? 0 : 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, handleNext]);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (dialogRef.current?.requestFullscreen) dialogRef.current.requestFullscreen().catch(() => setMessage('Trình duyệt không hỗ trợ chế độ toàn màn hình này.'));
    else if (nativeRef.current?.webkitEnterFullscreen) nativeRef.current.webkitEnterFullscreen();
  }, []);
  useEffect(() => {
    const handleChange = () => setFullscreen(document.fullscreenElement === dialogRef.current);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // Giữ focus trong hộp thoại lớn, trả focus về đúng nút đã mở bài học.
  useEffect(() => {
    if (isMinimized) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus?.({ preventScroll: true }); };
  }, [isMinimized]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (settingsOpen) setSettingsOpen(false);
        else if (playlistOpen) setPlaylistOpen(false);
        else if (!document.fullscreenElement) closePlayer();
        return;
      }
      if (event.key === 'Tab' && !isMinimized) {
        const elements = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], iframe, [tabindex="0"]')].filter((node) => node.getClientRects().length);
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        return;
      }
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, button, select, textarea, a, [contenteditable="true"]')) return;
      if (isMinimized && !dialogRef.current?.contains(document.activeElement)) return;
      if (resumePending) return;
      switch (event.key.toLowerCase()) {
        case ' ': case 'k': event.preventDefault(); handleTogglePlay(); break;
        case 'arrowleft': case 'j': event.preventDefault(); handleSeek(sampleRef.current.time - 10); break;
        case 'arrowright': case 'l': event.preventDefault(); handleSeek(sampleRef.current.time + 10); break;
        case 'm': handleMute(); break;
        case 'f': handleFullscreen(); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePlayer, settingsOpen, playlistOpen, isMinimized, resumePending, handleTogglePlay, handleSeek, handleFullscreen, handleMute]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleOutside = (event) => { if (!settingsRef.current?.contains(event.target)) setSettingsOpen(false); };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [settingsOpen]);

  // Kéo cửa sổ nhỏ bằng tiêu đề; không bắt thao tác trên nút hay thanh tua.
  const handleDragStart = (event) => {
    if (!isMinimized || event.button !== 0 || !event.isPrimary || event.target.closest('button')) return;
    const rect = dialogRef.current.getBoundingClientRect();
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleDragMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const rect = dialogRef.current.getBoundingClientRect();
    setCustomPos({ x: Math.max(12, Math.min(drag.left + event.clientX - drag.x, window.innerWidth - rect.width - 12)), y: Math.max(12, Math.min(drag.top + event.clientY - drag.y, window.innerHeight - rect.height - 12)) });
  };
  useEffect(() => {
    if (!isMinimized) return;
    const handleResize = () => {
      const rect = dialogRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(12, Math.min(rect.left, window.innerWidth - rect.width - 12));
      const y = Math.max(12, Math.min(rect.top, window.innerHeight - rect.height - 12));
      if (Math.abs(x - rect.left) > 1 || Math.abs(y - rect.top) > 1) setCustomPos({ x, y });
    };
    window.addEventListener('resize', handleResize);
    const frame = window.requestAnimationFrame(() => {
      setSettingsOpen(false); setPlaylistOpen(false); handleResize();
    });
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('resize', handleResize); };
  }, [isMinimized, setCustomPos]);

  const handleNativeReady = () => {
    const element = nativeRef.current;
    if (!element) return;
    setReady(true);
    setDuration(element.duration);
    sampleRef.current.duration = element.duration;
    element.volume = prefsRef.current.volume;
    element.playbackRate = prefsRef.current.speed;
    if (saved?.time >= element.duration - 5) setResumePending(false);
    if (!resumePendingRef.current) element.play().catch(() => setMessage('Nhấn Phát để bắt đầu video.'));
  };

  const controlsDisabled = !ready || Boolean(error) || resumePending;
  const progress = duration > 0 ? Math.min(100, time / duration * 100) : 0;

  return <div className={`learning-player-backdrop ${isMinimized ? 'is-mini' : ''} ${theater ? 'is-theater' : ''}`} onPointerDown={(event) => { if (event.target === event.currentTarget && !isMinimized) closePlayer(); }}>
    <section className={`learning-player ${isMinimized ? 'is-mini' : ''}`} ref={dialogRef} role="dialog" aria-modal={!isMinimized} aria-labelledby="learning-player-title" tabIndex={-1}
      style={isMinimized && customPos ? { left: customPos.x, top: customPos.y, right: 'auto', bottom: 'auto' } : undefined}>
      <header className="learning-player__header" onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} onLostPointerCapture={() => { dragRef.current = null; }}>
        <div className="learning-player__heading"><span>Bài {String(activeIndex + 1).padStart(2, '0')} / {allLessons.length}</span><h2 id="learning-player-title">{lesson.title}</h2></div>
        <div className="learning-player__header-actions">
          {!isMinimized && video && <button type="button" className="learning-icon-button learning-theater-button" aria-label="Chế độ tập trung" aria-pressed={theater} title="Chế độ tập trung" onClick={() => setTheater((value) => !value)}><Monitor size={19} /></button>}
          {video && <button type="button" className="learning-icon-button" aria-label={isMinimized ? 'Mở rộng trình phát' : 'Thu nhỏ trình phát'} title={isMinimized ? 'Mở rộng' : 'Cửa sổ nhỏ'} onClick={toggleMinimize}>{isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}</button>}
          <button type="button" className="learning-icon-button" aria-label="Đóng bài học" title="Đóng · Esc" onClick={closePlayer}><X size={20} /></button>
        </div>
      </header>

      <div className={`learning-player__workspace ${playlistOpen && !isMinimized ? 'has-playlist' : ''}`}>
        <div className="learning-player__main">
          {video ? <>
            <div className="learning-player__stage">
              {youtube ? <div className="learning-player__youtube" ref={mountRef} /> : <video ref={nativeRef} src={lesson.media?.url} playsInline preload="metadata"
                onLoadedMetadata={handleNativeReady} onCanPlay={() => setBuffering(false)}
                onTimeUpdate={(event) => { sampleRef.current = { time: event.currentTarget.currentTime, duration: event.currentTarget.duration }; setTime(event.currentTarget.currentTime); }}
                onPlay={() => { hasStartedRef.current = true; setPlaying(true); setEnded(false); setMessage(''); }}
                onPlaying={() => { setPlaying(true); setBuffering(false); }} onWaiting={() => setBuffering(true)}
                onPause={() => { setPlaying(false); persist(); }} onEnded={() => { setEnded(true); setPlaying(false); persist(); }}
                onError={() => { setReady(false); setError('Nguồn video chưa phát được. Hãy tải lại hoặc chọn bài khác.'); }}
                onClick={handleCanvasClick} />}

              {youtube && ready && !resumePending && !error && <button type="button" className="learning-player__canvas-action" tabIndex={-1}
                aria-label={playing ? 'Nhấn vào video để tạm dừng' : 'Nhấn vào video để phát'}
                onMouseDown={(event) => event.preventDefault()} onClick={handleCanvasClick}>
                {canvasFeedback && <span className="learning-player__canvas-feedback" aria-hidden="true">{canvasFeedback === 'pause' ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}</span>}
              </button>}

              {!ready && !error && !resumePending && <div className="learning-player__state" role="status"><Loader2 size={28} className="learning-spin" /><span>Đang mở bài giảng…</span></div>}
              {buffering && !resumePending && !error && <div className="learning-player__buffer" role="status"><Loader2 size={24} className="learning-spin" /><span className="sr-only">Đang tải video</span></div>}
              {error && <div className="learning-player__state learning-player__state--error" role="alert"><AlertCircle size={28} /><p>{error}</p><div><button type="button" className="learning-glass-button" onClick={() => { setError(''); setReady(false); setAttempt((value) => value + 1); nativeRef.current?.load(); }}><RotateCcw size={16} /> Thử lại</button>{youtube && <a className="learning-glass-button" href={sourceUrl} target="_blank" rel="noopener noreferrer">Mở YouTube <ExternalLink size={15} /></a>}</div></div>}
              {resumePending && !error && <div className="learning-player__resume"><div className="learning-player__resume-card"><span>Tiếp tục bài giảng</span><h3>Bạn đã xem đến {formatTime(saved.time)}</h3><p>Trở lại đúng đoạn đang học dở.</p><div><button type="button" className="learning-primary-button" disabled={!ready} onClick={() => handleResume(false)}>{ready ? <Play size={17} fill="currentColor" /> : <Loader2 size={17} className="learning-spin" />} Xem tiếp</button><button type="button" className="learning-glass-button" disabled={!ready} onClick={() => handleResume(true)}><RotateCcw size={16} /> Từ đầu</button></div></div></div>}
            </div>

            <div className="learning-player__controls">
              <input className="learning-player__seek" type="range" min={0} max={duration || 1} step=".1" value={Math.min(time, duration || 0)} disabled={controlsDisabled || duration <= 0} onChange={(event) => handleSeek(Number(event.target.value))} aria-label="Tua video" aria-valuetext={`${formatTime(time)} trên ${formatTime(duration)}`} style={{ '--seek-progress': `${progress}%` }} />
              <div className="learning-player__control-row">
                <div className="learning-player__playback-controls">
                  <button type="button" className="learning-icon-button learning-play-button" disabled={controlsDisabled} onClick={handleTogglePlay} aria-label={playing ? 'Tạm dừng' : 'Phát video'} title={playing ? 'Tạm dừng · Space' : 'Phát · Space'}>{playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}</button>
                  <button type="button" className="learning-icon-button learning-skip-button" disabled={controlsDisabled || duration <= 0} onClick={() => handleSeek(time - 10)} aria-label="Lùi 10 giây" title="Lùi 10 giây · ←"><RotateCcw size={19} /><small>10</small></button>
                  <button type="button" className="learning-icon-button learning-skip-button" disabled={controlsDisabled || duration <= 0} onClick={() => handleSeek(time + 10)} aria-label="Tới 10 giây" title="Tới 10 giây · →"><RotateCw size={19} /><small>10</small></button>
                  <span className="learning-player__time">{formatTime(time)} <span>/ {formatTime(duration)}</span></span>
                </div>
                <div className="learning-player__utility-controls">
                  <div className="learning-player__volume"><button type="button" className="learning-icon-button" aria-label={preferences.volume === 0 ? 'Bật âm thanh' : 'Tắt âm thanh'} title="Âm thanh · M" onClick={handleMute}>{preferences.volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button><input type="range" aria-label="Âm lượng" min={0} max={1} step={.05} value={preferences.volume} onChange={(event) => setPreferences((value) => ({ ...value, volume: Number(event.target.value) }))} /></div>
                  <div className="learning-player__settings-anchor" ref={settingsRef}>
                    <button type="button" className="learning-icon-button" aria-label="Cài đặt trình phát" title="Cài đặt" aria-expanded={settingsOpen} aria-controls="learning-player-settings" onClick={() => setSettingsOpen((value) => !value)}><Settings2 size={19} /></button>
                    {settingsOpen && <div className="learning-player__settings" id="learning-player-settings"><div className="learning-player__settings-heading">Cài đặt phát <button type="button" className="learning-icon-button" aria-label="Đóng cài đặt" onClick={() => setSettingsOpen(false)}><X size={16} /></button></div><span>Tốc độ phát</span><div className="learning-player__speeds">{[.5, .75, 1, 1.25, 1.5, 2].map((speed) => <button type="button" key={speed} aria-pressed={preferences.speed === speed} onClick={() => setPreferences((value) => ({ ...value, speed }))}>{speed}×</button>)}</div><label><span>Tự chuyển bài tiếp</span><input type="checkbox" role="switch" checked={preferences.autoNext} onChange={(event) => setPreferences((value) => ({ ...value, autoNext: event.target.checked }))} /></label><label><span>Tạm dừng khi chuyển tab</span><input type="checkbox" role="switch" checked={preferences.pauseOnHidden} onChange={(event) => setPreferences((value) => ({ ...value, pauseOnHidden: event.target.checked }))} /></label><small>Space: phát/dừng · ← →: tua 10 giây · F: toàn màn hình</small></div>}
                  </div>
                  <button type="button" className="learning-icon-button" aria-label={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} title="Toàn màn hình · F" onClick={handleFullscreen}>{fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</button>
                </div>
              </div>
            </div>
          </> : <article className="learning-player__text">{lesson.content || 'Nội dung bài học đang được cập nhật.'}</article>}

          {!isMinimized && <footer className="learning-player__footer">
            <button type="button" className="learning-text-button" aria-expanded={playlistOpen} onClick={() => { setPlaylistOpen((value) => !value); setSettingsOpen(false); }}><ListVideo size={18} /> Bài học <ChevronDown size={15} /></button>
            <div className="learning-player__feedback" role="status">{playerNotice || message || (countdown !== null ? `Chuyển bài sau ${countdown}s` : ended ? 'Bạn đã xem xong bài này.' : '')}{countdown !== null && <button type="button" onClick={() => setCountdown(null)}>Hủy</button>}</div>
            <button type="button" className="learning-text-button learning-next-button" disabled={!hasNext || loadingNext} onClick={handleNext}>{loadingNext ? <Loader2 size={17} className="learning-spin" /> : <SkipForward size={17} />} Bài tiếp</button>
          </footer>}
        </div>
        {playlistOpen && !isMinimized && <aside className="learning-player__playlist" aria-label="Danh sách bài học">
          <div className="learning-player__playlist-heading"><div><span>Lộ trình của bạn</span><strong>Bài giảng · {allLessons.length} bài</strong></div><button type="button" className="learning-icon-button" aria-label="Đóng danh sách bài" onClick={() => setPlaylistOpen(false)}><X size={18} /></button></div>
          <div className="learning-player__lesson-list">{allLessons.map((item, index) => <button type="button" key={item.id}
            className={`learning-player__lesson ${item.id === lesson.id ? 'is-current' : ''}`}
            aria-current={item.id === lesson.id ? 'true' : undefined}
            disabled={loadingNext}
            onClick={() => { persist(); playLesson(course, item, allLessons, state.courseTone); }}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><strong>{item.title}</strong><small>{item.duration}{item.isLocked && !state.courseAccessAllowed ? ' · Cần mở khóa' : ''}</small></div>
            {item.isLocked && !state.courseAccessAllowed ? <LockKeyhole size={16} aria-label="Bài học đã khóa" /> : item.id === lesson.id && <Check size={16} />}
          </button>)}</div>
        </aside>}
      </div>
    </section>
  </div>;
}
