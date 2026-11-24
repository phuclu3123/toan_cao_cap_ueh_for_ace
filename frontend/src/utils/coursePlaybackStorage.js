import { auth } from '../firebase';
import { safeLocalStorage as storage } from './safeStorage';

export const PLAYBACK_PROGRESS_EVENT = 'ueh-tcc-playback-progress';

const readJson = (key) => {
  try { return JSON.parse(storage.getItem(key)); } catch { return null; }
};

export function getPlaybackOwner() {
  const user = readJson('ueh_tcc_user');
  return String(user?.id || user?.uid || auth?.currentUser?.uid || 'guest');
}

export const getMediaKey = (lesson) => lesson?.media?.videoId || lesson?.media?.url || lesson?.id || '';
const progressKey = (owner, courseId, lesson) => `ueh_playback_v2:${owner}:${courseId}:${lesson.id}:${encodeURIComponent(getMediaKey(lesson))}`;
const recentKey = (owner, courseId) => `ueh_playback_recent_v2:${owner}:${courseId}`;

export function readPlaybackProgress(owner, courseId, lesson) {
  const saved = readJson(progressKey(owner, courseId, lesson));
  if (saved && Number.isFinite(saved.time) && saved.time >= 0) return saved;
  // Read old keys without deleting or rewriting any existing history.
  const user = readJson('ueh_tcc_user');
  const aliases = [...new Set([owner, user?.uid, auth?.currentUser?.uid].filter(Boolean))];
  for (const alias of aliases) {
    for (const mediaId of new Set([getMediaKey(lesson), lesson.id])) {
      const time = Number(storage.getItem(`course_playback_progress_${alias}_${mediaId}`));
      if (Number.isFinite(time) && time > 5) return { time, duration: 0 };
    }
  }
  return null;
}

export function savePlaybackProgress(owner, courseId, lesson, time, duration) {
  if (!owner || !lesson || !Number.isFinite(time) || time < 0 || !Number.isFinite(duration) || duration <= 0) return;
  const record = {
    lessonId: lesson.id, mediaKey: getMediaKey(lesson), title: lesson.title,
    time: Math.min(time, duration), duration, updatedAt: Date.now(),
    completed: time >= Math.max(duration - 5, duration * .98)
  };
  storage.setItem(progressKey(owner, courseId, lesson), JSON.stringify(record));
  storage.setItem(recentKey(owner, courseId), JSON.stringify(record));
  window.dispatchEvent(new CustomEvent(PLAYBACK_PROGRESS_EVENT, { detail: { owner, courseId } }));
}

export function readRecentPlayback(courseId) {
  const saved = readJson(recentKey(getPlaybackOwner(), courseId));
  return saved && Number.isFinite(saved.time) && saved.time > 5 && !saved.completed ? saved : null;
}

export function readPlayerPreferences() {
  const value = readJson(`ueh_player_preferences_v1:${getPlaybackOwner()}`) || {};
  return {
    volume: Number.isFinite(value.volume) ? Math.max(0, Math.min(1, value.volume)) : 1,
    speed: [.5, .75, 1, 1.25, 1.5, 1.75, 2].includes(value.speed) ? value.speed : 1,
    autoNext: value.autoNext === true,
    pauseOnHidden: value.pauseOnHidden !== false
  };
}

export function savePlayerPreferences(value) {
  storage.setItem(`ueh_player_preferences_v1:${getPlaybackOwner()}`, JSON.stringify(value));
}

export function formatPlaybackTime(seconds = 0) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor(value % 3600 / 60).toString().padStart(2, '0');
  const remainder = (value % 60).toString().padStart(2, '0');
  return hours ? `${hours}:${minutes}:${remainder}` : `${minutes}:${remainder}`;
}
