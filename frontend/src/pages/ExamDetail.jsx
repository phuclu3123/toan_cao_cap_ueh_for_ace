import { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
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
import { getPracticeExamById, isPracticeExamId } from '../data/practiceExams';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import MathRenderer from '../components/MathRenderer';
import NotFoundPage from './NotFoundPage';
import '../assets/styles/ExamDetail.css';

const DEFAULT_DURATION_MINUTES = 30;
const DISPLAY_MATH_PATTERN = /\\(?:lim|sum|int|prod|frac|dfrac|sqrt|det|begin\{(?:bmatrix|pmatrix|vmatrix|Vmatrix|matrix|cases|array)\})/;

const formatExamMath = (source, { displayStandalone = false } = {}) => {
  if (typeof source !== 'string') return source;

  return source.replace(/(^|[^\\])\$(?!\$)([^$]+?)\$(?!\$)/g, (match, prefix, rawMath) => {
    const math = rawMath.trim();
    if (!DISPLAY_MATH_PATTERN.test(math)) return match;

    const entireTextIsFormula = source.trim() === `$${rawMath}$`;
    if (displayStandalone && entireTextIsFormula) {
      return `${prefix}$$${math}$$`;
    }

    const displayStyleMath = math.startsWith('\\displaystyle') ? math : `\\displaystyle ${math}`;
    return `${prefix}$${displayStyleMath}$`;
  });
};

const stripQuestionNumberPrefix = (source, questionNumber) => {
  if (typeof source !== 'string') return source;
  const escapedNumber = String(questionNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.replace(new RegExp(`^\\s*Câu\\s*${escapedNumber}\\s*[\\.:\\-)]\\s*`, 'i'), '');
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainSeconds}`;
};

export default function ExamDetail() {
  const { id } = useParams();
  const isValidExam = isPracticeExamId(id);
  const exam = isValidExam ? getPracticeExamById(id) : null;

  if (!isValidExam || !exam) {
    return <NotFoundPage />;
  }

  return <ExamDetailContent key={exam.id} exam={exam} />;
}

function ExamDetailContent({ exam }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const navigate = useNavigate();

  const questions = useMemo(() => exam.questions || [], [exam.questions]);
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

  // Set up router navigation blocker with bypass ref to avoid routing deadlock
  const bypassBlockerRef = useRef(false);

  const blocker = useBlocker(
    ({ currentValue, nextLocation }) => {
      if (bypassBlockerRef.current) return false;
      return !submitted && currentValue.location.pathname !== nextLocation.pathname;
    }
  );

  const handleExitCancel = () => {
    bypassBlockerRef.current = false;
    setShowExitModal(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleExitSubmit = () => {
    bypassBlockerRef.current = true;
    setSubmitted(true);
    setSubmitReason('exit');
    setShowExitModal(false);
    if (blocker.state === 'blocked') {
      setTimeout(() => {
        blocker.proceed();
      }, 0);
    } else {
      navigate('/');
    }
  };

  const handleExitWithoutSubmit = () => {
    bypassBlockerRef.current = true;
    setShowExitModal(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate('/');
    }
  };

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
    if (submitted) return undefined;

    if (timeLeft <= 0) {
      const expiryTimer = window.setTimeout(() => {
        setSubmitReason('time');
        setSubmitted(true);
        setShowSubmitModal(false);
        setShowExitModal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
      return () => window.clearTimeout(expiryTimer);
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
        event.returnValue = t.exam.exitModalDesc;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted, t.exam.exitModalDesc]);

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
    } else {
      setShowExitModal(true);
    }
  };

  const selectedAnswer = answers[currentQuestion.id];
  const isCurrentFlagged = flaggedQuestions.includes(currentQuestion.id);
  const shouldShowExitModal = (showExitModal || blocker.state === 'blocked') && !submitted;

  return (
    <div className="exam-practice-page">
      <header className="exam-practice-topbar glass-panel">
        <button type="button" className="exam-back-btn" onClick={handleExit}>
          <ArrowLeft size={16} />
          <span>{t.exam.exit}</span>
        </button>

        <div className="exam-header-title-container">
          <span className="exam-header-kicker">{t.exam.kicker}</span>
          <span className="exam-header-title">{exam.title}</span>
        </div>

        <div className="exam-live-status">
          <div className={`exam-timer ${timeLeft < 600 && !submitted ? 'danger' : ''}`}>
            <Clock size={16} />
            <span>{submitted ? t.exam.submitted : formatTime(timeLeft)}</span>
          </div>
          <button type="button" className="exam-submit-inline" onClick={() => setShowSubmitModal(true)} disabled={submitted}>
            <Send size={14} />
            <span>{t.exam.submit}</span>
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
                <span className="result-kicker">{submitReason === 'time' ? t.exam.timeUp : t.exam.completed}</span>
                <h2>{result.score}/100 {t.exam.score}</h2>
                <p>
                  {t.exam.correct} <strong>{result.correctCount}</strong>/{questions.length} · {t.exam.completed} <strong>{result.answeredCount}</strong>/{questions.length}
                </p>
              </div>
            </div>

            <div className="result-stats-grid">
              <div className="stat-box correct">
                <span className="label">{t.exam.correct}</span>
                <span className="value">{result.correctCount}</span>
              </div>
              <div className="stat-box wrong">
                <span className="label">{t.exam.wrong}/{t.exam.skipped}</span>
                <span className="value">{questions.length - result.correctCount}</span>
              </div>
              <div className="stat-box flagged">
                <span className="label">{t.exam.flagged}</span>
                <span className="value">{result.flaggedCount}</span>
              </div>
            </div>

            <div className="result-actions">
              <button type="button" className="exam-reset-btn btn-secondary" onClick={resetExam}>
                <RotateCcw size={14} />
                <span>{t.exam.reset}</span>
              </button>
            </div>
          </section>
        ) : (
          <section className="exam-meta-compact glass-panel">
            <div className="meta-left">
              <h1>{exam.title}</h1>
              <p className="meta-desc">{exam.description}</p>
              <div className="meta-details">
                <span>{language === 'vi' ? 'Nguồn' : language === 'en' ? 'Source' : language === 'ja' ? '出典' : '来源'}: <strong>{exam.sourceLabel}</strong></span>
                <span className="bullet">·</span>
                <span>{language === 'vi' ? 'Tài liệu' : language === 'en' ? 'Document' : language === 'ja' ? '資料' : '文献'}: <strong>{exam.sourcePdf}</strong></span>
              </div>
            </div>
            <div className="meta-right-stats">
              <div className="mini-stat-pill">
                <span className="num">{questions.length}</span>
                <span className="txt">{t.exam.questions}</span>
              </div>
              <div className="mini-stat-pill">
                <span className="num">{durationMinutes}</span>
                <span className="txt">{t.exam.minutes}</span>
              </div>
            </div>
          </section>
        )}

        <div className="exam-practice-layout">
          <section className="exam-question-panel glass-panel">
            <div className="question-toolbar">
              <div className="q-title-block">
                <span className="question-section">{currentQuestion.section}</span>
                <h2>
                  {language === 'zh' ? `第 ${currentIndex + 1} 题` : language === 'ja' ? `問 ${currentIndex + 1}` : language === 'en' ? `Question ${currentIndex + 1}` : `Câu ${currentIndex + 1}`}
                  <span className="total-q">/ {questions.length}</span>
                </h2>
              </div>
              <button
                type="button"
                className={`flag-question-btn ${isCurrentFlagged ? 'active' : ''}`}
                onClick={() => toggleFlag(currentQuestion.id)}
                disabled={submitted}
              >
                <Flag size={14} />
                <span>{isCurrentFlagged ? t.exam.flagged : t.exam.flag}</span>
              </button>
            </div>

            <div className="question-card">
              <div className="question-prompt">
                <MathRenderer text={formatExamMath(stripQuestionNumberPrefix(currentQuestion.prompt, currentIndex + 1))} />
              </div>

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
                      <span className="option-text">
                        <MathRenderer text={formatExamMath(option.text, { displayStandalone: true })} />
                      </span>
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
                    <h3>{t.exam.solutionTitle.replace('{correct}', currentQuestion.correct)}</h3>
                  </div>
                  <div className="explanation-body">
                    <MathRenderer text={formatExamMath(currentQuestion.explanation)} />
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
                <span>{t.exam.prev}</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="nav-question-btn primary btn-primary"
                  onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
                >
                  <span>{t.exam.next}</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" className="nav-question-btn primary btn-primary" onClick={() => setShowSubmitModal(true)} disabled={submitted}>
                  <Send size={16} />
                  <span>{t.exam.submit}</span>
                </button>
              )}
            </div>
          </section>

          <aside className="exam-control-panel">
            <div className="exam-panel-card glass-panel">
              <div className="panel-heading">
                <ListChecks size={16} />
                <span>{t.exam.progressTitle}</span>
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
                  <span>{t.exam.progressLabel}</span>
                  <strong>{answeredCount}/{questions.length}</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="exam-mini-stats">
                <div className="mini-stat-cell answered">
                  <span className="dot" />
                  <span>{t.exam.answered}</span>
                  <strong>{answeredCount}</strong>
                </div>
                <div className="mini-stat-cell blank">
                  <span className="dot" />
                  <span>{t.exam.unanswered}</span>
                  <strong>{unansweredCount}</strong>
                </div>
                <div className="mini-stat-cell flagged">
                  <span className="dot" />
                  <span>{t.exam.flagged}</span>
                  <strong>{flaggedCount}</strong>
                </div>
              </div>
            </div>

            <div className="exam-panel-card exam-rule-card glass-panel">
              <div className="panel-heading">
                <BookOpen size={16} />
                <span>{t.exam.rulesTitle}</span>
              </div>
              <ul className="rule-list">
                <li>{t.exam.rule1}</li>
                <li>{t.exam.rule2}</li>
                <li>{t.exam.rule3}</li>
                <li>{t.exam.rule4}</li>
              </ul>
            </div>
          </aside>
        </div>

        {submitted && (
          <section className="exam-review-panel glass-panel">
            <div className="review-heading">
              <Award size={20} />
              <h2>{t.exam.reviewTitle}</h2>
            </div>
            <div className="review-grid-table">
              <div className="review-table-header">
                <div>{t.exam.colQ}</div>
                <div>{t.exam.colMyAns}</div>
                <div>{t.exam.colCorrect}</div>
                <div>{t.exam.colResult}</div>
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
                      <div className="col-idx">
                        {language === 'zh' ? `第 ${index + 1} 题` : language === 'ja' ? `問 ${index + 1}` : language === 'en' ? `Question ${index + 1}` : `Câu ${index + 1}`}
                      </div>
                      <div className="col-ans">{selected || t.exam.skipped}</div>
                      <div className="col-correct">{question.correct}</div>
                      <div className="col-status">
                        {isCorrect ? (
                          <span className="status-badge correct">{t.exam.correct}</span>
                        ) : (
                          <span className="status-badge wrong">{t.exam.wrong}</span>
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
            <h2>{t.exam.confirmSubmitTitle}</h2>
            <p className="modal-desc">
              {unansweredCount > 0 ? (
                <span>{t.exam.confirmSubmitDesc.replace('{answered}', answeredCount).replace('{total}', questions.length).replace('{unanswered}', unansweredCount)}</span>
              ) : (
                <span>{t.exam.confirmSubmitAllDone}</span>
              )}
            </p>
            <div className="modal-actions">
              <button type="button" className="modal-btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
                {t.exam.confirmSubmitBack}
              </button>
              <button type="button" className="modal-btn btn-primary" onClick={() => submitExam('manual')}>
                {t.exam.confirmSubmitOk}
              </button>
            </div>
          </div>
        </div>
      )}

      {shouldShowExitModal && (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal glass-panel">
            <div className="modal-icon danger"><AlertTriangle size={24} /></div>
            <h2>{t.exam.exitModalTitle}</h2>
            <p className="modal-desc">
              {t.exam.exitModalDesc}
            </p>
            <div className="modal-actions stacked">
              <button type="button" className="modal-btn btn-primary" onClick={handleExitSubmit}>
                {t.exam.exitModalOk}
              </button>
              <button type="button" className="modal-btn btn-secondary" onClick={handleExitCancel}>
                {t.exam.exitModalCancel}
              </button>
              <button type="button" className="modal-btn ghost-danger" onClick={handleExitWithoutSubmit}>
                {t.exam.exitModalDiscard}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
