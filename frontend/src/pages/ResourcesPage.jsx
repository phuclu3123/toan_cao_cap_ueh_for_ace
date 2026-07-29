import { useEffect, useMemo, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Grid,
  HelpCircle,
  List,
  Search
} from 'lucide-react';
import DocCard from '../components/DocCard';
import { documentsData as localDocs } from '../data/documentsData';
import { API_BASE_URL } from '../config';
import { formatResourceDate, sortResourcesByNewest } from '../utils/resourceDate';
import { mergeResourceItems } from '../utils/resourceMerge';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import BrandLoader from '../components/ui/BrandLoader';
import '../assets/styles/Resources.css';

const itemsPerPage = 12;

export default function ResourcesPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const location = useLocation();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize active tab from URL query params
  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const category = params.get('category');
      const query = params.get('q');
      setActiveTab(category === 'midterm' || category === 'final' || category === 'publication' ? category : 'all');
      setSearchQuery(query || '');
      setCurrentPage(1);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [location.search]);

  // Load resources from API or fallbacks
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await response.json();
        if (response.ok && data.success && data.resources?.documentsData) {
          setDocs(mergeResourceItems(data.resources.documentsData, localDocs));
        } else {
          setDocs(localDocs);
        }
      } catch {
        setDocs(localDocs);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const allItems = useMemo(() => {
    const publications = docs.map((doc) => ({
      ...doc,
      type: 'publication',
      displayCategory: doc.categoryLabel || (language === 'vi' ? 'Tài liệu học tập' : 'Study Material')
    }));

    let source = publications;
    if (activeTab === 'slide') {
      source = publications.filter(item => item.id.startsWith('slide-') || item.id.startsWith('lxt-'));
    } else if (activeTab === 'support') {
      source = publications.filter(item => item.category === 'support' || item.id.startsWith('tl'));
    } else if (activeTab === 'latest') {
      source = publications.filter(item => item.category === 'latest');
    }

    const newestFirst = sortResourcesByNewest(source);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return newestFirst;

    return newestFirst.filter((item) => {
      const haystack = [item.title, item.desc, item.displayCategory, item.categoryLabel].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [activeTab, docs, searchQuery, language]);

  const totalPages = Math.max(1, Math.ceil(allItems.length / itemsPerPage));
  const paginatedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const pageCopy = {
    vi: {
      title: 'Thư Viện Ấn Phẩm & Tài Liệu Học Tập',
      description: 'Tổng hợp giáo trình chuẩn, slide bài giảng giảng viên, tài liệu chuyên đề và bài tập chương Toán Cao Cấp UEH.',
      index: 'Danh mục thư viện',
      formats: 'PDF · Slide · Chuyên đề',
      groupedTitle: 'Nội dung được gom theo nhu cầu học.',
      groupedDescription: 'Thư viện ưu tiên tài liệu dùng ngay: giáo trình, bài tập chương, PDF ôn tập và tài liệu giữa kỳ. Các bài luyện thi tương tác được tách sang phòng luyện thi riêng.',
      allDocs: 'Tất cả tài liệu',
      slides: 'Slide bài giảng',
      support: 'Chuyên đề & bài tập',
      exams: 'Đến phòng thi TCC',
      results: 'tài liệu phù hợp'
    },
    en: {
      title: 'Publications & Study Library',
      description: 'Official textbooks, lecture slides, topic notes, and practice exercises for UEH Advanced Calculus.',
      index: 'Library index',
      formats: 'PDF · Slides · Topic notes',
      groupedTitle: 'Resources grouped by study needs.',
      groupedDescription: 'The library prioritizes directly applicable documents: textbooks, exercises, midterm review files, and mock exams. Interactive exams are structured inside the dedicated practice rooms.',
      allDocs: 'All documents',
      slides: 'Lecture slides',
      support: 'Topics & exercises',
      exams: 'Go to TCC exams',
      results: 'matching resources'
    }
  };
  const copy = pageCopy[language] || pageCopy.en;

  return (
    <div className="resources-page">
      <section className="resources-banner" aria-labelledby="resources-page-title">
        <div className="resources-banner-geometry" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="container resources-banner-grid">
          <div className="resources-banner-copy">
          <span className="resources-banner-subtitle">{t.resources.bannerSubtitle}</span>
            <h1 id="resources-page-title" className="resources-banner-title">{copy.title}</h1>
            <p className="resources-banner-desc">{copy.description}</p>
          </div>
          <aside className="library-index-card" aria-label={copy.index}>
            <BookMarked size={22} aria-hidden="true" />
            <span>{copy.index}</span>
            <strong>{loading ? '—' : docs.length}</strong>
            <small>{copy.formats}</small>
          </aside>
        </div>
      </section>

      <div className="container resources-control-panel">
        <div className="controls-wrapper" role="search">
          <div className="search-and-view-row">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} aria-hidden="true" />
              <label className="sr-only" htmlFor="resource-search">{t.resources.searchPlaceholder}</label>
              <input
                id="resource-search"
                type="text"
                className="search-field"
                placeholder={t.resources.searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="layout-toggle-buttons" aria-label={language === 'vi' ? 'Kiểu hiển thị' : 'View style'}>
              <button className={`btn-layout-toggle ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'} aria-label={t.resources.titleGrid}>
                <Grid size={18} aria-hidden="true" />
              </button>
              <button className={`btn-layout-toggle ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'} aria-label={t.resources.titleList}>
                <List size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="resources-tabs-wrapper" aria-label={language === 'vi' ? 'Bộ lọc tài liệu' : 'Resource filters'}>
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} aria-pressed={activeTab === 'all'} onClick={() => handleTabClick('all')}>{copy.allDocs} ({docs.length})</button>
            <button className={`tab-btn ${activeTab === 'slide' ? 'active' : ''}`} aria-pressed={activeTab === 'slide'} onClick={() => handleTabClick('slide')}>{copy.slides}</button>
            <button className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`} aria-pressed={activeTab === 'support'} onClick={() => handleTabClick('support')}>{copy.support}</button>
            <Link to="/exams" className="tab-btn highlight-exam-tab">
              <ClipboardCheck size={16} aria-hidden="true" />
              {copy.exams}
            </Link>
          </div>
        </div>
      </div>

      <section className="resource-quality-strip">
        <div className="container quality-strip-grid">
          <div>
            <span className="resources-banner-subtitle">{t.resources.bannerSubtitle}</span>
            <h2>{copy.groupedTitle}</h2>
          </div>
          <p>{copy.groupedDescription}</p>
        </div>
      </section>

      <section className="resources-content-section">
        <div className="container">
          {!loading && (
            <div className="resource-results-heading" aria-live="polite">
              <span>{allItems.length}</span> {copy.results}
            </div>
          )}
          {loading ? (
            <BrandLoader compact label={t.docDetail.loading} />
          ) : paginatedItems.length === 0 ? (
            <div className="empty-results">
              <div className="empty-icon-box">
                <HelpCircle size={32} />
              </div>
              <h3 className="empty-title">{t.resources.emptyTitle}</h3>
              <p className="empty-desc">{t.resources.emptyDesc}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="resources-grid">
              {paginatedItems.map((item) => {
                return item.externalUrl ? (
                  <div key={item.id} className="doc-card glass-panel external-card">
                    <div className="card-image-wrapper">
                      <img
                        src={`/images/${item.image || 'tccvang.jpg'}`}
                        alt={item.title}
                        className="card-image"
                        loading="lazy"
                        onError={(event) => { event.currentTarget.src = '/images/tccvang.jpg'; }}
                      />
                      <div className="card-category-tag">{item.displayCategory}</div>
                    </div>
                    <div className="card-body">
                      <div className="card-meta">
                        <span>{formatResourceDate(item)}</span>
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
                        loading="lazy"
                        onError={(event) => { event.currentTarget.src = '/images/tccvang.jpg'; }}
                      />
                    </div>
                    <div className="list-info">
                      <span className="list-category-badge">{item.displayCategory || item.categoryLabel}</span>
                      <h3 className="list-title">{item.title}</h3>
                      <p className="list-desc">{item.desc}</p>
                    </div>
                    <div className="list-action-area">
                      {item.externalUrl ? (
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-small">
                          <Download size={14} />
                          <span>{t.resources.btnDriveShort}</span>
                        </a>
                      ) : (
                        <Link to={`/document/${item.id}`} className="btn btn-primary btn-small">{t.resources.btnPdfShort}</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-container">
              <button className="btn-page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label={t.common.pagePrev}>
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} className={`btn-page ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              ))}
              <button className="btn-page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} aria-label={t.common.pageNext}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
