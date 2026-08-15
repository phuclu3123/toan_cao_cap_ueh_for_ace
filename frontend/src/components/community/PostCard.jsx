import { Link } from 'react-router-dom';
import {
  Heart,
  CheckCircle2,
  BookOpen,
  Bookmark,
  Sparkles
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import UserRankBadge from './UserRankBadge';
import PostActionsMenu from './PostActionsMenu';
import { formatRelativeTime, DIFFICULTY_LEVELS } from '../../services/communityService';
import '../../assets/styles/community.css';

// Safely extract text snippet without breaking KaTeX $$ or $ math delimiters
function extractFeedSnippet(content, maxLength = 190) {
  if (!content) return '';
  const clean = content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/^#+\s+/gm, '');
  if (clean.length <= maxLength) return clean;

  const truncated = clean.slice(0, maxLength);
  const doubleDollars = (truncated.match(/\$\$/g) || []).length;
  if (doubleDollars % 2 !== 0) {
    const nextClose = clean.indexOf('$$', maxLength);
    if (nextClose !== -1 && nextClose - maxLength < 80) {
      return clean.slice(0, nextClose + 2) + '...';
    }
    const lastOpen = truncated.lastIndexOf('$$');
    if (lastOpen > 20) {
      return clean.slice(0, lastOpen).trim() + '...';
    }
  }

  const singleDollars = (truncated.match(/(?<!\$)\$(?!\$)/g) || []).length;
  if (singleDollars % 2 !== 0) {
    const nextClose = clean.indexOf('$', maxLength);
    if (nextClose !== -1 && nextClose - maxLength < 40) {
      return clean.slice(0, nextClose + 1) + '...';
    }
    const lastOpen = truncated.lastIndexOf('$');
    if (lastOpen > 20) {
      return clean.slice(0, lastOpen).trim() + '...';
    }
  }

  return truncated.trim() + '...';
}

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
  const isQuestion = post.type === 'question';
  const isSolved = Boolean(post.isSolved);
  const diffConfig = DIFFICULTY_LEVELS.find((d) => d.id === post.difficulty) || DIFFICULTY_LEVELS[1];
  const answersCount = post.answersCount ?? (post.answers || []).length ?? 0;
  const isUpvoted = currentUserId ? (post.upvotedBy || []).includes(currentUserId) : false;
  const isAuthor = Boolean(currentUserId && post.author?.id === currentUserId);
  const authorHref = `/community/user/${post.author?.id || 'guest'}`;

  const snippet = extractFeedSnippet(post.content);

  const handleShare = () => {
    const url = `${window.location.origin}/community/${post.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
  };

  return (
    <article
      className={`qa-card ${isVisited ? 'is-visited' : ''} ${isSolved ? 'is-solved' : ''}`}
      id={`post-${post.id}`}
    >
      {/* Metric rail — the feed reads top-to-bottom on numbers first */}
      <div className="qa-card-rail">
        <div className="qa-metricbox">
          <b>{post.upvotes || 0}</b>
          <span>hữu ích</span>
        </div>

        <div
          className={`qa-metricbox ${
            isSolved && answersCount > 0 ? 'is-solved' : answersCount > 0 ? 'has-answers' : ''
          }`}
        >
          <b>{answersCount}</b>
          <span>lời giải</span>
        </div>

        <div className="qa-metricbox is-quiet">
          <b>{post.views || 0}</b>
          <span>lượt xem</span>
        </div>
      </div>

      <div className="qa-card-body">
        {/* Status + classification */}
        <div className="qa-card-top">
          {isQuestion ? (
            isSolved ? (
              <span className="q-status q-status-solved">
                <CheckCircle2 size={13} />
                Đã có lời giải
              </span>
            ) : (
              <span className="q-status q-status-open">
                <span className="q-dot" />
                Cần trợ giúp
              </span>
            )
          ) : (
            <span className="q-status q-status-note">
              <BookOpen size={13} />
              Bài chia sẻ
            </span>
          )}

          <span className="q-chip q-chip-neutral">
            {post.subjectLabel || 'Đại số Tuyến tính'}
          </span>

          <span className="q-chip" data-level={post.difficulty || 'medium'}>
            {post.difficultyLabel || diffConfig.label}
          </span>

          <PostActionsMenu
            isAuthor={isAuthor}
            isSaved={isSaved}
            onEdit={isAuthor && onEdit ? () => onEdit(post) : undefined}
            onDelete={isAuthor && onDelete ? () => onDelete(post) : undefined}
            onShare={handleShare}
            onToggleSave={onToggleSave ? () => onToggleSave(post.id) : undefined}
            onHide={onHide ? () => onHide(post.id) : undefined}
            onReport={onReport ? () => onReport(post) : undefined}
          />
        </div>

        <h2 className="qa-card-title">
          <Link to={`/community/${post.id}`}>
            <MathRenderer text={post.title} inline />
          </Link>
        </h2>

        {snippet && (
          <div className="qa-card-excerpt">
            <MathRenderer text={snippet} />
          </div>
        )}

        {(post.tags || []).length > 0 && (
          <div className="qa-card-tags">
            {(post.tags || []).slice(0, 4).map((tag, idx) => (
              <Link
                key={idx}
                to={`/community?tag=${encodeURIComponent(tag.replace('#', ''))}`}
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </Link>
            ))}
          </div>
        )}

        <footer className="qa-card-foot">
          <Link to={authorHref} className="qa-author">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="qa-avatar" />
            ) : (
              <span className="qa-avatar">
                {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}

            <span className="qa-author-meta">
              <span className="qa-author-name">
                {post.author?.name || 'Thành viên UEH'}
                {post.author?.points !== undefined && (
                  <UserRankBadge points={post.author.points} size="small" />
                )}
              </span>
              <span className="qa-author-sub">
                <span>{formatRelativeTime(post.createdAt)}</span>
                {post.author?.cohort && <span className="cohort-tag">{post.author.cohort}</span>}
                {post.isNew && (
                  <span className="qa-new"><Sparkles size={10} /> Mới</span>
                )}
              </span>
            </span>
          </Link>

          <div className="qa-card-acts">
            {onToggleSave && (
              <button
                type="button"
                className={`qa-act ${isSaved ? 'is-on-save' : ''}`}
                onClick={() => onToggleSave(post.id)}
                aria-pressed={isSaved}
                title={isSaved ? 'Bỏ lưu bài toán' : 'Lưu bài toán'}
              >
                <Bookmark size={14} />
                <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
              </button>
            )}

            <button
              type="button"
              className={`qa-act qa-like ${isUpvoted ? 'is-on-like' : ''}`}
              onClick={() => onUpvote?.(post.id)}
              aria-pressed={isUpvoted}
              title={isUpvoted ? 'Bỏ đánh dấu hữu ích' : 'Đánh dấu hữu ích'}
            >
              <Heart size={14} />
              <span className="q-num">{post.upvotes || 0}</span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}
