import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, onAuthStateChanged, isFirebaseConfigured } from '../firebase';
import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient';
import { safeLocalStorage } from '../utils/safeStorage';
import { getTierByPoints, getTierProgress } from '../services/reputationService';

const AuthContext = createContext(null);

const USER_POINTS_KEY = 'ueh_tcc_user_points';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = safeLocalStorage.getItem('ueh_tcc_cached_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

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
    try {
      const token = safeLocalStorage.getItem('ueh_tcc_token');
      if (!token) return null;

      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const payload = await readApiJson(res);
        if (payload.user) {
          const clientUser = toClientUser(payload.user);
          setCurrentUser(clientUser);
          safeLocalStorage.setItem('ueh_tcc_cached_user', JSON.stringify(clientUser));
          return clientUser;
        }
      }
    } catch (err) {
      console.warn('Không thể đồng bộ thông tin người dùng từ backend:', err);
    }
    return null;
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const u = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Sinh viên UEH',
            displayName: firebaseUser.displayName || 'Sinh viên UEH',
            photoURL: firebaseUser.photoURL || '',
            avatar: firebaseUser.photoURL || '',
            cohort: 'K50 UEH',
            isInstructor: firebaseUser.email?.includes('phuclu') || false
          };
          setCurrentUser(u);
          safeLocalStorage.setItem('ueh_tcc_cached_user', JSON.stringify(u));
          syncUserFromBackend().catch(() => {});
        } else {
          // If no firebase session, check local token
          syncUserFromBackend().then(synced => {
            if (!synced) {
              setCurrentUser(null);
              safeLocalStorage.removeItem('ueh_tcc_cached_user');
            }
          });
        }
        setLoading(false);
      });
    } else {
      syncUserFromBackend().finally(() => setLoading(false));
    }

    return () => unsubscribe();
  }, [syncUserFromBackend]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    reputationPoints,
    tier,
    tierProgress,
    addReputationPoints,
    syncUserFromBackend
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
