const memoryStorage = new Map();

export const safeLocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStorage.get(`local_${key}`) || null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStorage.set(`local_${key}`, String(value));
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      memoryStorage.delete(`local_${key}`);
    }
  }
};

export const safeSessionStorage = {
  getItem(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return memoryStorage.get(`session_${key}`) || null;
    }
  },
  setItem(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      memoryStorage.set(`session_${key}`, String(value));
    }
  },
  removeItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      memoryStorage.delete(`session_${key}`);
    }
  }
};
