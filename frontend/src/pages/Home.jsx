import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Library,
  Search,
  Sparkles,
  Trophy,
  Video
} from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import ConsultationForm from '../components/ConsultationForm';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { sortResourcesByNewest } from '../utils/resourceDate';
import '../assets/styles/Home.css';

export default function Home() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const sortedBlogPosts = sortResourcesByNewest(blogPosts);
  const featuredPost = sortedBlogPosts[0];
  const latestPosts = sortedBlogPosts.slice(1, 4);

  const productEntries = [
    {
      icon: Video,
      title: t.home.quickStart.courseTitle,
      desc: t.home.quickStart.courseDesc,
      to: '/courses',
      label: t.home.quickStart.courseBtn
    },
    {
      icon: Trophy,
      title: t.home.quickStart.examTitle,
      desc: t.home.quickStart.examDesc,
      to: '/exams',
      label: t.home.quickStart.examBtn
    },
    {
      icon: Library,
      title: t.home.quickStart.libTitle,
      desc: t.home.quickStart.libDesc,
      to: '/resources?category=all',
      label: t.home.quickStart.libBtn
    }
  ];

  const roadmap = [
    { title: t.home.roadmap.step1Title, desc: t.home.roadmap.step1Desc },
    { title: t.home.roadmap.step2Title, desc: t.home.roadmap.step2Desc },
    { title: t.home.roadmap.step3Title, desc: t.home.roadmap.step3Desc }
  ];

  return (
    <div className="home-page enterprise-home">
      <section className="enterprise-hero">
        <div className="hero-coordinate-grid" aria-hidden="true" />
        <div className="container enterprise-hero-grid">
          <div className="enterprise-copy">
            <span className="hero-badge">
              <Sparkles size={14} />
              {t.home.heroKicker}
            </span>
            <h1>{t.home.heroTitle}</h1>
            <p>{t.home.heroDesc}</p>
            <div className="hero-buttons">
              <Link to="/courses#enroll" className="btn btn-primary">
                <Video size={16} />
                {t.home.btnEnroll}
              </Link>
              <Link to="/resources?category=all" className="btn btn-secondary">
                <Search size={16} />
                {t.home.btnSearch}
              </Link>
            </div>

            <div className="trust-row" aria-label="Điểm nổi bật">
              <span><CheckCircle size={15} /> {t.home.badgeChapter}</span>
              <span><CheckCircle size={15} /> {t.home.badgePdf}</span>
              <span><CheckCircle size={15} /> {t.home.badgeExam}</span>
            </div>
          </div>

          <div className="hero-publication-showcase" aria-label="Ấn phẩm và đề thi nổi bật">
            <div className="publication-showcase-head">
              <span className="publication-live"><i /> New releases</span>
              <span>Edition 07.26</span>
            </div>

            <div className="publication-covers">
              <Link
                className="publication-cover publication-cover--k51"
                to="/document/k51-2-dot"
                aria-label="Mở bộ đề Toán ứng dụng khóa K51"
              >
                <img src="/images/cover-k51.jpg" alt="Bìa Toán ứng dụng khóa K51" />
                <span className="publication-cover-label">
                  <small>Ấn phẩm mới</small>
                  <strong>K51 · Hai đợt</strong>
                </span>
              </Link>

              <Link
                className="publication-cover publication-cover--final"
                to="/document/ap1"
                aria-label="Mở tuyển tập đề thi và lời giải FINAL 2807"
              >
                <img src="/images/cover-final-2807.jpg" alt="Bìa đề thi và lời giải Toán Cao Cấp 2025" />
                <span className="publication-cover-label">
                  <small>Tuyển tập</small>
                  <strong>FINAL 2807</strong>
                </span>
              </Link>
            </div>

            <div className="publication-showcase-footer">
              <div>
                <span>UEH TCC Publishing</span>
                <strong>Đề thật · Lời giải · Phòng luyện thi</strong>
              </div>
              <Link to="/resources?category=all">
                Khám phá thư viện
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="product-switchboard section">
        <div className="container">
          <div className="home-stats">
            <div><strong>600+</strong><span>{t.home.stats.questions}</span></div>
            <div><strong>12+</strong><span>{t.home.stats.exams}</span></div>
            <div><strong>30+</strong><span>{t.home.stats.docs}</span></div>
            <div><strong>A/A+</strong><span>{t.home.stats.goal}</span></div>
          </div>

          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">{t.home.quickStart.kicker}</span>
              <h2>{t.home.quickStart.title}</h2>
            </div>
            <p>{t.home.quickStart.desc}</p>
          </div>

          <div className="product-grid">
            {productEntries.map(({ icon: Icon, title, desc, to, label }) => (
              <Link className="product-card" to={to} key={title}>
                <div className="product-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span>{label}<ArrowRight size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="operating-model section">
        <div className="container operating-grid">
          <div className="operating-panel">
            <span className="section-subtitle">{t.home.roadmap.kicker}</span>
            <h2>{t.home.roadmap.title}</h2>
            <p>{t.home.roadmap.desc}</p>
          </div>
          <div className="flow-steps">
            {roadmap.map((item, index) => (
              <div className="flow-step" key={item.title}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-preview-section section">
        <div className="container">
          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">{t.home.blogPreview.kicker}</span>
              <h2>{t.home.blogPreview.title}</h2>
            </div>
            <Link to="/blog" className="section-link">
              {t.home.blogPreview.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="news-grid">
            <article className="news-feature">
              <img src={featuredPost.image} alt={featuredPost.title} />
              <div>
                <span>{featuredPost.category}</span>
                <h3>{featuredPost.title}</h3>
                <p>{featuredPost.excerpt}</p>
                <Link to={`/blog/${featuredPost.slug}`}>{t.home.blogPreview.readPost} <ArrowRight size={15} /></Link>
              </div>
            </article>

            <div className="news-list">
              {latestPosts.map((post) => (
                <Link className="news-item" to={`/blog/${post.slug}`} key={post.slug}>
                  <img src={post.image} alt={post.title} />
                  <div>
                    <span>{post.category} · {post.date}</span>
                    <h3>{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="enterprise-cta section">
        <div className="container">
          <ConsultationForm theme="dark" />
        </div>
      </section>
    </div>
  );
}
