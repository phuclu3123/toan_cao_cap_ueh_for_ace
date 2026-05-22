import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DocDetail from './pages/DocDetail';
import ExamDetail from './pages/ExamDetail';
import GiftPage from './pages/GiftPage';
import ResourcesPage from './pages/ResourcesPage';
import './App.css';

// Subcomponent to have access to useLocation
function AppContent() {
  const location = useLocation();
  const isGiftPage = location.pathname === '/20-10';

  return (
    <div className="app-container">
      {!isGiftPage && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/document/:id" element={<DocDetail />} />
          <Route path="/exam/:id" element={<ExamDetail />} />
          <Route path="/20-10" element={<GiftPage />} />
        </Routes>
      </main>
      {!isGiftPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

