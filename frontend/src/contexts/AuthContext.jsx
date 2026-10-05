import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  auth,
  onAuthStateChanged,
  isFirebaseConfigured,
  signOut as firebaseSignOut
} from '../firebase';
import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient';
import { safeLocalStorage } from '../utils/safeStorage';
import { getTierByPoints, getTierProgress } from '../services/reputationService';

const AuthContext = createContext(null);

const USER_POINTS_KEY = 'ueh_tcc_user_points';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const authRequestIdRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [reputationPoints, setReputationPoints] = useState(() => {
    return Number(safeLocalStorage.getItem(USER_POINTS_KEY)) || 65;
  });

  // Calculate tier & tier progress
  const tier = getTierByPoints(reputationPoints);
  const tierProgress = getTierProgress(reputationPoints);

  // Sync points with storage
  const addReputationPoints = useCallback((pts) => {
    setReputationPoints(prev => {
      const next = Math.max(0, prev + Number(pts));
      safeLocalStorage.setItem(USER_POINTS_KEY, next.toString());
      return next;
    });
  }, []);

  const syncUserFromBackend = useCallback(async () => {
    const requestId = authRequestIdRef.current + 1;
    authRequestIdRef.current = requestId;
    try {
      const payload = await readApiJson(await apiFetch('/api/auth/me'));
      if (payload.user) {
        const clientUser = toClientUser(payload.user);
        if (requestId === authRequestIdRef.current) {
          setCurrentUser(clientUser);
          safeLocalStorage.setItem('ueh_tcc_cached_user', JSON.stringify(clientUser));
        }
        return clientUser;
      }
    } catch (err) {
      console.warn('Không thể đồng bộ thông tin người dùng từ backend:', err);
      if (requestId === authRequestIdRef.current && err.status === 401) {
        setCurrentUser(null);
        safeLocalStorage.removeItem('ueh_tcc_cached_user');
      }
    } finally {
      if (requestId === authRequestIdRef.current) setLoading(false);
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    const response = await apiFetch('/api/auth/logout', { method: 'POST' });
    await readApiJson(response);

    authRequestIdRef.current += 1;
    setCurrentUser(null);
    safeLocalStorage.removeItem('ueh_tcc_user');
    safeLocalStorage.removeItem('ueh_tcc_cached_user');
    window.dispatchEvent(new Event('ueh-tcc-session-changed'));
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    const refreshSession = async () => {
      await syncUserFromBackend();
    };

    refreshSession();
    window.addEventListener('ueh-tcc-session-changed', refreshSession);

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) refreshSession();
      });
    }

    return () => {
      unsubscribe();
      window.removeEventListener('ueh-tcc-session-changed', refreshSession);
    };
  }, [syncUserFromBackend]);

  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    reputationPoints,
    tier,
    tierProgress,
    addReputationPoints,
    syncUserFromBackend,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
