import { createContext, useState, useEffect, lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactLauncher from './components/layout/ContactLauncher';
import ScrollManager from './components/layout/ScrollManager';
import AppBootLifecycle from './components/layout/AppBootLifecycle';
import MotionOrchestrator from './components/layout/MotionOrchestrator';
import PageTransition from './components/layout/PageTransition';
import Home from './pages/Home';
import GiftPage from './pages/GiftPage';
import ResourcesPage from './pages/ResourcesPage';
import CoursesPage from './pages/CoursesPage';
import ExamsPage from './pages/ExamsPage';
import BlogPage from './pages/BlogPage';
import PayOSApiPage from './pages/PayOSApiPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { safeLocalStorage, safeSessionStorage } from './utils/safeStorage';
import './App.css';
import './assets/styles/experience.css';

// Create Global Contexts
// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();

// Dynamic chunk fetch error recovery wrapper with loop protection
function safeLazy(importFunc) {
  return lazy(() =>
    importFunc().catch((error) => {
      const errorMsg = error.message || '';
      const isChunkError =
        error.name === 'TypeError' ||
        errorMsg.indexOf('Failed to fetch') !== -1 ||
        errorMsg.indexOf('dynamically imported module') !== -1;

      if (isChunkError) {
        const hasAttempted = safeSessionStorage.getItem('chunk_reload_attempted');
        if (!hasAttempted) {
          safeSessionStorage.setItem('chunk_reload_attempted', 'true');
          console.warn('Chunk loading failed. Dynamic module mismatch, reloading page once...', error);
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw error;
    })
  );
}

const BlogDetailPage = safeLazy(() => import('./pages/BlogDetailPage'));
const DocDetail = safeLazy(() => import('./pages/DocDetail'));
const ExamDetail = safeLazy(() => import('./pages/ExamDetail'));

function Layout() {
  const location = useLocation();
  const isGiftPage = location.pathname === '/20-10';
  const isExamPage = location.pathname.startsWith('/exam/');
  
  const showHeaderFooter = !isGiftPage && !isExamPage;

  return (
    <div className="app-container">
      <AppBootLifecycle />
      <ScrollManager />
      <MotionOrchestrator />
      {showHeaderFooter && <Navbar />}
      <main id="main-content" className="main-content" tabIndex="-1">
        <PageTransition />
      </main>
      {showHeaderFooter && <ContactLauncher />}
      {showHeaderFooter && <Footer />}
    </div>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: 'courses',
        element: <CoursesPage />
      },
      {
        path: 'exams',
        element: <ExamsPage />
      },
      {
        path: 'blog',
        element: <BlogPage />
      },
      {
        path: 'blog/:slug',
        element: (
          <Suspense fallback={<div className="loading-doc text-center">Đang tải bài viết chuyên sâu...</div>}>
            <BlogDetailPage />
          </Suspense>
        )
      },
      {
        path: 'payos-api',
        element: <PayOSApiPage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'resources',
        element: <ResourcesPage />
      },
      {
        path: 'document/:id',
        element: (
          <Suspense fallback={<div className="loading-doc text-center">Đang tải tài liệu...</div>}>
            <DocDetail />
          </Suspense>
        )
      },
      {
        path: 'exam/:id',
        element: (
          <Suspense fallback={<div className="loading-doc text-center">Đang tải phòng thi...</div>}>
            <ExamDetail />
          </Suspense>
        )
      },
      {
        path: '20-10',
        element: <GiftPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

function AppProviders({ children }) {
  const [language, setLanguage] = useState(() => safeLocalStorage.getItem('ueh_tcc_lang') || 'vi');
  const [theme, setTheme] = useState(() => safeLocalStorage.getItem('ueh_tcc_theme') || 'light');

  useEffect(() => {
    safeLocalStorage.setItem('ueh_tcc_lang', language);
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : language;
  }, [language]);

  useEffect(() => {
    safeLocalStorage.setItem('ueh_tcc_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
