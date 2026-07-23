import { useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Link as LinkIcon, UserRound } from 'lucide-react';
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

  // Scroll to top when post slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Handle smooth scroll to section without breaking hash routing
  const scrollToSection = (e, heading) => {
    e.preventDefault();
    const id = heading.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
            <h3>{t.blogPage.tocTitle}</h3>
            <ul className="toc-list">
              {post.toc.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(e) => scrollToSection(e, item)}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
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

            <img src={post.image} alt={post.title} className="article-cover" />

            {post.sections.map((section) => (
              <section key={section.heading} id={section.heading.toLowerCase().replace(/\s+/g, '-')} className="article-section">
                <h2 className="section-heading">{section.heading} <LinkIcon size={18} /></h2>
                <div className="article-body">
                  {section.body.split('\n\n').map((paragraph, pIdx) => (
                    <div key={pIdx} className="article-paragraph">
                      <MathRenderer text={paragraph} />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <h2>{t.blogPage.relatedTitle}</h2>
            <div className="related-posts">
              {relatedPosts.map((item) => (
                <Link to={`/blog/${item.slug}`} key={item.slug}>
                  {item.title}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
