import React, { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DocDetail from './pages/DocDetail';
import GiftPage from './pages/GiftPage';
import ResourcesPage from './pages/ResourcesPage';
import './App.css';

const ExamDetail = lazy(() => import('./pages/ExamDetail'));

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

export default function App() {
  return <RouterProvider router={router} />;}
