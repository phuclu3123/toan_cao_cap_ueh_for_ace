import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { formatPlaybackTime, getMediaKey, PLAYBACK_PROGRESS_EVENT, readRecentPlayback } from '../utils/coursePlaybackStorage';

export default function CourseContinueWatching({ course, onContinue }) {
  const [recent, setRecent] = useState(() => readRecentPlayback(course.id));
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const handleRefresh = () => setRecent(readRecentPlayback(course.id));
    const handleSessionChanged = () => { setDismissed(false); handleRefresh(); };
    window.addEventListener(PLAYBACK_PROGRESS_EVENT, handleRefresh);
    window.addEventListener('storage', handleRefresh);
    window.addEventListener('ueh-tcc-session-changed', handleSessionChanged);
    return () => {
      window.removeEventListener(PLAYBACK_PROGRESS_EVENT, handleRefresh);
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('ueh-tcc-session-changed', handleSessionChanged);
    };
  }, [course.id]);
  const lesson = course.chapters.flatMap((chapter) => chapter.lessons || []).find((item) => item.id === recent?.lessonId);
  if (dismissed || course.isClosed || !recent || !lesson || (lesson.media && getMediaKey(lesson) !== recent.mediaKey)) return null;
  return <div className="course-continue-banner">
    <div><span>Tiếp tục từ lần trước</span><strong>{lesson.title}</strong><small>Đang xem tại {formatPlaybackTime(recent.time)}{recent.duration > 0 ? ` / ${formatPlaybackTime(recent.duration)}` : ''}</small></div>
    <button type="button" className="cd-button cd-button--primary" onClick={() => onContinue(lesson)}><Play size={16} fill="currentColor" /> Xem tiếp</button>
    <button type="button" className="course-continue-dismiss" aria-label="Ẩn gợi ý xem tiếp" onClick={() => setDismissed(true)}><X size={18} /></button>
  </div>;
}
