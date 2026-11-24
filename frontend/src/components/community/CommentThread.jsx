import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Reply, Send, Pencil, Trash2, X, Sigma, Heart, MoreHorizontal, LogIn } from 'lucide-react';
import CommunityAvatar from './CommunityAvatar';
import CommunityMemberLink from './CommunityMemberLink';
import MathRenderer from '../MathRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';
import WYSIWYGMathEditor from './WYSIWYGMathEditor';
import { formatRelativeTime } from '../../services/communityService';

const hasText = value => Boolean(value.replace(/<[^>]*>/g, '').trim());

/** Stored replies keep the conversation together; no fabricated reactions. */
export default function CommentThread({ comments = [], currentUser, postId, answerId,
  onRequireLogin, onAddComment, onEditComment, onDeleteComment, onReactComment, onOpenCheatsheet }) {
  const [text, setText] = useState('');
  const [rich, setRich] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [visibleRoots, setVisibleRoots] = useState(6);
  const inputRef = useRef(null);
  const { hash } = useLocation();
  const composerRef = useRef(null);
  const threadRef = useRef(null);
  useEffect(() => {
    const closeMenus = event => {
      threadRef.current?.querySelectorAll('.qa-comment-menu[open]').forEach(menu => {
        if (event.key === 'Escape' || !menu.contains(event.target)) menu.open = false;
      });
    };
    document.addEventListener('pointerdown', closeMenus);
    document.addEventListener('keydown', closeMenus);
    return () => { document.removeEventListener('pointerdown', closeMenus); document.removeEventListener('keydown', closeMenus); };
  }, []);
  const byId = new Map(comments.map(comment => [comment.id, comment]));
  const rootFor = comment => {
    const visited = new Set([comment.id]);
    let root = comment;
    while (root.parentId && byId.has(root.parentId) && !visited.has(root.parentId)) {
      visited.add(root.parentId);
      root = byId.get(root.parentId);
    }
    return root.id;
  };
  const roots = comments.filter(comment => rootFor(comment) === comment.id);
  let fragment = '';
  try { fragment = decodeURIComponent(hash.slice(1)); } catch { /* Ignore invalid fragments. */ }
  const linkedComment = byId.get(fragment.replace(/^comment-/, ''));
  const linkedRootIndex = linkedComment ? roots.findIndex(root => root.id === rootFor(linkedComment)) : -1;
  const shownRoots = Math.max(visibleRoots, linkedRootIndex + 1);

  const handleReply = comment => {
    if (!currentUser) return onRequireLogin?.();
    setReplyTo(comment);
    composerRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    (inputRef.current || composerRef.current?.querySelector('[contenteditable]'))?.focus({ preventScroll: true });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!currentUser) return onRequireLogin?.();
    if (busy || !hasText(text)) return;
    setBusy(true); setError('');
    try {
      await onAddComment(postId, answerId, text.trim(), { parentId: replyTo?.id || null });
      setText(''); setReplyTo(null); setRich(false); setVisibleRoots(value => value + 1);
    } catch (failure) { setError(failure.message || 'Chưa gửi được bình luận. Nội dung của bạn vẫn được giữ lại.'); }
    finally { setBusy(false); }
  };

  const handleSaveEdit = async () => {
    if (busy || !hasText(editText)) return;
    setBusy(true); setError('');
    try { await onEditComment(postId, answerId, editing.id, editText.trim()); setEditing(null); }
    catch (failure) { setError(failure.message || 'Chưa lưu được thay đổi.'); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (busy || !deleting) return;
    setBusy(true); setError('');
    try {
      await onDeleteComment(postId, answerId, deleting.id);
      if (replyTo?.id === deleting.id) setReplyTo(null);
      setDeleting(null);
    } catch (failure) { setError(failure.message || 'Chưa xóa được bình luận.'); }
    finally { setBusy(false); }
  };

  const handleHeart = async comment => {
    if (!currentUser) return onRequireLogin?.();
    if (busy) return;
    setBusy(true); setError('');
    try { await onReactComment(postId, answerId, comment.id, !comment.isLiked); }
    catch (failure) { setError(failure.message || 'Chưa lưu được tim. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };

  const renderComment = (comment, isReply = false) => {
    const own = Boolean(currentUser && (comment.canManage || currentUser.role === 'Admin' || currentUser.isAdmin
      || [currentUser.id, currentUser.uid].filter(Boolean).includes(comment.author?.id)));
    const parent = byId.get(comment.parentId);
    return <article className={'qa-comment' + (isReply ? ' is-reply' : '')} key={comment.id} id={'comment-' + comment.id}>
      <CommunityMemberLink author={comment.author} className="qa-comment-avatar"><CommunityAvatar src={comment.author?.avatar} name={comment.author?.name} /></CommunityMemberLink>
      <div className="qa-comment-main">
        {editing?.id === comment.id ? <div className="qa-comment-edit">
          <WYSIWYGMathEditor value={editText} onChange={setEditText} compact streamlined minHeight="70px" onOpenCheatsheet={onOpenCheatsheet} placeholder="Chỉnh sửa bình luận…" />
          <div className="qa-comment-edit-buttons"><button type="button" disabled={busy} onClick={() => setEditing(null)}>Hủy</button><button type="button" className="qa-comment-send" disabled={busy || !hasText(editText)} onClick={handleSaveEdit}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
        </div> : <>
          <div className="qa-comment-bubble">
            <div className="qa-comment-byline"><CommunityMemberLink author={comment.author} className="qa-comment-name">{comment.author?.name || 'Thành viên'}</CommunityMemberLink>
              {own && <details className="qa-comment-menu"><summary aria-label="Tùy chọn bình luận"><MoreHorizontal size={17} /></summary><div>
                {onEditComment && <button type="button" disabled={busy} onClick={event => { event.currentTarget.closest('details').open = false; setEditing(comment); setEditText(comment.content); }}><Pencil size={14} />Chỉnh sửa</button>}
                {onDeleteComment && <button type="button" disabled={busy} onClick={event => { event.currentTarget.closest('details').open = false; setDeleting(comment); }}><Trash2 size={14} />Xóa bình luận</button>}
              </div></details>}
            </div>
            {isReply && parent && <span className="qa-comment-reply-context"><Reply size={12} />Trả lời {parent.author?.name || 'thành viên'}</span>}
            <div className="qa-comment-content"><MathRenderer text={comment.content} /></div>
          </div>
          <div className="qa-comment-actions">
            {onReactComment && <button type="button" className={'qa-comment-heart' + (comment.isLiked ? ' is-liked' : '')} aria-label={comment.isLiked ? 'Bỏ tim bình luận' : 'Thả tim bình luận'} aria-pressed={Boolean(comment.isLiked)} disabled={busy} onClick={() => handleHeart(comment)}><Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} /><span>{comment.likesCount || 0}</span></button>}
            <button type="button" disabled={busy} onClick={() => handleReply(comment)}>Trả lời</button>
            <time dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && <span title="Bình luận đã được chỉnh sửa">đã sửa</span>}
          </div>
        </>}
      </div>
    </article>;
  };

  return <section className="qa-discussion" ref={threadRef} aria-label="Bình luận lời giải">
    <header className="qa-discussion-heading"><h3><MessageCircle size={18} />Cùng trao đổi</h3><span>{comments.length} bình luận</span></header>
    {comments.length === 0 && <p className="qa-discussion-empty">Bạn muốn hỏi thêm ở bước nào? Cùng trao đổi ngay dưới lời giải.</p>}
    <div className="qa-discussion-list">{roots.slice(0, shownRoots).map(root => <div className="qa-comment-branch" key={root.id}>
      {renderComment(root)}
      <div className="qa-comment-replies">{comments.filter(comment => comment.id !== root.id && rootFor(comment) === root.id).map(comment => renderComment(comment, true))}</div>
    </div>)}</div>
    {roots.length > shownRoots && <button type="button" className="qa-comments-more" onClick={() => setVisibleRoots(shownRoots + 6)}>Xem thêm {Math.min(6, roots.length - shownRoots)} bình luận</button>}
    {error && <p className="qa-action-feedback is-error" role="alert">{error}</p>}
    <div className="qa-comment-composer" ref={composerRef}>
      {currentUser && <span className="qa-comment-avatar"><CommunityAvatar src={currentUser.avatar || currentUser.photoURL} name={currentUser.name || 'Bạn'} /></span>}
      {currentUser ? <form onSubmit={handleSubmit}>
        {replyTo && <div className="qa-comment-replying"><span>Đang trả lời <strong>{replyTo.author?.name || 'thành viên'}</strong></span><button type="button" disabled={busy} aria-label="Hủy trả lời" onClick={() => setReplyTo(null)}><X size={16} /></button></div>}
        {rich ? <WYSIWYGMathEditor value={text} onChange={setText} compact streamlined minHeight="75px" onOpenCheatsheet={onOpenCheatsheet} placeholder="Viết bình luận hoặc công thức…" />
          : <textarea ref={inputRef} aria-label="Nội dung bình luận" placeholder={replyTo ? 'Viết câu trả lời của bạn…' : 'Viết bình luận…'} value={text} maxLength={3000} rows={2} disabled={busy} onChange={event => setText(event.target.value)} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} />}
        <div className="qa-comment-composer-actions"><button type="button" className="qa-comment-format" disabled={busy || rich} onClick={() => setRich(true)}><Sigma size={16} />Định dạng & công thức</button><button type="submit" className="qa-comment-send" disabled={busy || !hasText(text)}><Send size={15} />{busy ? 'Đang gửi…' : 'Gửi'}</button></div>
      </form> : <button type="button" className="qa-comment-signin" onClick={onRequireLogin}><LogIn size={16} /><span>Đăng nhập để bình luận</span></button>}
    </div>
    <ConfirmDialog isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={handleDelete} isLoading={busy} title="Xóa bình luận?" message="Chỉ bình luận này bị xóa. Các phản hồi của thành viên khác vẫn được giữ lại." confirmLabel="Xóa bình luận" variant="danger" />
  </section>;
}
