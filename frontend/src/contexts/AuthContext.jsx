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
  const [currentUser, setCurrentUserState] = useState(null);
  const currentUserRef = useRef(null);
  const authRequestIdRef = useRef(0);
  const authSyncRef = useRef(null);
  const [sessionError, setSessionError] = useState('');

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

  const commitUser = useCallback(user => {
    const clientUser = toClientUser(user);
    // Keep the reference stable across identical /me responses. Consumers must
    // not restart access checks on every focus or background session check.
    if (JSON.stringify(currentUserRef.current) !== JSON.stringify(clientUser)) {
      currentUserRef.current = clientUser; setCurrentUserState(clientUser);
    }
    for (const key of ['ueh_tcc_cached_user', 'ueh_tcc_user']) {
      if (clientUser) safeLocalStorage.setItem(key, JSON.stringify(clientUser));
      else safeLocalStorage.removeItem(key);
    }
  }, []);
  // Login/profile responses have already been verified by the backend. A late
  // anonymous bootstrap response must not overwrite a newly completed login.
  const setCurrentUser = useCallback(user => {
    authRequestIdRef.current += 1; authSyncRef.current = null;
    commitUser(user); setSessionError(''); setLoading(false);
  }, [commitUser]);
  const syncUserFromBackend = useCallback(({ force = false } = {}) => {
    if (authSyncRef.current && !force) return authSyncRef.current;
    const requestId = ++authRequestIdRef.current;
    const sessionSignal = safeLocalStorage.getItem('ueh_tcc_session_signal');
    const isCurrent = () => requestId === authRequestIdRef.current
      && sessionSignal === safeLocalStorage.getItem('ueh_tcc_session_signal');
    const request = (async () => {
      try {
        const payload = await readApiJson(await apiFetch('/api/auth/me', { signal: AbortSignal.timeout(12_000) }));
        if (isCurrent()) { commitUser(payload.user || null); setSessionError(''); }
      } catch (err) {
        if (isCurrent()) {
          if (err.status === 401) { commitUser(null); setSessionError(''); }
          else setSessionError('Chưa kết nối được hệ thống tài khoản. Vui lòng thử lại.');
        }
      } finally {
        if (requestId === authRequestIdRef.current) { setLoading(false); authSyncRef.current = null; }
      }
      return currentUserRef.current;
    })();
    authSyncRef.current = request;
    return request;
  }, [commitUser]);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    const response = await apiFetch('/api/auth/logout', { method: 'POST' });
    await readApiJson(response);

    setCurrentUser(null);
    safeLocalStorage.removeItem('ueh_tcc_user');
    safeLocalStorage.removeItem('ueh_tcc_cached_user');
    window.dispatchEvent(new Event('ueh-tcc-session-changed'));
  }, [setCurrentUser]);

  useEffect(() => {
    // This transport page exchanges OAuth proofs only. Its parallel anonymous
    // bootstrap could otherwise erase the original tab's just-verified cache.
    if (window.location.pathname === '/auth/google') return;
    let unsubscribe = () => {};

    const refreshSession = async event => {
      // getIdToken refreshes an expiring token without asking for email again.
      // Navbar's token listener renews only a matching active backend session.
      if (auth?.currentUser) void auth.currentUser.getIdToken().catch(() => {});
      await syncUserFromBackend({ force: event?.type === 'ueh-tcc-session-changed' });
    };

    refreshSession();
    const broadcastSession = () => safeLocalStorage.setItem('ueh_tcc_session_signal', `${Date.now()}:${Math.random()}`);
    window.addEventListener('ueh-tcc-session-changed', broadcastSession);
    window.addEventListener('ueh-tcc-session-changed', refreshSession);
    window.addEventListener('ueh-tcc-auth-check-required', refreshSession);
    const handleStorage = event => {
      if (event.key === 'ueh_tcc_session_signal') syncUserFromBackend({ force: true });
    };
    window.addEventListener('storage', handleStorage);
    const handleVisible = () => { if (document.visibilityState === 'visible') refreshSession(); };
    window.addEventListener('focus', refreshSession);
    document.addEventListener('visibilitychange', handleVisible);
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshSession();
    }, 5 * 60_000);

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) refreshSession();
      });
    }

    return () => {
      unsubscribe();
      window.clearInterval(refreshTimer);
      window.removeEventListener('ueh-tcc-session-changed', refreshSession);
      window.removeEventListener('ueh-tcc-auth-check-required', refreshSession);
      window.removeEventListener('ueh-tcc-session-changed', broadcastSession);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refreshSession);
      document.removeEventListener('visibilitychange', handleVisible);
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
    sessionError,
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
