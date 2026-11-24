import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, GraduationCap, MessageCircle, Play, Smile } from 'lucide-react';
import { ThemeContext } from '../App';
import ConsultationForm from '../components/ConsultationForm';
import CatalogSummary from '../components/learning/CatalogSummary';
import KnowledgeStrip from '../components/learning/KnowledgeStrip';
import HomeArticleDeck from '../components/learning/HomeArticleDeck';
import HomeMilestones from '../components/learning/HomeMilestones';
import '../assets/styles/EditorialType.css';
import '../assets/styles/CampusHome.css';

const learningPaths = [
  { label: 'Hiểu bài', body: 'Bài giảng theo chương, bài tập và lời giải. Bắt đầu từ phần kiến thức bạn đang cần.', to: '/courses', action: 'Khám phá khóa học', paper: 'lavender' },
  { label: 'Luyện đề', body: 'Làm bài có thời gian, xem kết quả và đối chiếu cách giải sau mỗi đề.', to: '/exams', action: 'Chọn đề luyện', paper: 'sky' },
  { label: 'Gỡ vướng', body: 'Chia sẻ bài khó và cách bạn đã thử. Cùng trao đổi để hiểu rõ bước còn vướng.', to: '/community', action: 'Vào hỏi đáp', paper: 'mint' }
];

function LearningPreview({ stage }) {
  if (stage === 1) return <div className="hp-pdf-preview">
    {['354','118','204'].map((code,index)=><Link className={`hp-pdf-sheet hp-pdf-sheet-${index}`} to={`/exam/k51-${code}`} key={code} aria-label={`Xem đề K51 mã ${code}`}><img src={`/images/home/exam-k51-${code}.webp`} alt={`Trích trang đề Toán cao cấp K51 mã ${code} từ PDF gốc`} width="998" height="640" loading="lazy" decoding="async"/></Link>)}
    <span className="hp-real-caption">Trích từ bộ đề K51 · PDF gốc</span>
  </div>;
  if (stage === 2) return <figure className="hp-real-media hp-real-discussion"><Link to="/community/ueh-pnta-lagrange-cobb-douglas" aria-label="Đọc bài hỏi đáp về cực trị có điều kiện"><img src="/images/home/community-lagrange.webp" alt="Ảnh chụp bài hỏi đáp thực tế về hàm lợi ích và phương pháp Lagrange" width="771" height="590" loading="lazy" decoding="async"/></Link><figcaption>Câu hỏi thực tế · Cực trị có điều kiện</figcaption></figure>;
  return <figure className="hp-real-media hp-real-video"><Link to="/course/tu-hoc-toan-cao-cap" aria-label="Xem bài giảng định thức ma trận"><img src="/images/home/lesson-matrix-video.webp" alt="Khung hình ở phút 4 của bài giảng định thức ma trận và ma trận nghịch đảo" width="595" height="380" loading="lazy" decoding="async"/><span className="hp-video-play" aria-hidden="true"><Play size={18} fill="currentColor"/></span></Link><figcaption>Buổi 01 · Định thức ma trận</figcaption></figure>;
}

