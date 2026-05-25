import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, Eye, FileText, ArrowLeft, ArrowUpRight, AlertTriangle, BookOpen } from 'lucide-react';
import { documentsData, midtermExams } from '../data/documentsData';
import { API_BASE_URL } from '../config';
import { formatResourceDate } from '../utils/resourceDate';
import { mergeResourceItems } from '../utils/resourceMerge';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/Document.css';

export default function DocDetail() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [otherDocs, setOtherDocs] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Screen size check for responsive PDF rendering
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch and load resource details when id changes
  useEffect(() => {
    const loadResource = async () => {
      setLoading(true);
      let resourcesList = [];
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await response.json();
        if (response.ok && data.success && data.resources) {
          const apiDocs = mergeResourceItems(data.resources.documentsData || [], documentsData);
          const apiMidterms = mergeResourceItems(data.resources.midtermExams || [], midtermExams);
          resourcesList = [...apiDocs, ...apiMidterms];
          const randomSidebarDocs = apiDocs
            .filter(item => item.id !== id && !item.externalUrl)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
          setOtherDocs(randomSidebarDocs);
        } else {
          resourcesList = [...documentsData, ...midtermExams];
          const randomSidebarDocs = documentsData
            .filter(item => item.id !== id && !item.externalUrl)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
          setOtherDocs(randomSidebarDocs);
        }
      } catch (error) {
        resourcesList = [...documentsData, ...midtermExams];
        const randomSidebarDocs = documentsData
          .filter(item => item.id !== id && !item.externalUrl)
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        setOtherDocs(randomSidebarDocs);
      }

      const currentDoc = resourcesList.find(item => item.id === id);
      if (!currentDoc) {
        // If document not found, redirect to Home
        navigate('/');
        return;
      }
      setDoc(currentDoc);

      setLoading(false);
    };

    loadResource();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  if (loading || !doc) {
    return <div className="loading-doc">{t.docDetail.loading}</div>;
  }

  const pdfUrl = `/docs/${doc.pdf}`;
  const coverImage = doc.image ? `/images/${doc.image}` : '/images/tccvang.jpg';
  const displayDate = formatResourceDate(doc, '09/08/2025');

  return (
    <div className="doc-detail-page">
      {/* breadcrumb banner */}
      <div className="doc-detail-banner">
        <div className="container">
          <Link to="/" className="btn-back">
            <ArrowLeft size={16} />
            <span>{t.docDetail.btnBack}</span>
          </Link>
          <span className="doc-detail-category">{doc.categoryLabel || t.resources.tabMidterm}</span>
          <h1 className="doc-detail-title">{doc.title}</h1>
          <div className="doc-detail-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>⏰ {t.resources.metaUpdate} {displayDate}</span>
            </div>
            <div className="meta-item">
              <Eye size={14} />
              <span>1,200{t.docDetail.viewsSuffix}</span>
            </div>
            <div className="meta-item">
              <FileText size={14} />
              <span>{t.docDetail.metaFormat} PDF</span>
            </div>
          </div>
        </div>
      </div>

      <section className="doc-detail-content section">
        <div className="container">
          <div className="doc-detail-grid">
            
            {/* LEFT AREA: PDF Viewer / Mobile Preview */}
            <div className="doc-main-content">
              {isMobile ? (
                /* Mobile optimized layout (No heavy iframe) */
                <div className="mobile-pdf-preview glass-panel">
                  <div className="preview-header">
                    <AlertTriangle className="text-teal" size={24} />
                    <h3>{t.docDetail.mobileTitle}</h3>
                    <p>{t.docDetail.mobileDesc}</p>
                  </div>
                  <div className="preview-card">
                    <img 
                      src={coverImage} 
                      alt={doc.title} 
                      className="preview-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                    />
                    <div className="preview-details">
                      <h4>{doc.title}</h4>
                      <p className="preview-desc">{doc.desc || (
                        language === 'vi' ? 'Tài liệu ôn thi Toán Cao Cấp tuyển chọn kỹ lưỡng dành cho các bạn sinh viên UEH.' :
                        language === 'en' ? 'Carefully selected Advanced Calculus study materials for UEH students.' :
                        language === 'ja' ? 'UEH学生向けに厳選された高等微積分学習教材。' :
                        '为UEH学生精选的高等微积分学习资料。'
                      )}</p>
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                        <Download size={16} />
                        <span>{t.docDetail.mobileBtn}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop embedded PDF viewer */
                <div className="desktop-pdf-viewer glass-panel">
                  <div className="viewer-header">
                    <div className="viewer-title">
                      <BookOpen size={16} className="text-teal" />
                      <span>{t.docDetail.desktopTitle}</span>
                    </div>
                    <a href={pdfUrl} download className="btn btn-secondary btn-small">
                      <Download size={14} />
                      <span>{t.docDetail.desktopBtn}</span>
                    </a>
                  </div>
                  <div className="iframe-container">
                    <iframe 
                      src={`${pdfUrl}#zoom=page-fit`}
                      title={doc.title}
                      className="pdf-iframe"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT AREA: Sidebar other documents */}
            <aside className="doc-sidebar">
              <div className="sidebar-section glass-panel">
                <h3 className="sidebar-section-title">{t.docDetail.sidebarTitle}</h3>
                <div className="sidebar-list">
                  {otherDocs.map((item) => {
                    const sideImage = item.image ? `/images/${item.image}` : '/images/tccvang.jpg';
                    return (
                      <Link key={item.id} to={`/document/${item.id}`} className="sidebar-item">
                        <div className="sidebar-img-wrapper">
                          <img 
                            src={sideImage} 
                            alt={item.title} 
                            className="sidebar-img"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                          />
                        </div>
                        <div className="sidebar-info">
                          <h4 className="sidebar-item-title">{item.title}</h4>
                          <span className="sidebar-item-date">📅 {formatResourceDate(item, '09/08/2025')}</span>
                        </div>
                        <ArrowUpRight size={14} className="sidebar-item-arrow" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </div>
  );
}
