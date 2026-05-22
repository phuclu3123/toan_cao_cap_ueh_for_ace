import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  ListChecks,
  RotateCcw,
  Send,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import '../assets/styles/ExamDetail.css';

const EXAM_DURATION_SECONDS = 75 * 60;

const questions = [
  {
    id: 'q1',
    section: 'Đạo hàm và co giãn',
    prompt: 'Cho hàm cầu \\(Q=\\sqrt{500-4P}\\). Gọi \\(R_0\\) là doanh thu khi \\(|\\varepsilon(P)|=2\\). Giá trị của \\(R_0\\) là:',
    options: [
      { id: 'A', text: '500' },
      { id: 'B', text: '750' },
      { id: 'C', text: '1000' },
      { id: 'D', text: '1250' }
    ],
    correct: 'C',
    explanation: 'Ta có \\(\\varepsilon(P)=\\frac{-2P}{500-4P}\\). Giải \\(\\frac{2P}{500-4P}=2\\) được \\(P=100\\), \\(Q=10\\), nên \\(R_0=1000\\).'
  },
  {
    id: 'q2',
    section: 'Ma trận',
    prompt: 'Với ma trận vuông \\(A\\) cấp 3, nếu \\(\\det(A)=2\\) thì \\(\\det(3A)\\) bằng:',
    options: [
      { id: 'A', text: '6' },
      { id: 'B', text: '18' },
      { id: 'C', text: '27' },
      { id: 'D', text: '54' }
    ],
    correct: 'D',
    explanation: 'Với ma trận cấp 3, \\(\\det(kA)=k^3\\det(A)\\). Do đó \\(\\det(3A)=27\\cdot2=54\\).'
  },
  {
    id: 'q3',
    section: 'Hệ phương trình',
    prompt: 'Một hệ phương trình tuyến tính có ma trận hệ số khả nghịch. Kết luận đúng là:',
    options: [
      { id: 'A', text: 'Hệ vô nghiệm' },
      { id: 'B', text: 'Hệ có vô số nghiệm' },
      { id: 'C', text: 'Hệ có nghiệm duy nhất' },
      { id: 'D', text: 'Không thể kết luận' }
    ],
    correct: 'C',
    explanation: 'Ma trận hệ số khả nghịch tương đương định thức khác 0, nên hệ Cramer có nghiệm duy nhất.'
  },
  {
    id: 'q4',
    section: 'Hàm nhiều biến',
    prompt: 'Điểm dừng của hàm \\(f(x,y)=x^2+y^2-4x+6y\\) là:',
    options: [
      { id: 'A', text: '\\((2,-3)\\)' },
      { id: 'B', text: '\\((-2,3)\\)' },
      { id: 'C', text: '\\((4,-6)\\)' },
      { id: 'D', text: '\\((0,0)\\)' }
    ],
    correct: 'A',
    explanation: 'Giải \\(f_x=2x-4=0\\), \\(f_y=2y+6=0\\) được \\((x,y)=(2,-3)\\).'
  },
  {
    id: 'q5',
    section: 'Cực trị',
    prompt: 'Với \\(f(x,y)=x^2+y^2\\), tại \\((0,0)\\) hàm số đạt:',
    options: [
      { id: 'A', text: 'Cực đại địa phương' },
      { id: 'B', text: 'Cực tiểu địa phương' },
      { id: 'C', text: 'Điểm yên ngựa' },
      { id: 'D', text: 'Không phải điểm tới hạn' }
    ],
    correct: 'B',
    explanation: '\\(f(x,y)\\ge0\\) với mọi \\((x,y)\\), và bằng 0 tại \\((0,0)\\), nên đây là cực tiểu.'
  },
  {
    id: 'q6',
    section: 'Không gian vectơ',
    prompt: 'Trong \\(\\mathbb{R}^3\\), ba vectơ độc lập tuyến tính sẽ sinh ra không gian có số chiều là:',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: 'Không xác định' }
    ],
    correct: 'C',
    explanation: 'Ba vectơ độc lập tuyến tính trong \\(\\mathbb{R}^3\\) tạo thành một cơ sở, nên sinh ra không gian 3 chiều.'
  },
  {
    id: 'q7',
    section: 'Định thức',
    prompt: 'Nếu đổi chỗ hai hàng của một ma trận vuông thì định thức của ma trận:',
    options: [
      { id: 'A', text: 'Không đổi' },
      { id: 'B', text: 'Đổi dấu' },
      { id: 'C', text: 'Nhân đôi' },
      { id: 'D', text: 'Bằng 0' }
    ],
    correct: 'B',
    explanation: 'Tính chất cơ bản của định thức: đổi chỗ hai hàng làm định thức đổi dấu.'
  },
  {
    id: 'q8',
    section: 'Mô hình kinh tế',
    prompt: 'Trong mô hình cân bằng thị trường đơn giản, điểm cân bằng thường được xác định bởi điều kiện:',
    options: [
      { id: 'A', text: 'Cung lớn hơn cầu' },
      { id: 'B', text: 'Cầu lớn hơn cung' },
      { id: 'C', text: 'Cung bằng cầu' },
      { id: 'D', text: 'Giá bằng 0' }
    ],
    correct: 'C',
    explanation: 'Điểm cân bằng thị trường là nơi lượng cung bằng lượng cầu tại một mức giá cân bằng.'
  },
  {
    id: 'q9',
    section: 'Tích phân ứng dụng',
    prompt: 'Nếu chi phí biên là \\(MC(q)=2q+5\\), phần chi phí biến đổi từ \\(q=0\\) đến \\(q=10\\) là:',
    options: [
      { id: 'A', text: '50' },
      { id: 'B', text: '100' },
      { id: 'C', text: '150' },
      { id: 'D', text: '200' }
    ],
    correct: 'C',
    explanation: '\\(\\int_0^{10}(2q+5)dq=[q^2+5q]_0^{10}=100+50=150\\).'
  },
  {
    id: 'q10',
    section: 'Giới hạn',
    prompt: 'Giới hạn \\(\\lim_{x\\to0}\\frac{\\sin x}{x}\\) bằng:',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '\\(+\\infty\\)' },
      { id: 'D', text: 'Không tồn tại' }
    ],
    correct: 'B',
    explanation: 'Đây là giới hạn lượng giác cơ bản: \\(\\lim_{x\\to0}\\frac{\\sin x}{x}=1\\).'
  }
];

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainSeconds}`;
};

export default function ExamDetail() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [submitReason, setSubmitReason] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flaggedQuestions.length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const result = useMemo(() => {
    const correctCount = questions.reduce((count, question) => (
      answers[question.id] === question.correct ? count + 1 : count
    ), 0);

    return {
      correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      answeredCount,
      unansweredCount,
      flaggedCount
    };
  }, [answers, answeredCount, unansweredCount, flaggedCount]);

  useEffect(() => {
    if (submitted) return;

    if (timeLeft <= 0) {
      setSubmitReason('time');
      setSubmitted(true);
      setShowSubmitModal(false);
      setShowExitModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!submitted) {
        event.preventDefault();
        event.returnValue = 'Bài làm chưa được nộp. Bạn có chắc muốn rời khỏi trang?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted]);

  useEffect(() => {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise().catch((error) => {
        console.log('MathJax typesetting failed: ', error);
      });
    }
  }, [currentIndex, submitted, answers]);

  const selectAnswer = (questionId, optionId) => {
    if (submitted) return;
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  };

  const toggleFlag = (questionId) => {
    if (submitted) return;
    setFlaggedQuestions((current) => (
      current.includes(questionId)
        ? current.filter((item) => item !== questionId)
        : [...current, questionId]
    ));
  };

  const submitExam = (reason = 'manual') => {
    setSubmitReason(reason);
    setSubmitted(true);
    setShowSubmitModal(false);
    setShowExitModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetExam = () => {
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedQuestions([]);
    setTimeLeft(EXAM_DURATION_SECONDS);
    setSubmitted(false);
    setSubmitReason('');
    setShowSubmitModal(false);
    setShowExitModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExit = () => {
    if (submitted) {
      navigate('/');
      return;
    }
    setShowExitModal(true);
  };

  const selectedAnswer = answers[currentQuestion.id];
  const isCurrentFlagged = flaggedQuestions.includes(currentQuestion.id);

  return (
    <div className="exam-practice-page">
      <header className="exam-practice-topbar">
        <button type="button" className="exam-back-btn" onClick={handleExit}>
          <ArrowLeft size={18} />
          <span>Thoát bài thi</span>
        </button>

        <div className="exam-live-status">
          <div className={`exam-timer ${timeLeft < 600 && !submitted ? 'danger' : ''}`}>
            <Clock size={18} />
            <span>{submitted ? 'Đã nộp bài' : formatTime(timeLeft)}</span>
          </div>
          <button type="button" className="exam-submit-inline" onClick={() => setShowSubmitModal(true)} disabled={submitted}>
            <Send size={16} />
            <span>Nộp bài</span>
          </button>
        </div>
      </header>

      <main className="exam-practice-shell">
        <section className="exam-practice-hero">
          <div>
            <span className="exam-kicker">UEH TCC Practice Test</span>
            <h1>Bài Kiểm Tra Mô Phỏng Toán Cao Cấp K50</h1>
            <p>
              Làm bài theo nhịp luyện thi thực tế: 75 phút, chấm điểm tự động, đánh dấu câu cần quay lại và xem phân tích sau khi nộp.
            </p>
          </div>

          <div className="exam-hero-stats">
            <div>
              <strong>{questions.length}</strong>
              <span>Câu hỏi</span>
            </div>
            <div>
              <strong>75</strong>
              <span>Phút</span>
            </div>
            <div>
              <strong>{progress}%</strong>
              <span>Hoàn thành</span>
            </div>
          </div>
        </section>

        {submitted && (
          <section className={`exam-result-panel ${submitReason === 'time' ? 'timeout' : ''}`}>
            <div className="result-icon">
              {submitReason === 'time' ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
            </div>
            <div className="result-copy">
              <span>{submitReason === 'time' ? 'Hết giờ làm bài' : 'Bài làm đã được ghi nhận'}</span>
              <h2>{result.score}/100 điểm</h2>
              <p>
                Đúng {result.correctCount}/{questions.length} câu, đã làm {result.answeredCount} câu, bỏ trống {result.unansweredCount} câu, đánh dấu {result.flaggedCount} câu.
              </p>
            </div>
            <button type="button" className="exam-reset-btn" onClick={resetExam}>
              <RotateCcw size={16} />
              <span>Làm lại bài thi</span>
            </button>
          </section>
        )}

        <div className="exam-practice-layout">
          <aside className="exam-control-panel">
            <div className="exam-panel-card">
              <div className="panel-heading">
                <ListChecks size={18} />
                <span>Bảng câu hỏi</span>
              </div>

              <div className="question-map">
                {questions.map((question, index) => {
                  const isAnswered = !!answers[question.id];
                  const isFlagged = flaggedQuestions.includes(question.id);
                  const isActive = index === currentIndex;
                  const isCorrect = submitted && answers[question.id] === question.correct;
                  const isWrong = submitted && answers[question.id] && answers[question.id] !== question.correct;

                  return (
                    <button
                      type="button"
                      key={question.id}
                      className={[
                        'question-map-btn',
                        isActive ? 'active' : '',
                        isAnswered ? 'answered' : '',
                        isFlagged ? 'flagged' : '',
                        isCorrect ? 'correct' : '',
                        isWrong ? 'wrong' : ''
                      ].join(' ')}
                      onClick={() => setCurrentIndex(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="exam-progress-block">
                <div className="progress-row">
                  <span>Tiến độ</span>
                  <strong>{answeredCount}/{questions.length}</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="exam-mini-stats">
                <div><span>Đã làm</span><strong>{answeredCount}</strong></div>
                <div><span>Bỏ trống</span><strong>{unansweredCount}</strong></div>
                <div><span>Cắm cờ</span><strong>{flaggedCount}</strong></div>
              </div>
            </div>

            <div className="exam-panel-card exam-rule-card">
              <div className="panel-heading">
                <BookOpen size={18} />
                <span>Quy chế làm bài</span>
              </div>
              <ul>
                <li>Không tải lại trang khi chưa nộp bài.</li>
                <li>Dùng cờ để đánh dấu câu cần quay lại.</li>
                <li>Hết giờ hệ thống sẽ tự động nộp bài.</li>
              </ul>
            </div>
          </aside>

          <section className="exam-question-panel">
            <div className="question-toolbar">
              <div>
                <span className="question-section">{currentQuestion.section}</span>
                <h2>Câu {currentIndex + 1} / {questions.length}</h2>
              </div>
              <button
                type="button"
                className={`flag-question-btn ${isCurrentFlagged ? 'active' : ''}`}
                onClick={() => toggleFlag(currentQuestion.id)}
                disabled={submitted}
              >
                <Flag size={16} />
                <span>{isCurrentFlagged ? 'Đã cắm cờ' : 'Cắm cờ'}</span>
              </button>
            </div>

            <div className="question-card">
              <p className="question-prompt">{currentQuestion.prompt}</p>

              <div className="answer-options">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const isCorrect = submitted && option.id === currentQuestion.correct;
                  const isWrong = submitted && isSelected && option.id !== currentQuestion.correct;

                  return (
                    <button
                      type="button"
                      key={option.id}
                      className={[
                        'answer-option',
                        isSelected ? 'selected' : '',
                        isCorrect ? 'correct' : '',
                        isWrong ? 'wrong' : ''
                      ].join(' ')}
                      onClick={() => selectAnswer(currentQuestion.id, option.id)}
                    >
                      <span className="option-key">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                      {isCorrect && <CheckCircle2 size={18} />}
                      {isWrong && <XCircle size={18} />}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="answer-explanation">
                  <div className="panel-heading">
                    <HelpCircle size={18} />
                    <span>Giải thích đáp án</span>
                  </div>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="question-actions">
              <button
                type="button"
                className="nav-question-btn"
                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={18} />
                <span>Câu trước</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="nav-question-btn primary"
                  onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button type="button" className="nav-question-btn primary" onClick={() => setShowSubmitModal(true)} disabled={submitted}>
                  <Send size={18} />
                  <span>Nộp bài</span>
                </button>
              )}
            </div>
          </section>
        </div>

        {submitted && (
          <section className="exam-review-panel">
            <div className="review-heading">
              <Award size={20} />
              <h2>Bảng phân tích câu trả lời</h2>
            </div>
            <div className="review-list">
              {questions.map((question, index) => {
                const selected = answers[question.id];
                const isCorrect = selected === question.correct;
                return (
                  <button
                    type="button"
                    key={question.id}
                    className={`review-row ${isCorrect ? 'correct' : 'wrong'}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <span>Câu {index + 1}</span>
                    <strong>{selected || 'Chưa chọn'}</strong>
                    <em>Đáp án đúng: {question.correct}</em>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {showSubmitModal && !submitted && (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal">
            <div className="modal-icon warning"><Send size={24} /></div>
            <h2>Xác nhận nộp bài</h2>
            <p>
              Bạn đã làm {answeredCount}/{questions.length} câu. Còn {unansweredCount} câu chưa chọn và {flaggedCount} câu đang cắm cờ.
            </p>
            <div className="modal-actions">
              <button type="button" className="modal-btn secondary" onClick={() => setShowSubmitModal(false)}>
                Xem lại bài
              </button>
              <button type="button" className="modal-btn primary" onClick={() => submitExam('manual')}>
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitModal && !submitted && (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal">
            <div className="modal-icon danger"><AlertTriangle size={24} /></div>
            <h2>Bài làm chưa được nộp</h2>
            <p>
              Nếu rời trang lúc này, tiến độ làm bài có thể bị mất. Bạn có thể nộp bài để ghi nhận kết quả hoặc ở lại tiếp tục làm.
            </p>
            <div className="modal-actions stacked">
              <button type="button" className="modal-btn primary" onClick={() => submitExam('exit')}>
                Nộp bài và xem kết quả
              </button>
              <button type="button" className="modal-btn secondary" onClick={() => setShowExitModal(false)}>
                Ở lại làm tiếp
              </button>
              <button type="button" className="modal-btn ghost" onClick={() => navigate('/')}>
                Rời trang không nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
