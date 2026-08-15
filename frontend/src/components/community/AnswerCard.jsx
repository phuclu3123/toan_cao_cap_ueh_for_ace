import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  CheckCircle2,
  ShieldCheck,
  Quote,
  MessageSquare,
  CornerDownRight,
  Send,
  Share2,
  Award,
  Check
} from 'lucide-react';
import UserRankBadge from './UserRankBadge';
import MathRenderer from '../MathRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';
import PostActionsMenu from './PostActionsMenu';
import { formatRelativeTime } from '../../services/communityService';
import '../../assets/styles/community.css';

/**
 * AnswerCard Component: Solution display with Heart/Like, comments, and instructor verification.
 * Zero emojis, 100% Lucide SVG.
 */
export default function AnswerCard({
  answer,
  postId,
  isPostAuthor = false,
  isInstructor = false,
  onUpvote,
  onAcceptAnswer,
  onAddComment,
  onQuote,
  onDeleteAnswer,
  currentUser = null
}) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAccepted = Boolean(answer.isAccepted);
  const isVerified = Boolean(answer.instructorVerified || answer.isInstructorVerified);
  const isHighlightedByViewer = isInstructor ? isVerified : isAccepted;
  const isAnswerAuthor = currentUser && (currentUser.uid === answer.author?.id || currentUser.id === answer.author?.id);
  const hasUpvoted = (answer.upvotedBy || []).includes(currentUser?.uid || currentUser?.id || 'guest') || (answer.upvotes > 0);

  const handleShareLink = () => {
    const url = `${window.location.origin}/community/${postId}#${answer.id}`;
    navigator.clipboard?.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await onAddComment(postId, answer.id, commentText.trim());
      setCommentText('');
      setShowCommentForm(false);
    } catch (err) {
      console.error('Lỗi khi gửi bình luận:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div
      id={answer.id}
      className={`answer-card glass-panel ${isAccepted ? 'answer-accepted-highlight' : ''} ${isVerified ? 'answer-verified-highlight' : ''}`}
    >
      {/* Accepted / Verified Banners */}
      {isAccepted && (
        <div className="accepted-solution-banner">
          <div className="banner-badge-icon">
            <CheckCircle2 size={16} />
          </div>
          <div className="banner-text-content">
            <span className="banner-title">Lời giải nổi bật do tác giả đề xuất</span>
            <span className="banner-sub">Đây là lựa chọn tham khảo của tác giả, không phải điều kiện để lời giải được hiển thị.</span>
          </div>
        </div>
      )}

      {isVerified && !isAccepted && (
        <div className="verified-solution-banner">
          <div className="banner-badge-icon">
            <ShieldCheck size={16} />
          </div>
          <div className="banner-text-content">
            <span className="banner-title">Được Cố vấn học thuật UEH xác minh</span>
            <span className="banner-sub">Lời giải đã được giảng viên / ban cố vấn TCC thẩm định chuẩn mực.</span>
          </div>
        </div>
      )}

      {/* Main Answer Header */}
      <div className="answer-header">
        <div className="answer-author-box">
          <Link to={`/community/user/${answer.author?.id}`} className="answer-avatar-link">
            {answer.author?.avatar ? (
              <img src={answer.author.avatar} alt={answer.author.name} className="answer-avatar-img" />
            ) : (
              <div className="answer-avatar-fallback">
                {(answer.author?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="answer-author-info">
            <div className="author-name-row">
              <Link to={`/community/user/${answer.author?.id}`} className="author-name">
                {answer.author?.name || 'Sinh viên UEH'}
              </Link>
              <span className="author-cohort">{answer.author?.cohort || 'K50 UEH'}</span>
              <UserRankBadge points={answer.author?.points || 0} size="small" />
            </div>
            <div className="author-time-row">
              <span className="answer-time">{formatRelativeTime(answer.createdAt)}</span>
              {answer.isFirstSolver && (
                <span className="first-solver-pill">
                  <Award size={12} />
                  <span>First Solver (+15 pts)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Menu */}
        <div className="answer-header-right">
          {/* Post Author / Instructor can Mark Solution */}
          {(isPostAuthor || isInstructor) && (
            <button
              type="button"
              className={`btn-accept-solution ${isHighlightedByViewer ? 'is-accepted' : ''}`}
              onClick={() => setShowAcceptConfirm(true)}
              title={isInstructor
                ? (isVerified ? 'Bỏ xác minh chuyên môn' : 'Xác minh chuyên môn cho lời giải')
                : (isAccepted ? 'Bỏ ghim lời giải' : 'Ghim lời giải hữu ích cho người đọc')}
            >
              <CheckCircle2 size={15} />
              <span>{isInstructor
                ? (isVerified ? 'Đã xác minh' : 'Xác minh chuyên môn')
                : (isAccepted ? 'Đã ghim nổi bật' : 'Ghim lời giải hữu ích')}</span>
            </button>
          )}

          <PostActionsMenu
            isAuthor={isAnswerAuthor}
            onDelete={() => setShowDeleteConfirm(true)}
            onShare={handleShareLink}
          />
        </div>
      </div>

      {/* Answer Body with Math & Markdown */}
      <div className="answer-body">
        <MathRenderer text={answer.content} />
      </div>

      {/* Answer Footer Bar */}
      <div className="answer-footer">
        <div className="answer-actions-left">
          {/* Like / Upvote Button */}
          <button
            type="button"
            className={`answer-like-btn ${hasUpvoted ? 'active' : ''}`}
            onClick={() => onUpvote(postId, answer.id)}
            title="Thích và đánh giá lời giải hữu ích"
            aria-label="Thích lời giải"
          >
            <Heart size={16} fill={hasUpvoted ? 'currentColor' : 'none'} />
            <span className="like-count">{answer.upvotes || 0}</span>
            <span className="like-text">{hasUpvoted ? 'Đã thích' : 'Hữu ích'}</span>
          </button>

          {/* Quote Button */}
          {onQuote && (
            <button
              type="button"
              className="answer-action-text-btn"
              onClick={() => onQuote(answer.content)}
              title="Trích dẫn đoạn này vào bài giải của bạn"
            >
              <Quote size={14} />
              <span>Trích dẫn</span>
            </button>
          )}

          {/* Reply / Comment Button */}
          <button
            type="button"
            className="answer-action-text-btn"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            <MessageSquare size={14} />
            <span>Phản hồi ({(answer.comments || []).length})</span>
          </button>
        </div>

        <div className="answer-actions-right">
          <button
            type="button"
            className="answer-action-text-btn"
            onClick={handleShareLink}
            title="Sao chép link câu trả lời"
          >
            {isCopied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            <span>{isCopied ? 'Đã sao chép!' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>

      {/* 1-Level Nested Comments Area */}
      <div className="answer-nested-comments-section">
        {/* Comments List */}
        {(answer.comments || []).map((cmt) => (
          <div key={cmt.id} className="nested-comment-item" id={cmt.id}>
            <CornerDownRight size={14} className="comment-thread-icon" />
            <div className="comment-item-body">
              <div className="comment-header-row">
                <span className="comment-author-name">{cmt.author?.name || 'Sinh viên UEH'}</span>
                <span className="comment-author-cohort">{cmt.author?.cohort || 'K50 UEH'}</span>
                <span className="comment-time">{formatRelativeTime(cmt.createdAt)}</span>
              </div>
              <p className="comment-content-text">{cmt.content}</p>
            </div>
          </div>
        ))}

        {/* Comment Composer Form */}
        {showCommentForm && (
          <form onSubmit={handleCommentSubmit} className="nested-comment-form">
            <input
              type="text"
              className="form-input form-input-sm nested-comment-input"
              placeholder="Viết phản hồi trao đổi thêm về lời giải này..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              autoFocus
            />
            <div className="comment-form-actions">
              <span className="qa-comment-publish-note">Phản hồi được đăng ngay, không cần duyệt.</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCommentForm(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmittingComment || !commentText.trim()}
              >
                <Send size={13} />
                <span>Gửi</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirm Accept Solution Dialog */}
      <ConfirmDialog
        isOpen={showAcceptConfirm}
        onClose={() => setShowAcceptConfirm(false)}
        onConfirm={async () => {
          setShowAcceptConfirm(false);
          await onAcceptAnswer(postId, answer.id, isInstructor);
        }}
        title={isInstructor
          ? (isVerified ? 'Bỏ xác minh chuyên môn?' : 'Xác minh lời giải này?')
          : (isAccepted ? 'Bỏ ghim lời giải?' : 'Ghim lời giải hữu ích?')}
        message={
          isInstructor
            ? (isVerified
              ? 'Lời giải sẽ không còn nhãn xác minh chuyên môn.'
              : 'Xác nhận rằng lời giải đã được kiểm tra về mặt chuyên môn. Người giải sẽ nhận điểm ghi nhận.')
            : (isAccepted
              ? 'Lời giải vẫn hiển thị bình thường nhưng sẽ không còn được ghim nổi bật.'
              : 'Ghim lời giải này làm phương án tham khảo nổi bật. Đây không phải bước kiểm duyệt bình luận.')
        }
        confirmLabel={isHighlightedByViewer ? 'Bỏ đánh dấu' : (isInstructor ? 'Xác minh' : 'Ghim nổi bật')}
        variant="success"
      />

      {/* Confirm Delete Answer Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          if (onDeleteAnswer) await onDeleteAnswer(postId, answer.id);
        }}
        title="Xóa câu trả lời này?"
        message="Hành động này không thể hoàn tác. Câu trả lời và toàn bộ bình luận liên quan sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa câu trả lời"
        variant="danger"
      />
    </div>
  );
}
