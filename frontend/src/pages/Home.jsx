import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Library,
  Search,
  Trophy,
  Video
} from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import ConsultationForm from '../components/ConsultationForm';
import { LanguageContext, ThemeContext } from '../App';
import { translations } from '../utils/translations';
import { sortResourcesByNewest } from '../utils/resourceDate';
import '../assets/styles/Home.css';

const editorialCopy = {
  vi: {
    statement: 'Học chắc nền tảng. Luyện đúng dạng đề.',
    release: 'Mới phát hành',
    edition: 'Ấn bản 07.26',
    publishing: 'UEH TCC Publishing',
    publishingDetail: 'Đề thật · Lời giải rõ · Phòng luyện thi',
    explore: 'Khám phá thư viện',
    highlights: 'Điểm nổi bật của nền tảng'
  },
  en: {
    statement: 'Build strong foundations. Practice with purpose.',
    release: 'New releases',
    edition: 'Edition 07.26',
    publishing: 'UEH TCC Publishing',
    publishingDetail: 'Real exams · Clear solutions · Practice rooms',
    explore: 'Explore the library',
    highlights: 'Platform highlights'
  },
  ja: {
    statement: '基礎を固め、出題形式に沿って練習する。',
    release: '新着',
    edition: '07.26 版',
    publishing: 'UEH TCC Publishing',
    publishingDetail: '実際の試験 · 明快な解説 · 演習ルーム',
    explore: 'ライブラリを見る',
    highlights: 'プラットフォームの特長'
  },
  zh: {
    statement: '夯实基础，精准练习题型。',
    release: '最新发布',
    edition: '07.26 版',
    publishing: 'UEH TCC Publishing',
    publishingDetail: '真实试题 · 清晰解析 · 模拟考场',
    explore: '浏览资料库',
    highlights: '平台亮点'
  }
};

export default function Home() {
  const { language } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const t = translations[language];
  const copy = editorialCopy[language] || editorialCopy.vi;
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

  const stats = [
    { value: '600+', label: t.home.stats.questions },
    { value: '12+', label: t.home.stats.exams },
    { value: '30+', label: t.home.stats.docs },
    { value: 'A/A+', label: t.home.stats.goal }
  ];

  return (
    <div className="home-page enterprise-home">
      <section className="enterprise-hero" aria-labelledby="home-hero-title">
        <div className="hero-coordinate-grid" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="container enterprise-hero-grid">
          <div className="enterprise-copy">
            <span className="hero-badge">{t.home.heroKicker}</span>
            <h1 id="home-hero-title">
              <span className="hero-title-brand">{t.home.heroTitle}</span>
              <span className="hero-title-statement">{copy.statement}</span>
            </h1>
            <p>{t.home.heroDesc}</p>

            <div className="hero-buttons">
              <Link to="/courses#enroll" className="btn btn-primary">
                <Video size={17} aria-hidden="true" />
                {t.home.btnEnroll}
              </Link>
              <Link to="/resources?category=all" className="btn btn-secondary">
                <Search size={17} aria-hidden="true" />
                {t.home.btnSearch}
              </Link>
            </div>

            <ul className="trust-row" aria-label={copy.highlights}>
              <li><CheckCircle size={16} aria-hidden="true" /> {t.home.badgeChapter}</li>
              <li><CheckCircle size={16} aria-hidden="true" /> {t.home.badgePdf}</li>
              <li><CheckCircle size={16} aria-hidden="true" /> {t.home.badgeExam}</li>
            </ul>
          </div>

          <aside className="hero-publication-showcase" aria-label={copy.publishing}>
            <div className="publication-showcase-head">
              <span className="publication-live"><i aria-hidden="true" /> {copy.release}</span>
              <span>{copy.edition}</span>
            </div>

            <div className="publication-covers">
              <Link
                className="publication-cover publication-cover--k51"
                to="/document/k51-2-dot"
                aria-label="Mở bộ đề Toán ứng dụng khóa K51"
              >
                <img src="/images/cover-k51.jpg" alt="Bìa Toán ứng dụng khóa K51" fetchPriority="high" />
                <span className="publication-cover-label">
                  <small>{copy.release}</small>
                  <strong>K51 · Hai đợt</strong>
                </span>
              </Link>

              <Link
                className="publication-cover publication-cover--final"
                to="/document/ap1"
                aria-label="Mở tuyển tập đề thi và lời giải FINAL 2807"
              >
                <img src="/images/cover-final-2807.jpg" alt="Bìa đề thi và lời giải Toán Cao Cấp 2025" fetchPriority="high" />
                <span className="publication-cover-label">
                  <small>Collection</small>
                  <strong>FINAL 2807</strong>
                </span>
              </Link>
            </div>

            <div className="publication-showcase-footer">
              <div>
                <span>{copy.publishing}</span>
                <strong>{copy.publishingDetail}</strong>
              </div>
              <Link to="/resources?category=all">
                {copy.explore}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="product-switchboard section" aria-labelledby="home-products-title">
        <div className="container">
          <dl className="home-stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">{t.home.quickStart.kicker}</span>
              <h2 id="home-products-title">{t.home.quickStart.title}</h2>
            </div>
            <p>{t.home.quickStart.desc}</p>
          </div>

          <div className="product-grid">
            {productEntries.map(({ icon: Icon, title, desc, to, label }, index) => (
              <Link className="product-card" to={to} key={title}>
                <span className="product-index" aria-hidden="true">0{index + 1}</span>
                <div className="product-icon">
                  <Icon size={21} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="product-link">{label}<ArrowRight size={16} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="operating-model section" aria-labelledby="home-roadmap-title">
        <div className="container operating-grid">
          <div className="operating-panel">
            <span className="section-subtitle">{t.home.roadmap.kicker}</span>
            <h2 id="home-roadmap-title">{t.home.roadmap.title}</h2>
            <p>{t.home.roadmap.desc}</p>
          </div>
          <ol className="flow-steps">
            {roadmap.map((item, index) => (
              <li className="flow-step" key={item.title}>
                <strong aria-hidden="true">{String(index + 1).padStart(2, '0')}</strong>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featuredPost && (
        <section className="blog-preview-section section" aria-labelledby="home-blog-title">
          <div className="container">
            <div className="section-title section-title-split">
              <div>
                <span className="section-subtitle">{t.home.blogPreview.kicker}</span>
                <h2 id="home-blog-title">{t.home.blogPreview.title}</h2>
              </div>
              <Link to="/blog" className="section-link">
                {t.home.blogPreview.viewAll}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="news-grid">
              <article className="news-feature">
                <img src={featuredPost.image} alt={featuredPost.title} loading="lazy" />
                <div>
                  <span>{featuredPost.category}</span>
                  <h3>{featuredPost.title}</h3>
                  <p>{featuredPost.excerpt}</p>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    {t.home.blogPreview.readPost}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>

              <div className="news-list">
                {latestPosts.map((post) => (
                  <Link className="news-item" to={`/blog/${post.slug}`} key={post.slug}>
                    <img src={post.image} alt="" loading="lazy" />
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
      )}

      <section className="enterprise-cta section" aria-label={t.consultForm.title}>
        <div className="container">
          <ConsultationForm theme={theme === 'dark' ? 'dark' : 'light'} />
        </div>
      </section>
    </div>
  );
}
