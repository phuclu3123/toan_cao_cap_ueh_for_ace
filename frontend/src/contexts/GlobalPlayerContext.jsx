import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '../utils/apiClient';
import { useAuth } from './AuthContext';

const GlobalPlayerContext = createContext();

export function GlobalPlayerProvider({ children }) {
  const { currentUser } = useAuth();
  const identity = currentUser?.id || '';
  const [playerState, setPlayerState] = useState({
    isOpen: false,
    isMinimized: false,
    courseId: null,
    activeLesson: null,
    allLessons: [],
    courseTone: 'emerald',
    customPos: null,
    course: null // Need full course info for progress saving logic if needed, or just courseId
  });

  const [loadingNext, setLoadingNext] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const reportPlaybackStatus = useCallback((status) => setPlaybackStatus(status), []);
  const [playerNotice, setPlayerNotice] = useState('');
  const [accessDeniedStatus, setAccessDeniedStatus] = useState(null); // { isDenied: bool, reason: str }
  const nextLessonRequestIdRef = useRef(0);

  useEffect(() => {
    const clearSessionBoundContent = () => {
      nextLessonRequestIdRef.current += 1;
      setLoadingNext(false);
      setPlaybackStatus(null);
      setPlayerNotice('');
      setAccessDeniedStatus(null);
      setPlayerState((current) => ({
        ...current,
        isOpen: false,
        isMinimized: false,
        courseId: null,
        activeLesson: null,
        allLessons: [],
        course: null,
        customPos: null
      }));
    };

    window.addEventListener('ueh-tcc-session-changed', clearSessionBoundContent);
    // /me can also change identity after an expiry or another tab's logout;
    // those changes do not emit a local login event.
    const timer = window.setTimeout(clearSessionBoundContent, 0);
    return () => {
      nextLessonRequestIdRef.current += 1;
      window.clearTimeout(timer);
      window.removeEventListener('ueh-tcc-session-changed', clearSessionBoundContent);
    };
  }, [identity]);

  // Every entry point (list, next lesson, saved position) uses server authorization.
  const playLesson = useCallback(async (course, lesson, allLessons, courseTone = 'emerald', options = {}) => {
    // Closing sales does not revoke study rights. The content endpoint below
    // remains the authority for every lesson and every playback entry point.
    const requestId = ++nextLessonRequestIdRef.current;
    if (!options.keepPresentation) setLoadingNext(false);
    setPlayerNotice('');
    try {
      const response = await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/lessons/${encodeURIComponent(lesson.id)}/content`);
      const payload = await response.json().catch(() => ({}));
      if (requestId !== nextLessonRequestIdRef.current) return { opened: false, cancelled: true };
      if (response.status === 401 || response.status === 403) {
        setPlayerState((current) => ({ ...current, isOpen: false, activeLesson: null, isMinimized: false }));
        setAccessDeniedStatus({ isDenied: true, reason: response.status === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED', courseId: course.id, course, lesson, allLessons, courseTone });
        return { opened: false, denied: true };
      }
      const content = payload.data;
      if (!response.ok || content?.courseId !== course.id || content?.lessonId !== lesson.id || content?.type !== lesson.type || (lesson.type === 'video' && !content.media)) throw new Error(payload.message || 'Không thể mở bài học lúc này.');
      setPlayerState((current) => ({
        ...current, isOpen: true,
        isMinimized: options.keepPresentation ? current.isMinimized : false,
        courseId: course.id, course,
        courseAccessAllowed: !content.preview || options.accessAllowed === true || (current.courseId === course.id && current.courseAccessAllowed === true),
        activeLesson: { ...lesson, ...(content.media ? { media: content.media } : {}), ...(content.type === 'text' ? { content: content.content } : {}) },
        allLessons, courseTone
      }));
      setAccessDeniedStatus(null);
      return { opened: true };
    } catch (error) {
      if (requestId !== nextLessonRequestIdRef.current) return { opened: false, cancelled: true };
      const message = error.message || 'Không thể mở bài học lúc này.';
      setPlayerNotice(message);
      return { opened: false, message };
    }
  }, []);

  const closePlayer = useCallback(() => {
    nextLessonRequestIdRef.current += 1;
    setLoadingNext(false);
    setPlaybackStatus(null);
    setPlayerState(prev => ({
      ...prev,
      isOpen: false,
      activeLesson: null,
      isMinimized: false
    }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }));
  }, []);

  const setCustomPos = useCallback((pos) => {
    setPlayerState(prev => ({ ...prev, customPos: pos }));
  }, []);

  const playNextLesson = useCallback(async () => {
    const { activeLesson, allLessons, course, courseTone } = playerState;
    if (!activeLesson || !course || loadingNext) return;
    const index = allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
    const next = allLessons[index + 1];
    if (index < 0 || !next) return;
    setLoadingNext(true);
    const pending = playLesson(course, next, allLessons, courseTone, { keepPresentation: true, accessAllowed: playerState.courseAccessAllowed });
    const requestId = nextLessonRequestIdRef.current;
    try { await pending; } finally { if (requestId === nextLessonRequestIdRef.current) setLoadingNext(false); }
  }, [playerState, playLesson, loadingNext]);

  const value = useMemo(() => ({
    ...playerState,
    loadingNext,
    playbackStatus,
    reportPlaybackStatus,
    playerNotice,
    accessDeniedStatus,
    playLesson,
    closePlayer,
    toggleMinimize,
    playNextLesson,
    setCustomPos,
    setAccessDeniedStatus
  }), [playerState, loadingNext, playbackStatus, reportPlaybackStatus, playerNotice, accessDeniedStatus, playLesson, closePlayer, toggleMinimize, playNextLesson, setCustomPos]);

  return (
    <GlobalPlayerContext.Provider value={value}>
      {children}
    </GlobalPlayerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalPlayer() {
  return useContext(GlobalPlayerContext);
}
