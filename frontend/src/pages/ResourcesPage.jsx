import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Grid, List, ChevronLeft, ChevronRight, FileText, BookOpen, Calendar, HelpCircle, Download } from 'lucide-react';
import { documentsData as localDocs, midtermExams as localMidterms, finalExams as localFinals } from '../data/documentsData';
import DocCard from '../components/DocCard';
import { API_BASE_URL } from '../config';
import { formatResourceDate } from '../utils/resourceDate';
import { mergeResourceItems } from '../utils/resourceMerge';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/Resources.css';

export default function ResourcesPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const location = useLocation();
  
  // Dynamic resource lists fetched from API
  const [docs, setDocs] = useState([]);
  const [midterms, setMidterms] = useState([]);
  const [finals, setFinals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & view controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | midterm | final | publication
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Initialize active tab from URL query params (for "Xem tất cả" redirects)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveTab(catParam);
    } else {
      setActiveTab('all');
    }
    setCurrentPage(1);
  }, [location]);

  // Load resources from Express backend or static fallbacks
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await response.json();
        if (response.ok && data.success) {
          setDocs(mergeResourceItems(data.resources.documentsData || [], localDocs));
          setMidterms(mergeResourceItems(data.resources.midtermExams || [], localMidterms));
          setFinals(mergeResourceItems(data.resources.finalExams || [], localFinals));
        } else {
          // Fallback to local data
          setDocs(localDocs);
          setMidterms(localMidterms);
          setFinals(localFinals);
        }
      } catch (error) {
        // Fallback to local data if offline
        setDocs(localDocs);
        setMidterms(localMidterms);
        setFinals(localFinals);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Set page back to 1 when changing search query or tab
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const finalExamOrder = new Map(localFinals.map((exam, index) => [exam.id, index]));
  const isPracticeExam = (exam) => exam.hasDetailRoute;
  const practiceFinalExams = finals
    .filter(isPracticeExam)
    .sort((a, b) => (finalExamOrder.get(a.id) ?? 999) - (finalExamOrder.get(b.id) ?? 999));

  // Compile full list based on active tab and format appropriately
  const getFilteredItems = () => {
    let items = [];

    if (activeTab === 'all') {
      // Map all items to a uniform structure for display
      const mappedDocs = docs.map(d => ({ ...d, type: 'publication', displayCategory: d.categoryLabel || t.resources.tabPub }));
      const mappedMidterms = midterms.map(m => ({ ...m, type: 'midterm', displayCategory: t.resources.tabMidterm }));
      const mappedFinals = practiceFinalExams.map(f => ({ ...f, type: 'final', displayCategory: t.resources.badgeFinal }));
      items = [...mappedDocs, ...mappedMidterms, ...mappedFinals];
    } else if (activeTab === 'midterm') {
      items = midterms.map(m => ({ ...m, type: 'midterm', displayCategory: t.resources.tabMidterm }));
    } else if (activeTab === 'final') {
      items = practiceFinalExams.map(f => ({ ...f, type: 'final', displayCategory: t.resources.badgeFinal }));
    } else if (activeTab === 'publication') {
      items = docs.map(d => ({ ...d, type: 'publication', displayCategory: d.categoryLabel || t.resources.tabPub }));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.desc && item.desc.toLowerCase().includes(query)) ||
        (item.professorName && item.professorName.toLowerCase().includes(query))
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="resources-page">
      {/* 1. HERO BANNER */}
      <section className="resources-banner">
        <div className="container">
          <span className="resources-banner-subtitle">{t.resources.bannerSubtitle}</span>
          <h1 className="resources-banner-title">{t.resources.bannerTitle}</h1>
          <p className="resources-banner-desc">
            {t.resources.bannerDesc}
          </p>
        </div>
      </section>

      {/* 2. CONTROLS (SEARCH & TABS) */}
      <div className="container resources-control-panel">
        <div className="controls-wrapper">
          <div className="search-and-view-row">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-field" 
                placeholder={t.resources.searchPlaceholder} 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="layout-toggle-buttons">
              <button 
                className={`btn-layout-toggle ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
                title={t.resources.titleGrid}
              >
                <Grid size={18} />
              </button>
              <button 
                className={`btn-layout-toggle ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
                title={t.resources.titleList}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="resources-tabs-wrapper">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabClick('all')}>{t.resources.tabAllRes} ({docs.length + midterms.length + practiceFinalExams.length})</button>
            <button className={`tab-btn ${activeTab === 'midterm' ? 'active' : ''}`} onClick={() => handleTabClick('midterm')}>{t.resources.tabMidterm} ({midterms.length})</button>
            <button className={`tab-btn ${activeTab === 'final' ? 'active' : ''}`} onClick={() => handleTabClick('final')}>{t.resources.tabFinal} ({practiceFinalExams.length})</button>
            <button className={`tab-btn ${activeTab === 'publication' ? 'active' : ''}`} onClick={() => handleTabClick('publication')}>{t.resources.tabPub} ({docs.length})</button>
          </div>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <section className="resources-content-section">
        <div className="container">
          {loading ? (
            <div className="loading-doc text-center">{t.docDetail.loading}</div>
          ) : paginatedItems.length === 0 ? (
            <div className="empty-results">
              <div className="empty-icon-box">
                <HelpCircle size={32} />
              </div>
              <h3 className="empty-title">{t.resources.emptyTitle}</h3>
              <p className="empty-desc">{t.resources.emptyDesc}</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW MODE */
            <div className="resources-grid">
              {paginatedItems.map((item) => {
                // If it is a final exam
                if (item.type === 'final') {
                  return (
                    <div key={item.id} className="exam-card glass-panel flex flex-col justify-between">
                      <div className="exam-card-header">
                        <span className="exam-index">📝</span>
                        <span className="exam-date">{formatResourceDate(item)}</span>
                      </div>
                      <div className="exam-card-body">
                        <span className="list-category-badge">{t.resources.badgeFinal}</span>
                        <h3 className="text-lg font-bold mt-1 mb-2 text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-3">{item.desc}</p>
                      </div>
                      <div className="exam-card-footer mt-4">
                        <Link to={`/exam/${item.id}`} className="btn-exam-action">{t.finals.btnAction}</Link>
                      </div>
                    </div>
                  );
                }

                // If it is a midterm exam or standard doc
                return item.externalUrl ? (
                  <div key={item.id} className="doc-card glass-panel external-card">
                    <div className="card-image-wrapper">
                      <img 
                        src={`/images/${item.image}`} 
                        alt={item.title} 
                        className="card-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                      />
                      <div className="card-category-tag">{t.docs.externalLabel}</div>
                    </div>
                    <div className="card-body">
                      <div className="card-meta">
                        <span>⏰ {formatResourceDate(item)}</span>
                      </div>
                      <h3 className="card-title">
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">{item.title}</a>
                      </h3>
                      <p className="card-desc">{item.desc}</p>
                      <div className="card-footer">
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-read-more">
                          <span>{t.docs.btnDrive}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DocCard key={item.id} doc={item} />
                );
              })}
            </div>
          ) : (
            /* LIST VIEW MODE */
            <div className="resources-list">
              {paginatedItems.map((item) => {
                const coverImage = item.image ? `/images/${item.image}` : '/images/tccvang.jpg';
                return (
                  <div key={item.id} className="list-item-card glass-panel">
                    <div className="list-img-wrapper">
                      <img 
                        src={coverImage} 
                        alt={item.title} 
                        className="list-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                      />
                    </div>
                    <div className="list-info">
                      <span className="list-category-badge">{item.displayCategory}</span>
                      <h3 className="list-title">{item.title}</h3>
                      <p className="list-desc">{item.desc}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>📅 {t.resources.metaUpdate} {formatResourceDate(item)}</span>
                        {item.professorName && <span>👨‍🏫 {t.resources.metaProf} {item.professorName}</span>}
                      </div>
                    </div>
                    <div className="list-action-area">
                      {item.externalUrl ? (
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-small">
                          <Download size={14} />
                          <span>{t.resources.btnDriveShort}</span>
                        </a>
                      ) : item.type === 'final' ? (
                        <Link to={`/exam/${item.id}`} className="btn btn-primary btn-small">{t.resources.btnPracticeShort}</Link>
                      ) : (
                        <Link to={`/document/${item.id}`} className="btn btn-primary btn-small">{t.resources.btnPdfShort}</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="btn-page" 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                aria-label={t.common.pagePrev}
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`btn-page ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button 
                className="btn-page" 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                aria-label={t.common.pageNext}
              >
                <ChevronRight size={18} />
              </button>
              
              <span className="page-info">
                {t.common.pageSummary.replace('{current}', currentPage).replace('{total}', totalPages)}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
