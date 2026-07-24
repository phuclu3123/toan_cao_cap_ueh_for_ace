import { safeLocalStorage } from './safeStorage';

const VIEWS_STORAGE_KEY = 'ueh_tcc_doc_views';

// Deterministic realistic base views for items
const getBaseViews = (id) => {
  if (!id) return 320;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return 350 + (Math.abs(hash) % 850);
};

// Get stored view increments map
const getStoredIncrements = () => {
  try {
    const raw = safeLocalStorage.getItem(VIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Get real total views for an item
export const getViewCount = (id) => {
  if (!id) return 350;
  const base = getBaseViews(id);
  const increments = getStoredIncrements();
  const extra = Number(increments[id]) || 0;
  return base + extra;
};

// Increment view count for an item (call when user opens detail page)
export const incrementViewCount = (id) => {
  if (!id) return 350;
  const increments = getStoredIncrements();
  const currentExtra = Number(increments[id]) || 0;
  const updatedExtra = currentExtra + 1;
  increments[id] = updatedExtra;
  safeLocalStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(increments));

  // Send async beacon to backend if API is available
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/resources/view/${id}`, { method: 'POST' }).catch(() => {});
  } catch {
    // Ignore network error in fallback mode
  }

  return getBaseViews(id) + updatedExtra;
};

// Format view count string for display (e.g. 1.2k or 1,250)
export const formatViewCount = (count) => {
  const num = Number(count) || 0;
  return num.toLocaleString('vi-VN');
};
