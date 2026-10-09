import { useCallback, useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogIn, PlusCircle, Loader2, CheckCircle2,
  Sun, Moon, Globe, Search, ChevronDown, ChevronRight, BookOpen, LogOut, Bookmark, MessageSquare
} from 'lucide-react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import NotificationDropdown from './community/NotificationDropdown';
import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient';
import { syncFirebaseUserWithBackend } from '../services/authService';
import {
  beginGithubOAuth,
  ensureGoogleOAuthAvailable,
  GITHUB_OAUTH_MODE_KEY,
  GITHUB_OAUTH_RESULT_MESSAGE,
  GITHUB_OAUTH_STATE_KEY
} from '../services/oauthService';
import { getInitials } from '../utils/userInitials';
import '../assets/styles/Navbar.css';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  signInWithRedirect,
  onIdTokenChanged,
  getRedirectResult,
  FIREBASE_REDIRECT_PROVIDER_KEY
} from '../firebase';
import { LanguageContext, ThemeContext } from '../App';
import { translations } from '../utils/translations';

import SearchModal from './modals/SearchModal';
import UploadModal from './modals/UploadModal';
import AuthModal from './modals/AuthModal';

const PROFESSOR_NAMES = {
  pnta: 'Thầy Phan Ngô Tuấn Anh',
  ndt: 'Thầy Nguyễn Đình Tuấn',
  ntv: 'Thầy Ngô Trấn Vũ',
  ntvv: 'Thầy Nguyễn Thanh Vân'
};

const googleOneTapClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
let firebaseRedirectResultPromise;

const getFirebaseRedirectResultOnce = () => {
  if (!firebaseRedirectResultPromise) {
    firebaseRedirectResultPromise = getRedirectResult(auth);
  }
  return firebaseRedirectResultPromise;
};

const getPendingAuthProvider = () => {
  if (typeof window === 'undefined') return '';

  try {
    const firebaseProvider = window.sessionStorage.getItem(FIREBASE_REDIRECT_PROVIDER_KEY);
    if (firebaseProvider) return firebaseProvider;
    if (window.sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY)) return 'GitHub';
  } catch {
    // Storage can be unavailable in strict privacy modes. OAuth still works;
    // it simply cannot restore the progress label after a full-page redirect.
  }

  return '';
};

const notifyGithubOpener = (payload) => {
  try {
    if (sessionStorage.getItem(GITHUB_OAUTH_MODE_KEY) !== 'popup') return false;
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(
        { type: GITHUB_OAUTH_RESULT_MESSAGE, ...payload },
        window.location.origin
      );
    }
    sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
    // Even if GitHub's cross-origin isolation severed window.opener, closing
    // lets the original tab detect the shared session cookie via /auth/me.
    window.setTimeout(() => window.close(), 0);
    return true;
  } catch {
    return false;
  }
};

