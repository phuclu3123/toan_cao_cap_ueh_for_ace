import { useContext } from 'react';
import { GraduationCap, ShieldCheck, Target } from 'lucide-react';
import { LanguageContext } from '../App';
import '../assets/styles/AboutPage.css';

export default function AboutPage() {
  const { language } = useContext(LanguageContext);

  const texts = {
    vi: {
      subtitle: 'NỀN TẢNG HỌC TẬP CHUYÊN SÂU',
      title: 'Giới Thiệu UEH TCC',
      description: 'UEH TCC là nền tảng học tập chuyên khảo về Toán Cao Cấp, Thống Kê và Định Lượng Tài Chính dành cho sinh viên Đại học Kinh tế TP. Hồ Chí Minh.',
      missionTitle: 'Sứ Mệnh Học Thuật',
      missionDesc: 'Cung cấp phương pháp tư duy toán học chuẩn xác, bài giảng chuyên sâu và kho đề thi tương tác chất lượng cao, giúp sinh viên làm chủ kiến thức và áp dụng vào phân tích kinh tế thực tế.',
      pillar1Title: 'Chuẩn Mực Học Thuật',
      pillar1Desc: 'Nội dung được biên soạn bài bản, chặt chẽ, đi từ bản chất lý thuyết đến ứng dụng thực tiễn trong tài chính kinh tế.',
      pillar2Title: 'Tương Tác & Tự Động',
      pillar2Desc: 'Phòng thi tương tác với timer, tự động chấm điểm và phân tích lỗ hổng kiến thức sau mỗi bài nộp.',
      pillar3Title: 'Trải Nghiệm Đỉnh Cao',
      pillar3Desc: 'Giao diện Editorial hiện đại, đọc công thức LaTeX sắc nét, hỗ trợ 4 ngôn ngữ và tối ưu mượt mà trên mọi thiết bị.'
    },
    en: {
      subtitle: 'ADVANCED LEARNING PLATFORM',
      title: 'About UEH TCC',
      description: 'UEH TCC is an editorial academic platform for Advanced Calculus, Applied Statistics, and Quantitative Finance.',
      missionTitle: 'Academic Mission',
      missionDesc: 'Providing rigorous mathematical methodologies, deep articles, and interactive exam environments to master quantitative finance.',
      pillar1Title: 'Academic Rigor',
      pillar1Desc: 'Structured curriculum bridging pure mathematical foundations with real-world financial economics.',
      pillar2Title: 'Interactive & Automated',
      pillar2Desc: 'Interactive test rooms featuring real-time timing, auto-grading, and post-submission analytics.',
      pillar3Title: 'Enterprise Editorial UX',
      pillar3Desc: 'State-of-the-art editorial design, sharp KaTeX rendering, 4-language support, and 60fps responsive performance.'
    }
  };

  const t = texts[language] || texts.vi;

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <span className="section-subtitle">{t.subtitle}</span>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>
      </section>

      <section className="section about-mission-section">
        <div className="container grid-2">
          <div className="mission-content">
            <h2>{t.missionTitle}</h2>
            <p>{t.missionDesc}</p>
          </div>
          <div className="pillars-grid">
            <div className="pillar-card">
              <ShieldCheck size={28} className="pillar-icon" />
              <h3>{t.pillar1Title}</h3>
              <p>{t.pillar1Desc}</p>
            </div>
            <div className="pillar-card">
              <Target size={28} className="pillar-icon" />
              <h3>{t.pillar2Title}</h3>
              <p>{t.pillar2Desc}</p>
            </div>
            <div className="pillar-card">
              <GraduationCap size={28} className="pillar-icon" />
              <h3>{t.pillar3Title}</h3>
              <p>{t.pillar3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
