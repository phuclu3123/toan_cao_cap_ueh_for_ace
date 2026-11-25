import StudyWelcome from '../components/learning/StudyWelcome';
import { useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { sortResourcesByNewest } from '../utils/resourceDate';
import '../assets/styles/Home.css';
import '../assets/styles/EditorialType.css';
import '../assets/styles/Journal.css';

const pageSize = 6;
const papers = ['lavender','sky','mint','peach','sun'];
const postPaper = post => papers[Array.from(post.category).reduce((sum,letter)=>sum+letter.charCodeAt(0),0)%papers.length];

export default function BlogPage() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const sortedPosts = useMemo(() => sortResourcesByNewest(blogPosts), []);
  const categories = useMemo(() => [...new Set(blogPosts.map(post => post.category))], []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedPosts.filter((post) => {
      if (category !== 'all' && post.category !== category) return false;
      const haystack = [
        post.title,
        post.category,
        post.excerpt,
        post.author,
        ...post.keywords
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, sortedPosts, category]);

  const featuredPost = filteredPosts[0];
  const spotlightPosts = filteredPosts.slice(1, 3);

  const remainingPosts = useMemo(() => {
    return filteredPosts.slice(3);
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
    <div className="home-page blog-index-page designed-blog">
      <section className="blog-hero">
        <div className="container">
          <div className="journal-intro"><span className="journal-kicker">α∫M4A / NHỮNG TRANG GHI CHÉP</span>
          <h1>{language === 'vi' ? 'Góc đọc.' : 'The journal.'}</h1>
          <p>{language === 'vi' ? 'Cách học, lời giải và những bài toán đi xa hơn giáo trình.' : t.blogPage.desc}</p></div>

          <label className="blog-search" aria-label="Tìm bài viết">
            <span className="journal-search-label">Bạn muốn đọc về điều gì?</span><span className="journal-search-field">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t.blogPage.searchPlaceholder}
            />
            </span>
          </label>
        </div>
      </section>

      <section className="section blog-index-section">
        <div className="container">
          <div className="journal-filter-bar"><div role="group" aria-label="Chủ đề bài viết">{['all', ...categories].map(value => <button type="button" key={value} title={value === 'all' ? 'Tất cả chủ đề' : value} aria-pressed={category === value} onClick={() => { setCategory(value); setCurrentPage(1); }}>{value === 'all' ? 'Tất cả' : value.replace('Chuyên khảo · ', '')}</button>)}</div><span aria-live="polite">{filteredPosts.length} bài viết</span></div>
          {filteredPosts.length === 0 ? (
            <div className="empty-results">
              <h3 className="empty-title">{t.blogPage.emptyTitle}</h3>
              <p className="empty-desc">{t.blogPage.emptyDesc}</p>
            </div>
          ) : (
            <>
              <div className="blog-vertical-layout">
                {currentPage === 1 && featuredPost && <div className="journal-opening">
                  <Link to={`/blog/${featuredPost.slug}`} className="headline-story-vertical">
                    <div className="headline-img-wrapper paper-surface" data-paper="mint">
                      <img src={featuredPost.image} alt={featuredPost.title} />
                    </div>
                    <div className="headline-content">
                      <span className="post-category">{featuredPost.category} · {featuredPost.date}</span>
                      <h2 title={featuredPost.title}>{featuredPost.shortTitle || featuredPost.title}</h2>
                      <p>{featuredPost.excerpt}</p>
                      <strong className="read-more">{t.blogPage.readPost} <ArrowRight size={16} /></strong>
                    </div>
                  </Link>
                  {spotlightPosts.length > 0 && <aside className="journal-side-stories" aria-label="Bài viết chọn đọc">{spotlightPosts.map(post=><Link to={`/blog/${post.slug}`} className="journal-side-story" key={post.slug}><div className="journal-side-image paper-surface" data-paper={postPaper(post)}><img src={post.image} alt={post.title} loading="lazy"/></div><span className="post-category">{post.category} · {post.date}</span><h3>{post.shortTitle || post.title}</h3><span className="read-more-link">Mở bài viết <ArrowRight size={15}/></span></Link>)}</aside>}
                </div>}

                {pagePosts.length > 0 && <h2 className="journal-more-heading">Những trang tiếp theo<span>Thêm một chủ đề. Thêm một cách nhìn.</span></h2>}
                <div className="article-list-vertical">
                  {pagePosts.map((post) => (
                    <Link to={`/blog/${post.slug}`} className="article-row-vertical" key={post.slug}>
                      <div className="article-img-wrapper paper-surface" data-paper={postPaper(post)}>
                        <img src={post.image} alt={post.title} loading="lazy"/>
                      </div>
                      <div className="article-content">
                        <span className="post-category">{post.category} · {post.date}</span>
                        <h3 title={post.title}>{post.shortTitle || post.title}</h3>
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
      <StudyWelcome current="blog" />
    </div>
  );
}
