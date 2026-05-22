import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, Eye, FileText, ArrowLeft, ArrowUpRight, AlertTriangle, BookOpen } from 'lucide-react';
import { documentsData, midtermExams } from '../data/documentsData';
import { API_BASE_URL } from '../config';
import '../assets/styles/Document.css';

export default function DocDetail() {
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
        if (response.ok && data.success) {
          const apiDocs = data.resources.documentsData || [];
          const apiMidterms = data.resources.midtermExams || [];
          resourcesList = [...apiDocs, ...apiMidterms];
        } else {
          resourcesList = [...documentsData, ...midtermExams];
        }
      } catch (error) {
        resourcesList = [...documentsData, ...midtermExams];
      }

      const currentDoc = resourcesList.find(item => item.id === id);
      if (!currentDoc) {
        // If document not found, redirect to Home
        navigate('/');
        return;
      }
      setDoc(currentDoc);

      // List other publications in sidebar (excluding current)
      const filtered = resourcesList.filter(item => item.id !== id && !item.externalUrl);
      setOtherDocs(filtered.slice(0, 5));
      setLoading(false);
    };

    loadResource();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  if (loading || !doc) {
    return <div className="loading-doc">Đang tải tài liệu...</div>;
  }

  const pdfUrl = `/docs/${doc.pdf}`;
  const coverImage = doc.image ? `/images/${doc.image}` : '/images/tccvang.jpg';

  return (
    <div className="doc-detail-page">
      {/* breadcrumb banner */}
      <div className="doc-detail-banner">
        <div className="container">
          <Link to="/" className="btn-back">
            <ArrowLeft size={16} />
            <span>Quay lại trang chủ</span>
          </Link>
          <span className="doc-detail-category">{doc.categoryLabel || 'Đề thi giữa kỳ'}</span>
          <h1 className="doc-detail-title">{doc.title}</h1>
          <div className="doc-detail-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>⏰ Cập nhật: {doc.date || '09/08/2025'}</span>
            </div>
            <div className="meta-item">
              <Eye size={14} />
              <span>1,200+ Lượt xem</span>
            </div>
            <div className="meta-item">
              <FileText size={14} />
              <span>Định dạng: PDF</span>
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
                    <h3>Trải nghiệm xem di động</h3>
                    <p>Nhằm tối ưu hóa tốc độ tải và ngăn ngừa vỡ giao diện trên điện thoại, bạn có thể tải về hoặc mở file PDF trực tiếp bằng ứng dụng đọc chuyên dụng của thiết bị.</p>
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
                      <p className="preview-desc">{doc.desc || 'Tài liệu ôn thi Toán Cao Cấp tuyển chọn kỹ lưỡng dành cho các bạn sinh viên UEH.'}</p>
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                        <Download size={16} />
                        <span>Mở trực tiếp PDF</span>
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
                      <span>Trình Xem Tài Liệu Trực Tuyến</span>
                    </div>
                    <a href={pdfUrl} download className="btn btn-secondary btn-small">
                      <Download size={14} />
                      <span>Tải xuống bản gốc</span>
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
                <h3 className="sidebar-section-title">CÁC ẤN PHẨM KHÁC</h3>
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
                          <span className="sidebar-item-date">📅 {item.date || '09/08/2025'}</span>
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
