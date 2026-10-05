import { Link } from 'react-router-dom';
import {
  Heart,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MathRenderer from '../MathRenderer';
import PostActionsMenu from './PostActionsMenu';
import { formatRelativeTime, DIFFICULTY_LEVELS } from '../../services/communityService';
import { getInitials } from '../../utils/userInitials';
import '../../assets/styles/community.css';

// Safely extract text snippet without breaking KaTeX $$ or $ math delimiters
function extractFeedSnippet(content, maxLength = 160) {
  if (!content) return '';
  // 1. Strip images and markdown headers
  let clean = content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/^#+\s+/gm, '');

  // 2. If it contains HTML tags, strip wrapper elements and extract text content while preserving $...$ and $$...$$
  if (/<[a-z][\s\S]*>/i.test(clean)) {
    clean = clean
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (clean.length <= maxLength) return clean;

  const truncated = clean.slice(0, maxLength);
  const doubleDollars = (truncated.match(/\$\$/g) || []).length;
  if (doubleDollars % 2 !== 0) {
    const nextClose = clean.indexOf('$$', maxLength);
    if (nextClose !== -1 && nextClose - maxLength < 60) {
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
    if (nextClose !== -1 && nextClose - maxLength < 30) {
      return clean.slice(0, nextClose + 1) + '...';
    }
    const lastOpen = truncated.lastIndexOf('$');
    if (lastOpen > 20) {
      return clean.slice(0, lastOpen).trim() + '...';
    }
  }

  return truncated.trim() + '...';
}

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
  const isSolved = Boolean(post.isSolved || post.isAccepted);
  const diffConfig = DIFFICULTY_LEVELS.find((d) => d.id === post.difficulty) || DIFFICULTY_LEVELS[1];
  const answersCount = post.answersCount ?? (post.answers || []).length ?? 0;
  const isUpvoted = currentUserId ? (post.upvotedBy || []).includes(currentUserId) : false;

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'Admin' ||
      currentUser.isAdmin === true
    )
  );

  const isAuthor = Boolean(
    isAdmin || (
      currentUser && post.author && (
        (currentUser.uid && (post.author.id === currentUser.uid || post.author.uid === currentUser.uid)) ||
        (currentUser.id && (post.author.id === currentUser.id || post.author.uid === currentUser.id)) ||
        (currentUser.email && post.author.email && currentUser.email.toLowerCase() === post.author.email.toLowerCase()) ||
        (currentUser.username && post.author.email && currentUser.username.toLowerCase() === post.author.email.toLowerCase()) ||
        (currentUserId && (post.author.id === currentUserId || post.author.uid === currentUserId))
      )
    )
  );

  const authorHref = `/community/user/${post.author?.id || 'guest'}`;

  const snippet = extractFeedSnippet(post.content);

  const handleShare = () => {
    const url = `${window.location.origin}/community/${post.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
  };

  return (
    <article
      className={`se-question-item ${isVisited ? 'is-visited' : ''} ${isSolved ? 'is-solved' : ''}`}
      id={`post-${post.id}`}
    >
      {/* 1. Left Stats Rail (Votes, Answers box, Views) */}
      <div className="se-stats-rail">
        {/* Votes */}
        <div className={`se-stat-box se-votes-box ${post.upvotes > 0 ? 'has-votes' : ''}`}>
          <span className="se-stat-value">{post.upvotes || 0}</span>
          <span className="se-stat-label">votes</span>
        </div>

        {/* Answers */}
        <div
          className={`se-stat-box se-answers-box ${
            isSolved
              ? 'is-accepted-answers'
              : answersCount > 0
              ? 'has-answers'
              : 'no-answers'
          }`}
          title={
            isSolved
              ? 'Bài toán đã có lời giải chuẩn xác'
              : answersCount > 0
              ? `${answersCount} câu trả lời`
              : 'Chưa có câu trả lời'
          }
        >
          {isSolved && <CheckCircle2 size={12} className="se-check-icon" />}
          <span className="se-stat-value">{answersCount}</span>
          <span className="se-stat-label">
            {answersCount === 1 ? 'answer' : 'answers'}
          </span>
        </div>

        {/* Views */}
        <div className="se-stat-box se-views-box">
          <span className="se-stat-value">{formatNumber(post.views || 0)}</span>
          <span className="se-stat-label">views</span>
        </div>
      </div>

      {/* 2. Main Question Details */}
      <div className="se-question-main">
        {/* Question Title with KaTeX */}
        <h3 className="se-question-title">
          <Link to={`/community/${post.id}`}>
            <MathRenderer text={post.title} inline />
          </Link>
        </h3>

        {/* Question Excerpt Snippet */}
        {snippet && (
          <div className="se-question-excerpt">
            <MathRenderer text={snippet} />
          </div>
        )}

        {/* Bottom Bar: Tags on left, User byline & Action tools on right */}
        <div className="se-question-footer">
          {/* Tags */}
          <div className="se-tags-list">
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

          {/* User Byline & Quick Actions */}
          <div className="se-user-meta-right">
            {/* Quick Actions (Bookmark, Like) */}
            <div className="se-quick-actions">
              {onToggleSave && (
                <button
                  type="button"
                  className={`se-action-icon-btn ${isSaved ? 'is-saved' : ''}`}
                  onClick={() => onToggleSave(post.id)}
                  title={isSaved ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi'}
                  aria-pressed={isSaved}
                >
                  <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              )}

              <button
                type="button"
                className={`se-action-icon-btn ${isUpvoted ? 'is-liked' : ''}`}
                onClick={() => onUpvote?.(post.id)}
                title={isUpvoted ? 'Bỏ thích' : 'Thích bài toán'}
                aria-pressed={isUpvoted}
              >
                <Heart size={13} fill={isUpvoted ? 'currentColor' : 'none'} />
              </button>

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

            {/* User Signature Card */}
            <div className="se-user-signature">
              <Link to={authorHref} className="se-user-avatar-wrap">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="se-user-avatar"
                  />
                ) : (
                  <span className="se-user-avatar-fallback">
                    {getInitials(post.author?.name || 'U')}
                  </span>
                )}
              </Link>

              <div className="se-user-info-text">
                <div className="se-user-name-line">
                  <Link to={authorHref} className="se-user-name">
                    {post.author?.name || 'Thành viên UEH'}
                  </Link>
                  <span className="se-user-rep">
                    {formatNumber(post.author?.points || 1)}
                  </span>
                </div>
                <div className="se-user-time">
                  <span>{post.answersCount > 0 ? 'answered' : 'asked'} {formatRelativeTime(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
