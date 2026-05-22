import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';
import { finalExams } from '../data/documentsData';
import { API_BASE_URL } from '../config';
import '../assets/styles/ExamDetail.css';

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'hint', message: '' }
  const [otherExams, setOtherExams] = useState([]);

  // Check if current exam is k50-dot-2
  useEffect(() => {
    if (id !== 'k50-dot-2') {
      // We currently only have a detailed mock interactive view for k50-dot-2, 
      // other IDs should redirect or open the general document view.
      navigate('/document/ap1');
      return;
    }

    const loadOtherExams = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`);
        const data = await response.json();
        if (response.ok && data.success) {
          const apiFinals = data.resources.finalExams || [];
          const filtered = apiFinals.filter(exam => exam.id !== id);
          setOtherExams(filtered);
        } else {
          const filtered = finalExams.filter(exam => exam.id !== id);
          setOtherExams(filtered);
        }
      } catch (error) {
        const filtered = finalExams.filter(exam => exam.id !== id);
        setOtherExams(filtered);
      }
    };

    loadOtherExams();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  // Typeset math on mount and when solution is toggled
  useEffect(() => {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise()
        .catch((err) => console.log('MathJax typesetting failed: ', err));
    }
  }, [showSolution, feedback]);

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    const trimmed = userAnswer.trim();
    if (!trimmed) return;

    if (trimmed === '1000') {
      setFeedback({
        type: 'success',
        message: 'Chính xác! Đáp án đúng là 1000. Bạn đã giải quyết bài toán cực kỳ xuất sắc! 🎉'
      });
    } else if (trimmed.toLowerCase().includes('1000')) {
      setFeedback({
        type: 'success',
        message: 'Hoàn hảo! R0 = 1000 là kết quả chính xác.'
      });
    } else {
      setFeedback({
        type: 'error',
        message: 'Chưa chính xác rồi! Hãy thử tính toán lại nhé. Hoặc click vào "Gợi ý cách giải" ở bên dưới.'
      });
    }
  };

  const handleShowHint = () => {
    setFeedback({
      type: 'hint',
      message: 'Gợi ý: Tìm hệ số co giãn \\( \\varepsilon(P) = Q\'(P) \\cdot \\frac{P}{Q} \\). Cho trị tuyệt đối bằng 2 để giải tìm \\( P \\). Từ đó tìm được lượng cầu \\( Q \\) ứng với giá đó, rồi tính doanh thu \\( R_0 = P \\cdot Q \\).'
    });
  };

  const handleResetAnswer = () => {
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <div className="exam-detail-page">
      {/* breadcrumb banner */}
      <div className="exam-detail-banner">
        <div className="container">
          <Link to="/" className="btn-back">
            <ArrowLeft size={16} />
            <span>Quay lại trang chủ</span>
          </Link>
          <span className="exam-detail-category">Đề thi cuối kỳ chính thức</span>
          <h1 className="exam-detail-title">Đề thi Toán Cao Cấp K50 Đợt 2</h1>
          <div className="exam-detail-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>⏰ Kỳ thi: Cuối học kỳ - Khóa K50</span>
            </div>
            <div className="meta-item">
              <Award size={14} />
              <span>Độ khó: Khó (Highly Advanced)</span>
            </div>
            <div className="meta-item">
              <BookOpen size={14} />
              <span>Được biên soạn bởi UEH TCC</span>
            </div>
          </div>
        </div>
      </div>

      <section className="exam-detail-content section">
        <div className="container">
          <div className="exam-detail-grid">
            
            {/* LEFT AREA: Exam Questions and Interactive Board */}
            <div className="exam-main-content">
              <div className="exam-card-paper glass-panel">
                <div className="exam-paper-header">
                  <div className="exam-title-badge">
                    <Sparkles size={16} className="text-teal" />
                    <span>NỘI DUNG ĐỀ THI</span>
                  </div>
                  <span className="exam-duration">Thời gian làm bài: 60 phút</span>
                </div>
                
                <div className="exam-paper-body">
                  <div className="exam-section-label">PHẦN TRẮC NGHIỆM</div>
                  
                  <div className="question-item">
                    <div className="question-number">Bài 1</div>
                    <div className="question-text">
                      <p>
                        Hàm cầu của một sản phẩm được cho bởi:
                        <span className="math-display">
                          {"$$Q = \\sqrt{500 - 4P}$$"}
                        </span>
                        {"(trong đó \\(P\\) là giá bán và \\(Q\\) là lượng cầu sản phẩm). "}
                        {"Ta ký hiệu \\(\\varepsilon(P)\\) là hệ số co giãn của lượng cầu theo giá tại mức giá \\(P\\). "}
                        {"Gọi \\(R_0\\) là doanh thu khi \\(|\\varepsilon(P)| = 2\\)."}
                      </p>
                      <p className="question-target">
                        <strong>Yêu cầu:</strong> {"Xác định giá trị của doanh thu \\(R_0\\)."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE WORKSPACE CARD */}
              <div className="interactive-card glass-panel">
                <div className="interactive-header">
                  <HelpCircle size={20} className="text-teal animate-pulse" />
                  <h3>Góc Thực Hành Tương Tác</h3>
                </div>
                <p className="interactive-intro">
                  {"Hãy thử tự mình giải quyết bài toán trên và nhập kết quả số của doanh thu \\(R_0\\) vào ô bên dưới để tự động kiểm tra năng lực của bản thân nhé!"}
                </p>

                <form onSubmit={handleCheckAnswer} className="interactive-form">
                  <div className="answer-input-wrapper">
                    <label htmlFor="user-answer">{"Đáp án của bạn (ví dụ: 1000, 500,...):"}</label>
                    <div className="input-row">
                      <input
                        type="text"
                        id="user-answer"
                        className="form-input"
                        placeholder="Nhập giá trị R0..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={feedback?.type === 'success'}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={!userAnswer || feedback?.type === 'success'}
                      >
                        Kiểm tra
                      </button>
                    </div>
                  </div>

                  <div className="interactive-actions">
                    <button 
                      type="button" 
                      className="btn-link text-teal" 
                      onClick={handleShowHint}
                      disabled={feedback?.type === 'success'}
                    >
                      💡 Xem gợi ý
                    </button>
                    {(feedback || userAnswer) && (
                      <button 
                        type="button" 
                        className="btn-link text-gray" 
                        onClick={handleResetAnswer}
                      >
                        <RefreshCw size={14} />
                        <span>Làm lại</span>
                      </button>
                    )}
                  </div>
                </form>

                {feedback && (
                  <div className={`feedback-alert ${feedback.type}`}>
                    {feedback.type === 'success' && <CheckCircle2 className="alert-icon" size={18} />}
                    {feedback.type === 'error' && <AlertCircle className="alert-icon" size={18} />}
                    {feedback.type === 'hint' && <Sparkles className="alert-icon" size={18} />}
                    <div className="feedback-message">{feedback.message}</div>
                  </div>
                )}
              </div>

              {/* DETAILED SOLUTION CARD */}
              <div className="solution-container">
                <button 
                  className={`btn-solution-toggle glass-panel ${showSolution ? 'active' : ''}`}
                  onClick={() => setShowSolution(!showSolution)}
                >
                  <div className="toggle-label">
                    <BookOpen size={18} className="text-teal" />
                    <span>{showSolution ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết từng bước'}</span>
                  </div>
                  {showSolution ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showSolution && (
                  <div className="solution-details glass-panel animate-fade-in">
                    <div className="solution-section">
                      <h4>Bước 1: Tính đạo hàm của lượng cầu theo giá</h4>
                      <p>
                        Ta có hàm cầu:
                        {"$$Q(P) = \\sqrt{500 - 4P} = (500 - 4P)^{1/2}$$"}
                      </p>
                      <p>
                        {"Lấy đạo hàm của \\(Q\\) theo biến số \\(P\\) áp dụng công thức đạo hàm hàm hợp \\((u^\\alpha)' = \\alpha \\cdot u^{\\alpha-1} \\cdot u'\\):"}
                        {"$$Q'(P) = \\frac{dQ}{dP} = \\frac{1}{2}(500 - 4P)^{-1/2} \\cdot (-4) = \\frac{-2}{\\sqrt{500 - 4P}} = \\frac{-2}{Q}$$"}
                      </p>
                    </div>

                    <div className="solution-section">
                      <h4>Bước 2: Thiết lập công thức hệ số co giãn</h4>
                      <p>
                        {"Công thức hệ số co giãn của lượng cầu theo giá là:"}
                        {"$$\\varepsilon(P) = Q'(P) \\cdot \\frac{P}{Q}$$"}
                      </p>
                      <p>
                        {"Thay đạo hàm \\(Q'(P)\\) vừa tính ở Bước 1 vào công thức co giãn:"}
                        {"$$\\varepsilon(P) = \\frac{-2}{\\sqrt{500 - 4P}} \\cdot \\frac{P}{\\sqrt{500 - 4P}} = \\frac{-2P}{500 - 4P}$$"}
                      </p>
                    </div>

                    <div className="solution-section">
                      <h4>Bước 3: Giải phương trình tìm mức giá khi trị tuyệt đối hệ số co giãn bằng 2</h4>
                      <p>
                        {"Theo yêu cầu đề bài, doanh thu \\(R_0\\) đạt được khi độ lớn của hệ số co giãn co giãn bằng 2:"}
                        {"$$|\\varepsilon(P)| = 2$$"}
                      </p>
                      <p>
                        {"Với điều kiện giá \\(P \\ge 0\\) và cầu \\(Q > 0 \\Rightarrow 500 - 4P > 0 \\Rightarrow P < 125\\), biểu thức co giãn \\(\\varepsilon(P) = \\frac{-2P}{500-4P}\\) luôn luôn mang giá trị âm. Do đó:"}
                        {"$$|\\varepsilon(P)| = \\frac{2P}{500 - 4P} = 2$$"}
                      </p>
                      <p>
                        Giải phương trình trên:
                        {"$$\\Rightarrow 2P = 2(500 - 4P)$$"}
                        {"$$\\Rightarrow P = 500 - 4P$$"}
                        {"$$\\Rightarrow 5P = 500 \\Rightarrow P_0 = 100$$"}
                      </p>
                      <p>
                        {"Mức giá thỏa mãn yêu cầu là \\(P_0 = 100\\) (đồng/sản phẩm) (thỏa mãn điều kiện \\(P < 125\\))."}
                      </p>
                    </div>

                    <div className="solution-section">
                      <h4>Bước 4: Tính lượng cầu và doanh thu tối ưu</h4>
                      <p>
                        {"Với mức giá \\(P_0 = 100\\), lượng cầu tương ứng của thị trường là:"}
                        {"$$Q_0 = \\sqrt{500 - 4(100)} = \\sqrt{100} = 10$$"}
                      </p>
                      <p>
                        {"Doanh thu bán hàng tương ứng được tính bằng công thức \\(R = P \\cdot Q\\):"}
                        {"$$R_0 = P_0 \\cdot Q_0 = 100 \\cdot 10 = 1000$$"}
                      </p>
                      <p className="solution-conclusion">
                        <strong>Kết luận:</strong> {"Giá trị doanh thu cần tìm là "}<strong>R0 = 1000</strong>{" đơn vị tiền tệ."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT AREA: Sidebar other exams */}
            <aside className="exam-sidebar">
              <div className="sidebar-section glass-panel">
                <h3 className="sidebar-section-title">CÁC ĐỀ THI KHÁC</h3>
                <div className="sidebar-list">
                  {otherExams.map((item, idx) => (
                    <Link key={idx} to={item.hasDetailRoute ? `/exam/${item.id}` : `/document/${item.id}`} className="sidebar-item">
                      <div className="sidebar-info-exam">
                        <h4 className="sidebar-item-title">{item.title}</h4>
                        <span className="sidebar-item-date">📅 {item.date}</span>
                        <p className="sidebar-item-desc">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="sidebar-section glass-panel formula-cheat-sheet">
                <h3 className="sidebar-section-title">CÔNG THỨC ÔN TẬP</h3>
                <div className="cheat-sheet-content">
                  <div className="cheat-item">
                    <h5>Hệ số co giãn (Elasticity)</h5>
                    <p>{"\\(\\varepsilon(P) = Q'(P) \\cdot \\frac{P}{Q}\\)"}</p>
                  </div>
                  <div className="cheat-item">
                    <h5>Doanh thu (Revenue)</h5>
                    <p>{"\\(R = P \\cdot Q\\)"}</p>
                  </div>
                  <div className="cheat-item">
                    <h5>Doanh thu biên (Marginal Revenue)</h5>
                    <p>{"\\(MR = R'(Q) = P \\cdot \\left(1 + \\frac{1}{\\varepsilon(Q)}\\right)\\)"}</p>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </div>
  );
}
