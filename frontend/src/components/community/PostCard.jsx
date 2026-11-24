import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  CheckCircle2,
  Bookmark,
  MessageCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MathRenderer from '../MathRenderer';
import PostActionsMenu from './PostActionsMenu';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatRelativeTime } from '../../services/communityService';
import CommunityAvatar from './CommunityAvatar';
import CommunityMemberLink from './CommunityMemberLink';
import { communityExcerpt } from '../../utils/communityExcerpt';
import '../../assets/styles/community.css';

function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return num.toString();
}

/**
 * Question Item Card following Mathematics & Physics Stack Exchange layout.
 */
export default function PostCard({
  post,
  currentUserId = null,
  isVisited = false,
  isSaved = false,
  onUpvote,
  onToggleSave,
  onEdit,
  onDelete,
  onHide,
  onReport
}) {
  const { currentUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isSolved = Boolean(post.isSolved || post.isAccepted);
  const answersCount = post.answersCount ?? (post.answers || []).length ?? 0;
  const isUpvoted = currentUserId ? (post.upvotedBy || []).includes(currentUserId) : false;

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'Admin' ||
      currentUser.isAdmin === true
    )
  );

  const isAuthor = Boolean(
    post.canManage || isAdmin || (
      currentUser && post.author && (
        (currentUser.uid && (post.author.id === currentUser.uid || post.author.uid === currentUser.uid)) ||
        (currentUser.id && (post.author.id === currentUser.id || post.author.uid === currentUser.id)) ||
        (currentUser.email && post.author.email && currentUser.email.toLowerCase() === post.author.email.toLowerCase()) ||
        (currentUser.username && post.author.email && currentUser.username.toLowerCase() === post.author.email.toLowerCase()) ||
        (currentUserId && (post.author.id === currentUserId || post.author.uid === currentUserId))
      )
    )
  );


  const snippet = communityExcerpt(post.content, 180);

  const handleAction = async (action) => {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try { await action(); }
    catch (error) { setFeedback({ error: true, message: error.message || 'Chưa thể hoàn tất. Vui lòng thử lại.' }); }
    finally { setBusy(false); }
  };

  const handleShare = () => handleAction(async () => {
    const url = `${window.location.origin}/community/${post.id}`;
    if (!navigator.clipboard) throw new Error('Trình duyệt chưa hỗ trợ sao chép. Bạn có thể sao chép đường dẫn khi mở bài.');
    await navigator.clipboard.writeText(url);
    setFeedback({ message: 'Đã sao chép liên kết.' });
  });

  const category = { algebra: 'Đại số tuyến tính', calc1: 'Vi tích phân 1', calc2: 'Vi tích phân 2', econ_models: 'Toán kinh tế', prob_stats: 'Xác suất thống kê', exam_prep: 'Ôn luyện & đề thi', method_tips: 'Phương pháp học' }[post.subject] || post.subjectLabel;
  return (
    <article className={`se-question-item ${isSolved ? 'is-solved' : ''} ${isVisited ? 'is-visited' : ''}`} id={'post-' + post.id}>
      <div className="se-question-main">
        <header className="qa-entry-byline">
          <div className="se-user-signature">
            {post.origin === 'curated' ? <span className="qa-source-seal" aria-hidden="true">TCC</span> : <CommunityMemberLink author={post.author} className="se-user-avatar-wrap"><CommunityAvatar src={post.author?.avatar} name={post.author?.name} imageClassName="se-user-avatar" fallbackClassName="se-user-avatar-fallback" /></CommunityMemberLink>}
            <div className="se-user-info-text"><CommunityMemberLink author={post.author} className="se-user-name">{post.author?.name || 'Thành viên'}</CommunityMemberLink><div className="se-user-time">{post.origin === 'curated' && <span>Bài biên soạn · </span>}{formatRelativeTime(post.createdAt)}</div></div>
          </div>
          {category && <Link className="qa-question-category" data-subject={post.subject} title={post.subjectLabel} to={'/community?subject=' + encodeURIComponent(post.subject)}>{category}</Link>}
        </header>
        <h2 className="se-question-title"><Link to={'/community/' + post.id}><MathRenderer text={post.title} inline /></Link></h2>
        {snippet && <div className="se-question-excerpt"><MathRenderer text={snippet} inline /></div>}
        <div className="se-tags-list qa-entry-tags">
          {(post.tags || []).slice(0, 2).map(tag => <Link key={tag} to={'/community?tag=' + encodeURIComponent(tag.replace(/^#/, ''))} className="se-tag-pill">{tag.replace(/^#/, '')}</Link>)}
          {(post.tags || []).length > 2 && <Link to={'/community/' + post.id} className="qa-more-tags">+{post.tags.length - 2} chủ đề</Link>}
        </div>
        <footer className="qa-entry-footer">
          <div className="qa-entry-interactions">
            <button type="button" className={'qa-entry-vote' + (isUpvoted ? ' is-liked' : '')} disabled={busy || !onUpvote}
              aria-label={isUpvoted ? 'Bỏ bình chọn' : 'Bình chọn câu hỏi'} title="Câu hỏi hữu ích" aria-pressed={isUpvoted}
              onClick={() => handleAction(() => onUpvote?.(post.id))}><Heart size={16} fill={isUpvoted ? 'currentColor' : 'none'} /><span>{formatNumber(post.upvotes || 0)}</span></button>
            <Link className={'qa-entry-answers' + (isSolved ? ' is-solved' : '')} to={'/community/' + post.id + '#answers-section'} title={isSolved ? 'Có lời giải được chấp nhận' : 'Xem lời giải'}>
              {isSolved ? <CheckCircle2 size={16} /> : <MessageCircle size={16} />}<span>{answersCount} lời giải</span>
            </Link>
            <span className="qa-entry-views" aria-label={(post.views || 0) + ' lượt xem'} title={(post.views || 0) + ' lượt mở bài'}><Eye size={16} />{formatNumber(post.views || 0)}</span>
            <span className="qa-entry-action-divider" aria-hidden="true" />
            {onToggleSave && <button type="button" className={'se-action-icon-btn' + (isSaved ? ' is-saved' : '')} disabled={busy}
              aria-label={isSaved ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi'} title={isSaved ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi'} aria-pressed={isSaved}
              onClick={() => handleAction(() => onToggleSave(post.id))}><Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} /></button>}
            <PostActionsMenu isAuthor={isAuthor} isSaved={isSaved}
              onEdit={isAuthor && onEdit ? () => handleAction(() => onEdit(post)) : undefined}
              onDelete={isAuthor && onDelete ? () => setConfirmDelete(true) : undefined}
              onShare={handleShare} onToggleSave={onToggleSave ? () => handleAction(() => onToggleSave(post.id)) : undefined}
              onHide={onHide ? () => onHide(post.id) : undefined} onReport={onReport ? () => onReport(post) : undefined} />
          </div>
        </footer>
        {feedback && <p className={feedback.error ? 'qa-action-feedback is-error' : 'qa-action-feedback'} role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
      </div>
      <ConfirmDialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Xóa câu hỏi?"
        message={'Bài “' + post.title + '” và các lời giải sẽ bị xóa. Thao tác này không thể hoàn tác.'} confirmLabel="Xóa câu hỏi" isLoading={busy}
        onConfirm={() => handleAction(async () => { await onDelete(post); setConfirmDelete(false); })} />
    </article>
  );
}
