import { useState } from 'react';
import CommunityMemberLink from './CommunityMemberLink';
import CommunityAvatar from './CommunityAvatar';
import CommentThread from './CommentThread';
import {
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Check,
  Maximize2,
  Minimize2,
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
  onReactComment,
  onQuote,
  onEditAnswer,
  onDeleteAnswer,
  onReport,
  onOpenCheatsheet
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAcceptingAnswer, setIsAcceptingAnswer] = useState(false);
  const [isDeletingAnswer, setIsDeletingAnswer] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  // Edit Answer state
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [isSavingAnswerEdit, setIsSavingAnswerEdit] = useState(false);

  const isAccepted = Boolean(answer.isAccepted);
  const currentUserId = currentUser?.id || currentUser?.uid || '';
  const isVerified = Boolean(answer.instructorVerified || answer.isInstructorVerified);
  const isAnswerAuthor = currentUser && (answer.canManage || currentUser.uid === answer.author?.id || currentUser.id === answer.author?.id);
  const hasUpvoted = Boolean(currentUserId && answer.upvotedBy && answer.upvotedBy.includes(currentUserId));
  const hasDownvoted = Boolean(currentUserId && answer.downvotedBy && answer.downvotedBy.includes(currentUserId));

  const handleShareLink = async () => {
    const url = `${window.location.origin}/community/${postId}#${answer.id}`;
    try {
    if (!navigator.clipboard) throw new Error('Trình duyệt chưa hỗ trợ sao chép liên kết.');
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    } catch (error) { setActionError(error.message); }
  };

  const handleVote = async (action) => {
    if (!currentUser) return onRequireLogin?.();
    if (isVoting) return;
    setIsVoting(true); setActionError('');
    try { await action?.(postId, answer.id); }
    catch (error) { setActionError(error.message || 'Chưa thể bình chọn. Vui lòng thử lại.'); }
    finally { setIsVoting(false); }
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
      setActionError(err.message || 'Please retry.');
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
      setActionError(err.message || 'Please retry.');
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
      setActionError(err.message || 'Please retry.');
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
            handleVote(onUpvote);
          }}
          title="Lời giải này hữu ích và chuẩn xác"
          aria-label="Bình chọn lời giải hữu ích"
          disabled={isVoting}
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
            handleVote(onDownvote);
          }}
          title="Lời giải chưa hữu ích hoặc không chính xác"
          aria-label="Bình chọn lời giải chưa hữu ích"
          disabled={isVoting}
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
        {actionError && <p className="qa-action-feedback is-error" role="alert">{actionError}</p>}
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
              placeholder="Chỉnh sửa lời giải, công thức hoặc hình minh họa…"
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
              {answer.image && <figure className="qa-answer-attachment"><img src={answer.image} alt={answer.altText || 'Ảnh lời giải đính kèm'} loading="lazy" />{answer.altText && <figcaption>{answer.altText}</figcaption>}</figure>}
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
              {answer.origin === 'curated' ? 'Lời giải biên soạn' : 'Trả lời'} {formatRelativeTime(answer.createdAt)}
              {answer.updatedAt && (
                <span className="se-comment-edited-badge" title={`Chỉnh sửa ${formatRelativeTime(answer.updatedAt)}`}>
                  {' '}(đã sửa)
                </span>
              )}
            </span>
            <div className="author-card-user-row">
              <CommunityMemberLink author={answer.author} className="author-card-avatar">
                <CommunityAvatar src={answer.author?.avatar} name={answer.author?.name} />
              </CommunityMemberLink>
              <div className="author-card-meta">
                <CommunityMemberLink author={answer.author} className="author-card-name">
                  {answer.author?.name || 'Sinh viên UEH'}
                </CommunityMemberLink>
                <span className="author-card-rep">
                  {answer.origin === 'curated' ? 'α∫M4A' : `${answer.author?.points || 0} \u0111i\u1ec3m`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CommentThread key={`${answer.id}:${currentUser?.id || currentUser?.uid || 'guest'}`}
          comments={answer.comments || []} currentUser={currentUser} postId={postId} answerId={answer.id}
          onRequireLogin={onRequireLogin} onAddComment={onAddComment} onEditComment={onEditComment}
          onDeleteComment={onDeleteComment} onReactComment={onReactComment} onOpenCheatsheet={onOpenCheatsheet} />
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

    </article>
  );
}
