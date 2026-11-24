import { createContext, useState, useEffect, lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  useNavigate,
  useParams,
  useRouteError
} from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import GoogleAuthTab from './pages/GoogleAuthTab';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import ContactLauncher from './components/layout/ContactLauncher';
import ScrollManager from './components/layout/ScrollManager';
import AppBootLifecycle from './components/layout/AppBootLifecycle';
import MotionOrchestrator from './components/layout/MotionOrchestrator';
import PageTransition from './components/layout/PageTransition';
import BrandLoader from './components/ui/BrandLoader';
import { GlobalPlayerProvider } from './contexts/GlobalPlayerContext';
import GlobalPlayer from './components/GlobalPlayer';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CheckoutSessionProvider } from './contexts/CheckoutSessionContext';
import CheckoutSessionDock from './components/CheckoutSessionDock';
import { CommunityProvider } from './contexts/CommunityContext';
const Home = safeLazy(() => import('./pages/Home'));
const GiftPage = safeLazy(() => import('./pages/GiftPage'));
const ResourcesPage = safeLazy(() => import('./pages/ResourcesPage'));
const CoursesPage = safeLazy(() => import('./pages/CoursesPage'));
const ExamsPage = safeLazy(() => import('./pages/ExamsPage'));
const BlogPage = safeLazy(() => import('./pages/BlogPage'));
const PayOSApiPage = safeLazy(() => import('./pages/PayOSApiPage'));
const AboutPage = safeLazy(() => import('./pages/AboutPage'));
const NotFoundPage = safeLazy(() => import('./pages/NotFoundPage'));
const CommunityPage = safeLazy(() => import('./pages/CommunityPage'));
const CommunityDetailPage = safeLazy(() => import('./pages/CommunityDetailPage'));
const CommunityProfilePage = safeLazy(() => import('./pages/CommunityProfilePage'));
const FlashcardStudyPage = safeLazy(() => import('./pages/StudyWorkspace'));
const FlashcardAdmin = safeLazy(() => import('./pages/FlashcardAdmin'));
const CourseCommerceAdmin = safeLazy(() => import('./pages/CourseCommerceAdmin'));
const PurchaseTerms = safeLazy(() => import('./pages/PurchaseTerms'));
import { safeLocalStorage } from './utils/safeStorage';
import { claimChunkRecovery, isRecoverableChunkError } from './utils/chunkRecovery';
import './App.css';
import './assets/styles/experience.css';
import './assets/styles/CommunityChrome.css';
import './assets/styles/InterfaceSystem.css';
import './assets/styles/PaperSurfaces.css';
import './assets/styles/CommunityPastel.css';
import './assets/styles/CommunityQuietLight.css';
import './assets/styles/CapsuleHeaderLight.css';
import './assets/styles/LearningSpacesLight.css';
import './assets/styles/LearningInterfaceRefresh.css';

// Create Global Contexts
// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();

const googleOneTapClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

function GoogleIdentityBoundary({ children }) {
  if (!googleOneTapClientId) return children;

  return (
    <GoogleOAuthProvider clientId={googleOneTapClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

// Dynamic chunk fetch error recovery wrapper
const lazyChunkReloadKey = 'ueh_tcc_lazy_chunk_reload_v1';
function safeLazy(importFunc) {
  return lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      if (!import.meta.env.PROD || !isRecoverableChunkError(error)) throw error;
      // A successful sibling import must not reset the guard for a failed chunk.
      let claimed = false;
      try { claimed = claimChunkRecovery(window.sessionStorage, lazyChunkReloadKey, error.message); } catch { /* Storage can be blocked. */ }
      if (!claimed) throw error;
      console.warn('Đang thử tải lại một lần sau lỗi nạp trang...', error);
      window.location.reload();
      // If navigation is blocked, the router still gets an actionable error.
      throw error;
    }
  });
}
// An error is terminal until an explicit retry; never disguise it as loading.
function GlobalErrorBoundary() {
  const error = useRouteError();
  return (
    <main className="route-load-error" role="alert">
      <span className="route-load-error-brand">α∫M4A</span>
      <h1>Chưa tải được trang</h1>
      <p>Giao diện chưa thể mở. Bạn có thể tải lại hoặc trở về trang chủ.</p>
      <div className="route-load-error-actions">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Thử tải lại</button>
        <a href="/">Về trang chủ</a>
      </div>
      {import.meta.env.DEV && <details><summary>Chi tiết lỗi phát triển</summary><pre>{error?.message || 'Lỗi không xác định.'}</pre></details>}
    </main>
  );
}

