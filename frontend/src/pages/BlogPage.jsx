import { useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { sortResourcesByNewest } from '../utils/resourceDate';
import '../assets/styles/Home.css';

const pageSize = 5;

export default function BlogPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const sortedPosts = useMemo(() => sortResourcesByNewest(blogPosts), []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedPosts;
    return sortedPosts.filter((post) => {
      const haystack = [
        post.title,
        post.category,
        post.excerpt,
        post.author,
        ...post.keywords
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, sortedPosts]);

  const featuredPost = filteredPosts[0];

  const remainingPosts = useMemo(() => {
    return filteredPosts.slice(1);
  }, [filteredPosts]);

  const totalPages = Math.max(1, Math.ceil(remainingPosts.length / pageSize));
  
  const pagePosts = useMemo(() => {
    return remainingPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [remainingPosts, currentPage]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="home-page blog-index-page">
      <section className="blog-hero">
        <div className="container">
          <span className="section-subtitle">{t.blogPage.kicker}</span>
          <h1>{t.blogPage.title}</h1>
          <p>{t.blogPage.desc}</p>

          <label className="blog-search" aria-label="Tìm bài viết">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t.blogPage.searchPlaceholder}
            />
          </label>
        </div>
      </section>

      <section className="section blog-index-section">
        <div className="container">
          {filteredPosts.length === 0 ? (
            <div className="empty-results">
              <h3 className="empty-title">{t.blogPage.emptyTitle}</h3>
              <p className="empty-desc">{t.blogPage.emptyDesc}</p>
            </div>
          ) : (
            <>
              <div className="blog-vertical-layout">
                {currentPage === 1 && featuredPost && (
                  <Link to={`/blog/${featuredPost.slug}`} className="headline-story-vertical">
                    <div className="headline-img-wrapper">
                      <img src={featuredPost.image} alt={featuredPost.title} />
                    </div>
                    <div className="headline-content">
                      <span className="post-category">{featuredPost.category} · {featuredPost.date}</span>
                      <h2>{featuredPost.title}</h2>
                      <p>{featuredPost.excerpt}</p>
                      <strong className="read-more">{t.blogPage.readPost} <ArrowRight size={16} /></strong>
                    </div>
                  </Link>
                )}

                <div className="article-list-vertical">
                  {pagePosts.map((post) => (
                    <Link to={`/blog/${post.slug}`} className="article-row-vertical" key={post.slug}>
                      <div className="article-img-wrapper">
                        <img src={post.image} alt={post.title} />
                      </div>
                      <div className="article-content">
                        <span className="post-category">{post.category} · {post.date}</span>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <span className="read-more-link">{t.blogPage.readMore} <ArrowRight size={14} /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="pagination-container blog-pagination">
                  <button
                    className="btn-page"
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    aria-label={t.common.pagePrev}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      type="button"
                      className={`btn-page ${page === currentPage ? 'active' : ''}`}
                      key={page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="btn-page"
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    aria-label={t.common.pageNext}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
