import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  Bookmark,
  Plus,
  Sparkles,
  ListOrdered,
  X
} from 'lucide-react';
import { communityService, DIFFICULTY_LEVELS } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import CommunityNavSidebar from '../components/community/CommunityNavSidebar';
import MathRenderer from '../components/MathRenderer';
import AnswerCard from '../components/community/AnswerCard';
import AnswerComposer from '../components/community/AnswerComposer';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ReportContentModal from '../components/community/ReportContentModal';
import CreatePostModal from '../components/community/CreatePostModal';
import FormulaCheatsheetModal from '../components/community/FormulaCheatsheetModal';
import LeaderboardModal from '../components/community/LeaderboardModal';
import AuthModal from '../components/modals/AuthModal';
import '../assets/styles/community.css';

function formatRelativeTime(dateString) {
  if (!dateString) return 'gần đây';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

/**
 * CommunityDetailPage: Stack Exchange Mathematics Thread Layout
 */
export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    savedPostIds,
    toggleSavePost,
    handleUpvotePost,
    handleDownvotePost,
    handleUpvoteAnswer,
    handleDownvoteAnswer,
    handleDeletePost,
    handleUpdatePost,
    handleAddAnswer,
    handleAcceptAnswer,
    reportPost,
    leaderboard,
    handleCreatePost,
    openCreateModal,
    isCreateModalOpen,
    closeCreateModal
  } = useCommunity();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answerSort, setAnswerSort] = useState('upvotes'); // 'upvotes' | 'newest' | 'oldest'
  const [quoteText, setQuoteText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isTocMinimized, setIsTocMinimized] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('question-section');

  useEffect(() => {
    let isMounted = true;
    communityService.getPostById(id)
      .then(data => {
        if (isMounted) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Không thể tải bài toán');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ScrollSpy to highlight TOC section as user scrolls
  useEffect(() => {
    if (!post) return;
    const sections = [
      'question-section',
      ...(post.answers || []).map(a => a.id),
      'answer-composer-section'
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPos >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'Admin' ||
      currentUser.isAdmin === true
    )
  );

  const isPostAuthor = Boolean(
    isAdmin || (
      currentUser && post && post.author && (
        (currentUser.uid && (post.author.id === currentUser.uid || post.author.uid === currentUser.uid)) ||
        (currentUser.id && (post.author.id === currentUser.id || post.author.uid === currentUser.id)) ||
        (currentUser.email && post.author.email && currentUser.email.toLowerCase() === post.author.email.toLowerCase()) ||
        (currentUser.username && post.author.email && currentUser.username.toLowerCase() === post.author.email.toLowerCase())
      )
    )
  );

  const currentUserId = currentUser?.id || currentUser?.uid || 'guest';
  const isUpvoted = Boolean(post?.upvotedBy && post.upvotedBy.includes(currentUserId));
  const isDownvoted = Boolean(post?.downvotedBy && post.downvotedBy.includes(currentUserId));
  const isSaved = Boolean(post && savedPostIds.includes(post.id));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSave = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    await toggleSavePost(post.id);
  };

  const handleUpvote = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const result = await handleUpvotePost(post.id);
    setPost(prev => ({
      ...prev,
      upvotes: result.upvotes,
      upvotedBy: result.upvotedBy,
      downvotedBy: result.downvotedBy
    }));
  };

  const handleDownvote = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const result = await handleDownvotePost(post.id);
    setPost(prev => ({
      ...prev,
      upvotes: result.upvotes,
      upvotedBy: result.upvotedBy,
      downvotedBy: result.downvotedBy
    }));
  };

  const handleAnswerUpvote = async (pId, aId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const res = await handleUpvoteAnswer(pId, aId);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a => {
        if (a.id === aId) {
          return {
            ...a,
            upvotes: res.upvotes,
            upvotedBy: res.upvotedBy,
            downvotedBy: res.downvotedBy
          };
        }
        return a;
      })
    }));
  };

  const handleAnswerDownvote = async (pId, aId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const res = await handleDownvoteAnswer(pId, aId);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a => {
        if (a.id === aId) {
          return {
            ...a,
            upvotes: res.upvotes,
            upvotedBy: res.upvotedBy,
            downvotedBy: res.downvotedBy
          };
        }
        return a;
      })
    }));
  };

  const handleAnswerAccept = async (pId, aId, isInstructor) => {
    const res = await handleAcceptAnswer(pId, aId, isInstructor);
    setPost(res.post);
  };

  const handleAnswerComment = async (pId, aId, text) => {
    const res = await communityService.addCommentToAnswer(pId, aId, {
      content: text,
      author: currentUser || { name: 'Sinh viên UEH', cohort: 'K50 UEH' }
    });

    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a => {
        if (a.id === aId) {
          return {
            ...a,
            comments: [...(a.comments || []), res.comment]
          };
        }
        return a;
      })
    }));
  };

  const handleEditAnswerComment = async (pId, aId, cId, updatedText) => {
    const res = await communityService.editComment(pId, aId, cId, updatedText);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a => {
        if (a.id === aId) {
          return {
            ...a,
            comments: (a.comments || []).map(c => c.id === cId ? res.comment : c)
          };
        }
        return a;
      })
    }));
  };

  const handleDeleteAnswerComment = async (pId, aId, cId) => {
    await communityService.deleteComment(pId, aId, cId);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a => {
        if (a.id === aId) {
          return {
            ...a,
            comments: (a.comments || []).filter(c => c.id !== cId)
          };
        }
        return a;
      })
    }));
  };

  const handleEditAnswer = async (pId, aId, updatedContent) => {
    await communityService.editAnswer(pId, aId, updatedContent);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a =>
        a.id === aId ? { ...a, content: updatedContent, updatedAt: new Date().toISOString() } : a
      )
    }));
  };

  const handleDeleteAnswer = async (pId, aId) => {
    const result = await communityService.deleteAnswer(pId, aId);
    if (result.post) setPost(result.post);
  };

  const handleCreateAnswerSubmit = async (content) => {
    const res = await handleAddAnswer(post.id, content);
    setPost(res.post);
    setQuoteText('');
  };

  const handleDeletePostConfirm = async () => {
    setShowDeleteConfirm(false);
    await handleDeletePost(post.id);
    navigate('/community', { replace: true });
  };

  if (loading) {
    return (
      <div className="qa-math-site-wrapper">
        <div className="qa-main-container" style={{ paddingTop: '24px' }}>
          <LoadingSkeleton variant="post-detail" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="qa-math-site-wrapper">
        <div className="qa-main-container" style={{ paddingTop: '60px', maxWidth: '800px' }}>
          <ErrorState
            variant="not-found"
            title="Không tìm thấy bài toán"
            message={error || 'Bài viết này có thể đã bị xóa hoặc đường dẫn không đúng.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const diffConfig = DIFFICULTY_LEVELS.find(d => d.id === post.difficulty) || DIFFICULTY_LEVELS[1];

  // Sort answers
  const sortedAnswers = [...(post.answers || [])].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    if (answerSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (answerSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  return (
    <div className="qa-math-site-wrapper">
      <div className="qa-main-container qa-detail-page-container" style={{ paddingTop: '28px' }}>
        {/* 1. StackExchange Style Question Header */}
        <div className="se-detail-header-block">
          <div className="se-detail-header-top">
            <h1 className="se-detail-question-title">
              <MathRenderer text={post.title} inline />
            </h1>

            <button
              type="button"
              className="qa-ask-question-btn flex-shrink-0"
              onClick={currentUser ? openCreateModal : () => setShowAuthModal(true)}
            >
              <Plus size={16} />
              <span>Ask Question</span>
            </button>
          </div>

          <div className="se-detail-meta-bar">
            <div className="se-meta-item">
              <span className="se-meta-k">Asked</span>
              <span className="se-meta-v">{formatRelativeTime(post.createdAt)}</span>
            </div>
            {post.updatedAt && (
              <div className="se-meta-item">
                <span className="se-meta-k">Modified</span>
                <span className="se-meta-v">{formatRelativeTime(post.updatedAt)}</span>
              </div>
            )}
            <div className="se-meta-item">
              <span className="se-meta-k">Viewed</span>
              <span className="se-meta-v">{post.views || 1} times</span>
            </div>
          </div>
        </div>

        {/* 2. Core 3-Column Layout (Expanded Center Stream) */}
        <div className="qa-3col-layout qa-detail-expanded-layout">
          {/* Left Nav */}
          <aside className="qa-left-col">
            <CommunityNavSidebar
              activeNav="questions"
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
              onOpenCreate={currentUser ? openCreateModal : () => setShowAuthModal(true)}
              savedCount={savedPostIds.length}
            />
          </aside>

          {/* Center Main Stream: Question + Answers + Composer */}
          <main className="qa-center-col">
            {/* Main Question Block with Left Vote Rail */}
            <article className="se-detail-post-row" id="question-section">
              {/* Left Vote Rail */}
              <div className="se-detail-vote-rail">
                <button
                  type="button"
                  className={`se-vote-btn up ${isUpvoted ? 'is-active' : ''}`}
                  onClick={handleUpvote}
                  title="Bài toán có nghiên cứu, rõ ràng và hữu ích"
                  aria-label="Upvote question"
                >
                  <ChevronUp size={28} />
                </button>

                <span className="se-vote-number">{post.upvotes || 0}</span>

                <button
                  type="button"
                  className={`se-vote-btn down ${isDownvoted ? 'is-active' : ''}`}
                  onClick={handleDownvote}
                  title="Bài toán chưa rõ ràng hoặc thiếu thông tin"
                  aria-label="Downvote question"
                >
                  <ChevronDown size={28} />
                </button>

                <button
                  type="button"
                  className={`se-vote-btn bookmark ${isSaved ? 'is-saved' : ''}`}
                  onClick={handleToggleSave}
                  title={isSaved ? 'Bỏ lưu bài toán' : 'Lưu bài toán này'}
                  aria-label="Save question"
                >
                  <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Question Main Body */}
              <div className="se-detail-post-body-col">
                <div className="se-detail-math-content">
                  <MathRenderer text={post.content} />

                  {post.image && (
                    <figure className="detail-attached-image-figure">
                      <img
                        src={post.image}
                        alt={post.altText || 'Hình ảnh bài toán'}
                        className="detail-attached-img"
                      />
                      {post.altText && (
                        <figcaption className="detail-img-caption">
                          Ghi chú: {post.altText}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>

                {/* Tags */}
                <div className="se-tags-list" style={{ marginTop: '16px' }}>
                  {post.subjectLabel && (
                    <span className="se-subject-badge">
                      {post.subjectLabel}
                    </span>
                  )}
                  {(post.tags || []).map((tag, idx) => {
                    const cleanTag = tag.replace('#', '');
                    return (
                      <Link
                        key={idx}
                        to={`/community?tag=${encodeURIComponent(cleanTag)}`}
                        className="se-tag-pill"
                      >
                        {cleanTag}
                      </Link>
                    );
                  })}
                  {post.difficulty && (
                    <span
                      className="se-difficulty-pill"
                      style={{ color: diffConfig.color, borderColor: `${diffConfig.color}40` }}
                    >
                      {diffConfig.label.split(' ')[0]}
                    </span>
                  )}
                </div>

                {/* Bottom Action strip: links on left, author card on right */}
                <div className="se-detail-post-bottom-bar">
                  <div className="se-detail-actions-links">
                    <button type="button" className="se-detail-link-btn" onClick={handleShare}>
                      {isCopied ? 'Đã sao chép link' : 'Chia sẻ'}
                    </button>
                    {isPostAuthor && (
                      <button type="button" className="se-detail-link-btn" onClick={() => setIsEditing(true)}>
                        Chỉnh sửa
                      </button>
                    )}
                    {isPostAuthor && (
                      <button type="button" className="se-detail-link-btn is-danger" onClick={() => setShowDeleteConfirm(true)}>
                        Xóa
                      </button>
                    )}
                    <button
                      type="button"
                      className="se-detail-link-btn"
                      onClick={currentUser ? () => setReportTarget(post) : () => setShowAuthModal(true)}
                    >
                      Báo cáo
                    </button>
                  </div>

                  {/* Author Card Box */}
                  <div className="se-author-card-box">
                    <span className="author-card-time">asked {formatRelativeTime(post.createdAt)}</span>
                    <div className="author-card-user-row">
                      <Link to={`/community/user/${post.author?.id}`} className="author-card-avatar">
                        {post.author?.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} />
                        ) : (
                          <span>{(post.author?.name || 'U').charAt(0).toUpperCase()}</span>
                        )}
                      </Link>
                      <div className="author-card-meta">
                        <Link to={`/community/user/${post.author?.id}`} className="author-card-name">
                          {post.author?.name || 'Sinh viên UEH'}
                        </Link>
                        <span className="author-card-rep">
                          {post.author?.points || 1} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 3. Answers Section */}
            <div className="se-answers-section-wrap">
              <div className="se-answers-heading-bar">
                <h2 className="se-answers-count-title">
                  {sortedAnswers.length} {sortedAnswers.length === 1 ? 'Answer' : 'Answers'}
                </h2>

                {sortedAnswers.length > 1 && (
                  <div className="se-answers-sort-select-wrap">
                    <label htmlFor="sort-answers-select">Sorted by:</label>
                    <select
                      id="sort-answers-select"
                      className="se-select-native"
                      value={answerSort}
                      onChange={(e) => setAnswerSort(e.target.value)}
                    >
                      <option value="upvotes">Highest score (default)</option>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Answers Stream */}
              <div className="se-answers-stream">
                {sortedAnswers.length === 0 ? (
                  <div className="se-empty-answers-prompt">
                    <Sparkles size={28} className="prompt-sparkle-icon" />
                    <h3>Chưa có câu trả lời nào</h3>
                    <p>Hãy là người đầu tiên giải bài toán này để nhận ngay <strong>+15 điểm First Solver</strong>!</p>
                  </div>
                ) : (
                  sortedAnswers.map((ans) => (
                    <AnswerCard
                      key={ans.id}
                      answer={ans}
                      postId={post.id}
                      isPostAuthor={isPostAuthor}
                      isInstructor={currentUser?.isInstructor}
                      currentUser={currentUser}
                      onRequireLogin={() => setShowAuthModal(true)}
                      onUpvote={handleAnswerUpvote}
                      onDownvote={handleAnswerDownvote}
                      onAcceptAnswer={handleAnswerAccept}
                      onAddComment={handleAnswerComment}
                      onEditComment={handleEditAnswerComment}
                      onDeleteComment={handleDeleteAnswerComment}
                      onEditAnswer={handleEditAnswer}
                      onDeleteAnswer={handleDeleteAnswer}
                      onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
                      onQuote={(text) => {
                        setQuoteText(text);
                        document.getElementById('answer-composer-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onReport={currentUser ? (target) => setReportTarget(target) : () => setShowAuthModal(true)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 4. Answer Composer (Your Answer) */}
            <div id="answer-composer-section" style={{ marginTop: '32px' }}>
              <AnswerComposer
                onSubmit={handleCreateAnswerSubmit}
                currentUser={currentUser}
                onRequireLogin={() => setShowAuthModal(true)}
                onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
                quoteText={quoteText}
                onClearQuote={() => setQuoteText('')}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Right Floating TOC Rail (Mục lục luồng bài toán mờ thị giác luôn chạy theo khi lướt) */}
      <aside className={`se-floating-thread-sidebar ${isTocMinimized ? 'is-minimized' : ''}`}>
        {isTocMinimized ? (
          <button
            type="button"
            className="se-toc-expand-pill-btn"
            onClick={() => setIsTocMinimized(false)}
            title="Mở Mục lục luồng bài toán"
          >
            <ListOrdered size={13} />
            <span>Mục lục</span>
          </button>
        ) : (
          <div className="se-thread-toc-card glassmorphism-toc">
            <div className="se-toc-header">
              <span className="se-toc-header-title">MỤC LỤC BÀI VIẾT</span>
              <button
                type="button"
                className="se-toc-minimize-btn"
                onClick={() => setIsTocMinimized(true)}
                title="Thu nhỏ mục lục"
              >
                <X size={12} />
              </button>
            </div>

            <nav className="se-toc-nav-list" aria-label="Mục lục bài toán">
              {/* 1. Question item */}
              <a
                href="#question-section"
                className={`se-toc-link ${activeSection === 'question-section' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('question-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="se-toc-indicator-bar" />
                <span className="se-toc-title">Đề bài & Dữ kiện</span>
              </a>

              {/* 2. Answers list */}
              {sortedAnswers.map((ans, aIdx) => (
                <a
                  key={ans.id}
                  href={`#${ans.id}`}
                  className={`se-toc-link is-sub ${activeSection === ans.id ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(ans.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  title={`Lời giải #${aIdx + 1} của ${ans.author?.name || 'Thành viên'}`}
                >
                  <span className="se-toc-indicator-bar" />
                  <span className="se-toc-title">
                    Lời giải #{aIdx + 1} {ans.author?.name ? `(${ans.author.name.split(' ').slice(-1)[0]})` : ''}
                  </span>
                </a>
              ))}

              {/* 3. Composer item */}
              <a
                href="#answer-composer-section"
                className={`se-toc-link ${activeSection === 'answer-composer-section' ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('answer-composer-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="se-toc-indicator-bar" />
                <span className="se-toc-title">Viết lời giải</span>
              </a>
            </nav>
          </div>
        )}
      </aside>

      {/* Modals */}
      {/* 1. Create New Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={async (postData) => {
          const newPost = await handleCreatePost(postData);
          closeCreateModal();
          if (newPost?.id) {
            navigate(`/community/${newPost.id}`);
          }
        }}
        currentUser={currentUser}
        onRequireLogin={() => setShowAuthModal(true)}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
      />

      {/* 2. Edit Existing Post Modal */}
      {isEditing && (
        <CreatePostModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSubmit={async (updateData) => {
            const updated = await handleUpdatePost(post.id, updateData);
            setPost(updated);
            setIsEditing(false);
          }}
          editingPost={post}
          currentUser={currentUser}
          onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePostConfirm}
        title="Xóa bài toán này?"
        message="Hành động này không thể hoàn tác. Toàn bộ câu hỏi, lời giải và bình luận liên quan sẽ bị xóa hoàn toàn khỏi diễn đàn."
        confirmLabel="Xóa bài viết"
        variant="danger"
      />

      <ReportContentModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onSubmit={async (data) => {
          await reportPost({ ...data, targetId: reportTarget?.id });
        }}
        contentTitle={reportTarget?.title || 'Nội dung'}
      />

      <FormulaCheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
      />

      {showAuthModal && (
        <AuthModal
          showLoginModal={showAuthModal}
          setShowLoginModal={setShowAuthModal}
        />
      )}
    </div>
  );
}
