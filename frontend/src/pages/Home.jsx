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
import '../assets/styles/Home.css';

export default function Home() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const featuredPost = blogPosts[0];
  const latestPosts = blogPosts.slice(1, 4);

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

          <div className="hero-learning-visual" aria-label="Không gian học tập định lượng UEH TCC">
            <div className="learning-visual-toolbar">
              <div className="visual-window-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span>UEH TCC · Learning intelligence</span>
              <span className="visual-live"><i /> Online</span>
            </div>

            <div className="learning-visual-body">
              <div className="visual-primary-card">
                <div className="visual-card-label">
                  <span>QUANTITATIVE PATH</span>
                  <strong>01 / 04</strong>
                </div>
                <div className="visual-formula" aria-label="Công thức rủi ro danh mục">
                  x<sup>⊤</sup>Σx
                </div>
                <p>Statistics → Finance → Stochastic control</p>
                <svg className="visual-curve" viewBox="0 0 420 118" role="img" aria-label="Đường học tập tăng dần">
                  <defs>
                    <linearGradient id="learningArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className="curve-grid" d="M0 96H420M0 64H420M0 32H420" />
                  <path className="curve-area" d="M0 96C58 91 72 81 112 84C154 87 171 52 214 58C260 65 270 31 316 38C356 43 377 17 420 12V118H0Z" />
                  <path className="curve-line" d="M0 96C58 91 72 81 112 84C154 87 171 52 214 58C260 65 270 31 316 38C356 43 377 17 420 12" />
                  <circle cx="420" cy="12" r="5" />
                </svg>
              </div>

              <div className="visual-side-stack">
                <div className="visual-metric-card">
                  <span>Học thuật</span>
                  <strong>Deep BSDE</strong>
                  <small>FBSDE · MFG · MFC</small>
                </div>
                <div className="visual-metric-card visual-metric-accent">
                  <span>Thực hành</span>
                  <strong>75 phút</strong>
                  <small>Phòng thi tương tác</small>
                </div>
              </div>
            </div>

            <div className="learning-visual-footer">
              <span><Sparkles size={14} /> Curated knowledge</span>
              <span>VI · EN · JA · ZH</span>
              <div className="visual-progress" aria-hidden="true">
                <i />
              </div>
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
