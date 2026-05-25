import { useEffect, useMemo, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Grid, HelpCircle, List, Search } from 'lucide-react';
import DocCard from '../components/DocCard';
import { documentsData as localDocs, midtermExams as localMidterms, finalExams as localFinals } from '../data/documentsData';
import { API_BASE_URL } from '../config';
import { formatResourceDate } from '../utils/resourceDate';
import { mergeResourceItems } from '../utils/resourceMerge';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/Resources.css';

const itemsPerPage = 6;

const midtermCovers = ['tccvang.jpg', 'c123.jpg', 'c4678.jpg', 'bg.jpg'];

export default function ResourcesPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const location = useLocation();

  const [docs, setDocs] = useState([]);
  const [midterms, setMidterms] = useState([]);
  const [finals, setFinals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize active tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const query = params.get('q');
    setActiveTab(category === 'midterm' || category === 'final' || category === 'publication' ? category : 'all');
    setSearchQuery(query || '');
    setCurrentPage(1);
  }, [location]);

  // Load resources from API or fallbacks
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await response.json();
        if (response.ok && data.success && data.resources) {
          setDocs(mergeResourceItems(data.resources.documentsData || [], localDocs));
          setMidterms(mergeResourceItems(data.resources.midtermExams || [], localMidterms));
          setFinals(mergeResourceItems(data.resources.finalExams || [], localFinals));
        } else {
          setDocs(localDocs);
          setMidterms(localMidterms);
          setFinals(localFinals);
        }
      } catch {
        setDocs(localDocs);
        setMidterms(localMidterms);
        setFinals(localFinals);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const finalExamOrder = useMemo(() => new Map(localFinals.map((exam, index) => [exam.id, index])), []);
  const isPracticeExam = (exam) => exam.hasDetailRoute;
  
  const practiceFinalExams = useMemo(() => {
    return finals
      .filter(isPracticeExam)
      .sort((a, b) => (finalExamOrder.get(a.id) ?? 999) - (finalExamOrder.get(b.id) ?? 999));
  }, [finals, finalExamOrder]);

  const toPublicMidterm = (item, index) => {
    let title = item.title;
    let desc = item.desc;
    let professorName = item.professorName;
    
    if (language !== 'vi') {
      if (item.professorName) {
        const engProfName = item.professorName.replace('Thầy ', 'Prof. ');
        professorName = engProfName;
        if (language === 'en') {
          title = `Midterm Exam - ${engProfName}`;
          desc = `Collection of midterm exam papers for ${engProfName}'s class at UEH, with step-by-step detailed explanations.`;
        } else if (language === 'ja') {
          title = `中間試験 - ${item.professorName.replace('Thầy ', '')}先生`;
          desc = `UEHにおける${item.professorName.replace('Thầy ', '')}先生クラスの中間試験問題集。詳細な解説付き。`;
        } else if (language === 'zh') {
          title = `期中考试 - ${item.professorName.replace('Thầy ', '')}老师`;
          desc = `UEH${item.professorName.replace('Thầy ', '')}老师班级期中考试真题及详解。`;
        }
      } else {
        title = language === 'en' 
          ? `Midterm Calculus resource ${String(index + 1).padStart(2, '0')}`
          : language === 'ja'
            ? `中間微分積分リソース ${String(index + 1).padStart(2, '0')}`
            : `期中微积分资料 ${String(index + 1).padStart(2, '0')}`;
        desc = language === 'en'
          ? 'Midterm reference materials, grouped by topics, used as revision PDF materials.'
          : language === 'ja'
            ? 'トピックごとにグループ化された中間テスト対策用PDF資料。'
            : '按主题分组的期中复习PDF资料。';
      }
    }
    
    return {
      ...item,
      title,
      desc,
      categoryLabel: t.resources.tabMidterm,
      displayCategory: t.resources.tabMidterm,
      image: item.image || midtermCovers[index % midtermCovers.length],
      professorName: professorName || ''
    };
  };

  const toPublicFinal = (f) => {
    let title = f.title;
    let desc = f.desc;
    
    if (language !== 'vi') {
      const kMatch = f.title.match(/K\d+/);
      const codeMatch = f.title.match(/Mã Đề \d+/);
      const kStr = kMatch ? kMatch[0] : '';
      const codeStr = codeMatch ? codeMatch[0].replace('Mã Đề ', 'Code ') : '';
      
      if (language === 'en') {
        title = `Advanced Calculus ${kStr} ${codeStr || 'Practice Exam'}`;
        desc = f.desc
          .replace('Đề K51 mới nhất mã 204 từ main.pdf, làm bài trong 75 phút với chấm điểm tự động, cắm cờ câu khó và thống kê sau khi nộp.', 'Latest K51 exam code 204 from main.pdf, practice in 75 minutes with auto-grading, flags and statistics after submission.')
          .replace('mô phỏng bài kiểm tra cuối kỳ 75 phút chuyên nghiệp.', 'simulating a professional 75-minute final exam.')
          .replace('chuyển thành phòng luyện thi tương tác theo nhịp bài thi thật.', 'converted to an interactive exam room mimicking real exam pacing.')
          .replace('dùng để luyện tốc độ làm trắc nghiệm và kiểm tra đáp án sau khi nộp.', 'used for speed training and checking answers after submission.')
          .replace('Timer, cắm cờ và nộp bài tự động khi hết giờ.', 'Timer, flagging, and auto-submission when time is up.')
          .replace('đã chuyển thành bài kiểm tra tương tác thay vì chỉ xem lời giải.', 'converted to interactive test instead of static solution.')
          .replace('có chấm điểm tự động và bảng phân tích câu trả lời.', 'featuring auto-grading and detailed response analysis.')
          .replace('dùng để luyện phản xạ làm bài cuối kỳ theo cấu trúc đề thật.', 'used to build final exam reflexes modeled after real exam structure.')
          .replace('giữ đúng ghi chú đáp án của tài liệu nguồn khi luyện thi.', 'retains original answer keys from source document for study.')
          .replace('Chưa tìm thấy section đề K48 trong final 2807.pdf để chuyển thành bài kiểm tra tương tác.', 'K48 exam section not yet found in final 2807.pdf for interactive conversion.')
          .replace('gồm 20 câu trắc nghiệm để luyện bài dài hơn trong phòng thi.', 'includes 20 multiple-choice questions for longer exam practice.')
          .replace('chuyển từ tài liệu lời giải sang bài kiểm tra tương tác 75 phút.', 'converted from solution guide to interactive 75-minute exam.');
      } else if (language === 'ja') {
        title = `高等微積分 ${kStr} ${codeStr ? '問題' + codeStr.replace('Code ', '') : '模擬試験'}`;
        desc = `75分間のインタラクティブ模擬試験。自動採点、問題フラグ、詳細な結果分析に対応しています。`;
      } else if (language === 'zh') {
        title = `高等微积分 ${kStr} ${codeStr ? '试卷' + codeStr.replace('Code ', '') : '模拟考试'}`;
        desc = `75分钟互动式模拟考试。支持自动评分、标记难题和提交后的统计分析。`;
      }
    }
    
    return {
      ...f,
      title,
      desc,
      type: 'final',
      displayCategory: t.resources.badgeFinal
    };
  };

  const allItems = useMemo(() => {
    const publications = docs.map((doc) => ({
      ...doc,
      type: 'publication',
      displayCategory: doc.categoryLabel || t.resources.tabPub
    }));
    const publicMidterms = midterms.map((item, index) => ({
      ...toPublicMidterm(item, index),
      type: 'midterm'
    }));
    const publicFinals = practiceFinalExams.map((f) => ({
      ...toPublicFinal(f),
      type: 'final'
    }));

    const source = activeTab === 'publication'
      ? publications
      : activeTab === 'midterm'
        ? publicMidterms
        : activeTab === 'final'
          ? publicFinals
          : [...publications, ...publicMidterms, ...publicFinals];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return source;

    return source.filter((item) => {
      const haystack = [item.title, item.desc, item.displayCategory, item.categoryLabel].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [activeTab, docs, midterms, practiceFinalExams, searchQuery, language, t]);

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

  return (
    <div className="resources-page">
      <section className="resources-banner">
        <div className="container">
          <span className="resources-banner-subtitle">{t.resources.bannerSubtitle}</span>
          <h1 className="resources-banner-title">{t.resources.bannerTitle}</h1>
          <p className="resources-banner-desc">
            {t.resources.bannerDesc}
          </p>
        </div>
      </section>

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
              <button className={`btn-layout-toggle ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title={t.resources.titleGrid}>
                <Grid size={18} />
              </button>
              <button className={`btn-layout-toggle ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title={t.resources.titleList}>
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

      <section className="resource-quality-strip">
        <div className="container quality-strip-grid">
          <div>
            <span className="resources-banner-subtitle">{t.resources.bannerSubtitle}</span>
            <h2>{language === 'vi' ? 'Nội dung được gom theo nhu cầu học.' : 'Resources grouped by study needs.'}</h2>
          </div>
          <p>{language === 'vi' 
            ? 'Thư viện ưu tiên tài liệu dùng ngay: giáo trình, bài tập chương, PDF ôn tập và tài liệu giữa kỳ. Các bài luyện thi tương tác được tách sang phòng luyện thi riêng.'
            : 'The library prioritizes directly applicable documents: textbooks, exercises, midterm review files, and mock exams. Interactive exams are structured inside the dedicated practice exam rooms.'}
          </p>
        </div>
      </section>

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
            <div className="resources-grid">
              {paginatedItems.map((item) => {
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

                return item.externalUrl ? (
                  <div key={item.id} className="doc-card glass-panel external-card">
                    <div className="card-image-wrapper">
                      <img
                        src={`/images/${item.image || 'tccvang.jpg'}`}
                        alt={item.title}
                        className="card-image"
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
