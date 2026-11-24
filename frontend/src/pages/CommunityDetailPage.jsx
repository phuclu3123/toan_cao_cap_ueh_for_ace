import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  Bookmark,
  Plus,
  ListOrdered,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { communityService, DIFFICULTY_LEVELS } from '../services/communityService';
import CommunityMemberLink from '../components/community/CommunityMemberLink';
import CommunityAvatar from '../components/community/CommunityAvatar';
import CommunityPanel from '../components/community/CommunityPanel';
import MathMarginArtwork from '../components/community/MathMarginArtwork';
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
import '../assets/styles/community-workspace.css';
import '../assets/styles/community-discussion.css';

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
  const { hash } = useLocation();
  const { currentUser } = useAuth();
  const {
    savedPostIds,
    sessionActionError,
    markVisited,
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
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const [answerSort, setAnswerSort] = useState('upvotes'); // 'upvotes' | 'newest' | 'oldest'
  const [quoteText, setQuoteText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('question-section');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    communityService.getPostById(id)
      .then(data => {
        if (isMounted) {
          setPost(data);
          markVisited(data.id);
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
  }, [id, currentUser?.id, currentUser?.uid, markVisited]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!post?.id || !hash || loading) return;
    let active = true;
    document.fonts.ready.then(() => {
      if (!active) return;
      try {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'auto', block: 'center' });
      } catch { /* Ignore malformed external fragments. */ }
    });
    return () => { active = false; };
  }, [post?.id, hash, loading]);

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
    post?.canManage || isAdmin || (
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

  const handlePostAction = async (action) => {
    if (actionBusy) return;
    setActionBusy(true);
    setActionError('');
    try { await action(); }
    catch (error) { setActionError(error.message || 'Thao tác chưa thành công. Vui lòng thử lại.'); }
    finally { setActionBusy(false); }
  };

  const handleShare = async () => {
    if (!navigator.clipboard) throw new Error('Trình duyệt chưa hỗ trợ sao chép liên kết.');
    await navigator.clipboard.writeText(window.location.href);
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

  const handleAnswerComment = async (pId, aId, text, { parentId = null } = {}) => {
    const res = await communityService.addCommentToAnswer(pId, aId, {
      content: text,
      parentId
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

  const handleCommentHeart = async (pId, aId, commentId, liked) => {
    const comment = await communityService.setCommentHeart(pId, aId, commentId, liked, currentUser?.id || currentUser?.uid);
    setPost(previous => ({ ...previous, answers: previous.answers.map(answer => answer.id !== aId ? answer : {
      ...answer, comments: answer.comments.map(item => item.id === commentId ? comment : item)
    }) }));
    return comment;
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
    const result = await communityService.editAnswer(pId, aId, updatedContent);
    setPost(result.post);
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
    await handleDeletePost(post.id);
    setShowDeleteConfirm(false);
    navigate('/community', { replace: true });
  };

  if (loading) {
    return (
      <div className="qa-math-site-wrapper qa-thread-workspace">
        <div className="qa-main-container" style={{ paddingTop: '24px' }}>
          <LoadingSkeleton variant="post-detail" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="qa-math-site-wrapper qa-thread-workspace">
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
    <div className="qa-math-site-wrapper qa-thread-workspace">
      <MathMarginArtwork />
      <div className="qa-main-container qa-detail-page-container" style={{ paddingTop: '28px' }}>
        <div className="qa-workspace-tools">
          <Link to="/community" className="qa-tools-trigger"><ArrowLeft size={17} />Về hỏi đáp</Link>
          <div className="qa-workspace-tools-end">
            <CommunityPanel title="Khám phá cộng đồng" label="Khám phá" icon={Compass}>{({ close }) => <CommunityNavSidebar activeNav="questions" savedCount={savedPostIds.length}
              onSelectNav={key => { close(); navigate(key === 'unanswered' ? '/community?status=unsolved' : key === 'saved' ? '/community?status=saved' : key === 'tags' ? '/community?browse=tags' : '/community'); }}
              onOpenLeaderboard={() => { close(); setIsLeaderboardOpen(true); }} onOpenCheatsheet={() => { close(); setIsCheatsheetOpen(true); }} />}</CommunityPanel>
            <CommunityPanel title="Mục lục bài viết" label="Mục lục" icon={ListOrdered}>{({ close }) => <nav className="qa-thread-contents" aria-label="Mục lục bài toán">
              {[{ id: 'question-section', title: 'Đề bài & dữ kiện' }, ...sortedAnswers.map((answer, index) => ({ id: answer.id, title: `Lời giải ${index + 1} · ${answer.author?.name || 'Thành viên'}` })), { id: 'answer-composer-section', title: 'Viết lời giải' }].map(section => <a key={section.id} href={'#' + section.id} aria-current={activeSection === section.id ? 'location' : undefined}
                onClick={event => { event.preventDefault(); close(); document.getElementById(section.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }}>{section.title}</a>)}
            </nav>}</CommunityPanel>
          </div>
        </div>
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
              <span>Đặt câu hỏi</span>
            </button>
          </div>

          <div className="se-detail-meta-bar">
            <div className="se-meta-item">
              <span className="se-meta-k">Đăng</span>
              <span className="se-meta-v">{formatRelativeTime(post.createdAt)}</span>
            </div>
            {post.updatedAt && (
              <div className="se-meta-item">
                <span className="se-meta-k">Cập nhật</span>
                <span className="se-meta-v">{formatRelativeTime(post.updatedAt)}</span>
              </div>
            )}
            <div className="se-meta-item">
              <span className="se-meta-k">Lượt xem</span>
              <span className="se-meta-v">{post.views || 0}</span>
            </div>
          </div>
        </div>

        {/* 2. Core 3-Column Layout (Expanded Center Stream) */}
        <div className="qa-thread-layout">
          {/* Left Nav */}


          {/* Center Main Stream: Question + Answers + Composer */}
          <main className="qa-center-col">
            {sessionActionError && <div className="qa-inline-notice qa-action-feedback is-error" role="alert">{sessionActionError}</div>}
            {actionError && <div className="qa-inline-notice qa-action-feedback is-error" role="alert">{actionError}</div>}
            {/* Main Question Block with Left Vote Rail */}
            <article className="se-detail-post-row" id="question-section">
              {/* Left Vote Rail */}
              <div className="se-detail-vote-rail">
                <button
                  type="button"
                  className={`se-vote-btn up ${isUpvoted ? 'is-active' : ''}`}
                  disabled={actionBusy}
                  onClick={() => handlePostAction(handleUpvote)}
                  title="Bài toán có nghiên cứu, rõ ràng và hữu ích"
                  aria-label="Upvote question"
                >
                  <ChevronUp size={28} />
                </button>

                <span className="se-vote-number">{post.upvotes || 0}</span>

                <button
                  type="button"
                  className={`se-vote-btn down ${isDownvoted ? 'is-active' : ''}`}
                  disabled={actionBusy}
                  onClick={() => handlePostAction(handleDownvote)}
                  title="Bài toán chưa rõ ràng hoặc thiếu thông tin"
                  aria-label="Downvote question"
                >
                  <ChevronDown size={28} />
                </button>

                <button
                  type="button"
                  className={`se-vote-btn bookmark ${isSaved ? 'is-saved' : ''}`}
                  disabled={actionBusy}
                  onClick={() => handlePostAction(handleToggleSave)}
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
                    <button type="button" className="se-detail-link-btn" onClick={() => handlePostAction(handleShare)}>
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
                    <span className="author-card-time">{post.origin === 'curated' ? 'Bài biên soạn' : 'Đăng'} {formatRelativeTime(post.createdAt)}</span>
                    <div className="author-card-user-row">
                      <CommunityMemberLink author={post.author} className="author-card-avatar">
                        <CommunityAvatar src={post.author?.avatar} name={post.author?.name} />
                      </CommunityMemberLink>
                      <div className="author-card-meta">
                        <CommunityMemberLink author={post.author} className="author-card-name">
                          {post.author?.name || 'Sinh viên UEH'}
                        </CommunityMemberLink>
                        <span className="author-card-rep">
                          {post.origin === 'curated' ? 'α∫M4A' : `${post.author?.points || 0} \u0111i\u1ec3m`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 3. Answers Section */}
            <div className="se-answers-section-wrap" id="answers-section">
              <div className="se-answers-heading-bar">
                <h2 className="se-answers-count-title">
                  {sortedAnswers.length} lời giải
                </h2>

                {sortedAnswers.length > 1 && (
                  <div className="se-answers-sort-select-wrap">
                    <label htmlFor="sort-answers-select">Sắp xếp:</label>
                    <select
                      id="sort-answers-select"
                      className="se-select-native"
                      value={answerSort}
                      onChange={(e) => setAnswerSort(e.target.value)}
                    >
                      <option value="upvotes">Hữu ích nhất</option>
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Answers Stream */}
              <div className="se-answers-stream">
                {sortedAnswers.length === 0 ? (
                  <div className="se-empty-answers-prompt">
                    <h3>Chưa có lời giải</h3>
                    <p>Bạn có cách giải khác? Hãy chia sẻ các bước và cùng trao đổi.</p>
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
                      onReactComment={handleCommentHeart}
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
                key={`${post.id}:${currentUser?.id || currentUser?.uid || 'guest'}`}
                postId={post.id}
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
        onConfirm={() => handlePostAction(handleDeletePostConfirm)}
        isLoading={actionBusy}
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
