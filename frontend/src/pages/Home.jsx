import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Download, Send, CheckCircle, AlertCircle, FileText, HelpCircle, User, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { documentsData as localDocs, midtermExams as localMidterms, finalExams as localFinals } from '../data/documentsData';
import DocCard from '../components/DocCard';
import { API_BASE_URL } from '../config';
import { formatResourceDate } from '../utils/resourceDate';
import { mergeResourceItems } from '../utils/resourceMerge';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/Home.css';

export default function Home() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [professorFilter, setProfessorFilter] = useState('all');
  const [docCategoryTab, setDocCategoryTab] = useState('all');
  const [finalPage, setFinalPage] = useState(1);
  const [midtermPage, setMidtermPage] = useState(1);
  const [docsPage, setDocsPage] = useState(1);
  
  // Dynamic database lists
  const [docs, setDocs] = useState([]);
  const [midterms, setMidterms] = useState([]);
  const [finals, setFinals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('idle'); // idle | loading | success | error
  const [contactStatusMsg, setContactStatusMsg] = useState('');

  const itemsPerHomePage = 6;

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
          setDocs(localDocs);
          setMidterms(localMidterms);
          setFinals(localFinals);
        }
      } catch (error) {
        setDocs(localDocs);
        setMidterms(localMidterms);
        setFinals(localFinals);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setContactStatus('loading');
    setContactStatusMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setContactStatus('success');
        setContactStatusMsg(data.message);
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
      } else {
        setContactStatus('error');
        setContactStatusMsg(data.message || t.contact.error);
      }
    } catch (error) {
      // Offline fallback
      setTimeout(() => {
        setContactStatus('success');
        setContactStatusMsg(t.contact.success);
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
      }, 1000);
    }
  };

  // Filters Midterm Exams
  const filteredMidtermExams = professorFilter === 'all'
    ? midterms
    : midterms.filter(exam => exam.professor === professorFilter);

  // Filters Publications
  const filteredDocs = docCategoryTab === 'all'
    ? docs
    : docs.filter(doc => doc.category === docCategoryTab);

  const finalExamOrder = new Map(localFinals.map((exam, index) => [exam.id, index]));
  const isPracticeExam = (exam) => exam.hasDetailRoute;
  const practiceFinalExams = finals
    .filter(isPracticeExam)
    .sort((a, b) => (finalExamOrder.get(a.id) ?? 999) - (finalExamOrder.get(b.id) ?? 999));

  const getPaginatedItems = (items, page) => {
    const startIndex = (page - 1) * itemsPerHomePage;
    return items.slice(startIndex, startIndex + itemsPerHomePage);
  };

  const getTotalPages = (items) => Math.max(1, Math.ceil(items.length / itemsPerHomePage));

  const paginatedFinals = getPaginatedItems(practiceFinalExams, finalPage);
  const paginatedMidterms = getPaginatedItems(filteredMidtermExams, midtermPage);
  const paginatedDocs = getPaginatedItems(filteredDocs, docsPage);

  const handleProfessorFilterChange = (filter) => {
    setProfessorFilter(filter);
    setMidtermPage(1);
  };

  const handleDocCategoryChange = (category) => {
    setDocCategoryTab(category);
    setDocsPage(1);
  };

  const PaginationControls = ({ currentPage, totalPages, onPageChange, label }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="home-pagination" aria-label={label}>
        <button
          type="button"
          className="home-page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            className={`home-page-btn ${currentPage === pageNumber ? 'active' : ''}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          className="home-page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Trang sau"
        >
          <ChevronRight size={18} />
        </button>

        <span className="home-page-summary">Trang {currentPage} / {totalPages}</span>
      </div>
    );
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section id="hero" className="hero-section">
        <div className="hero-background-overlay"></div>
        <div className="container hero-container">
          <div className="hero-grid">
            <div className="hero-content">
              <span className="hero-badge animate-float">
                <Sparkles size={14} className="text-teal" />
                <span>{t.hero.kicker}</span>
              </span>
              <h1 className="hero-title">
                {t.hero.title1}<span className="gradient-text">{t.hero.title2}</span>
              </h1>
              <p className="hero-desc">
                {t.hero.desc}
              </p>
              <div className="hero-buttons">
                <a href="#midterm" className="btn btn-primary">
                  <BookOpen size={16} />
                  <span>{t.hero.btnMidterm}</span>
                </a>
                <a href="#docs" className="btn btn-secondary">
                  <FileText size={16} />
                  <span>{t.hero.btnDoc}</span>
                </a>
              </div>
            </div>
            <div className="hero-media">
              <div className="video-card glass-panel">
                <img src="/images/hp.avif" alt="UEH TCC Background" className="video-thumbnail" />
                <a href="https://youtu.be/iAhWqqvZ3og" target="_blank" rel="noopener noreferrer" className="pulsating-play-btn" aria-label="Play video">
                  <Play size={24} fill="currentColor" />
                </a>
                <span className="video-card-badge">{t.hero.watchVideo}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="about-section section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-area">
              <div className="about-image-wrapper">
                <img 
                  src="/images/hẹ hẹ.jpg" 
                  alt="Lữ Phúc UEH" 
                  className="about-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                />
                <div className="about-image-decoration"></div>
              </div>
            </div>
            <div className="about-content">
              <span className="section-subtitle">{t.about.sectionSubtitle}</span>
              <h2>{t.about.title}</h2>
              <p className="fst-italic text-teal">
                {t.about.quote}
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <div className="feature-icon"><HelpCircle size={20} /></div>
                  <div className="feature-text">
                    <h4>{t.about.feat1Title}</h4>
                    <p>{t.about.feat1Desc}</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><Sparkles size={20} /></div>
                  <div className="feature-text">
                    <h4>{t.about.feat2Title}</h4>
                    <p>{t.about.feat2Desc}</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><User size={20} /></div>
                  <div className="feature-text">
                    <h4>{t.about.feat3Title}</h4>
                    <p>{t.about.feat3Desc}</p>
                  </div>
                </div>
              </div>
              <p className="author-signature" dangerouslySetInnerHTML={{ __html: t.about.signature }}></p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FINAL EXAMS (ĐỀ THI TCC) SECTION */}
      <section id="exams" className="exams-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">{t.finals.sectionSubtitle}</span>
            <h2>{t.finals.title}</h2>
            <p>{t.finals.desc}</p>
          </div>

          <div className="exams-grid">
            {paginatedFinals.map((exam, index) => (
              <div key={exam.id} className="exam-card glass-panel">
                <div className="exam-card-header">
                  <span className="exam-index">{(((finalPage - 1) * itemsPerHomePage) + index + 1).toString().padStart(2, '0')}</span>
                  <span className="exam-date">{formatResourceDate(exam)}</span>
                </div>
                <div className="exam-card-body">
                  <h3>{exam.title}</h3>
                  <p>{exam.desc}</p>
                </div>
                <div className="exam-card-footer">
                  <Link to={`/exam/${exam.id}`} className="btn-exam-action">
                    {t.finals.btnAction}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={finalPage}
            totalPages={getTotalPages(practiceFinalExams)}
            onPageChange={setFinalPage}
            label={t.finals.sectionSubtitle}
          />
        </div>
      </section>

      {/* 4. MIDTERM EXAMS (ĐỀ GIỮA KỲ CÁC THẦY) SECTION */}
      <section id="midterm" className="midterm-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">{t.midterms.sectionSubtitle}</span>
            <h2>{t.midterms.title}</h2>
            <p>{t.midterms.desc}</p>
          </div>

          {/* Midterm Filter tabs */}
          <div className="filter-tabs-wrapper">
            <div className="filter-tabs glass-panel">
              <button className={`filter-tab-btn ${professorFilter === 'all' ? 'active' : ''}`} onClick={() => handleProfessorFilterChange('all')}>{t.midterms.filterAll}</button>
              <button className={`filter-tab-btn ${professorFilter === 'pnta' ? 'active' : ''}`} onClick={() => handleProfessorFilterChange('pnta')}>Thầy Phan Ngô Tuấn Anh</button>
              <button className={`filter-tab-btn ${professorFilter === 'ndt' ? 'active' : ''}`} onClick={() => handleProfessorFilterChange('ndt')}>Thầy Nguyễn Đình Tuấn</button>
              <button className={`filter-tab-btn ${professorFilter === 'ntv' ? 'active' : ''}`} onClick={() => handleProfessorFilterChange('ntv')}>Thầy Ngô Trấn Vũ</button>
              <button className={`filter-tab-btn ${professorFilter === 'ntvv' ? 'active' : ''}`} onClick={() => handleProfessorFilterChange('ntvv')}>Thầy Nguyễn Thanh Vân</button>
            </div>
          </div>

          <div className="midterm-grid">
            {paginatedMidterms.map((exam) => (
              <div key={exam.id} className="midterm-card glass-panel">
                <div className="midterm-card-img-wrapper">
                  <img 
                    src={`/images/${exam.image}`} 
                    alt={exam.title} 
                    className="midterm-card-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                  />
                  <div className="midterm-prof-badge">{exam.professorName}</div>
                </div>
                <div className="midterm-card-body">
                  <h3>{exam.title}</h3>
                  <p>{exam.desc}</p>
                  <Link to={`/document/${exam.id}`} className="btn btn-secondary w-full text-center">
                    <Download size={14} />
                    <span>{t.midterms.btnAction}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={midtermPage}
            totalPages={getTotalPages(filteredMidtermExams)}
            onPageChange={setMidtermPage}
            label={t.midterms.sectionSubtitle}
          />
        </div>
      </section>

      {/* 5. PUBLICATIONS (ẤN PHẨM) SECTION */}
      <section id="docs" className="docs-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">{t.docs.sectionSubtitle}</span>
            <h2>{t.docs.title}</h2>
            <p>{t.docs.desc}</p>
          </div>

          {/* Category Tabs */}
          <div className="filter-tabs-wrapper">
            <div className="filter-tabs category-tabs glass-panel">
              <button className={`filter-tab-btn ${docCategoryTab === 'all' ? 'active' : ''}`} onClick={() => handleDocCategoryChange('all')}>{t.docs.tabAll}</button>
              <button className={`filter-tab-btn ${docCategoryTab === 'latest' ? 'active' : ''}`} onClick={() => handleDocCategoryChange('latest')}>{t.docs.tabLatest}</button>
              <button className={`filter-tab-btn ${docCategoryTab === 'support' ? 'active' : ''}`} onClick={() => handleDocCategoryChange('support')}>{t.docs.tabSupport}</button>
              <button className={`filter-tab-btn ${docCategoryTab === 'other' ? 'active' : ''}`} onClick={() => handleDocCategoryChange('other')}>{t.docs.tabOther}</button>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="docs-grid">
            {paginatedDocs.map((doc) => (
              doc.externalUrl ? (
                // If it is a direct Google Drive link
                <div key={doc.id} className="doc-card glass-panel external-card">
                  <div className="card-image-wrapper">
                    <img 
                      src={`/images/${doc.image}`} 
                      alt={doc.title} 
                      className="card-image"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/tccvang.jpg'; }}
                    />
                    <div className="card-category-tag">{t.docs.externalLabel}</div>
                  </div>
                  <div className="card-body">
                    <div className="card-meta">
                      <span>⏰ {formatResourceDate(doc)}</span>
                    </div>
                    <h3 className="card-title">
                      <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer">{doc.title}</a>
                    </h3>
                    <p className="card-desc">{doc.desc}</p>
                    <div className="card-footer">
                      <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-read-more">
                        <span>{t.docs.btnDrive}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <DocCard key={doc.id} doc={doc} />
              )
            ))}
          </div>

          <PaginationControls
            currentPage={docsPage}
            totalPages={getTotalPages(filteredDocs)}
            onPageChange={setDocsPage}
            label={t.docs.sectionSubtitle}
          />
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="contact-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">{t.contact.sectionSubtitle}</span>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.desc}</p>
          </div>

          <div className="contact-card glass-panel">
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="c-name">{t.contact.labelName}</label>
                  <input
                    type="text"
                    id="c-name"
                    className="form-input"
                    placeholder={t.contact.placeholderName}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-email">{t.contact.labelEmail}</label>
                  <input
                    type="email"
                    id="c-email"
                    className="form-input"
                    placeholder={t.contact.placeholderEmail}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="c-subject">{t.contact.labelSubject}</label>
                <input
                  type="text"
                  id="c-subject"
                  className="form-input"
                  placeholder={t.contact.placeholderSubject}
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="c-message">{t.contact.labelMessage}</label>
                <textarea
                  id="c-message"
                  className="form-input text-area"
                  rows="5"
                  placeholder={t.contact.placeholderMessage}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" disabled={contactStatus === 'loading'}>
                <Send size={15} />
                <span>{t.contact.btnSubmit}</span>
              </button>

              {contactStatus === 'loading' && <div className="status-msg loading">{t.contact.loading}</div>}
              {contactStatus === 'success' && (
                <div className="status-msg success">
                  <CheckCircle size={15} />
                  <span>{contactStatusMsg}</span>
                </div>
              )}
              {contactStatus === 'error' && (
                <div className="status-msg error">
                  <AlertCircle size={15} />
                  <span>{contactStatusMsg}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
