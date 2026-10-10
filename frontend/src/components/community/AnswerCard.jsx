import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Check,
  Maximize2,
  Minimize2,
  Trash2,
  Pencil
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';
import WYSIWYGMathEditor from './WYSIWYGMathEditor';
import { formatRelativeTime } from '../../services/communityService';
import '../../assets/styles/community.css';

/**
 * AnswerCard Component with Stack Exchange Left Vote Rail, Fade Collapse, & WYSIWYG Comments
 */
export default function AnswerCard({
  answer,
  postId,
  isPostAuthor = false,
  isInstructor = false,
  currentUser = null,
  onRequireLogin,
  onUpvote,
  onDownvote,
  onAcceptAnswer,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onQuote,
  onEditAnswer,
  onDeleteAnswer,
  onReport,
  onOpenCheatsheet
}) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSavingCommentEdit, setIsSavingCommentEdit] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAcceptingAnswer, setIsAcceptingAnswer] = useState(false);
  const [isDeletingAnswer, setIsDeletingAnswer] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Edit Answer state
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [isSavingAnswerEdit, setIsSavingAnswerEdit] = useState(false);

  const isAccepted = Boolean(answer.isAccepted);
  const currentUserId = currentUser?.id || currentUser?.uid || '';
  const isVerified = Boolean(answer.instructorVerified || answer.isInstructorVerified);
  const isAnswerAuthor = currentUser && (currentUser.uid === answer.author?.id || currentUser.id === answer.author?.id);
  const hasUpvoted = Boolean(currentUserId && answer.upvotedBy && answer.upvotedBy.includes(currentUserId));
  const hasDownvoted = Boolean(currentUserId && answer.downvotedBy && answer.downvotedBy.includes(currentUserId));

  const handleShareLink = () => {
    const url = `${window.location.origin}/community/${postId}#${answer.id}`;
    navigator.clipboard?.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    const clean = commentText.replace(/<[^>]*>/g, '').trim();
    if (!clean && !commentText.includes('$')) return;

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

  const handleStartComment = () => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    setShowCommentForm(true);
  };

  const handleStartEditComment = (cmt) => {
    setEditingCommentId(cmt.id);
    setEditingCommentText(cmt.content);
  };

  const handleSaveCommentEdit = async (cmtId) => {
    const clean = editingCommentText.replace(/<[^>]*>/g, '').trim();
    if (!clean && !editingCommentText.includes('$')) return;
    setIsSavingCommentEdit(true);
    try {
      await onEditComment?.(postId, answer.id, cmtId, editingCommentText.trim());
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err) {
      console.error('Lỗi cập nhật bình luận:', err);
    } finally {
      setIsSavingCommentEdit(false);
    }
  };

  const handleDeleteCommentConfirm = async () => {
    if (!commentToDelete) return;
    try {
      await onDeleteComment?.(postId, answer.id, commentToDelete.id);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Lỗi khi xóa bình luận:', err);
    }
  };

  const handleStartEditAnswer = () => {
    setIsEditingAnswer(true);
    setEditAnswerText(answer.content);
  };

  const handleSaveAnswerEdit = async () => {
    const clean = editAnswerText.replace(/<[^>]*>/g, '').trim();
    if (!clean && !editAnswerText.includes('$')) return;
    setIsSavingAnswerEdit(true);
    try {
      await onEditAnswer?.(postId, answer.id, editAnswerText.trim());
      setIsEditingAnswer(false);
    } catch (err) {
      console.error('Lỗi khi lưu chỉnh sửa lời giải:', err);
    } finally {
      setIsSavingAnswerEdit(false);
    }
  };

  const handleAcceptConfirm = async () => {
    setIsAcceptingAnswer(true);
    try {
      await onAcceptAnswer?.(postId, answer.id, isInstructor);
      setShowAcceptConfirm(false);
    } catch (err) {
      console.error('Lỗi khi cập nhật lời giải được chấp nhận:', err);
    } finally {
      setIsAcceptingAnswer(false);
    }
  };

  const handleDeleteAnswerConfirm = async () => {
    setIsDeletingAnswer(true);
    try {
      await onDeleteAnswer?.(postId, answer.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Lỗi khi xóa lời giải:', err);
    } finally {
      setIsDeletingAnswer(false);
    }
  };

  return (
    <article
      id={answer.id}
      className={`se-detail-answer-row ${isAccepted ? 'is-accepted-answer' : ''}`}
    >
      {/* 1. Left Vote Column */}
      <div className="se-detail-vote-rail">
        <button
          type="button"
          className={`se-vote-btn up ${hasUpvoted ? 'is-active' : ''}`}
          onClick={() => {
            if (!currentUser) {
              onRequireLogin?.();
              return;
            }
            onUpvote?.(postId, answer.id);
          }}
          title="Lời giải này hữu ích và chuẩn xác"
          aria-label="Upvote answer"
        >
          <ChevronUp size={28} />
        </button>

        <span className="se-vote-number">{answer.upvotes || 0}</span>

        <button
          type="button"
          className={`se-vote-btn down ${hasDownvoted ? 'is-active' : ''}`}
          onClick={() => {
            if (!currentUser) {
              onRequireLogin?.();
              return;
            }
            onDownvote?.(postId, answer.id);
          }}
          title="Lời giải chưa hữu ích hoặc không chính xác"
          aria-label="Downvote answer"
        >
          <ChevronDown size={28} />
        </button>

        {/* Big Green Accepted Checkmark Badge */}
        {isAccepted && (
          <div className="se-accepted-checkmark-badge" title="Lời giải đã được tác giả chấp nhận">
            <Check size={28} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* 2. Main Answer Body Column */}
      <div className="se-detail-post-body-col">
        {/* Top bar with Collapse Toggle Button */}
        <div className="se-answer-top-toolbar">
          {isVerified && !isAccepted && (
            <div className="se-verified-banner">
              <ShieldCheck size={15} />
              <span>Được Cố vấn học thuật UEH xác minh chuẩn mực</span>
            </div>
          )}

          {!isEditingAnswer && (
            <button
              type="button"
              className="se-collapse-toggle-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Mở rộng toàn bộ lời giải' : 'Thu gọn bớt lời giải'}
            >
              {isCollapsed ? (
                <>
                  <Maximize2 size={13} />
                  <span>Xem thêm...</span>
                </>
              ) : (
                <>
                  <Minimize2 size={13} />
                  <span>Thu gọn</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Answer Content or Full Inline WYSIWYG Editor */}
        {isEditingAnswer ? (
          <div className="se-answer-inline-edit-composer" style={{ margin: '10px 0 18px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
              <Pencil size={14} color="#0d9488" />
              <span>Chỉnh sửa nội dung lời giải</span>
            </div>
            <WYSIWYGMathEditor
              value={editAnswerText}
              onChange={setEditAnswerText}
              placeholder="Chỉnh sửa nội dung lời giải (hỗ trợ KaTeX, bảng, hộp Bổ đề/Định lý)..."
              onOpenCheatsheet={onOpenCheatsheet}
              minHeight="180px"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditingAnswer(false)}
                disabled={isSavingAnswerEdit}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveAnswerEdit}
                disabled={isSavingAnswerEdit || !editAnswerText.replace(/<[^>]*>/g, '').trim()}
              >
                {isSavingAnswerEdit ? 'Đang lưu...' : 'Lưu thay đổi lời giải'}
              </button>
            </div>
          </div>
        ) : (
          <div className={`se-detail-math-wrapper ${isCollapsed ? 'is-faded-collapsed' : ''}`}>
            <div className="se-detail-math-content">
              <MathRenderer text={answer.content} />
            </div>

            {isCollapsed && (
              <div className="se-collapsed-fade-overlay">
                <button
                  type="button"
                  className="se-fade-expand-btn"
                  onClick={() => setIsCollapsed(false)}
                >
                  Xem thêm...
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions & Author signature */}
        <div className="se-detail-post-bottom-bar">
          <div className="se-detail-actions-links">
            <button type="button" className="se-detail-link-btn" onClick={handleShareLink}>
              {isCopied ? 'Đã sao chép link' : 'Chia sẻ'}
            </button>

            {onQuote && !isEditingAnswer && (
              <button type="button" className="se-detail-link-btn" onClick={() => onQuote(answer.content)}>
                Trích dẫn
              </button>
            )}

            {onReport && !isEditingAnswer && (
              <button type="button" className="se-detail-link-btn" onClick={() => onReport(answer)}>
                Báo cáo
              </button>
            )}

            {isAnswerAuthor && !isEditingAnswer && (
              <button
                type="button"
                className="se-detail-link-btn"
                onClick={handleStartEditAnswer}
                title="Chỉnh sửa lời giải này"
              >
                Chỉnh sửa
              </button>
            )}

            {isAnswerAuthor && (
              <button type="button" className="se-detail-link-btn is-danger" onClick={() => setShowDeleteConfirm(true)}>
                Xóa
              </button>
            )}

            {/* Accept Solution Button */}
            {(isPostAuthor || isInstructor) && !isEditingAnswer && (
              <button
                type="button"
                className={`se-detail-link-btn ${isAccepted ? 'is-accepted-link' : ''}`}
                onClick={() => setShowAcceptConfirm(true)}
              >
                {isAccepted ? '✓ Đã ghim chấp nhận' : 'Chấp nhận lời giải'}
              </button>
            )}
          </div>

          {/* Answer Author Card */}
          <div className="se-author-card-box is-answer-author">
            <span className="author-card-time">
              answered {formatRelativeTime(answer.createdAt)}
              {answer.updatedAt && (
                <span className="se-comment-edited-badge" title={`Chỉnh sửa ${formatRelativeTime(answer.updatedAt)}`}>
                  {' '}(đã sửa)
                </span>
              )}
            </span>
            <div className="author-card-user-row">
              <Link to={`/community/user/${answer.author?.id}`} className="author-card-avatar">
                {answer.author?.avatar ? (
                  <img src={answer.author.avatar} alt={answer.author.name} />
                ) : (
                  <span>{(answer.author?.name || 'U').charAt(0).toUpperCase()}</span>
                )}
              </Link>
              <div className="author-card-meta">
                <Link to={`/community/user/${answer.author?.id}`} className="author-card-name">
                  {answer.author?.name || 'Sinh viên UEH'}
                </Link>
                <span className="author-card-rep">
                  {answer.author?.points || 0} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Threaded Comments Section */}
        <div className="se-comments-thread">
          <div className="se-comments-list">
            {(answer.comments || []).map((cmt) => {
              const isCmtAuthor = currentUser && (
                currentUser.uid === cmt.author?.id ||
                currentUser.id === cmt.author?.id ||
                currentUser.email === cmt.author?.email ||
                currentUser.isAdmin
              );
              const isEditing = editingCommentId === cmt.id;

              if (isEditing) {
                return (
                  <div key={cmt.id} className="se-comment-edit-box">
                    <WYSIWYGMathEditor
                      value={editingCommentText}
                      onChange={setEditingCommentText}
                      placeholder="Chỉnh sửa bình luận..."
                      onOpenCheatsheet={onOpenCheatsheet}
                      minHeight="60px"
                      compact={true}
                    />
                    <div className="se-comment-edit-actions">
                      <button
                        type="button"
                        className="se-comment-cancel-btn"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="se-comment-save-btn"
                        onClick={() => handleSaveCommentEdit(cmt.id)}
                        disabled={isSavingCommentEdit || !editingCommentText.replace(/<[^>]*>/g, '').trim()}
                      >
                        {isSavingCommentEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={cmt.id} className="se-comment-item group-hover-actions">
                  <div className="se-comment-body">
                    <MathRenderer text={cmt.content} inline />
                    <span className="se-comment-meta-byline">
                      {' – '}
                      <Link to={`/community/user/${cmt.author?.id || 'guest'}`} className="se-comment-author">
                        {cmt.author?.name || 'Sinh viên UEH'}
                      </Link>{' '}
                      <span className="se-comment-date">{formatRelativeTime(cmt.createdAt)}</span>
                      {cmt.updatedAt && (
                        <span className="se-comment-edited-badge" title={`Chỉnh sửa ${formatRelativeTime(cmt.updatedAt)}`}>
                          (đã sửa)
                        </span>
                      )}
                    </span>
                  </div>

                  {isCmtAuthor && (
                    <div className="se-comment-action-btns">
                      <button
                        type="button"
                        className="se-comment-action-btn edit"
                        onClick={() => handleStartEditComment(cmt)}
                        title="Chỉnh sửa bình luận này"
                        aria-label="Edit comment"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        className="se-comment-action-btn delete"
                        onClick={() => setCommentToDelete(cmt)}
                        title="Xóa bình luận này"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add a comment trigger or Rich form */}
          {!showCommentForm ? (
            <button
              type="button"
              className="se-add-comment-btn"
              onClick={handleStartComment}
            >
              Thêm bình luận trao đổi...
            </button>
          ) : (
            <form onSubmit={handleCommentSubmit} className="se-inline-comment-form">
              <WYSIWYGMathEditor
                value={commentText}
                onChange={setCommentText}
                placeholder="Nhập nhận xét hoặc đặt câu hỏi (hỗ trợ in đậm B, nghiêng I, màu sắc, KaTeX)..."
                onOpenCheatsheet={onOpenCheatsheet}
                minHeight="70px"
                compact={true}
              />
              <div className="se-comment-form-actions">
                <button
                  type="button"
                  className="se-comment-cancel-btn"
                  onClick={() => setShowCommentForm(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="se-comment-submit-btn"
                  disabled={isSubmittingComment || !commentText.replace(/<[^>]*>/g, '').trim()}
                >
                  Gửi bình luận
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showAcceptConfirm}
        onClose={() => setShowAcceptConfirm(false)}
        onConfirm={handleAcceptConfirm}
        isLoading={isAcceptingAnswer}
        title={isAccepted ? 'Bỏ chọn lời giải này?' : 'Chấp nhận lời giải này?'}
        message={
          isAccepted
            ? 'Bạn có chắc chắn muốn bỏ đánh dấu lời giải được chấp nhận?'
            : 'Đánh dấu lời giải này là chuẩn xác và hữu ích nhất cho bài toán của bạn.'
        }
        confirmLabel={isAccepted ? 'Bỏ chấp nhận' : 'Chấp nhận lời giải'}
        variant={isAccepted ? 'secondary' : 'primary'}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAnswerConfirm}
        isLoading={isDeletingAnswer}
        title="Xóa câu trả lời này?"
        message="Hành động này không thể hoàn tác. Lời giải của bạn sẽ bị xóa vĩnh viễn khỏi cuộc thảo luận."
        confirmLabel="Xóa câu trả lời"
        variant="danger"
      />

      {/* Comment Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDeleteCommentConfirm}
        title="Xác nhận xóa bình luận?"
        message="Bình luận này sẽ bị xóa vĩnh viễn khỏi câu trả lời. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa bình luận"
        variant="danger"
      />
    </article>
  );
}
