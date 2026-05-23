import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { getPracticeExamById } from '../data/practiceExams';
import '../assets/styles/ExamDetail.css';

const DEFAULT_DURATION_MINUTES = 75;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainSeconds}`;
};

export default function ExamDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const exam = useMemo(() => getPracticeExamById(id), [id]);
  const questions = exam.questions;
  const durationMinutes = exam.durationMinutes || DEFAULT_DURATION_MINUTES;
  const durationSeconds = durationMinutes * 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [submitReason, setSubmitReason] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];
  const answeredCount = questions.reduce((count, question) => (
    answers[question.id] ? count + 1 : count
  ), 0);
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
  }, [answers, answeredCount, flaggedCount, questions, unansweredCount]);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedQuestions([]);
    setTimeLeft(durationSeconds);
    setSubmitted(false);
    setSubmitReason('');
    setShowSubmitModal(false);
    setShowExitModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [durationSeconds, exam.id]);

  useEffect(() => {
    if (submitted) return undefined;

    if (timeLeft <= 0) {
      setSubmitReason('time');
      setSubmitted(true);
      setShowSubmitModal(false);
      setShowExitModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return undefined;
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
    // A short timeout ensures that MathJax runs after React has committed the DOM changes
    const timer = setTimeout(() => {
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise().catch((error) => {
          console.warn('MathJax typesetting failed: ', error);
        });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [currentIndex, submitted, answers, exam.id]);

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
    setTimeLeft(durationSeconds);
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
      <header className="exam-practice-topbar glass-panel">
        <button type="button" className="exam-back-btn" onClick={handleExit}>
          <ArrowLeft size={16} />
          <span>Thoát</span>
        </button>

        <div className="exam-header-title-container">
          <span className="exam-header-kicker">Đang thi:</span>
          <span className="exam-header-title">{exam.title}</span>
        </div>

        <div className="exam-live-status">
          <div className={`exam-timer ${timeLeft < 600 && !submitted ? 'danger' : ''}`}>
            <Clock size={16} />
            <span>{submitted ? 'Đã nộp bài' : formatTime(timeLeft)}</span>
          </div>
          <button type="button" className="exam-submit-inline" onClick={() => setShowSubmitModal(true)} disabled={submitted}>
            <Send size={14} />
            <span>Nộp bài</span>
          </button>
        </div>
      </header>

      <main className="exam-practice-shell">
        {submitted ? (
          <section className={`exam-result-panel glass-panel ${submitReason === 'time' ? 'timeout' : ''}`}>
            <div className="result-main-info">
              <div className="result-icon-ring">
                {submitReason === 'time' ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
              </div>
              <div className="result-copy">
                <span className="result-kicker">{submitReason === 'time' ? 'Hết giờ làm bài' : 'Đã hoàn thành'}</span>
                <h2>{result.score}/100 Điểm</h2>
                <p>
                  Đúng <strong>{result.correctCount}</strong>/{questions.length} câu · 
                  Hoàn thành <strong>{result.answeredCount}</strong>/{questions.length} câu
                </p>
              </div>
            </div>

            <div className="result-stats-grid">
              <div className="stat-box correct">
                <span className="label">Đúng</span>
                <span className="value">{result.correctCount}</span>
              </div>
              <div className="stat-box wrong">
                <span className="label">Sai/Bỏ trống</span>
                <span className="value">{questions.length - result.correctCount}</span>
              </div>
              <div className="stat-box flagged">
                <span className="label">Đánh dấu</span>
                <span className="value">{result.flaggedCount}</span>
              </div>
            </div>

            <div className="result-actions">
              <button type="button" className="exam-reset-btn btn-secondary" onClick={resetExam}>
                <RotateCcw size={14} />
                <span>Làm lại bài thi</span>
              </button>
            </div>
          </section>
        ) : (
          <section className="exam-meta-compact glass-panel">
            <div className="meta-left">
              <h1>{exam.title}</h1>
              <p className="meta-desc">{exam.description}</p>
              <div className="meta-details">
                <span>Nguồn: <strong>{exam.sourceLabel}</strong></span>
                <span className="bullet">·</span>
                <span>Tài liệu: <strong>{exam.sourcePdf}</strong></span>
              </div>
            </div>
            <div className="meta-right-stats">
              <div className="mini-stat-pill">
                <span className="num">{questions.length}</span>
                <span className="txt">câu hỏi</span>
              </div>
              <div className="mini-stat-pill">
                <span className="num">{durationMinutes}</span>
                <span className="txt">phút</span>
              </div>
            </div>
          </section>
        )}

        <div className="exam-practice-layout">
          <section className="exam-question-panel glass-panel">
            <div className="question-toolbar">
              <div className="q-title-block">
                <span className="question-section">{currentQuestion.section}</span>
                <h2>Câu {currentIndex + 1} <span className="total-q">/ {questions.length}</span></h2>
              </div>
              <button
                type="button"
                className={`flag-question-btn ${isCurrentFlagged ? 'active' : ''}`}
                onClick={() => toggleFlag(currentQuestion.id)}
                disabled={submitted}
              >
                <Flag size={14} />
                <span>{isCurrentFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
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
                      disabled={submitted}
                    >
                      <span className="option-key">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                      {isCorrect && <CheckCircle2 size={18} className="option-status-icon correct" />}
                      {isWrong && <XCircle size={18} className="option-status-icon wrong" />}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="answer-explanation glass-panel">
                  <div className="explanation-header">
                    <HelpCircle size={16} />
                    <h3>Lời giải chi tiết (Đáp án đúng: {currentQuestion.correct})</h3>
                  </div>
                  <div className="explanation-body">
                    {currentQuestion.explanation}
                  </div>
                </div>
              )}
            </div>

            <div className="question-actions">
              <button
                type="button"
                className="nav-question-btn btn-secondary"
                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={16} />
                <span>Câu trước</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="nav-question-btn primary btn-primary"
                  onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" className="nav-question-btn primary btn-primary" onClick={() => setShowSubmitModal(true)} disabled={submitted}>
                  <Send size={16} />
                  <span>Nộp bài</span>
                </button>
              )}
            </div>
          </section>

          <aside className="exam-control-panel">
            <div className="exam-panel-card glass-panel">
              <div className="panel-heading">
                <ListChecks size={16} />
                <span>Bảng tiến độ câu hỏi</span>
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
                  <span>Tiến độ bài làm</span>
                  <strong>{answeredCount}/{questions.length}</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="exam-mini-stats">
                <div className="mini-stat-cell answered">
                  <span className="dot" />
                  <span>Đã làm</span>
                  <strong>{answeredCount}</strong>
                </div>
                <div className="mini-stat-cell blank">
                  <span className="dot" />
                  <span>Chưa làm</span>
                  <strong>{unansweredCount}</strong>
                </div>
                <div className="mini-stat-cell flagged">
                  <span className="dot" />
                  <span>Đã đánh dấu</span>
                  <strong>{flaggedCount}</strong>
                </div>
              </div>
            </div>

            <div className="exam-panel-card exam-rule-card glass-panel">
              <div className="panel-heading">
                <BookOpen size={16} />
                <span>Quy chế làm bài</span>
              </div>
              <ul className="rule-list">
                <li>Không tải lại trang khi đang làm bài.</li>
                <li>Hệ thống tự động lưu tiến trình cục bộ.</li>
                <li>Đánh dấu câu hỏi để xem lại sau.</li>
                <li>Khi hết giờ, hệ thống sẽ tự nộp bài.</li>
              </ul>
            </div>
          </aside>
        </div>

        {submitted && (
          <section className="exam-review-panel glass-panel">
            <div className="review-heading">
              <Award size={20} />
              <h2>Phân tích kết quả chi tiết từng câu</h2>
            </div>
            <div className="review-grid-table">
              <div className="review-table-header">
                <div>Câu hỏi</div>
                <div>Lựa chọn của bạn</div>
                <div>Đáp án đúng</div>
                <div>Kết quả</div>
              </div>
              <div className="review-table-body">
                {questions.map((question, index) => {
                  const selected = answers[question.id];
                  const isCorrect = selected === question.correct;
                  return (
                    <div
                      key={question.id}
                      className={`review-table-row ${isCorrect ? 'correct' : 'wrong'}`}
                      onClick={() => {
                        setCurrentIndex(index);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                    >
                      <div className="col-idx">Câu {index + 1}</div>
                      <div className="col-ans">{selected || 'Bỏ trống'}</div>
                      <div className="col-correct">{question.correct}</div>
                      <div className="col-status">
                        {isCorrect ? (
                          <span className="status-badge correct">Đúng</span>
                        ) : (
                          <span className="status-badge wrong">Sai</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {showSubmitModal && !submitted && (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal glass-panel">
            <div className="modal-icon warning"><Send size={24} /></div>
            <h2>Xác nhận nộp bài</h2>
            <p className="modal-desc">
              Bạn đã trả lời <strong>{answeredCount}</strong>/{questions.length} câu. 
              {unansweredCount > 0 ? (
                <span> Còn <strong>{unansweredCount}</strong> câu chưa làm.</span>
              ) : (
                ' Bạn đã hoàn thành tất cả câu hỏi.'
              )}
            </p>
            <div className="modal-actions">
              <button type="button" className="modal-btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
                Quay lại
              </button>
              <button type="button" className="modal-btn btn-primary" onClick={() => submitExam('manual')}>
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitModal && !submitted && (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal glass-panel">
            <div className="modal-icon danger"><AlertTriangle size={24} /></div>
            <h2>Rời khỏi phòng thi?</h2>
            <p className="modal-desc">
              Tiến độ làm bài của bạn sẽ không được lưu nếu bạn thoát mà không nộp bài. 
              Bạn muốn làm gì?
            </p>
            <div className="modal-actions stacked">
              <button type="button" className="modal-btn btn-primary" onClick={() => submitExam('exit')}>
                Nộp bài và thoát
              </button>
              <button type="button" className="modal-btn btn-secondary" onClick={() => setShowExitModal(false)}>
                Tiếp tục làm bài
              </button>
              <button type="button" className="modal-btn ghost-danger" onClick={() => navigate('/')}>
                Thoát không nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

