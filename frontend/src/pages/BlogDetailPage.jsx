import { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, Link as LinkIcon, UserRound, Check } from 'lucide-react';
import { blogPosts, getBlogPostBySlug } from '../data/blogPosts';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import MathRenderer from '../components/MathRenderer';
import '../assets/styles/Home.css';

export default function BlogDetailPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [copiedSectionId, setCopiedSectionId] = useState('');

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
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
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
    const url = `${window.location.origin}/#/blog/${slug}?section=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSectionId(id);
      setTimeout(() => setCopiedSectionId(''), 2500);
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

  return (
    <div className="home-page forum-blog-page">
      <section className="forum-blog-hero">
        <div className="container forum-blog-grid">
          <aside className="article-toc">
            <h3 className="toc-title">Nội dung bài viết</h3>
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
                      {item}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="toc-footer">
              <span>© 2026 UEH TCC. All rights reserved.</span>
            </div>
          </aside>

          <article className="forum-article">
            <Link to="/blog" className="article-back-link">
              <ArrowLeft size={18} />
              {t.blogPage.btnAll}
            </Link>
            <h1 className="article-title">{post.title}</h1>
            <div className="article-byline">
              <span><UserRound size={16} /> {t.blogPage.authorLabel} {post.author}</span>
              <span><CalendarDays size={16} /> {post.date}</span>
            </div>
            <p className="article-keywords">
              <strong>Keywords:</strong> {post.keywords.join(', ')}
            </p>
            <div className="article-meta">
              <span className="category-badge">{post.category}</span>
            </div>

            {post.sections.map((section) => {
              const sectionId = getSectionId(section.heading);
              const isCopied = copiedSectionId === sectionId;
              return (
                <section key={section.heading} id={sectionId} className="article-section">
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
                  <div className="article-body">
                    {section.body.split('\n\n').map((paragraph, pIdx) => (
                      <div key={pIdx} className="article-paragraph">
                        <MathRenderer text={paragraph} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="related-section">
              <h2>{t.blogPage.relatedTitle}</h2>
              <div className="related-posts">
                {relatedPosts.map((item) => (
                  <Link to={`/blog/${item.slug}`} key={item.slug}>
                    {item.title}
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
