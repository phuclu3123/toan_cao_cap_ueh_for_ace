import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Clock, FileText, Gauge, Trophy } from 'lucide-react';
import { finalExams, midtermExams } from '../data/documentsData';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/Home.css';

export default function ExamsPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const getLocalizedFinal = (exam) => {
    let title = exam.title;
    let desc = exam.desc;
    if (language !== 'vi') {
      const kMatch = exam.title.match(/K\d+/);
      const codeMatch = exam.title.match(/Mã Đề \d+/);
      const kStr = kMatch ? kMatch[0] : '';
      const codeStr = codeMatch ? codeMatch[0].replace('Mã Đề ', 'Code ') : '';
      if (language === 'en') {
        title = `Advanced Calculus ${kStr} ${codeStr || 'Practice Exam'}`;
        desc = exam.desc
          .replace('Đề K51 mới nhất mã 204 từ main.pdf, làm bài trong 30 phút với chấm điểm tự động, cắm cờ câu khó và thống kê sau khi nộp.', 'Latest K51 exam code 204 from main.pdf, practice in 30 minutes with auto-grading, flags and statistics after submission.')
          .replace('mô phỏng bài kiểm tra cuối kỳ 30 phút chuyên nghiệp.', 'simulating a professional 30-minute final exam.')
          .replace('chuyển thành phòng luyện thi tương tác theo nhịp bài thi thật.', 'converted to an interactive exam room mimicking real exam pacing.')
          .replace('dùng để luyện tốc độ làm trắc nghiệm và kiểm tra đáp án sau khi nộp.', 'used for speed training and checking answers after submission.')
          .replace('Timer, cắm cờ và nộp bài tự động khi hết giờ.', 'Timer, flagging, and auto-submission when time is up.')
          .replace('đã chuyển thành bài kiểm tra tương tác thay vì chỉ xem lời giải.', 'converted to interactive test instead of static solution.')
          .replace('có chấm điểm tự động và bảng phân tích câu trả lời.', 'featuring auto-grading and detailed response analysis.')
          .replace('dùng để luyện phản xạ làm bài cuối kỳ theo cấu trúc đề thật.', 'used to build final exam reflexes modeled after real exam structure.')
          .replace('giữ đúng ghi chú đáp án của tài liệu nguồn khi luyện thi.', 'retains original answer keys from source document for study.')
          .replace('Chưa tìm thấy section đề K48 trong final 2807.pdf để chuyển thành bài kiểm tra tương tác.', 'K48 exam section not yet found in final 2807.pdf for interactive conversion.')
          .replace('gồm 20 câu trắc nghiệm để luyện bài dài hơn trong phòng thi.', 'includes 20 multiple-choice questions for longer exam practice.')
          .replace('chuyển từ tài liệu lời giải sang bài kiểm tra tương tác 30 phút.', 'converted from solution guide to interactive 30-minute exam.');
      } else if (language === 'ja') {
        title = `高等微積分 ${kStr} ${codeStr ? '問題' + codeStr.replace('Code ', '') : '模擬試験'}`;
        desc = `75分間のインタラクティブ模擬試験。自動採点、問題フラグ、詳細な結果分析に対応しています。`;
      } else if (language === 'zh') {
        title = `高等微积分 ${kStr} ${codeStr ? '试卷' + codeStr.replace('Code ', '') : '模拟考试'}`;
        desc = `75分钟互动式模拟考试。支持自动评分、标记难题和提交后的统计分析。`;
      }
    }
    return { ...exam, title, desc };
  };

  const getLocalizedMidterm = (exam) => {
    let title = exam.title;
    let desc = exam.desc;
    let professorName = exam.professorName;
    if (language !== 'vi') {
      const engProfName = exam.professorName.replace('Thầy ', 'Prof. ');
      professorName = engProfName;
      if (language === 'en') {
        title = `Midterm Exam - ${engProfName}`;
        desc = `Collection of midterm exam papers for ${engProfName}'s class at UEH, with step-by-step detailed explanations.`;
      } else if (language === 'ja') {
        title = `中間試験 - ${exam.professorName.replace('Thầy ', '')}先生`;
        desc = `UEHにおける${exam.professorName.replace('Thầy ', '')}先生クラスの中間試験問題集。詳細な解説付き。`;
      } else if (language === 'zh') {
        title = `期中考试 - ${exam.professorName.replace('Thầy ', '')}老师`;
        desc = `UEH${exam.professorName.replace('Thầy ', '')}老师班级期中考试真题及详解。`;
      }
    }
    return { ...exam, title, desc, professorName };
  };

  const practiceFinals = finalExams.filter((exam) => exam.hasDetailRoute).map(getLocalizedFinal);
  const localizedMidtermExams = midtermExams.map(getLocalizedMidterm);

  return (
    <div className="home-page page-shell">
      <section className="page-hero exams-page-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="hero-badge"><Trophy size={14} /> {t.examsPage.kicker}</span>
            <h1>{t.examsPage.title}</h1>
            <p>{t.examsPage.desc}</p>
          </div>
          <div className="exam-overview-panel glass-panel">
            <div>
              <Gauge size={22} />
              <strong>{practiceFinals.length}</strong>
              <span>{t.examsPage.statPractice}</span>
            </div>
            <div>
              <BookOpen size={22} />
              <strong>{midtermExams.length}</strong>
              <span>{t.examsPage.statMidterm}</span>
            </div>
            <div>
              <Clock size={22} />
              <strong>75'</strong>
              <span>{t.examsPage.statTime}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">{t.examsPage.finalSubtitle}</span>
              <h2>{t.examsPage.finalTitle}</h2>
            </div>
            <p>{t.examsPage.finalDesc}</p>
          </div>

          <div className="exam-room-grid">
            {practiceFinals.map((exam, index) => (
              <Link className="exam-room-card" to={`/exam/${exam.id}`} key={exam.id}>
                <span className="exam-room-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{exam.title}</h3>
                  <p>{exam.desc}</p>
                </div>
                <span className="exam-room-action">
                  {t.examsPage.btnStart}
                  <ChevronRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section midterm-room-section">
        <div className="container">
          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">{t.examsPage.midtermSubtitle}</span>
              <h2>{t.examsPage.midtermTitle}</h2>
            </div>
            <p>{t.examsPage.midtermDesc}</p>
          </div>

          <div className="midterm-room-grid midterm-teacher-grid">
            {localizedMidtermExams.map((exam) => (
              <Link className="midterm-room-card teacher-exam-card" to={`/document/${exam.id}`} key={exam.id}>
                <div className="teacher-cover">
                  <img src={`/images/${exam.image}`} alt={exam.professorName} onError={(event) => { event.currentTarget.src = '/images/tccvang.jpg'; }} />
                  <span>{exam.professorName}</span>
                </div>
                <div>
                  <h3>{exam.title}</h3>
                  <p>{exam.desc}</p>
                  <span className="teacher-card-action"><FileText size={16} /> {t.examsPage.btnViewSolution}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
