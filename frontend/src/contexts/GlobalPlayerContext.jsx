import { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
    setPlayerState(prev => {
      if (!prev.activeLesson || !prev.allLessons.length) return prev;
      const currentIndex = prev.allLessons.findIndex(l => l.id === prev.activeLesson.id);

      if (currentIndex >= 0 && currentIndex < prev.allLessons.length - 1) {
        const nextLesson = prev.allLessons[currentIndex + 1];

        // Let's handle the fetch asynchronously
        setTimeout(async () => {
          setLoadingNext(true);
          setPlayerNotice('');

          if (nextLesson.type === 'video' && nextLesson.videoUrl) {
            const ytMatch = nextLesson.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            let media = ytMatch ? { provider: 'youtube', videoId: ytMatch[1] } : { url: nextLesson.videoUrl };

            setPlayerState(p => ({
              ...p,
              activeLesson: { ...nextLesson, media }
            }));
            setLoadingNext(false);
            return;
          }

          try {
            const response = await apiFetch(`/api/courses/${encodeURIComponent(prev.courseId)}/lessons/${encodeURIComponent(nextLesson.id)}/content`);
            const payload = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
               setAccessDeniedStatus({
                 isDenied: true,
                 reason: response.status === 401 ? 'AUTH_REQUIRED' : 'ENROLLMENT_REQUIRED'
               });
               setLoadingNext(false);
               return;
            }

            const content = payload.data;
            if (!response.ok || !content || content.type !== nextLesson.type) {
              throw new Error(payload.message || 'Nội dung bài học chưa sẵn sàng.');
            }

            setPlayerState(p => ({
              ...p,
              activeLesson: {
                ...nextLesson,
                ...(content.media ? { media: content.media } : {}),
                ...(content.type === 'text' ? { content: content.content } : {})
              }
            }));
          } catch (error) {
            setPlayerNotice(error.message || 'Không thể mở bài học lúc này.');
          } finally {
            setLoadingNext(false);
          }
        }, 0);

        return prev; // keep previous state while loading, or we can show a loading indicator on player
      }
      return prev;
    });
  }, []);

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