function GoogleOneTapBridge({ disabled, onSuccess }) {
  useGoogleOneTapLogin({
    onSuccess,
    onError: () => {},
    disabled,
    auto_select: false,
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: true
  });

  return null;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const mobileToggleRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { language, setLanguage: changeLanguage } = useContext(LanguageContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const t = translations[language];

  // Login / Signup / Phone OTP / Forgot Password Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'phone'

  // Email/Password inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Signup inputs
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Forgot Password input
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmNewPassword, setForgotConfirmNewPassword] = useState('');

  // Phone OTP inputs
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [loggedInUser, setLoggedInUserState] = useState(null);
  const setLoggedInUser = useCallback((user) => {
    setLoggedInUserState(user);
    if (user) {
      localStorage.setItem('ueh_tcc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ueh_tcc_user');
    }
  }, []);
  const hasBackendSessionRef = useRef(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(() => Boolean(getPendingAuthProvider()));
  const [authProgress, setAuthProgress] = useState(() => {
    const provider = getPendingAuthProvider();
    return provider
      ? { phase: 'loading', message: `Đang hoàn tất đăng nhập ${provider}…` }
      : null;
  });
  const oauthRequestInFlightRef = useRef(false);
  const authProgressTimerRef = useRef(null);
  const githubPopupRef = useRef(null);
  const githubPopupPollTimerRef = useRef(null);
  const firebaseSyncsRef = useRef(new Map());
  const lastFirebaseSyncRef = useRef(null);
  const firebaseAuthIntentRef = useRef('');
  const sessionBootstrapPromiseRef = useRef(Promise.resolve());

  // Upload Modal States (Admin Only)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('documentsData');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadImage, setUploadImage] = useState('tccvang.jpg');
  const [uploadPdf, setUploadPdf] = useState('tccvang.pdf');
  const [uploadProf, setUploadProf] = useState('pnta');
  const [uploadExternalUrl, setUploadExternalUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMsg, setUploadMsg] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const uploadProfName = PROFESSOR_NAMES[uploadProf] || 'Giảng viên UEH';

  const showAuthProgress = useCallback((phase, message) => {
    if (authProgressTimerRef.current) {
      window.clearTimeout(authProgressTimerRef.current);
      authProgressTimerRef.current = null;
    }

    if (!phase) {
      setAuthProgress(null);
      return;
    }

    setAuthProgress({ phase, message });
    if (phase === 'success') {
      authProgressTimerRef.current = window.setTimeout(() => {
        setAuthProgress(null);
        authProgressTimerRef.current = null;
      }, 2200);
    }
  }, []);

  const clearGithubPopupWatch = useCallback(() => {
    if (githubPopupPollTimerRef.current) {
      window.clearInterval(githubPopupPollTimerRef.current);
      githubPopupPollTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (authProgressTimerRef.current) {
      window.clearTimeout(authProgressTimerRef.current);
    }
    clearGithubPopupWatch();
  }, [clearGithubPopupWatch]);

  const handleGithubPopupResult = useCallback((payload) => {
    const expectedState = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
    if (!expectedState || payload?.state !== expectedState) {
      return;
    }

    clearGithubPopupWatch();
    githubPopupRef.current = null;
    sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
    oauthRequestInFlightRef.current = false;
    setIsAuthenticating(false);

    if (!payload.success || !payload.user) {
      setAuthSuccessMsg('');
      setAuthError(payload.message || 'Không thể hoàn tất đăng nhập GitHub.');
      setShowLoginModal(true);
      showAuthProgress(null);
      return;
    }

    const dbUser = toClientUser(payload.user);
    hasBackendSessionRef.current = true;
    setLoggedInUser(dbUser);
    window.dispatchEvent(new Event('ueh-tcc-session-changed'));
    setAuthError('');
    setAuthSuccessMsg('Đăng nhập GitHub thành công!');
    setShowLoginModal(false);
    showAuthProgress('success', 'Đăng nhập GitHub thành công');
    navigate('/', { replace: true });
  }, [clearGithubPopupWatch, navigate, setLoggedInUser, showAuthProgress]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.origin !== window.location.origin
        || event.data?.type !== GITHUB_OAUTH_RESULT_MESSAGE
        || (githubPopupRef.current && event.source !== githubPopupRef.current)
      ) return;

      handleGithubPopupResult(event.data);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleGithubPopupResult]);

  const completeFirebaseSession = useCallback((firebaseUser, options = {}) => {
    const uid = String(firebaseUser?.uid || '');
    if (!uid || typeof firebaseUser?.getIdToken !== 'function') {
      return Promise.reject(new Error('Không nhận được tài khoản Firebase hợp lệ.'));
    }

    const provider = options.provider || 'Google';
    const announce = Boolean(options.announce);
    const lastSync = lastFirebaseSyncRef.current;
    if (lastSync?.uid === uid && hasBackendSessionRef.current) {
      if (announce) {
        sessionStorage.removeItem(FIREBASE_REDIRECT_PROVIDER_KEY);
        firebaseAuthIntentRef.current = '';
        setAuthError('');
        setAuthSuccessMsg(`Đăng nhập ${provider} thành công!`);
        setShowLoginModal(false);
        setIsAuthenticating(false);
        showAuthProgress('success', `Đăng nhập ${provider} thành công`);
      }
      return Promise.resolve(lastSync.user);
    }

    const existing = firebaseSyncsRef.current.get(uid);
    if (existing) {
      if (announce) {
        existing.announce = true;
        existing.provider = provider;
        setIsAuthenticating(true);
        showAuthProgress('loading', `Đang đồng bộ tài khoản ${provider}…`);
      }
      return existing.promise;
    }

    const entry = { announce, provider, promise: null };
    if (entry.announce) {
      setIsAuthenticating(true);
      showAuthProgress('loading', `Đang đồng bộ tài khoản ${entry.provider}…`);
    }

    entry.promise = syncFirebaseUserWithBackend(firebaseUser)
      .then((dbUser) => {
        hasBackendSessionRef.current = true;
        lastFirebaseSyncRef.current = { uid, user: dbUser };
        setLoggedInUser(dbUser);
        window.dispatchEvent(new Event('ueh-tcc-session-changed'));

        if (entry.announce) {
          sessionStorage.removeItem(FIREBASE_REDIRECT_PROVIDER_KEY);
          firebaseAuthIntentRef.current = '';
          setAuthError('');
          setAuthSuccessMsg(`Đăng nhập ${entry.provider} thành công!`);
          setShowLoginModal(false);
          setIsAuthenticating(false);
          showAuthProgress('success', `Đăng nhập ${entry.provider} thành công`);
        }

        return dbUser;
      })
      .catch((error) => {
        if (entry.announce) {
          sessionStorage.removeItem(FIREBASE_REDIRECT_PROVIDER_KEY);
          firebaseAuthIntentRef.current = '';
          setAuthSuccessMsg('');
          setAuthError(`Lỗi đăng nhập ${entry.provider}: ${error.message || 'Không thể đồng bộ tài khoản.'}`);
          setShowLoginModal(true);
          setIsAuthenticating(false);
          showAuthProgress(null);
        }
        throw error;
      })
      .finally(() => {
        if (firebaseSyncsRef.current.get(uid) === entry) {
          firebaseSyncsRef.current.delete(uid);
        }
      });

    firebaseSyncsRef.current.set(uid, entry);
    return entry.promise;
  }, [setLoggedInUser, showAuthProgress]);

  const [readingProgress, setReadingProgress] = useState(0);
  const isBlogDetailPage = location.pathname.startsWith('/blog/');

  // Reading progress tracker ONLY for blog detail pages (/blog/:slug)
  useEffect(() => {
    if (!isBlogDetailPage) {
      return undefined;
    }

    const handleScrollProgress = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollableHeight = Math.max(
        0,
        (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
      );
      const progress = scrollableHeight > 0 ? (currentScroll / scrollableHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    const initialFrame = window.requestAnimationFrame(handleScrollProgress);
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    window.addEventListener('resize', handleScrollProgress);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      resizeObserver = new ResizeObserver(() => {
        handleScrollProgress();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener('scroll', handleScrollProgress);
      window.removeEventListener('resize', handleScrollProgress);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isBlogDetailPage, location.pathname]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const restoreFocusTarget = mobileToggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => {
      mobileDrawerRef.current?.querySelector('[data-mobile-menu-close]')?.focus();
    });
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !mobileDrawerRef.current) return;
      const controls = Array.from(
        mobileDrawerRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((element) => element.getClientRects().length > 0);
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
      restoreFocusTarget?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Bootstrap the HttpOnly backend session. Browser storage is never an
  // authentication source.
  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      const hadBackendSessionAtStart = hasBackendSessionRef.current;
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const payload = await readApiJson(res);
          if (payload?.user) {
            const clientUser = toClientUser(payload.user);
            const newerLoginCompleted = !hadBackendSessionAtStart && hasBackendSessionRef.current;
            if (!cancelled && !newerLoginCompleted) {
              hasBackendSessionRef.current = true;
              setLoggedInUser(clientUser);
            }
            return;
          }
        }
        if (!cancelled && !hasBackendSessionRef.current) {
          hasBackendSessionRef.current = false;
          setLoggedInUser(null);
          localStorage.removeItem('ueh_tcc_user');
        }
      } catch {
        if (!cancelled && !hasBackendSessionRef.current) {
          hasBackendSessionRef.current = false;
          setLoggedInUser(null);
          localStorage.removeItem('ueh_tcc_user');
        }
      }
    };

    const startBootstrapSession = () => {
      const request = bootstrapSession();
      sessionBootstrapPromiseRef.current = request;
      return request;
    };

    startBootstrapSession();
    window.addEventListener('ueh-tcc-session-changed', startBootstrapSession);
    return () => {
      cancelled = true;
      window.removeEventListener('ueh-tcc-session-changed', startBootstrapSession);
    };
  }, [setLoggedInUser]);

  // Process Firebase before the slower /auth/me bootstrap finishes. This keeps
  // redirect and One Tap logins responsive while the shared completion helper
  // de-duplicates the redirect result and the auth-state listener.
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return undefined;

    let cancelled = false;
    let redirectSettled = false;
    let authStateSettled = false;
    let firebaseUserObserved = false;
    const pendingRedirectProvider = sessionStorage.getItem(FIREBASE_REDIRECT_PROVIDER_KEY);
    const redirectProvider = pendingRedirectProvider || 'Google';

    const finishMissingRedirect = () => {
      if (
        cancelled
        || !pendingRedirectProvider
        || !redirectSettled
        || !authStateSettled
        || firebaseUserObserved
      ) return;

      sessionStorage.removeItem(FIREBASE_REDIRECT_PROVIDER_KEY);
      setIsAuthenticating(false);
      showAuthProgress(null);
      setAuthSuccessMsg('');
      setAuthError(`Không nhận được kết quả đăng nhập ${redirectProvider}. Vui lòng thử lại.`);
      setShowLoginModal(true);
    };

    getFirebaseRedirectResultOnce()
      .then((result) => {
        redirectSettled = true;
        if (cancelled) return;
        if (result?.user) {
          firebaseUserObserved = true;
          void completeFirebaseSession(result.user, {
            provider: redirectProvider,
            announce: Boolean(pendingRedirectProvider)
          }).catch((error) => {
            console.error('Lỗi đồng bộ Firebase user với Backend:', error);
          });
          return;
        }
        finishMissingRedirect();
      })
      .catch((error) => {
        redirectSettled = true;
        if (cancelled) return;
        sessionStorage.removeItem(FIREBASE_REDIRECT_PROVIDER_KEY);
        firebaseAuthIntentRef.current = '';
        setIsAuthenticating(false);
        showAuthProgress(null);
        console.error('Redirect auth error:', error);
        const message = error.code === 'auth/account-exists-with-different-credential'
          ? 'Email này đã liên kết với một phương thức đăng nhập khác. Vui lòng dùng phương thức đã đăng ký trước đó.'
          : (error.message || 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.');
        setAuthSuccessMsg('');
        setAuthError(`Lỗi đăng nhập ${redirectProvider}: ${message}`);
        setShowLoginModal(true);
      });

    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      authStateSettled = true;
      if (cancelled) return;

      if (!firebaseUser) {
        finishMissingRedirect();
        return;
      }

      firebaseUserObserved = true;
      const intentProvider = firebaseAuthIntentRef.current
        || sessionStorage.getItem(FIREBASE_REDIRECT_PROVIDER_KEY);
      if (intentProvider) {
        void completeFirebaseSession(firebaseUser, {
          provider: intentProvider,
          announce: true
        }).catch((error) => {
          console.error('Lỗi đồng bộ Firebase user với Backend:', error);
        });
        return;
      }

      // A persisted Firebase user is only synchronized when the parallel
      // backend bootstrap confirms that no valid HttpOnly session exists.
      void sessionBootstrapPromiseRef.current
        .catch(() => {})
        .then(() => {
          if (cancelled || hasBackendSessionRef.current) return;
          return completeFirebaseSession(firebaseUser).catch((error) => {
            console.error('Không thể khôi phục phiên Firebase:', error);
          });
        });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [completeFirebaseSession, showAuthProgress]);

  const isActivePath = (path) => location.pathname === path;

  const handleNavClick = () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const launcher = document.querySelector('.contact-launcher-container') || document.querySelector('.contact-launcher');
    if (launcher) launcher.style.display = '';

    setIsOpen(false);
    setShowUserDropdown(false);
    setShowLangMenu(false);
    window.scrollTo(0, 0);
  };

  const handleGlobalSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setShowSearch(false);
    navigate(`/resources?q=${encodeURIComponent(query)}`);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!username || !password) {
      setAuthError('Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await readApiJson(response);
      if (data.success) {
        hasBackendSessionRef.current = true;
        setLoggedInUser(toClientUser(data.user));
        window.dispatchEvent(new Event('ueh-tcc-session-changed'));
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      } else {
        setAuthError(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (error) {
      setAuthError(
        error?.status || error?.code
          ? error.message
          : 'Không thể kết nối đến máy chủ Backend!'
      );
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!signupName || !signupUsername || !signupPassword) {
      setAuthError('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (signupPassword.length < 10) {
      setAuthError('Mật khẩu phải chứa ít nhất 10 ký tự!');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Mật khẩu nhập lại không trùng khớp!');
      return;
    }

    try {
      const response = await apiFetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername,
          password: signupPassword,
          name: signupName
        })
      });
      const data = await readApiJson(response);
      if (data.success) {
        hasBackendSessionRef.current = true;
        setLoggedInUser(toClientUser(data.user));
        window.dispatchEvent(new Event('ueh-tcc-session-changed'));
        setShowLoginModal(false);
        setSignupName('');
        setSignupUsername('');
        setSignupPassword('');
        setSignupConfirmPassword('');
      } else {
        setAuthError(data.message || 'Không thể tạo tài khoản!');
      }
    } catch (error) {
      setAuthError(
        error?.status || error?.code
          ? error.message
          : 'Không thể kết nối đến máy chủ Backend!'
      );
    }
  };

  const handleGoogleOneTapSuccess = useCallback(async (response) => {
    if (oauthRequestInFlightRef.current || hasBackendSessionRef.current) return;

    oauthRequestInFlightRef.current = true;
    firebaseAuthIntentRef.current = 'Google';
    setAuthError('');
    setAuthSuccessMsg('Đang xác thực nhanh với Google…');
    setIsAuthenticating(true);
    showAuthProgress('loading', 'Đang xác thực tài khoản Google…');

    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('Hệ thống Firebase chưa được cấu hình.');
      }
      if (!response?.credential) {
        throw new Error('Google không trả về thông tin xác thực.');
      }

      const credential = GoogleAuthProvider.credential(response.credential);
      const userCredential = await signInWithCredential(auth, credential);
      await completeFirebaseSession(userCredential.user, {
        provider: 'Google',
        announce: true
      });
    } catch (error) {
      firebaseAuthIntentRef.current = '';
      setIsAuthenticating(false);
      showAuthProgress(null);
      setAuthSuccessMsg('');
      setAuthError(`Lỗi đăng nhập Google: ${error.message || 'Không thể hoàn tất đăng nhập nhanh.'}`);
      setShowLoginModal(true);
    } finally {
      oauthRequestInFlightRef.current = false;
    }
  }, [completeFirebaseSession, showAuthProgress]);

  const processedCodeRef = useRef(null);

  // Handle manual OAuth redirect return
  useEffect(() => {
    const handleOAuthReturn = async () => {
      // GitHub OAuth code return (bound to the browser session with state).
      const queryParams = new URLSearchParams(window.location.search);
      let githubCode = queryParams.get('code');
      let githubState = queryParams.get('state');
      const githubError = queryParams.get('error');
      const githubErrorDescription = queryParams.get('error_description');

      if (githubError) {
        const message = githubError === 'access_denied'
          ? 'Bạn đã hủy đăng nhập GitHub.'
          : `Không thể đăng nhập GitHub: ${githubErrorDescription || githubError}`;
        sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);
        if (notifyGithubOpener({ success: false, state: githubState, message })) return;
        sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
        setIsAuthenticating(false);
        showAuthProgress(null);
        setAuthSuccessMsg('');
        setAuthError(message);
        setShowLoginModal(true);
        return;
      }

      // Fallback if GitHub appended it after the hash (e.g. /#/?code=...)
      if (!githubCode && window.location.hash.includes('code=')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          githubCode = hashParams.get('code');
          githubState = hashParams.get('state');
        }
      }

      if (githubCode && processedCodeRef.current !== githubCode) {
        processedCodeRef.current = githubCode;
        setIsAuthenticating(true);
        showAuthProgress('loading', 'Đang xác minh tài khoản GitHub…');
        const expectedState = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
        sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);

        if (!expectedState || !githubState || expectedState !== githubState) {
          const message = 'Phiên đăng nhập GitHub không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
          if (notifyGithubOpener({ success: false, state: githubState, message })) return;
          sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
          setAuthError(message);
          setShowLoginModal(true);
          setIsAuthenticating(false);
          showAuthProgress(null);
          return;
        }

        try {
          const response = await apiFetch('/api/auth/github/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: githubCode })
          });
          const data = await readApiJson(response);
          if (data.success && data.user) {
            if (notifyGithubOpener({
              success: true,
              state: githubState,
              user: data.user
            })) return;
            sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
            const dbUser = toClientUser(data.user);
            hasBackendSessionRef.current = true;
            setLoggedInUser(dbUser);
            window.dispatchEvent(new Event('ueh-tcc-session-changed'));
            setAuthError('');
            setAuthSuccessMsg('Đăng nhập GitHub thành công!');
            setShowLoginModal(false);
            showAuthProgress('success', 'Đăng nhập GitHub thành công');
            navigate('/', { replace: true });
          } else {
            const errorMsg = data.message || 'Lỗi lấy token từ GitHub.';
            if (notifyGithubOpener({
              success: false,
              state: githubState,
              message: `Lỗi đăng nhập GitHub: ${errorMsg}`
            })) return;
            sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
            setAuthError(`Lỗi đăng nhập GitHub: ${errorMsg}`);
            setShowLoginModal(true);
            showAuthProgress(null);
          }
        } catch (error) {
          console.error("Lỗi xác thực GitHub code:", error);
          if (notifyGithubOpener({
            success: false,
            state: githubState,
            message: `Lỗi đăng nhập GitHub: ${error.message}`
          })) return;
          sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
          setAuthError(`Lỗi đăng nhập GitHub: ${error.message}`);
          setShowLoginModal(true);
          showAuthProgress(null);
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    handleOAuthReturn();
  }, [navigate, setLoggedInUser, showAuthProgress]);

  const handleGoogleLogin = async () => {
    if (oauthRequestInFlightRef.current) return;
    oauthRequestInFlightRef.current = true;
    setAuthError('');
    setAuthSuccessMsg('');
    setIsAuthenticating(true);
    showAuthProgress('loading', 'Đang chuyển đến Google…');
    try {
      if (!isFirebaseConfigured || !auth || !googleProvider) {
        throw new Error('Hệ thống Firebase chưa được cấu hình.');
      }
      await ensureGoogleOAuthAvailable();
      sessionStorage.setItem(FIREBASE_REDIRECT_PROVIDER_KEY, 'Google');
      setAuthSuccessMsg('Đang chuyển đến Google...');
      setShowLoginModal(false);
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      sessionStorage.removeItem(FIREBASE_REDIRECT_PROVIDER_KEY);
      setAuthSuccessMsg('');
      setAuthError(`Lỗi đăng nhập Google: ${error.message}`);
      setShowLoginModal(true);
      oauthRequestInFlightRef.current = false;
      setIsAuthenticating(false);
      showAuthProgress(null);
    }
  };

  const handleGithubLogin = async () => {
    if (oauthRequestInFlightRef.current) return;
    oauthRequestInFlightRef.current = true;
    setAuthError('');
    setAuthSuccessMsg('Đang chuyển đến GitHub...');
    setIsAuthenticating(true);
    showAuthProgress('loading', 'Đang chuyển đến GitHub…');
    try {
      const result = await beginGithubOAuth();
      if (result?.mode === 'popup' && result.popup) {
        githubPopupRef.current = result.popup;
        setAuthSuccessMsg('Hãy chọn tài khoản trong cửa sổ GitHub vừa mở.');
        showAuthProgress('loading', 'Đang chờ bạn xác nhận tài khoản GitHub…');
        clearGithubPopupWatch();
        githubPopupPollTimerRef.current = window.setInterval(() => {
          if (githubPopupRef.current && !githubPopupRef.current.closed) return;

          clearGithubPopupWatch();
          githubPopupRef.current = null;
          if (!oauthRequestInFlightRef.current) return;

          const expectedState = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
          showAuthProgress('loading', 'Đang xác nhận phiên đăng nhập GitHub…');
          void apiFetch('/api/auth/me')
            .then((response) => readApiJson(response))
            .then((payload) => {
              handleGithubPopupResult({
                success: Boolean(payload?.user),
                state: expectedState,
                user: payload?.user,
                message: 'Cửa sổ đăng nhập GitHub đã đóng trước khi hoàn tất.'
              });
            })
            .catch(() => {
              handleGithubPopupResult({
                success: false,
                state: expectedState,
                message: 'Cửa sổ đăng nhập GitHub đã đóng trước khi hoàn tất.'
              });
            });
        }, 500);
      }
    } catch (error) {
      setAuthSuccessMsg('');
      setAuthError(error.message || 'Không thể bắt đầu đăng nhập GitHub.');
      oauthRequestInFlightRef.current = false;
      sessionStorage.removeItem(GITHUB_OAUTH_MODE_KEY);
      setIsAuthenticating(false);
      showAuthProgress(null);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!forgotEmail) {
      setAuthError('Vui lòng nhập địa chỉ email!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setAuthError('Địa chỉ email không đúng định dạng!');
      return;
    }

    setForgotLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
        signal: controller.signal
      });
      const data = await readApiJson(response);
      if (data.success) {
        if (data.otpCode) {
          setForgotOtp(data.otpCode);
        }
        setAuthSuccessMsg(data.message || 'Mã OTP gồm 6 chữ số đã được gửi đến email của bạn.');
        setForgotStep(2);
        return;
      }

      setAuthError(data.message || 'Email này chưa đăng ký tài khoản trên hệ thống.');
    } catch (error) {
      console.warn("Forgot password request notice:", error.name);
      setAuthError(
        error.name === 'AbortError'
          ? 'Máy chủ phản hồi quá lâu. Vui lòng thử gửi lại mã OTP.'
          : error?.code || Number.isInteger(error?.status)
            ? error.message
            : 'Không thể gửi mã OTP lúc này. Vui lòng kiểm tra kết nối và thử lại.'
      );
    } finally {
      clearTimeout(timeoutId);
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!forgotEmail || !/^\d{6}$/.test(forgotOtp.trim()) || !forgotNewPassword) {
      setAuthError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (forgotNewPassword.length < 10) {
      setAuthError('Mật khẩu mới phải có ít nhất 10 ký tự!');
      return;
    }
    if (forgotNewPassword !== forgotConfirmNewPassword) {
      setAuthError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otpCode: forgotOtp.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await readApiJson(response);
      if (data.success) {
        setAuthSuccessMsg(data.message || 'Đặt lại mật khẩu thành công!');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmNewPassword('');
        setForgotStep(1);
        setTimeout(() => {
          setAuthMode('login');
          setAuthSuccessMsg('');
        }, 4000);
      } else {
        setAuthError(data.message || 'Mã xác thực OTP không chính xác!');
      }
    } catch (error) {
      setAuthError(
        error?.code || Number.isInteger(error?.status)
          ? error.message
          : 'Không thể kết nối đến backend để xác thực OTP.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier && isFirebaseConfigured) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          'expired-callback': () => {
            setAuthError('reCAPTCHA đã hết hạn, vui lòng gửi lại mã OTP.');
          }
        });
      } catch (err) {
        console.error("Lỗi khởi tạo RecaptchaVerifier:", err);
      }
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!phoneInput) {
      setAuthError('Vui lòng nhập số điện thoại!');
      return;
    }
    if (!isFirebaseConfigured) {
      setAuthError('Tính năng Phone OTP yêu cầu cấu hình Firebase Auth!');
      return;
    }

    let formattedPhone = phoneInput.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+84' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('+')) {
      setAuthError('Số điện thoại phải bắt đầu bằng mã quốc gia (+84 cho VN)');
      return;
    }

    setOtpLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setAuthSuccessMsg('Mã OTP đã được gửi về số điện thoại của bạn!');
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/invalid-phone-number') {
        msg = 'Số điện thoại không đúng định dạng quốc tế!';
      }
      setAuthError(msg || 'Lỗi gửi mã OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!verificationCode) {
      setAuthError('Vui lòng nhập mã xác thực OTP!');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const dbUser = await syncFirebaseUserWithBackend(result.user);
      hasBackendSessionRef.current = true;
      setLoggedInUser(dbUser);
      window.dispatchEvent(new Event('ueh-tcc-session-changed'));
      setShowLoginModal(false);
      setIsOtpSent(false);
      setPhoneInput('');
      setVerificationCode('');
      setConfirmationResult(null);
    } catch {
      setAuthError('Mã OTP chưa chính xác hoặc đã hết hạn!');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      const response = await apiFetch('/api/auth/logout', { method: 'POST' });
      await readApiJson(response);
    } catch (error) {
      setAuthError(error.message || 'Không thể thu hồi phiên đăng nhập. Vui lòng thử lại.');
      setShowLoginModal(true);
      return;
    }
    hasBackendSessionRef.current = false;
    localStorage.removeItem('ueh_tcc_user');
    setLoggedInUser(null);
    window.dispatchEvent(new Event('ueh-tcc-session-changed'));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadDesc) {
      setUploadStatus('error');
      setUploadMsg('Vui lòng nhập đầy đủ tiêu đề và mô tả!');
      return;
    }

    setUploadStatus('loading');
    setUploadMsg('');

    const itemPayload = {
      title: uploadTitle,
      desc: uploadDesc,
      image: uploadImage,
      pdf: uploadPdf
    };

    if (uploadType === 'documentsData') {
      itemPayload.category = 'latest';
      itemPayload.categoryLabel = 'Tài liệu mới nhất';
      if (uploadExternalUrl) {
        itemPayload.externalUrl = uploadExternalUrl;
      }
    } else if (uploadType === 'midtermExams') {
      itemPayload.professor = uploadProf;
      itemPayload.professorName = uploadProfName;
    } else if (uploadType === 'finalExams') {
      itemPayload.hasDetailRoute = false;
    }

    try {
      const response = await apiFetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: uploadType,
          item: itemPayload,
          adminRole: loggedInUser?.role,
          uid: loggedInUser?.uid,
          email: loggedInUser?.username
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUploadStatus('success');
        setUploadMsg(data.message || 'Đăng tải thành công!');
        setUploadTitle('');
        setUploadDesc('');
        setUploadExternalUrl('');

        setTimeout(() => {
          setShowUploadModal(false);
          setUploadStatus('idle');
          setUploadMsg('');
          window.location.reload();
        }, 1500);
      } else {
        setUploadStatus('error');
        setUploadMsg(data.message || 'Có lỗi xảy ra khi đăng tải.');
      }
    } catch {
      setUploadStatus('error');
      setUploadMsg('Lỗi kết nối server Backend! Hãy chắc chắn server port 5000 đã khởi động.');
    }
  };

  return (
    <>
      {googleOneTapClientId && (
        <GoogleOneTapBridge
          disabled={
            authMode !== 'login'
            || !showLoginModal
            || Boolean(loggedInUser)
            || isAuthenticating
            || !isFirebaseConfigured
            || !auth
          }
          onSuccess={handleGoogleOneTapSuccess}
        />
      )}

      {authProgress && (
        <div
          className={`navbar-auth-progress is-${authProgress.phase}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="navbar-auth-progress-icon" aria-hidden="true">
            {authProgress.phase === 'success'
              ? <CheckCircle2 size={20} />
              : <Loader2 size={20} />}
          </span>
          <span className="navbar-auth-progress-copy">
            <strong>{authProgress.phase === 'success' ? 'Đã xác thực' : 'Đang đăng nhập'}</strong>
            <span>{authProgress.message}</span>
          </span>
        </div>
      )}

      <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="navbar" aria-label="Điều hướng chính">
          {/* Reading Progress Bar attached to Navbar Header (Blog Detail Page Only) */}
          {isBlogDetailPage && (
            <div
              className="navbar-reading-progress"
              role="progressbar"
              aria-label="Tiến độ đọc bài"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(readingProgress)}
            >
              <div
                className="navbar-reading-progress-fill"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          )}
          <div className="container navbar-container">
            <Link to="/" className="navbar-logo" onClick={handleNavClick} aria-label="UEH TCC — Trang chủ">
              <span className="logo-symbol" aria-hidden="true" />
              <span className="logo-helper">UEH</span>
              <span className="logo-main">TCC</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="nav-links">
              <Link to="/" className={`nav-link-item ${isActivePath('/') ? 'active' : ''}`} aria-current={isActivePath('/') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.home}</Link>
              <Link to="/courses" className={`nav-link-item ${isActivePath('/courses') ? 'active' : ''}`} aria-current={isActivePath('/courses') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.courses}</Link>
              <Link to="/community" className={`nav-link-item ${isActivePath('/community') ? 'active' : ''}`} aria-current={isActivePath('/community') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.community || 'Hỏi đáp TCC'}</Link>
              <Link to="/resources?category=all" className={`nav-link-item ${location.pathname === '/resources' ? 'active' : ''}`} aria-current={location.pathname === '/resources' ? 'page' : undefined} onClick={handleNavClick}>{t.nav.library}</Link>
              <Link to="/exams" className={`nav-link-item ${isActivePath('/exams') ? 'active' : ''}`} aria-current={isActivePath('/exams') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.exams}</Link>
              <Link to="/blog" className={`nav-link-item ${isActivePath('/blog') ? 'active' : ''}`} aria-current={isActivePath('/blog') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.blog}</Link>
              <Link to="/20-10" className={`nav-link-item rose-link ${location.pathname === '/20-10' ? 'active' : ''}`} aria-current={location.pathname === '/20-10' ? 'page' : undefined} onClick={handleNavClick}>{t.nav.gift}</Link>
            </div>

            {/* Theme & Language Controls */}
            <div className="nav-controls">
              <NotificationDropdown />

              <button
                type="button"
                className="control-btn"
                onClick={() => setShowSearch(true)}
                aria-label="Mở tìm kiếm"
              >
                <Search size={18} />
              </button>

              <button
                type="button"
                className="control-btn theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="lang-selector-container">
                <button
                  type="button"
                  className="control-btn lang-btn"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  aria-label="Chọn ngôn ngữ"
                  aria-haspopup="menu"
                  aria-expanded={showLangMenu}
                >
                  <Globe size={16} />
                  <span className="lang-code-capsule">{language.toUpperCase()}</span>
                </button>
                {showLangMenu && (
                  <div className="lang-dropdown-menu" role="menu">
                    <button type="button" className={`lang-option-btn ${language === 'vi' ? 'active' : ''}`} onClick={() => { changeLanguage('vi'); setShowLangMenu(false); }}>
                      <span>Tiếng Việt</span>
                    </button>
                    <button type="button" className={`lang-option-btn ${language === 'en' ? 'active' : ''}`} onClick={() => { changeLanguage('en'); setShowLangMenu(false); }}>
                      <span>English</span>
                    </button>
                    <button type="button" className={`lang-option-btn ${language === 'ja' ? 'active' : ''}`} onClick={() => { changeLanguage('ja'); setShowLangMenu(false); }}>
                      <span>日本語</span>
                    </button>
                    <button type="button" className={`lang-option-btn ${language === 'zh' ? 'active' : ''}`} onClick={() => { changeLanguage('zh'); setShowLangMenu(false); }}>
                      <span>中文</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Login Action / Admin Action (Matching Image 2) */}
            <div className="auth-action">
              {loggedInUser ? (
                <div className="user-profile-menu-container">
                  <button
                    type="button"
                    className={`user-profile-pill-btn ${authProgress?.phase === 'success' ? 'is-authenticated' : ''}`}
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    aria-haspopup="menu"
                    aria-expanded={showUserDropdown}
                  >
                    <div className="user-avatar-circle">
                      {(loggedInUser.avatar || loggedInUser.photoURL) ? (
                        <img
                          src={loggedInUser.avatar || loggedInUser.photoURL}
                          alt={loggedInUser.name}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span>{getInitials(loggedInUser.name || loggedInUser.username)}</span>
                      )}
                    </div>
                    <span className="user-profile-name-text">{loggedInUser.name}</span>
                    <ChevronDown size={14} />
                  </button>

                  {showUserDropdown && (
                    <div className="user-dropdown-card" role="menu">
                      <div className="user-dropdown-header">
                        <div className="dropdown-avatar-circle">
                          {(loggedInUser.avatar || loggedInUser.photoURL) ? (
                            <img
                              src={loggedInUser.avatar || loggedInUser.photoURL}
                              alt={loggedInUser.name}
                              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span>{getInitials(loggedInUser.name || loggedInUser.username)}</span>
                          )}
                        </div>
                        <div className="dropdown-user-info">
                          <span className="dropdown-user-name">{loggedInUser.name}</span>
                          <span className="dropdown-user-email">{loggedInUser.username || loggedInUser.email}</span>
                        </div>
                      </div>

                      <div className="user-dropdown-divider" />

                      <Link
                        to="/account?tab=courses"
                        className="user-dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="user-dropdown-item-left">
                          <div className="dropdown-item-icon-circle green">
                            <BookOpen size={16} />
                          </div>
                          <span>Khóa học của tôi</span>
                        </div>
                        <ChevronRight size={14} color="#94a3b8" />
                      </Link>

                      <Link
                        to="/account?tab=profile"
                        className="user-dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="user-dropdown-item-left">
                          <div className="dropdown-item-icon-circle blue">
                            <User size={16} />
                          </div>
                          <span>Sửa thông tin cá nhân</span>
                        </div>
                        <ChevronRight size={14} color="#94a3b8" />
                      </Link>

                      <Link
                        to="/community/saved"
                        className="user-dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="user-dropdown-item-left">
                          <div className="dropdown-item-icon-circle gold">
                            <Bookmark size={16} />
                          </div>
                          <span>Bài toán đã lưu</span>
                        </div>
                        <ChevronRight size={14} color="#94a3b8" />
                      </Link>

                      <Link
                        to="/community/user/me"
                        className="user-dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="user-dropdown-item-left">
                          <div className="dropdown-item-icon-circle green">
                            <MessageSquare size={16} />
                          </div>
                          <span>Hồ sơ diễn đàn AoPS</span>
                        </div>
                        <ChevronRight size={14} color="#94a3b8" />
                      </Link>

                      {loggedInUser.role === 'Admin' && (
                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => { setShowUserDropdown(false); setShowUploadModal(true); }}
                        >
                          <div className="user-dropdown-item-left">
                            <div className="dropdown-item-icon-circle gold">
                              <PlusCircle size={16} />
                            </div>
                            <span>Tải lên đề thi / bài tập</span>
                          </div>
                          <ChevronRight size={14} color="#94a3b8" />
                        </button>
                      )}

                      <div className="user-dropdown-divider" />

                      <button
                        type="button"
                        className="user-dropdown-item"
                        onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                      >
                        <div className="user-dropdown-item-left">
                          <div className="dropdown-item-icon-circle gray">
                            <LogOut size={16} />
                          </div>
                          <span>Đăng xuất</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : isAuthenticating ? (
                <button className="btn btn-primary btn-login-nav" disabled style={{ opacity: 0.7 }}>
                  <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Đang xử lý...</span>
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-login-nav" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setShowLoginModal(true); }}>
                  <LogIn size={15} />
                  <span>{t.nav.login}</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              ref={mobileToggleRef}
              className="mobile-toggle"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
              aria-controls="mobile-navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Sidebar Drawer */}
        <div className={`mobile-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
          <div className="mobile-drawer-overlay" onClick={() => setIsOpen(false)} />
          <div ref={mobileDrawerRef} id="mobile-navigation" className="mobile-drawer-content" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
            <div className="drawer-header">
              <span className="logo-main">Menu UEH TCC</span>
              <button type="button" className="close-btn" onClick={() => setIsOpen(false)} aria-label="Đóng menu" data-mobile-menu-close>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-links">
              <Link to="/" className={`mobile-link-item ${isActivePath('/') ? 'active' : ''}`} aria-current={isActivePath('/') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.home}</Link>
              <Link to="/courses" className={`mobile-link-item ${isActivePath('/courses') ? 'active' : ''}`} aria-current={isActivePath('/courses') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.courses}</Link>
              <Link to="/community" className={`mobile-link-item ${isActivePath('/community') ? 'active' : ''}`} aria-current={isActivePath('/community') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.community || 'Hỏi đáp TCC'}</Link>
              <Link to="/resources?category=all" className={`mobile-link-item ${location.pathname === '/resources' ? 'active' : ''}`} aria-current={location.pathname === '/resources' ? 'page' : undefined} onClick={handleNavClick}>{t.nav.library}</Link>
              <Link to="/exams" className={`mobile-link-item ${isActivePath('/exams') ? 'active' : ''}`} aria-current={isActivePath('/exams') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.exams}</Link>
              <Link to="/blog" className={`mobile-link-item ${isActivePath('/blog') ? 'active' : ''}`} aria-current={isActivePath('/blog') ? 'page' : undefined} onClick={handleNavClick}>{t.nav.blog}</Link>
              <Link to="/20-10" className={`mobile-link-item rose-link ${location.pathname === '/20-10' ? 'active' : ''}`} aria-current={location.pathname === '/20-10' ? 'page' : undefined} onClick={handleNavClick}>{t.nav.gift}</Link>

              {/* Mobile theme & language controls */}
              <div className="mobile-controls-row">
                <button
                  type="button"
                  className="mobile-control-btn"
                  onClick={() => setShowSearch(true)}
                >
                  <Search size={18} />
                  <span>Tìm kiếm</span>
                </button>
                <button
                  type="button"
                  className="mobile-control-btn"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
                <div className="mobile-lang-options">
                  <button type="button" className={`mobile-lang-btn ${language === 'vi' ? 'active' : ''}`} onClick={() => { changeLanguage('vi'); setIsOpen(false); }}>VI</button>
                  <button type="button" className={`mobile-lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => { changeLanguage('en'); setIsOpen(false); }}>EN</button>
                  <button type="button" className={`mobile-lang-btn ${language === 'ja' ? 'active' : ''}`} onClick={() => { changeLanguage('ja'); setIsOpen(false); }}>JA</button>
                  <button type="button" className={`mobile-lang-btn ${language === 'zh' ? 'active' : ''}`} onClick={() => { changeLanguage('zh'); setIsOpen(false); }}>ZH</button>
                </div>
              </div>

              <div className="mobile-drawer-auth">
                {loggedInUser ? (
                  <div className="mobile-user-profile">
                    <div className="user-details mb-3">
                      <User size={20} />
                      <span>{loggedInUser.name} ({loggedInUser.role})</span>
                    </div>
                    {loggedInUser.role === 'Admin' && (
                      <button
                        className="btn btn-secondary w-full mb-2 text-teal"
                        onClick={() => { setIsOpen(false); setShowUploadModal(true); }}
                      >
                        <PlusCircle size={15} />
                        <span>{t.nav.upload} Admin</span>
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary w-full" onClick={handleLogout}>{t.nav.logout}</button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-primary w-full" onClick={() => { setIsOpen(false); setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setShowLoginModal(true); }}>
                    <LogIn size={15} />
                    <span>{t.nav.login}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Subcomponents Modals */}
      <SearchModal
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleGlobalSearch={handleGlobalSearch}
      />

      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        loggedInUser={loggedInUser}
        uploadType={uploadType}
        setUploadType={setUploadType}
        uploadTitle={uploadTitle}
        setUploadTitle={setUploadTitle}
        uploadDesc={uploadDesc}
        setUploadDesc={setUploadDesc}
        uploadProf={uploadProf}
        setUploadProf={setUploadProf}
        uploadProfName={uploadProfName}
        uploadImage={uploadImage}
        setUploadImage={setUploadImage}
        uploadPdf={uploadPdf}
        setUploadPdf={setUploadPdf}
        uploadExternalUrl={uploadExternalUrl}
        setUploadExternalUrl={setUploadExternalUrl}
        uploadStatus={uploadStatus}
        uploadMsg={uploadMsg}
        handleUploadSubmit={handleUploadSubmit}
      />

      <AuthModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        setAuthError={setAuthError}
        authSuccessMsg={authSuccessMsg}
        setAuthSuccessMsg={setAuthSuccessMsg}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        signupName={signupName}
        setSignupName={setSignupName}
        signupUsername={signupUsername}
        setSignupUsername={setSignupUsername}
        signupPassword={signupPassword}
        setSignupPassword={setSignupPassword}
        signupConfirmPassword={signupConfirmPassword}
        setSignupConfirmPassword={setSignupConfirmPassword}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        forgotLoading={forgotLoading}
        forgotStep={forgotStep}
        setForgotStep={setForgotStep}
        forgotOtp={forgotOtp}
        setForgotOtp={setForgotOtp}
        forgotNewPassword={forgotNewPassword}
        setForgotNewPassword={setForgotNewPassword}
        forgotConfirmNewPassword={forgotConfirmNewPassword}
        setForgotConfirmNewPassword={setForgotConfirmNewPassword}
        phoneInput={phoneInput}
        setPhoneInput={setPhoneInput}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        isOtpSent={isOtpSent}
        setIsOtpSent={setIsOtpSent}
        otpLoading={otpLoading}
        isAuthenticating={isAuthenticating}
        setConfirmationResult={setConfirmationResult}
        handleLoginSubmit={handleLoginSubmit}
        handleGoogleLogin={handleGoogleLogin}
        handleGithubLogin={handleGithubLogin}
        handleSignupSubmit={handleSignupSubmit}
        handleForgotPasswordSubmit={handleForgotPasswordSubmit}
        handleResetPasswordSubmit={handleResetPasswordSubmit}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
      />
    </>
  );
}
