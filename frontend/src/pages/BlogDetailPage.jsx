import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronsDown,
  ChevronsUp,
  Clock3,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  UserRound,
} from 'lucide-react';
import { blogPosts, getBlogPostBySlug } from '../data/blogPosts';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import ArticleBlock from '../components/ArticleBlock';
import BlogEngagement from '../components/BlogEngagement';
import MathRenderer from '../components/MathRenderer';
import NotFoundPage from './NotFoundPage';
import '../assets/styles/Home.css';
import '../assets/styles/BlogDetail.css';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <NotFoundPage />;
  }

  return <BlogDetailContent post={post} slug={slug} />;
}

function BlogDetailContent({ post, slug }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [activeSectionId, setActiveSectionId] = useState('');
  const [copiedSectionId, setCopiedSectionId] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Safe ASCII slug generator for section IDs
  const getSectionId = (heading) => {
    if (!heading) return '';
    return heading
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Scroll to top or target query section when post slug changes
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const targetSection = searchParams.get('section');

    if (targetSection) {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
          setActiveSectionId(targetSection);
        }
      }, 200);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [slug]);

  // ScrollSpy using IntersectionObserver
  useEffect(() => {
    if (!post) return;

    const sectionElements = document.querySelectorAll('.article-section');
    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0.1
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [post]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollableHeight = Math.max(
        0,
        (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
      );
      const nextProgress = scrollableHeight > 0 ? (currentScroll / scrollableHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, nextProgress)));
    };

    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      resizeObserver = new ResizeObserver(() => {
        updateReadingProgress();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
      window.removeEventListener('resize', updateReadingProgress);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [post]);

  useEffect(() => {
    if (!post) return undefined;
    const previousTitle = document.title;
    document.title = `${post.title} | UEH TCC`;
    return () => {
      document.title = previousTitle;
    };
  }, [post]);

  // Handle smooth scroll to section without breaking hash routing
  const scrollToSection = (e, heading) => {
    e.preventDefault();
    const id = getSectionId(heading);
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // Safe copy section link for HashRouter
  const copySectionLink = (e, heading) => {
    e.preventDefault();
    const id = getSectionId(heading);
    const url = `${window.location.origin}/blog/${slug}?section=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSectionId(id);
      setTimeout(() => setCopiedSectionId(''), 2500);
    });
  };

  const setDossiersOpen = (sectionId, shouldOpen) => {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;
    sectionElement.querySelectorAll('details.exam-dossier').forEach((details) => {
      details.open = shouldOpen;
    });
  };

  if (!post) {
    return (
      <div className="home-page forum-blog-page">
        <section className="forum-blog-hero">
          <div className="container">
            <Link to="/blog" className="article-back-link">
              <ArrowLeft size={18} />
              {t.blogPage.btnAll}
            </Link>
            <h1>{t.blogPage.emptyTitle}</h1>
          </div>
        </section>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const activeSectionIndex = Math.max(
    0,
    post.sections.findIndex((section) => getSectionId(section.heading) === activeSectionId)
  );

  return (
    <div className="home-page forum-blog-page">
      <section className="forum-blog-hero">
        <div className="container forum-blog-grid">
          <aside className="article-toc">
            <div className="toc-heading-row">
              <div>
                <span className="toc-kicker">Trong bài này</span>
                <h3 className="toc-title">Mục lục</h3>
              </div>
              <span className="toc-progress-value">{Math.round(readingProgress)}%</span>
            </div>
            <ul className="toc-list">
              {post.toc.map((item, idx) => {
                const sectionId = getSectionId(item);
                const isActive = activeSectionId === sectionId;
                return (
                  <li key={idx}>
                    <a
                      href={`#${sectionId}`}
                      className={`toc-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => scrollToSection(e, item)}
                    >
                      <span className="toc-item-index">{String(idx + 1).padStart(2, '0')}</span>
                      <span>{item}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            {post.scope && (
              <div className="toc-scope-note">
                <BadgeCheck size={17} aria-hidden="true" />
                <span>{post.scope.title}</span>
              </div>
            )}
            <div className="toc-footer">
              <span>
                Phần {activeSectionIndex + 1}/{post.sections.length}
              </span>
            </div>
          </aside>

          <article className="forum-article">
            <header className="editorial-article-hero">
              <Link to="/blog" className="article-back-link">
                <ArrowLeft size={18} />
                {t.blogPage.btnAll}
              </Link>

              <div className="article-kicker-row">
                <span className="article-kicker">{post.category}</span>
                {post.updatedAt && (
                  <span className="article-verified">
                    <BadgeCheck size={15} />
                    Đã kiểm chứng nguồn
                  </span>
                )}
              </div>

              <h1 className="article-title">{post.title}</h1>
              <p className="article-dek">{post.excerpt}</p>

              <div className="article-byline">
                <span><UserRound size={16} /> {t.blogPage.authorLabel} {post.author}</span>
                <span><CalendarDays size={16} /> {post.date}</span>
                {post.readingTime && <span><Clock3 size={16} /> {post.readingTime}</span>}
                {post.level && <span><GraduationCap size={16} /> {post.level}</span>}
              </div>

              {post.scope && (
                <div className="article-scope-card">
                  <FileText size={20} aria-hidden="true" />
                  <div>
                    <span>{post.scope.label}</span>
                    <strong>{post.scope.title}</strong>
                    <p>{post.scope.description}</p>
                  </div>
                </div>
              )}

              {post.highlights && (
                <div className="article-highlight-grid">
                  {post.highlights.map((item) => (
                    <div key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="article-keyword-list" aria-label="Từ khóa bài viết">
                {post.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </header>

            <div className="editorial-article-body">
            {post.sections.map((section, sectionIndex) => {
              const sectionId = getSectionId(section.heading);
              const isCopied = copiedSectionId === sectionId;
              const dossierCount = section.blocks?.filter((block) => block.type === 'exam').length || 0;
              return (
                <section key={section.heading} id={sectionId} className="article-section">
                  <header className="article-section-header">
                    <span className="article-section-number">
                      {String(sectionIndex + 1).padStart(2, '0')}
                    </span>
                    <div>
                      {section.eyebrow && <span className="article-section-kicker">{section.eyebrow}</span>}
                      <h2 className="section-heading">
                        <span>{section.heading}</span>
                        <button
                          type="button"
                          className="section-anchor-btn"
                          onClick={(e) => copySectionLink(e, section.heading)}
                          title="Sao chép liên kết phần này"
                        >
                          {isCopied ? <Check size={18} className="text-success" /> : <LinkIcon size={18} />}
                          {isCopied && <span className="copied-tooltip">Đã chép link!</span>}
                        </button>
                      </h2>
                      {section.summary && <p>{section.summary}</p>}
                    </div>
                  </header>

                  <div className="article-body">
                    {dossierCount > 0 && (
                      <div className="dossier-toolbar">
                        <div>
                          <span>Thư viện hồ sơ</span>
                          <strong>{dossierCount} bài có lời giải chi tiết</strong>
                        </div>
                        <div className="dossier-toolbar-actions">
                          <button type="button" onClick={() => setDossiersOpen(sectionId, true)}>
                            <ChevronsDown size={17} />
                            Mở tất cả
                          </button>
                          <button type="button" onClick={() => setDossiersOpen(sectionId, false)}>
                            <ChevronsUp size={17} />
                            Thu gọn
                          </button>
                        </div>
                      </div>
                    )}
                    {section.blocks
                      ? section.blocks.map((block, blockIndex) => (
                          <ArticleBlock
                            block={block}
                            key={`${section.heading}-${block.type}-${blockIndex}`}
                          />
                        ))
                      : section.body.split('\n\n').map((paragraph, pIdx) => (
                          <div key={pIdx} className="article-paragraph">
                            <MathRenderer text={paragraph} />
                          </div>
                        ))}
                  </div>
                </section>
              );
            })}
            </div>

            {post.sections && <BlogEngagement slug={post.slug} title={post.title} />}

            <div className="related-section">
              <span className="related-kicker">Đọc tiếp</span>
              <h2>{t.blogPage.relatedTitle}</h2>
              <div className="related-posts">
                {relatedPosts.map((item) => (
                  <Link to={`/blog/${item.slug}`} key={item.slug}>
                    <span>{item.category}</span>
                    <strong>{item.title}</strong>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