const BlogDetailPage = safeLazy(() => import('./pages/BlogDetailPage'));
const DocDetail = safeLazy(() => import('./pages/DocDetail'));
const ExamDetail = safeLazy(() => import('./pages/ExamDetail'));
const CourseDetail = safeLazy(() => import('./pages/CourseDetail'));
const ProfilePage = safeLazy(() => import('./pages/ProfilePage'));
const PaymentResult = safeLazy(() => import('./pages/PaymentResult'));

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isStudyPage = location.pathname === '/flashcards';
  const isCommunityPage = location.pathname === '/community' || location.pathname.startsWith('/community/');
  const [studyHeaderHidden, setStudyHeaderHidden] = useState(false);
  const isGiftPage = location.pathname === '/20-10';
  const isExamPage = location.pathname.startsWith('/exam/');

  useEffect(() => {
    const legacyHash = window.location.hash;
    if (!legacyHash.startsWith('#/')) return;

    const legacyTarget = legacyHash.slice(1);
    navigate(legacyTarget, { replace: true });
  }, [navigate]);

  const showHeaderFooter = !isGiftPage && !isExamPage;

  useEffect(() => {
    if (!isStudyPage) return;
    let previousY = window.scrollY;
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentY = Math.max(0, window.scrollY);
        if (document.querySelector('.header-wrapper')?.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) {
          setStudyHeaderHidden(false);
          previousY = currentY;
          return;
        }
        if (currentY < 100) setStudyHeaderHidden(false);
        else if (Math.abs(currentY - previousY) > 10) setStudyHeaderHidden(currentY > previousY);
        if (Math.abs(currentY - previousY) > 10 || currentY < 100) previousY = currentY;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => { window.removeEventListener('scroll', handleScroll); window.cancelAnimationFrame(frame); };
  }, [isStudyPage]);

  return (
    <CommunityProvider>
      <div className={`app-container${showHeaderFooter ? ' capsule-route' : ''}${isStudyPage ? ' study-route' : ''}${isCommunityPage ? ' community-route' : ''}${isStudyPage && studyHeaderHidden ? ' study-header-hidden' : ''}`}>
        <ScrollManager />
        <MotionOrchestrator />
        {showHeaderFooter && <Navbar />}
        <main id="main-content" className="main-content" tabIndex="-1">
          <span className="scroll-replay-top" data-scroll-replay-top aria-hidden="true"/>
          <PageTransition />
        </main>
        <GlobalPlayer />
        <CheckoutSessionDock />
        {showHeaderFooter && <ContactLauncher />}
        {showHeaderFooter && <Footer />}
        {showHeaderFooter && <CookieConsent />}
      </div>
    </CommunityProvider>
  );
}

function LegacyDocumentRedirect() {
  const { id } = useParams();
  return <Navigate to={`/document/${id}`} replace />;
}

function LegacyAccountRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/account${search}`} replace />;
}

const router = createBrowserRouter([
  { path: '/auth/google', element: <GoogleAuthTab /> },
  {
    path: '/',
    element: <Layout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải trang chủ..." />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'courses',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải danh sách khóa học..." />}>
            <CoursesPage />
          </Suspense>
        )
      },
      {
        path: 'course/:slug',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải khóa học E-Learning" />}>
            <CourseDetail />
          </Suspense>
        )
      },
      {
        path: 'community',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải Diễn đàn Toán học UEH..." />}>
            <CommunityPage />
          </Suspense>
        )
      },
      {
        path: 'community/:id',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải bài toán & lời giải..." />}>
            <CommunityDetailPage />
          </Suspense>
        )
      },
      {
        path: 'community/user/:id',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải hồ sơ thành viên..." />}>
            <CommunityProfilePage />
          </Suspense>
        )
      },
      {
        path: 'community/saved',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải bài toán đã lưu..." />}>
            <CommunityProfilePage defaultTab="saved" />
          </Suspense>
        )
      },
      {
        path: 'account',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải thông tin cá nhân" />}>
            <ProfilePage />
          </Suspense>
        )
      },
      {
        path: 'payment/result',
        element: (
          <Suspense fallback={<BrandLoader label="Đang đối soát giao dịch PayOS" />}>
            <PaymentResult />
          </Suspense>
        )
      },
      {
        path: 'exams',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải danh sách đề thi..." />}>
            <ExamsPage />
          </Suspense>
        )
      },
      {
        path: 'flashcards',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải Flashcard & Bài học..." />}>
            <FlashcardStudyPage />
          </Suspense>
        )
      },
      {
        path: 'study',
        element: <Navigate to="/flashcards" replace />
      },
      {
        path: 'admin/flashcards',
        element: <Suspense fallback={<BrandLoader label="Đang tải quản trị Flashcard…" />}><FlashcardAdmin /></Suspense>
      },
      {
        path: 'admin/courses',
        element: <Suspense fallback={<BrandLoader label="Đang tải quản trị khóa học…" />}><CourseCommerceAdmin /></Suspense>
      },
      {
        path: 'purchase-terms',
        element: <Suspense fallback={<BrandLoader label="Đang tải điều khoản mua…" />}><PurchaseTerms /></Suspense>
      },
      {
        path: 'blog',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải trang bài viết..." />}>
            <BlogPage />
          </Suspense>
        )
      },
      {
        path: 'blog/:slug',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải bài viết kiến thức" />}>
            <BlogDetailPage />
          </Suspense>
        )
      },
      {
        path: 'resources',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải kho tài liệu..." />}>
            <ResourcesPage />
          </Suspense>
        )
      },
      {
        path: 'document/:id',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải tài liệu học tập" />}>
            <DocDetail />
          </Suspense>
        )
      },
      {
        path: 'exam/:id',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải phòng thi trắc nghiệm" />}>
            <ExamDetail />
          </Suspense>
        )
      },
      {
        path: 'doc/:id',
        element: <LegacyDocumentRedirect />
      },
      {
        path: 'profile',
        element: <LegacyAccountRedirect />
      },
      {
        path: 'payos-api',
        element: <Navigate to="/payos-api-docs" replace />
      },
      {
        path: 'payos-api-docs',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải tài liệu API..." />}>
            <PayOSApiPage />
          </Suspense>
        )
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải giới thiệu..." />}>
            <AboutPage />
          </Suspense>
        )
      },
      {
        path: '20-10',
        element: (
          <Suspense fallback={<BrandLoader label="Đang tải quà tặng..." />}>
            <GiftPage />
          </Suspense>
        )
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<BrandLoader label="Đang xử lý..." />}>
            <NotFoundPage />
          </Suspense>
        )
      }
    ]
  }
]);

export default function App() {
  const [language, setLanguage] = useState(() => {
    return safeLocalStorage.getItem('ueh_tcc_lang') || 'vi';
  });

  const [theme, setTheme] = useState(() => {
    return safeLocalStorage.getItem('ueh_tcc_theme') || 'light';
  });

  useEffect(() => {
    safeLocalStorage.setItem('ueh_tcc_lang', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    safeLocalStorage.setItem('ueh_tcc_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'vi' ? 'en' : 'vi'));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      <AppBootLifecycle />
      <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
        <AuthProvider>
          <NotificationProvider>
            <CheckoutSessionProvider>
            <GoogleIdentityBoundary>
              <GlobalPlayerProvider>
                <RouterProvider router={router} />
              </GlobalPlayerProvider>
            </GoogleIdentityBoundary>
            </CheckoutSessionProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}
