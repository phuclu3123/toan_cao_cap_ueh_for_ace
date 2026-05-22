import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, BookOpen, Download, Send, CheckCircle, AlertCircle, FileText, HelpCircle, Heart, User, Sparkles } from 'lucide-react';
import { documentsData as localDocs, midtermExams as localMidterms, finalExams as localFinals } from '../data/documentsData';
import DocCard from '../components/DocCard';
import { API_BASE_URL } from '../config';
import '../assets/styles/Home.css';

export default function Home() {
  const [professorFilter, setProfessorFilter] = useState('all');
  const [docCategoryTab, setDocCategoryTab] = useState('all');
  
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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await response.json();
        if (response.ok && data.success) {
          setDocs(data.resources.documentsData || []);
          setMidterms(data.resources.midtermExams || []);
          setFinals(data.resources.finalExams || []);
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
        setContactStatusMsg(data.message || 'Lỗi gửi tin nhắn.');
      }
    } catch (error) {
      // Offline fallback
      setTimeout(() => {
        setContactStatus('success');
        setContactStatusMsg('Tin nhắn của bạn đã được gửi thành công! (Chế độ demo offline)');
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
                <span>Nền tảng hỗ trợ học tập số 1 UEH</span>
              </span>
              <h1 className="hero-title">
                Đây Là <span className="gradient-text">Nơi Hỗ Trợ Toán Cao Cấp</span>
              </h1>
              <p className="hero-desc">
                Chào mừng các bạn đến với góc học tập Toán Cao Cấp (TCC) dành riêng cho sinh viên UEH. Chúng tôi đồng hành giúp bạn chinh phục điểm số A, A+ dễ dàng hơn!
              </p>
              <div className="hero-buttons">
                <a href="#midterm" className="btn btn-primary">
                  <BookOpen size={16} />
                  <span>Đề Thi Giữa Kỳ</span>
                </a>
                <a href="#docs" className="btn btn-secondary">
                  <FileText size={16} />
                  <span>Tài Liệu Ôn Tập</span>
                </a>
              </div>
            </div>
            <div className="hero-media">
              <div className="video-card glass-panel">
                <img src="/images/hp.avif" alt="UEH TCC Background" className="video-thumbnail" />
                <a href="https://youtu.be/iAhWqqvZ3og" target="_blank" rel="noopener noreferrer" className="pulsating-play-btn" aria-label="Play video">
                  <Play size={24} fill="currentColor" />
                </a>
                <span className="video-card-badge">Xem video hướng dẫn học</span>
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
              <span className="section-subtitle">VỀ CHÚNG TÔI</span>
              <h2>Tại Sao Tôi Lại Lập Ra Trang WEB Này?</h2>
              <p className="fst-italic text-teal">
                "Khó khăn vẫn còn đó, nhưng ít nhất giờ đây bạn đã có tôi đồng hành."
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <div className="feature-icon"><HelpCircle size={20} /></div>
                  <div className="feature-text">
                    <h4>Vượt qua khó khăn cấp 3</h4>
                    <p>Biết rằng Toán Cao Cấp là một môn học khá trừu tượng và khó khăn với các bạn học sinh cấp 3 thiên hướng xã hội khi mới bước chân vào UEH.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><Sparkles size={20} /></div>
                  <div className="feature-text">
                    <h4>Đặt mục tiêu điểm A/A+</h4>
                    <p>Cung cấp ngân hàng câu hỏi, bài giảng trọng tâm phục vụ các bạn có mong muốn đạt điểm số tối đa A, A+ hay đơn giản cải thiện học lực môn Toán.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><User size={20} /></div>
                  <div className="feature-text">
                    <h4>Xây dựng cộng đồng học tập</h4>
                    <p>Tạo lập một cộng đồng gắn kết chia sẻ kinh nghiệm, các tài liệu ôn thi chất lượng, phi thương mại giúp giảm bớt áp lực thi cử cho sinh viên khóa dưới.</p>
                  </div>
                </div>
              </div>
              <p className="author-signature">
                Mình tên là <strong>Lữ Phúc</strong>, sinh viên UEH khóa K50. Rất vui và tự hào khi được hỗ trợ các bạn!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FINAL EXAMS (ĐỀ THI TCC) SECTION */}
      <section id="exams" className="exams-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">ĐỀ THI CUỐI KỲ</span>
            <h2>Lời Giải Toán Cao Cấp Qua Các Năm</h2>
            <p>Tuyển tập đầy đủ các đề thi chính thức từ nhà trường qua các khóa học, kèm đáp án lời giải cực kỳ chi tiết.</p>
          </div>

          <div className="exams-grid">
            {finals.slice(0, 4).map((exam, index) => (
              <div key={index} className="exam-card glass-panel">
                <div className="exam-card-header">
                  <span className="exam-index">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="exam-date">{exam.date}</span>
                </div>
                <div className="exam-card-body">
                  <h3>{exam.title}</h3>
                  <p>{exam.desc}</p>
                </div>
                <div className="exam-card-footer">
                  {exam.hasDetailRoute ? (
                    <Link to={`/exam/${exam.id}`} className="btn-exam-action">
                      Xem lời giải nháp
                    </Link>
                  ) : (
                    <Link to={`/document/ap1`} className="btn-exam-action">
                      Xem trong Tuyển tập
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/resources?category=final" className="btn btn-secondary">
              <span>Xem tất cả đề thi cuối kỳ ({finals.length})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MIDTERM EXAMS (ĐỀ GIỮA KỲ CÁC THẦY) SECTION */}
      <section id="midterm" className="midterm-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">ĐỀ THI GIỮA KỲ</span>
            <h2>Đề Thi Giữa Kỳ Của Các Thầy</h2>
            <p>Tham khảo các đề kiểm tra giữa kỳ do chính các giảng viên có tiếng tại UEH ra đề để làm quen cấu trúc đề.</p>
          </div>

          {/* Midterm Filter tabs */}
          <div className="filter-tabs-wrapper">
            <div className="filter-tabs glass-panel">
              <button className={`filter-tab-btn ${professorFilter === 'all' ? 'active' : ''}`} onClick={() => setProfessorFilter('all')}>Tất cả</button>
              <button className={`filter-tab-btn ${professorFilter === 'pnta' ? 'active' : ''}`} onClick={() => setProfessorFilter('pnta')}>Thầy Phan Ngô Tuấn Anh</button>
              <button className={`filter-tab-btn ${professorFilter === 'ndt' ? 'active' : ''}`} onClick={() => setProfessorFilter('ndt')}>Thầy Nguyễn Đình Tuấn</button>
              <button className={`filter-tab-btn ${professorFilter === 'ntv' ? 'active' : ''}`} onClick={() => setProfessorFilter('ntv')}>Thầy Ngô Trấn Vũ</button>
              <button className={`filter-tab-btn ${professorFilter === 'ntvv' ? 'active' : ''}`} onClick={() => setProfessorFilter('ntvv')}>Thầy Nguyễn Thanh Vân</button>
            </div>
          </div>

          <div className="midterm-grid">
            {filteredMidtermExams.slice(0, 3).map((exam) => (
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
                    <span>Xem Đề & Lời Giải</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to={`/resources?category=midterm`} className="btn btn-secondary">
              <span>Xem tất cả đề thi giữa kỳ ({midterms.length})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PUBLICATIONS (ẤN PHẨM) SECTION */}
      <section id="docs" className="docs-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">ẤN PHẨM & TÀI LIỆU</span>
            <h2>Nhìn Lại Các Ấn Phẩm Đặc Biệt</h2>
            <p>Các tài liệu ôn tập và bài viết tổng hợp phương pháp giải được đông đảo sinh viên yêu thích và tải xuống.</p>
          </div>

          {/* Category Tabs */}
          <div className="filter-tabs-wrapper">
            <div className="filter-tabs category-tabs glass-panel">
              <button className={`filter-tab-btn ${docCategoryTab === 'all' ? 'active' : ''}`} onClick={() => setDocCategoryTab('all')}>Tất cả</button>
              <button className={`filter-tab-btn ${docCategoryTab === 'latest' ? 'active' : ''}`} onClick={() => setDocCategoryTab('latest')}>Tài liệu mới nhất</button>
              <button className={`filter-tab-btn ${docCategoryTab === 'support' ? 'active' : ''}`} onClick={() => setDocCategoryTab('support')}>Tài liệu bổ trợ</button>
              <button className={`filter-tab-btn ${docCategoryTab === 'other' ? 'active' : ''}`} onClick={() => setDocCategoryTab('other')}>Tài liệu khác</button>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="docs-grid">
            {filteredDocs.slice(0, 3).map((doc) => (
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
                    <div className="card-category-tag">Liên kết ngoài</div>
                  </div>
                  <div className="card-body">
                    <div className="card-meta">
                      <span>⏰ {doc.date}</span>
                    </div>
                    <h3 className="card-title">
                      <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer">{doc.title}</a>
                    </h3>
                    <p className="card-desc">{doc.desc}</p>
                    <div className="card-footer">
                      <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-read-more">
                        <span>Tải trên Drive</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <DocCard key={doc.id} doc={doc} />
              )
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/resources?category=publication" className="btn btn-secondary">
              <span>Xem tất cả tài liệu & ấn phẩm ({docs.length})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="contact-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-subtitle">LIÊN HỆ</span>
            <h2>Gửi Tin Nhắn Cho Tôi</h2>
            <p>Nếu bạn có bất cứ thắc mắc nào về bài giảng hoặc muốn chia sẻ đề thi mới, đừng ngần ngại gửi thư về cho tôi nhé!</p>
          </div>

          <div className="contact-card glass-panel">
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="c-name">Họ và Tên</label>
                  <input
                    type="text"
                    id="c-name"
                    className="form-input"
                    placeholder="e.g. Nguyễn Văn A"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-email">Địa chỉ Email</label>
                  <input
                    type="email"
                    id="c-email"
                    className="form-input"
                    placeholder="e.g. mail@ueh.edu.vn"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="c-subject">Chủ đề</label>
                <input
                  type="text"
                  id="c-subject"
                  className="form-input"
                  placeholder="e.g. Đóng góp ý kiến lời giải TCC"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="c-message">Nội dung tin nhắn</label>
                <textarea
                  id="c-message"
                  className="form-input text-area"
                  rows="5"
                  placeholder="Điền nội dung bạn muốn gửi ở đây..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" disabled={contactStatus === 'loading'}>
                <Send size={15} />
                <span>Gửi lời nhắn</span>
              </button>

              {contactStatus === 'loading' && <div className="status-msg loading">Đang gửi thư liên hệ...</div>}
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
