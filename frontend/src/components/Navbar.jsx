import { useCallback, useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogIn, PlusCircle, Loader2,
  Sun, Moon, Globe, Search, ChevronDown, ChevronRight, BookOpen, LogOut, Bookmark, MessageSquare
} from 'lucide-react';
import NotificationDropdown from './community/NotificationDropdown';
import { apiFetch, readApiJson, toClientUser } from '../utils/apiClient';
import '../assets/styles/Navbar.css';
import {
  auth,
  isFirebaseConfigured,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getRedirectResult
} from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useGoogleOneTapLogin } from '@react-oauth/google';
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

const GITHUB_OAUTH_STATE_KEY = 'ueh_tcc_github_oauth_state';

const createOAuthState = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
};

async function syncUserWithBackend(firebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('Dữ liệu người dùng không hợp lệ.');
  }

  const response = await apiFetch('/api/auth/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      phoneNumber: firebaseUser.phoneNumber
    })
  });
  const data = await readApiJson(response);
  if (data.token) {
    localStorage.setItem('ueh_tcc_token', data.token);
  }
  if (!data.success || !data.user) {
    throw new Error(data.message || 'Không thể đồng bộ phiên đăng nhập.');
  }
  return toClientUser(data.user);
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
      localStorage.removeItem('ueh_tcc_token');
    }
  }, []);
  const [sessionReady, setSessionReady] = useState(false);
  const hasBackendSessionRef = useRef(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
      try {
        const savedUser = localStorage.getItem('ueh_tcc_user');
        if (savedUser) {
          if (!cancelled) {
            hasBackendSessionRef.current = true;
            setLoggedInUser(JSON.parse(savedUser));
          }
        } else {
          if (!cancelled) {
            hasBackendSessionRef.current = false;
            setLoggedInUser(null);
          }
        }
      } catch {
        if (!cancelled) {
          hasBackendSessionRef.current = false;
          setLoggedInUser(null);
        }
        localStorage.removeItem('ueh_tcc_user');
        localStorage.removeItem('ueh_tcc_token');
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    };

    bootstrapSession();
    window.addEventListener('ueh-tcc-session-changed', bootstrapSession);
    return () => {
      cancelled = true;
      window.removeEventListener('ueh-tcc-session-changed', bootstrapSession);
    };
  }, [setLoggedInUser]);

  // Listen for real Firebase sessions and exchange their verified ID token for
  // a backend session cookie.
  useEffect(() => {
    if (sessionReady && isFirebaseConfigured && auth) {
      // Check for redirect result (e.g. from GitHub login)
      getRedirectResult(auth).then(async (result) => {
        if (result) {
          try {
            const dbUser = await syncUserWithBackend(result.user);
            hasBackendSessionRef.current = true;
            setLoggedInUser(dbUser);
            window.dispatchEvent(new Event('ueh-tcc-session-changed'));
            setAuthSuccessMsg('Đăng nhập thành công!');
          } catch(err) {
            console.error("Lỗi đồng bộ Firebase user với Backend:", err);
          }
        }
      }).catch((error) => {
        console.error("Redirect auth error:", error);
        if (error.code === 'auth/account-exists-with-different-credential') {
          alert('Lỗi: Email này đã được đăng ký bằng Google trước đó!\\n\\nĐể dùng cả GitHub và Google chung 1 email, bạn phải vào Firebase Console -> Authentication -> Settings -> Chọn "Link accounts that use the same email".');
        } else {
          alert('Lỗi đăng nhập: ' + error.message);
        }
      });

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && !hasBackendSessionRef.current) {
          try {
            const dbUser = await syncUserWithBackend(firebaseUser);
            hasBackendSessionRef.current = true;
            setLoggedInUser(dbUser);
            window.dispatchEvent(new Event('ueh-tcc-session-changed'));
          } catch(err) {
            console.error("Lỗi đồng bộ Firebase user với Backend:", err);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [sessionReady, setLoggedInUser]);

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
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.token) localStorage.setItem('ueh_tcc_token', data.token);
        hasBackendSessionRef.current = true;
        setLoggedInUser(toClientUser(data.user));
        window.dispatchEvent(new Event('ueh-tcc-session-changed'));
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      } else {
        setAuthError(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch {
      setAuthError('Không thể kết nối đến máy chủ Backend!');
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
    if (signupPassword.length < 6) {
      setAuthError('Mật khẩu phải chứa ít nhất 6 ký tự!');
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
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.token) localStorage.setItem('ueh_tcc_token', data.token);
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
    } catch {
      setAuthError('Không thể kết nối đến máy chủ Backend!');
    }
  };

  const handleGoogleAuthSuccess = useCallback(async (response) => {
    setAuthError('');
    setAuthSuccessMsg('Đang xác thực Google...');
    try {
      let credential;
      if (response.credential) {
        // One Tap returns JWT credential directly
        credential = GoogleAuthProvider.credential(response.credential);
      } else if (response.access_token) {
        // useGoogleLogin returns access token
        credential = GoogleAuthProvider.credential(null, response.access_token);
      } else {
        throw new Error('Không nhận được token xác thực từ Google.');
      }

      const userCredential = await signInWithCredential(auth, credential);
      const dbUser = await syncUserWithBackend(userCredential.user);
      hasBackendSessionRef.current = true;
      setLoggedInUser(dbUser);
      window.dispatchEvent(new Event('ueh-tcc-session-changed'));
      setAuthSuccessMsg('Đăng nhập Google thành công!');
      setTimeout(() => {
        setShowLoginModal(false);
        setAuthSuccessMsg('');
      }, 200);
    } catch (error) {
      console.error("Lỗi xác thực Google:", error);
      setAuthError(`Lỗi đăng nhập Google: ${error.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [setLoggedInUser]);

  // Google One Tap UI (appears in top right)
  useGoogleOneTapLogin({
    onSuccess: handleGoogleAuthSuccess,
    onError: () => console.log('Google One Tap Failed or Closed'),
    disabled: !!loggedInUser || !isFirebaseConfigured || !showLoginModal
  });

  const processedCodeRef = useRef(null);

  // Handle manual OAuth redirect return
  useEffect(() => {
    const handleOAuthReturn = async () => {
      // 1. Google (access_token in hash)
      if (window.location.hash.includes('access_token=')) {
        const rawHash = window.location.hash;
        const paramString = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash.replace(/^#\/?/, '');
        const params = new URLSearchParams(paramString);
        const accessToken = params.get('access_token') || new URLSearchParams(rawHash.substring(1)).get('access_token');

        if (accessToken) {
          setIsAuthenticating(true);
          navigate('/', { replace: true });
          handleGoogleAuthSuccess({ access_token: accessToken });
        }
      }

      // 2. GitHub (code in query string or hash)
      const queryParams = new URLSearchParams(window.location.search);
      let githubCode = queryParams.get('code');
      let githubState = queryParams.get('state');

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
        const expectedState = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
        sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
        window.history.replaceState({}, document.title, window.location.pathname);

        if (!expectedState || !githubState || expectedState !== githubState) {
          setAuthError('Phiên đăng nhập GitHub không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
          setIsAuthenticating(false);
          return;
        }

        try {
          const response = await apiFetch('/api/auth/github/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: githubCode })
          });
          const data = await response.json();
          if (data.success && data.access_token) {
            // Bypass Firebase entirely if using manual OAuth
            const mockFirebaseUser = {
              uid: 'github-' + data.access_token.substring(0, 16),
              email: data.email || `github_${Date.now()}@ueh.edu.vn`,
              displayName: data.name || 'GitHub User',
              photoURL: null,
              phoneNumber: null
            };
            if (data.token) localStorage.setItem('ueh_tcc_token', data.token);
            const dbUser = await syncUserWithBackend(mockFirebaseUser);

            hasBackendSessionRef.current = true;
            setLoggedInUser(dbUser);
            window.dispatchEvent(new Event('ueh-tcc-session-changed'));
            setAuthSuccessMsg('Đăng nhập GitHub thành công!');
          } else {
            const errorMsg = data.message || 'Lỗi lấy token từ GitHub.';
            setAuthError(errorMsg);
            alert(`Lỗi đăng nhập GitHub: ${errorMsg}`);
          }
        } catch (error) {
          console.error("Lỗi xác thực GitHub code:", error);
          setAuthError(`Lỗi đăng nhập GitHub: ${error.message}`);
          alert(`Lỗi đăng nhập GitHub: ${error.message}`);
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    handleOAuthReturn();
  }, [navigate, handleGoogleAuthSuccess, setLoggedInUser]);

  const handleGoogleLogin = async () => {
    setAuthError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '889879979247-ui1p4bgdv0vah7sfddhfmpejtqtr2npv.apps.googleusercontent.com';
    const redirectUri = window.location.origin;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile`;
    window.location.href = url;
  };

  const handleGithubLogin = async () => {
    setAuthError('');
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23livA8dLXS0qzY0kt';
    const state = createOAuthState();
    sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=user%3Aemail&state=${encodeURIComponent(state)}`;
    window.location.href = url;
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
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        if (data.otpCode) {
          setForgotOtp(data.otpCode);
        }
        setAuthSuccessMsg(data.message || 'Mã OTP gồm 6 chữ số đã được gửi đến email của bạn.');
        setForgotStep(2);
        return;
      }

      setAuthError(data.message || 'Email này chưa đăng ký tài khoản trên hệ thống.');
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("Forgot password request notice:", error.name);
      setAuthError(
        error.name === 'AbortError'
          ? 'Máy chủ phản hồi quá lâu. Vui lòng thử gửi lại mã OTP.'
          : 'Không thể gửi mã OTP lúc này. Vui lòng kiểm tra kết nối và thử lại.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!forgotEmail || !forgotOtp || forgotOtp.trim().length !== 6 || !forgotNewPassword) {
      setAuthError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setAuthError('Mật khẩu mới phải có ít nhất 6 ký tự!');
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
      const data = await response.json();
      if (response.ok && data.success) {
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
    } catch {
      setAuthError('Không thể kết nối đến backend để xác thực OTP.');
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
      const dbUser = await syncUserWithBackend(result.user);
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
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    hasBackendSessionRef.current = false;
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('ueh_tcc_user');
    localStorage.removeItem('ueh_tcc_token');
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
      setUploadMsg('Lỗi kết nối server Backend! Hãy chắc chắn server port 3001 đã khởi động.');
    }
  };

  return (
    <>
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
                    className="user-profile-pill-btn"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    aria-haspopup="menu"
                    aria-expanded={showUserDropdown}
                  >
                    <div className="user-avatar-circle">
                      {loggedInUser.avatar ? (
                        <img src={loggedInUser.avatar} alt={loggedInUser.name} />
                      ) : (
                        <span>{loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <span className="user-profile-name-text">{loggedInUser.name}</span>
                    <ChevronDown size={14} />
                  </button>

                  {showUserDropdown && (
                    <div className="user-dropdown-card" role="menu">
                      <div className="user-dropdown-header">
                        <div className="dropdown-avatar-circle">
                          {loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : 'U'}
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
