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
import Footer from './components/Footer';
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
import { safeLocalStorage } from './utils/safeStorage';
import './App.css';
import './assets/styles/experience.css';

// Create Global Contexts
// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();

// Dynamic chunk fetch error recovery wrapper
function safeLazy(importFunc) {
  return lazy(() =>
    importFunc().catch((error) => {
      console.warn('Cập nhật phiên bản mới, đang tự động đồng bộ tài nguyên...', error);
      // Auto-reload to load fresh Vite chunk hashes from Netlify
      window.location.reload();
      return new Promise(() => {});
    })
  );
}

// Global Route Error Boundary to handle version updates gracefully
function GlobalErrorBoundary() {
  const error = useRouteError();
  const errorMsg = error?.message || error?.toString() || '';

  useEffect(() => {
    const isChunkError =
      errorMsg.indexOf('Failed to fetch') !== -1 ||
      errorMsg.indexOf('dynamically imported module') !== -1 ||
      errorMsg.indexOf('Importing binding') !== -1;

    if (isChunkError) {
      console.warn('Đang tự động làm mới trang để cập nhật phiên bản mới nhất...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [errorMsg]);

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <BrandLoader label="Đang làm mới dữ liệu hệ thống UEH TCC..." />
      <p style={{ marginTop: '16px', color: '#64748b', fontSize: '0.9rem' }}>
        Hệ thống đang tự động đồng bộ phiên bản mới nhất. Vui lòng đợi trong giây lát...
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary"
        style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '10px' }}
      >
        🔄 Tải lại trang ngay
      </button>
    </div>
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
  const isGiftPage = location.pathname === '/20-10';
  const isExamPage = location.pathname.startsWith('/exam/');

  useEffect(() => {
    const legacyHash = window.location.hash;
    if (!legacyHash.startsWith('#/')) return;

    const legacyTarget = legacyHash.slice(1);
    navigate(legacyTarget, { replace: true });
  }, [navigate]);

  const showHeaderFooter = !isGiftPage && !isExamPage;

  return (
    <CommunityProvider>
      <div className="app-container">
        <AppBootLifecycle />
        <ScrollManager />
        <MotionOrchestrator />
        {showHeaderFooter && <Navbar />}
        <main id="main-content" className="main-content" tabIndex="-1">
          <PageTransition />
        </main>
        <GlobalPlayer />
        {showHeaderFooter && <ContactLauncher />}
        {showHeaderFooter && <Footer />}
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
      <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
        <AuthProvider>
          <NotificationProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '889879979247-ui1p4bgdv0vah7sfddhfmpejtqtr2npv.apps.googleusercontent.com'}>
              <GlobalPlayerProvider>
                <RouterProvider router={router} />
              </GlobalPlayerProvider>
            </GoogleOAuthProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}
