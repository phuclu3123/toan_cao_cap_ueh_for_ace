import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { communityService, DIFFICULTY_LEVELS } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import UserRankBadge from '../components/community/UserRankBadge';
import MathRenderer from '../components/MathRenderer';
import PostActionsMenu from '../components/community/PostActionsMenu';
import AnswerCard from '../components/community/AnswerCard';
import AnswerComposer from '../components/community/AnswerComposer';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ReportContentModal from '../components/community/ReportContentModal';
import CreatePostModal from '../components/community/CreatePostModal';
import FormulaCheatsheetModal from '../components/community/FormulaCheatsheetModal';
import AuthModal from '../components/modals/AuthModal';
import '../assets/styles/community.css';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Gần đây';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

/**
 * CommunityDetailPage: Deep Discussion & Mathematical Solution Thread
 */
export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    savedPostIds,
    toggleSavePost,
    handleUpvotePost,
    handleDeletePost,
    handleUpdatePost,
    handleAddAnswer,
    handleAcceptAnswer,
    reportPost,
    hidePost
  } = useCommunity();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answerSort, setAnswerSort] = useState('upvotes'); // 'upvotes' | 'newest' | 'oldest'
  const [quoteText, setQuoteText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
      upvotedBy: result.hasUpvoted
        ? [...(prev.upvotedBy || []), currentUser.uid || currentUser.id]
        : (prev.upvotedBy || []).filter(u => u !== (currentUser.uid || currentUser.id))
    }));
  };

  const handleAnswerUpvote = async (pId, aId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const userId = currentUser.uid || currentUser.id;
    const res = await communityService.toggleUpvoteAnswer(pId, aId, userId);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).map(a => {
        if (a.id === aId) {
          return {
            ...a,
            upvotes: res.upvotes,
            upvotedBy: res.hasUpvoted
              ? [...(a.upvotedBy || []), userId]
              : (a.upvotedBy || []).filter(u => u !== userId)
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

  const handleDeleteAnswer = async (pId, aId) => {
    await communityService.deleteAnswer(pId, aId);
    setPost(prev => ({
      ...prev,
      answers: (prev.answers || []).filter(a => a.id !== aId)
    }));
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
      <div className="community-page-wrapper">
        <div className="container" style={{ maxWidth: '900px' }}>
          <LoadingSkeleton variant="post-detail" />
          <div style={{ marginTop: '24px' }}>
            <LoadingSkeleton variant="answer-card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="community-page-wrapper">
        <div className="container" style={{ maxWidth: '800px', padding: '60px 20px' }}>
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

  const isPostAuthor = currentUser && (post.author?.id === (currentUser.uid || currentUser.id));
  const isSaved = savedPostIds.includes(post.id);
  const isSolved = post.status === 'solved' || post.isAccepted;
  const diffConfig = DIFFICULTY_LEVELS.find(d => d.id === post.difficulty) || DIFFICULTY_LEVELS[1];

  // Sort answers
  const sortedAnswers = [...(post.answers || [])].sort((a, b) => {
    // Accepted solution always pinned at the top
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;

    if (answerSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (answerSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return (b.upvotes || 0) - (a.upvotes || 0); // 'upvotes' default
  });

  return (
    <div className="community-page-wrapper">
      <div className="container community-detail-container">
        {/* Back Link */}
        <div className="detail-top-nav">
          <Link to="/community" className="detail-back-btn">
            <ArrowLeft size={16} />
            <span>Về diễn đàn Toán học</span>
          </Link>
        </div>

        {/* Hero Post Detail Card */}
        <article className={`post-detail-hero-card glass-panel ${isSolved ? 'solved-hero-glow' : ''}`}>
          {/* Top Metadata */}
          <div className="detail-hero-header">
            <div className="detail-author-box">
              <Link to={`/community/user/${post.author?.id}`} className="detail-avatar-link">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="detail-avatar-img" />
                ) : (
                  <div className="detail-avatar-fallback">
                    {(post.author?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>

              <div className="detail-author-info">
                <div className="detail-author-name-row">
                  <Link to={`/community/user/${post.author?.id}`} className="detail-author-name">
                    {post.author?.name || 'Sinh viên UEH'}
                  </Link>
                  <span className="detail-author-cohort">{post.author?.cohort || 'K50 UEH'}</span>
                  <UserRankBadge points={post.author?.points || 0} isInstructor={post.author?.isInstructor} size="small" />
                </div>

                <div className="detail-time-row">
                  <Clock size={12} />
                  <span>Đăng {formatRelativeTime(post.createdAt)}</span>
                  {post.updatedAt && (
                    <span className="edited-badge">• Đã chỉnh sửa</span>
                  )}
                  <span>• <Eye size={12} /> {post.views || 1} lượt xem</span>
                </div>
              </div>
            </div>

            {/* Status Pill & 3-dot Menu */}
            <div className="detail-header-actions">
              <span className={`post-status-pill ${isSolved ? 'status-solved' : 'status-unsolved'}`}>
                {isSolved ? (
                  <>
                    <CheckCircle2 size={13} /> Đã có lời giải chuẩn
                  </>
                ) : (
                  <>
                    <HelpCircle size={13} /> Cần trợ giúp
                  </>
                )}
              </span>

              <PostActionsMenu
                isAuthor={isPostAuthor}
                isSaved={isSaved}
                onEdit={isPostAuthor ? () => setIsEditing(true) : null}
                onDelete={isPostAuthor ? () => setShowDeleteConfirm(true) : null}
                onShare={handleShare}
                onToggleSave={() => toggleSavePost(post.id)}
                onHide={() => {
                  hidePost(post.id);
                  navigate('/community');
                }}
                onReport={() => setReportTarget(post)}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="detail-main-title">
            <MathRenderer text={post.title} inline />
          </h1>

          {/* Tags & Categories Row */}
          <div className="detail-tags-row">
            <span className="post-subject-badge">{post.subjectLabel || 'Đại số Tuyến tính'}</span>
            <span
              className="post-difficulty-badge"
              style={{ color: diffConfig.color, backgroundColor: diffConfig.badgeBg }}
            >
              {post.difficultyLabel || diffConfig.label}
            </span>
            {(post.tags || []).map((tag, idx) => (
              <Link
                key={idx}
                to={`/community?tag=${encodeURIComponent(tag.replace('#', ''))}`}
                className="post-tag-item"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </Link>
            ))}
          </div>

          {/* Main Math Content (Flat background for clean reading) */}
          <div className="detail-math-content-area">
            <MathRenderer text={post.content} />

            {/* Attached Diagram / Screenshot */}
            {post.image && (
              <figure className="detail-attached-image-figure">
                <img
                  src={post.image}
                  alt={post.altText || 'Hình ảnh bài toán'}
                  className="detail-attached-img"
                />
                {post.altText && (
                  <figcaption className="detail-img-caption">
                    Ghi chú đề bài: {post.altText}
                  </figcaption>
                )}
              </figure>
            )}
          </div>

          {/* Bottom Interactive Bar */}
          <div className="detail-action-bar">
            <div className="action-bar-left">
              {/* Like / Heart Button */}
              <button
                type="button"
                className={`detail-like-btn ${(post.upvotedBy || []).includes(currentUser?.uid || currentUser?.id) || post.upvotes > 0 ? 'active' : ''}`}
                onClick={handleUpvote}
                title="Thích và đánh giá bài toán hay"
                aria-label="Thích bài toán"
              >
                <Heart size={18} fill={(post.upvotedBy || []).includes(currentUser?.uid || currentUser?.id) || post.upvotes > 0 ? 'currentColor' : 'none'} />
                <span>{(post.upvotedBy || []).includes(currentUser?.uid || currentUser?.id) || post.upvotes > 0 ? 'Đã thích' : 'Thích bài toán'}</span>
                <span className="like-badge-num">{post.upvotes || 0}</span>
              </button>

              {/* Bookmark Button */}
              <button
                type="button"
                className={`detail-action-btn ${isSaved ? 'active-saved' : ''}`}
                onClick={() => toggleSavePost(post.id)}
                title={isSaved ? 'Bỏ lưu bài toán' : 'Lưu bài toán'}
              >
                <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Đã lưu' : 'Lưu bài'}</span>
              </button>

              {/* Watch / Follow Button */}
              <button
                type="button"
                className={`detail-action-btn ${isFollowing ? 'active-following' : ''}`}
                onClick={() => setIsFollowing(!isFollowing)}
                title="Nhận thông báo khi có lời giải mới"
              >
                <Bell size={16} fill={isFollowing ? 'currentColor' : 'none'} />
                <span>{isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</span>
              </button>
            </div>

            <div className="action-bar-right">
              {/* Share Button */}
              <button
                type="button"
                className="detail-action-btn"
                onClick={handleShare}
                title="Sao chép liên kết"
              >
                <Share2 size={16} />
                <span>{isCopied ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Answers Header & Sort Row */}
        <div className="answers-section-header" id="answers-section">
          <div className="answers-title-box">
            <MessageSquare size={20} className="answers-header-icon" />
            <h2>
              Lời Giải & Thảo Luận <span>({sortedAnswers.length})</span>
            </h2>
          </div>

          {/* Sort Answers Selector */}
          {sortedAnswers.length > 1 && (
            <div className="answers-sort-box">
              <label htmlFor="answers-sort-select">Sắp xếp:</label>
              <div className="select-with-chevron">
                <select
                  id="answers-sort-select"
                  className="filter-select"
                  value={answerSort}
                  onChange={(e) => setAnswerSort(e.target.value)}
                >
                  <option value="upvotes">▲ Được bình chọn nhiều</option>
                  <option value="newest">⚡ Mới nhất</option>
                  <option value="oldest">⏳ Cũ nhất</option>
                </select>
                <ChevronDown size={14} className="select-chevron-icon" />
              </div>
            </div>
          )}
        </div>

        {/* Answers List */}
        <div className="answers-feed-list">
          {sortedAnswers.length === 0 ? (
            <div className="no-answers-prompt-card glass-panel">
              <Sparkles size={36} className="prompt-icon" />
              <h3>Chưa có ai giải bài toán này!</h3>
              <p>Bạn biết cách giải bài này? Hãy là người đầu tiên gửi lời giải chuẩn xác để nhận ngay <strong>+15 điểm First Solver</strong>!</p>
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
                onUpvote={handleAnswerUpvote}
                onAcceptAnswer={handleAnswerAccept}
                onAddComment={handleAnswerComment}
                onDeleteAnswer={handleDeleteAnswer}
                onQuote={(text) => {
                  setQuoteText(text);
                  const composer = document.getElementById('answer-composer-section');
                  composer?.scrollIntoView({ behavior: 'smooth' });
                }}
                onReport={(target) => setReportTarget(target)}
              />
            ))
          )}
        </div>

        {/* Answer Composer */}
        <div style={{ marginTop: '40px' }}>
          <AnswerComposer
            onSubmit={handleCreateAnswerSubmit}
            currentUser={currentUser}
            onRequireLogin={() => setShowAuthModal(true)}
            onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            quoteText={quoteText}
            onClearQuote={() => setQuoteText('')}
          />
        </div>
      </div>

      {/* Edit Post Modal */}
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

      {/* Delete Post Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePostConfirm}
        title="Xóa bài toán này?"
        message="Hành động này không thể hoàn tác. Toàn bộ câu hỏi, lời giải và bình luận liên quan sẽ bị xóa hoàn toàn khỏi diễn đàn."
        confirmLabel="Xóa bài viết"
        variant="danger"
      />

      {/* Report Modal */}
      <ReportContentModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onSubmit={(data) => {
          reportPost({ ...data, targetId: reportTarget?.id });
          setReportTarget(null);
        }}
        contentTitle={reportTarget?.title || 'Nội dung'}
      />

      {/* Formula Cheatsheet Modal */}
      <FormulaCheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          showLoginModal={showAuthModal}
          setShowLoginModal={setShowAuthModal}
        />
      )}
    </div>
  );
}
