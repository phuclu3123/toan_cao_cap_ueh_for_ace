import React, { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import Home from './pages/Home';
import DocDetail from './pages/DocDetail';
import GiftPage from './pages/GiftPage';
import ResourcesPage from './pages/ResourcesPage';
import CoursesPage from './pages/CoursesPage';
import ExamsPage from './pages/ExamsPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import PayOSApiPage from './pages/PayOSApiPage';
import './App.css';

// Create Global Contexts
export const LanguageContext = createContext();
export const ThemeContext = createContext();

// Dynamic chunk fetch error recovery wrapper
function safeLazy(importFunc) {
  return lazy(() =>
    importFunc().catch((error) => {
      const errorMsg = error.message || '';
      if (
        error.name === 'TypeError' ||
        errorMsg.indexOf('Failed to fetch') !== -1 ||
        errorMsg.indexOf('dynamically imported module') !== -1
      ) {
        console.warn('Chunk loading failed. Dynamic module mismatch, reloading page to fetch latest build...', error);
        window.location.reload();
      }
      throw error;
    })
  );
}

const ExamDetail = safeLazy(() => import('./pages/ExamDetail'));

function Layout() {
  const location = useLocation();
  const isGiftPage = location.pathname === '/20-10';
  const isExamPage = location.pathname.startsWith('/exam/');
  
  const showHeaderFooter = !isGiftPage && !isExamPage;

  return (
    <div className="app-container">
      {showHeaderFooter && <Navbar />}
      <main className="main-content">
        <Outlet />
      </main>
      {showHeaderFooter && <FloatingActions />}
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
        element: <BlogDetailPage />
      },
      {
        path: 'payos-api',
        element: <PayOSApiPage />
      },
      {
        path: 'resources',
        element: <ResourcesPage />
      },
      {
        path: 'document/:id',
        element: <DocDetail />
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
      }
    ]
  }
]);

export function AppProviders({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('ueh_tcc_lang') || 'vi');
  const [theme, setTheme] = useState(() => localStorage.getItem('ueh_tcc_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('ueh_tcc_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ueh_tcc_theme', theme);
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
