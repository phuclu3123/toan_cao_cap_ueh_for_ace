import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock, FileText, Search, ScanLine } from 'lucide-react';
import { midtermExams } from '../data/documentsData';
import { practiceCatalog } from '../data/practiceCatalog';
import { LanguageContext } from '../App';
import { midtermPreviewData } from '../data/midtermPreviewData';
import ExamPdfPreview from '../components/learning/ExamPdfPreview';
import { examPreviewData } from '../data/examPreviewData';
import '../assets/styles/EditorialType.css';
import '../assets/styles/ExamCatalog.css';

// One catalog drives filtering, question counts and actual exam links.
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').toLowerCase();
const cohorts = [...new Set(practiceCatalog.map(exam => exam.title.match(/K\d+/)?.[0]).filter(Boolean))];
const durations = [...new Set(practiceCatalog.map(exam => exam.durationMinutes))].sort((a,b) => a-b);
const timeLabel = durations.length === 1 ? `${durations[0]}` : `${durations[0]}–${durations.at(-1)}`;

export default function ExamsPage() {
  const { language } = useContext(LanguageContext);
  const [query, setQuery] = useState(''), [cohort, setCohort] = useState('all');
  const [preview, setPreview] = useState(null);
  const exams = useMemo(() => practiceCatalog.filter(exam => (cohort === 'all' || exam.title.includes(cohort)) && normalize(`${exam.title} ${exam.id}`).includes(normalize(query))), [query, cohort]);
  return <div className="exam-catalog-page">
    <section className="exam-catalog-hero"><div className="container">
      <div className="exam-catalog-intro"><span className="catalog-eyebrow">α∫M4A / PHÒNG LUYỆN THI</span><h1>{language === 'vi' ? <>Đọc đề thật.<br/><em>Luyện cách giải.</em></> : 'Practice. Review. Improve.'}</h1><p>Chọn bộ đề theo khóa, đọc trước nội dung từ PDF gốc rồi bắt đầu lượt luyện có thời gian. Sau khi nộp, xem lại từng câu và cách giải.</p><a href="#practice-exams" className="catalog-primary-link">Tìm đề phù hợp <ArrowRight size={18} /></a>
      <dl className="exam-catalog-summary"><div><dd>{practiceCatalog.length}</dd><dt>đề tương tác</dt></div><div><dd>{timeLabel}′</dd><dt>mỗi lượt luyện</dt></div><div><dd>{midtermExams.length}</dd><dt>bộ đề giữa kỳ</dt></div></dl></div>
      <figure className="exam-source-showcase paper-surface" data-paper="sun"><div className="exam-showcase-label"><span>TỪ TRANG GIẤY ĐẾN PHÒNG LUYỆN</span><span>K51</span></div><div className="exam-source-pages" aria-hidden="true">{['k51-118','k51-204','k51-tonghop'].map((id,index)=><img src={examPreviewData[id].fullPageImage} alt="" key={id} style={{'--sheet':index}} width="1020" height="1443"/>)}</div><figcaption><span>Đề thật, từng chi tiết.</span><button type="button" onClick={()=>setPreview(practiceCatalog[0])}>Mở trang đề <ArrowUpRight size={17}/></button></figcaption></figure>
    </div></section>
    <section className="exam-practice-section" id="practice-exams"><div className="container">
      <header className="exam-section-heading"><div><span className="catalog-eyebrow">CHỌN ĐỀ CỦA BẠN</span><h2>Luyện trực tuyến</h2></div><label className="exam-search"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm khóa, mã đề…" aria-label="Tìm đề thi" /></label></header>
      <div className="exam-filter-row"><div role="group" aria-label="Lọc theo khóa">{['all', ...cohorts].map(value => <button type="button" key={value} aria-pressed={cohort === value} onClick={() => setCohort(value)}>{value === 'all' ? 'Tất cả' : value}</button>)}</div><span aria-live="polite">{exams.length} đề</span></div>
      <div className="exam-catalog-grid">{exams.map((exam, index) => <article className="exam-ticket" key={exam.id} data-cohort={exam.title.match(/K\d+/)?.[0]}>
        <div className="exam-ticket-top"><span>{exam.title.match(/K\d+/)?.[0] || 'α∫M4A'}</span><span>PDF · TRANG {examPreviewData[exam.id].page}</span></div>
        <button type="button" className="exam-ticket-preview" onClick={()=>setPreview(exam)} aria-label={`Xem PDF gốc: ${exam.title}`}><img src={examPreviewData[exam.id].image} width={examPreviewData[exam.id].width} height={examPreviewData[exam.id].height} alt={`Phần đầu đề ${exam.title}, cắt từ tài liệu gốc`} loading="lazy"/><span><ScanLine size={15}/>Xem đề gốc</span></button>
        <h3>{exam.title.replace(/^Toán Cao Cấp /i, '').replace('Mã Đề', '· Mã đề').replace('Đợt', '· Đợt')}</h3>
        <div className="exam-ticket-meta"><span><FileText size={14} />{exam.questionsCount} câu</span><span><Clock size={14} />{exam.durationMinutes} phút</span></div>
        <div className="exam-ticket-bottom"><span>{String(index+1).padStart(2,'0')} / {String(exams.length).padStart(2,'0')}</span><Link to={`/exam/${exam.id}`}>Làm đề này <ArrowUpRight size={19} /></Link></div>
      </article>)}</div>
      {!exams.length && <div className="exam-empty"><h3>Chưa có đề phù hợp.</h3><p>Thử một mã đề hoặc khóa khác.</p><button type="button" onClick={() => { setQuery(''); setCohort('all'); }}>Xem tất cả đề</button></div>}
    </div></section>
    <section className="exam-midterm-section"><div className="container"><header className="exam-section-heading"><div><span className="catalog-eyebrow">ÔN THEO LỚP CỦA BẠN</span><h2>Giữa kỳ,<br/><em>chuẩn bị từng phần.</em></h2></div><p>Đề thi và học liệu theo giảng viên. Xem trang gốc trước khi chọn tài liệu để ôn.</p></header><div className="exam-midterm-grid">{midtermExams.map((exam,index) => {
      const source = midtermPreviewData[exam.id];
      return <Link className="exam-teacher-note paper-surface" data-paper={['lavender','sun','peach','sky','mint'][index]} to={`/document/${exam.id}`} key={exam.id}>
        <div className={`exam-note-art${source ? '' : ' is-pending'}`}>{source ? <img src={source.image} alt={`Trích trang ${source.page} từ học liệu của ${exam.professorName}`} loading="lazy"/> : <><img src={`/images/${exam.image}`} alt={exam.professorName} loading="lazy"/><span>Đang đối chiếu bản gốc</span></>}</div>
        <div className="exam-note-copy"><span>{source ? `${source.pages ? `PDF · ${source.pages} trang` : 'ẢNH ĐỀ GỐC'}` : 'ĐANG BỔ SUNG'}</span><h3>{exam.professorName}</h3><p>{exam.sourceStatus === 'pending' ? 'Bổ sung đúng tài liệu trước khi mở đọc.' : exam.id === 'ntvv' ? 'Bài tập theo chương, kèm các bước giải để ôn lại kiến thức.' : 'Mở học liệu và xem nội dung trực tiếp trên trang.'}</p><span className="exam-note-link">{source ? 'Mở học liệu' : 'Xem trạng thái'} <ArrowUpRight size={17}/></span></div>
      </Link>;
    })}</div></div></section>
    {preview && <ExamPdfPreview exam={preview} onClose={()=>setPreview(null)}/>}
  </div>;
}
