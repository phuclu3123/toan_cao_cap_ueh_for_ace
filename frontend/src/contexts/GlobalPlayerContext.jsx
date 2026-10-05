import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '../utils/apiClient';

const GlobalPlayerContext = createContext();

export function GlobalPlayerProvider({ children }) {
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
  const [playerNotice, setPlayerNotice] = useState('');
  const [accessDeniedStatus, setAccessDeniedStatus] = useState(null); // { isDenied: bool, reason: str }
  const nextLessonRequestIdRef = useRef(0);

  useEffect(() => {
    const clearSessionBoundContent = () => {
      nextLessonRequestIdRef.current += 1;
      setLoadingNext(false);
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
    return () => {
      window.removeEventListener('ueh-tcc-session-changed', clearSessionBoundContent);
    };
  }, []);

  const playLesson = useCallback((course, activeLesson, allLessons, courseTone = 'emerald') => {
    setPlayerState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      courseId: course.id,
      course,
      activeLesson,
      allLessons: allLessons || prev.allLessons,
      courseTone
    }));
    setAccessDeniedStatus(null);
    setPlayerNotice('');
  }, []);

  const closePlayer = useCallback(() => {
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

  // Fetch content for next lesson
  const playNextLesson = useCallback(async () => {
    const { activeLesson, allLessons, courseId } = playerState;
    if (!activeLesson || !allLessons.length || !courseId) return;

    const currentIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
    if (currentIndex < 0 || currentIndex >= allLessons.length - 1) return;

    const nextLesson = allLessons[currentIndex + 1];
    const requestId = nextLessonRequestIdRef.current + 1;
    nextLessonRequestIdRef.current = requestId;
    setLoadingNext(true);
    setPlayerNotice('');

    try {
      const response = await apiFetch(`/api/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(nextLesson.id)}/content`);
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        if (requestId === nextLessonRequestIdRef.current) {
          setAccessDeniedStatus({
            isDenied: true,
            reason: response.status === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED'
          });
        }
        return;
      }

      const content = payload.data;
      if (
        !response.ok
        || !content
        || content.courseId !== courseId
        || content.lessonId !== nextLesson.id
        || content.type !== nextLesson.type
        || (nextLesson.type === 'video' && !content.media)
      ) {
        throw new Error(payload.message || 'Nội dung bài học chưa sẵn sàng.');
      }

      if (requestId !== nextLessonRequestIdRef.current) return;
      setPlayerState((current) => {
        if (current.courseId !== courseId || current.activeLesson?.id !== activeLesson.id) {
          return current;
        }
        return {
          ...current,
          activeLesson: {
            ...nextLesson,
            ...(content.media ? { media: content.media } : {}),
            ...(content.type === 'text' ? { content: content.content } : {})
          }
        };
      });
    } catch (error) {
      if (requestId === nextLessonRequestIdRef.current && error.name !== 'AbortError') {
        setPlayerNotice(error.message || 'Không thể mở bài học lúc này.');
      }
    } finally {
      if (requestId === nextLessonRequestIdRef.current) setLoadingNext(false);
    }
  }, [playerState]);

  const value = useMemo(() => ({
    ...playerState,
    loadingNext,
    playerNotice,
    accessDeniedStatus,
    playLesson,
    closePlayer,
    toggleMinimize,
    playNextLesson,
    setCustomPos,
    setAccessDeniedStatus
  }), [playerState, loadingNext, playerNotice, accessDeniedStatus, playLesson, closePlayer, toggleMinimize, playNextLesson, setCustomPos]);

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