export default function CampusHome() {
  const { theme } = useContext(ThemeContext);
  return <div className="campus-home">
    <div className="hp-intro">
      <svg className="hp-intro-ribbons" viewBox="0 0 1600 1200" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M-120 515C130 755 235 645 420 650S705 500 935 615S1280 960 1720 535" stroke="var(--ui-pastel-peach)" strokeWidth="24"/>
        <path d="M-120 565C130 805 235 695 420 700S705 550 935 665S1280 1010 1720 585" stroke="var(--ui-pastel-mint)" strokeWidth="34"/>
        <path d="M-120 625C130 865 235 755 420 760S705 610 935 725S1280 1070 1720 645" stroke="var(--ui-pastel-lavender)" strokeWidth="28"/>
        <path d="M-120 680C130 920 235 810 420 815S705 665 935 780S1280 1125 1720 700" stroke="var(--ui-pastel-sky)" strokeWidth="26"/>
        <path d="M-120 730C130 970 235 860 420 865S705 715 935 830S1280 1175 1720 750" stroke="var(--ui-pastel-sun)" strokeWidth="19"/>
      </svg>
    <section className="hp-hero" aria-labelledby="hp-title">
      <div className="container hp-hero-grid">
        <div className="hp-hero-copy">
          <span className="hp-kicker"><GraduationCap size={18} /> TOÁN CAO CẤP CHO SINH VIÊN UEH</span>
          <h1 id="hp-title">Hiểu bản chất.<br /><span>Giải đến cùng.</span></h1>
          <p>Bài giảng theo chương, đề luyện có thời gian và thư viện lời giải. Chọn đúng phần cần học, tiến bộ qua từng bài làm.</p>
          <div className="hp-actions"><Link className="hp-button hp-button-primary" to="/courses">Khám phá khóa học <ArrowRight size={18} /></Link><Link className="hp-button hp-button-outline" to="/exams"><Play size={16} /> Luyện đề ngay</Link></div>
          <div className="hp-hero-notes"><span><CheckCircle2 size={16} /> Học theo chương</span><span><CheckCircle2 size={16} /> Đề thi & lời giải</span><span><CheckCircle2 size={16} /> Hỏi đáp cùng cộng đồng</span></div>
        </div>
        <div className="hp-publications" aria-label="Ấn phẩm α∫M4A">
          <div className="hp-publication-label"><span>TỦ SÁCH α∫M4A</span><span>ĐỀ THI & LỜI GIẢI</span></div>
          <div className="hp-books">
            <Link className="hp-book hp-book-k51" to="/document/k51-2-dot"><img src="/images/cover-k51.jpg" alt="Toán ứng dụng khóa K51 — đề thi và lời giải" fetchPriority="high" /></Link>
            <Link className="hp-book hp-book-final" to="/document/ap1"><img src="/images/cover-final-2807.jpg" alt="Tuyển tập đề thi và lời giải Toán cao cấp 2025" fetchPriority="high" /></Link>
          </div>
          <div className="hp-publication-foot"><span>Đề thật. Lời giải chi tiết.</span><Link to="/resources?category=all">Khám phá thư viện <ArrowRight size={17}/></Link></div>
        </div>
      </div>
    </section>

    <CatalogSummary />
    </div>

    <section className="hp-learning" aria-labelledby="hp-learning-title"><div className="container">
      <header className="hp-paths-heading hp-reveal"><span className="hp-kicker">BẮT ĐẦU TỪ ĐIỀU BẠN CẦN</span><h2 id="hp-learning-title">Hôm nay, bạn muốn học gì?</h2><p>Hiểu một chương, thử một đề, hay gỡ một bài khó. <br/>Chọn cách học phù hợp với bạn.</p></header>
      <div className="hp-learning-options">{learningPaths.map((path,index)=><article className="hp-path-card paper-surface hp-reveal" data-paper={path.paper} key={path.label} aria-labelledby={`hp-path-${index}`}>
        <div className="hp-path-copy"><h3 id={`hp-path-${index}`}>{path.label}</h3><p>{path.body}</p><Link className="hp-path-action" to={path.to}>{path.action}<ArrowUpRight size={17}/></Link></div>
        <div className={`hp-path-preview hp-path-preview-${index}`}><LearningPreview stage={index}/></div>
      </article>)}</div>
    </div></section>

    <section className="hp-section-break" aria-label="Cách học tại α∫M4A">
      <div className="hp-learning-note hp-reveal">
        <span className="hp-kicker">HỌC ĐỂ HIỂU, KHÔNG CHỈ ĐỂ NHỚ</span>
        <p>Hiểu một lời giải.<br/><em>Nhìn ra nhiều cách nghĩ.</em></p>
        <div className="hp-note-principles">
          <article><BookOpen size={32} strokeWidth={1.3}/><h3>Hiểu từng bước</h3><p>Biết vì sao chọn một công thức và vì sao mỗi bước giải đúng.</p></article>
          <article><CheckCircle2 size={32} strokeWidth={1.3}/><h3>Tự thử, tự kiểm tra</h3><p>Làm lại bài, đối chiếu lời giải và nhận ra phần mình còn vướng.</p></article>
          <article><GraduationCap size={34} strokeWidth={1.3}/><h3>Nhìn ra bản chất</h3><p>Kết nối công thức với đồ thị, hình học và những bài toán thực tế.</p></article>
        </div>
      </div>
    </section>
    <div className="hp-math-lab paper-surface" data-paper="lavender"><KnowledgeStrip /></div>

    <section className="hp-voice" aria-labelledby="hp-voice-quote">
      <figure className="hp-voice-inner hp-reveal" data-reveal-direction="right">
        <div className="hp-voice-statement">
          <span className="hp-kicker">GÓC NHÌN HỌC VIÊN</span>
          <blockquote id="hp-voice-quote">“Mình không chỉ muốn biết đáp án đúng. Mình muốn <em>hiểu cách giải</em>, để gặp một bài toán mới vẫn biết bắt đầu từ đâu.”</blockquote>
        </div>
        <figcaption className="hp-voice-signature">
          <span className="hp-voice-portrait"><img src="/images/home/community-voice.jpg" width="88" height="88" alt="Phương Thảo, học viên khóa học" loading="lazy" decoding="async"/></span>
          <span><strong>Phương Thảo</strong></span>
        </figcaption>
      </figure>
    </section>

    <HomeArticleDeck/>

    <section className="hp-student-story" aria-labelledby="hp-huyen-quote">
      <figure className="hp-student-story-inner hp-reveal" data-reveal-direction="left">
        <div className="hp-student-story-photo"><img src="/images/home/student-huyen.jpg" width="1446" height="1934" alt="Huyền, học viên khóa học" loading="lazy" decoding="async"/></div>
        <figcaption className="hp-student-story-copy">
          <span className="hp-kicker">GÓC NHÌN HỌC VIÊN</span>
          <blockquote id="hp-huyen-quote"><p>“Phúc dạy hay, hơi khó tính một chút nhưng <em>take care rất kỹ</em>, sửa bài chỉn chu mà chữ còn đẹp nữa. Web cũng có nhiều tính năng hay, giúp mình học và luyện bài thuận tiện hơn.</p><p>Nhờ học với Phúc, mình giải bài tốt hơn và đã qua môn rồi, mừng lắm! Phúc còn dạy miễn phí nhiều khóa cho các bạn từng rớt môn nữa.”</p></blockquote>
          <div className="hp-student-story-signature"><strong>Huyền</strong><span>Học viên khóa học</span></div>
          <aside className="hp-student-joke" aria-label="Câu nói đùa của Huyền"><span><Smile size={20} strokeWidth={1.6} aria-hidden="true"/> Huyền nói vui</span><p>“Nhờ học Phúc mà mình có thêm <em>người cha thứ 2.</em>”</p></aside>
        </figcaption>
      </figure>
    </section>

    <section className="hp-consult paper-surface" data-paper="peach" id="home-consultation" aria-labelledby="hp-consult-title"><div className="container hp-consult-grid hp-reveal">
      <div className="hp-consult-copy"><span className="hp-kicker">CÙNG BẮT ĐẦU</span><h2 id="hp-consult-title">Mục tiêu của bạn.<br />Bước tiếp theo cùng α∫M4A.</h2><p>Bạn đang cần củng cố nền tảng hay chuẩn bị cho kỳ thi? Chia sẻ nhu cầu để nhận gợi ý học phù hợp.</p><div className="hp-conversation" aria-label="Các nhu cầu học có thể trao đổi"><span className="hp-chat-line">“Mình muốn hiểu lại phần nền tảng.”</span><span className="hp-chat-line">“Mình cần luyện đề cho kỳ thi sắp tới.”</span><span className="hp-chat-line hp-chat-reply"><MessageCircle size={18}/> Bắt đầu từ điều bạn đang cần.</span></div><a href="#consult-name" className="hp-text-link" onClick={event=>{event.preventDefault();document.getElementById('consult-name')?.focus();}}>Trao đổi nhu cầu học <ArrowRight size={18}/></a></div>
      <ConsultationForm theme={theme} variant="guided" />
    </div></section>
    <HomeMilestones/>
  </div>;
}
