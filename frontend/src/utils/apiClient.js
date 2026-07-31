import { API_BASE_URL } from '../config';

const resolveApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Authorization')) {
    const token = localStorage.getItem('ueh_tcc_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(resolveApiUrl(path), {
    ...options,
    headers,
    credentials: 'include'
  });
};

export const readApiJson = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.desc || 'Yêu cầu không thể hoàn tất.');
    error.status = response.status;
    error.data = data;
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
