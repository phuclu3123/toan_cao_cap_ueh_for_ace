import { API_BASE_URL } from '../config.js';

const resolveApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = (path, options = {}) => {
  const headers = new Headers(options.headers || {});

  return fetch(resolveApiUrl(path), {
    ...options,
    headers,
    credentials: 'include'
  });
};

export const readApiJson = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    const error = new Error('Máy chủ Backend trả về phản hồi không hợp lệ.');
    error.status = response.status;
    error.code = 'INVALID_API_RESPONSE';
    throw error;
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    const error = new Error('Máy chủ Backend trả về phản hồi không hợp lệ.');
    error.status = response.status;
    error.code = 'INVALID_API_RESPONSE';
    throw error;
  }

  if (!response.ok) {
    const error = new Error(data.message || data.desc || 'Yêu cầu không thể hoàn tất.');
    error.status = response.status;
    if (typeof data.code === 'string' && data.code.trim()) {
      error.code = data.code.trim();
    }
    error.data = data;
    const retryAfter = Number.parseInt(response.headers.get('Retry-After') || '', 10);
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      error.retryAfterSeconds = retryAfter;
    }
    throw error;
  }

  return data;
};

export const toClientUser = (user) => {
  if (!user) return null;
  const {
    id,
    uid,
    username,
    email,
    name,
    role,
    phoneNumber,
    school,
    bio,
    avatar,
    photoURL
  } = user;
  return { id, uid, username, email, name, role, phoneNumber, school, bio, avatar, photoURL };
};
