import { useEffect, useRef, useState } from 'react';
import {
  BookOpenCheck,
  Heart,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
  ThumbsUp,
  UsersRound,
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { safeLocalStorage } from '../utils/safeStorage';
import '../assets/styles/BlogEngagement.css';

const reactionOptions = [
  { id: 'clear', label: 'Dễ hiểu', Icon: Sparkles },
  { id: 'useful', label: 'Hữu ích', Icon: BookOpenCheck },
  { id: 'insightful', label: 'Sâu sắc', Icon: Lightbulb },
  { id: 'love', label: 'Yêu thích', Icon: Heart },
];

const emptyEngagement = {
  reactions: { clear: 0, useful: 0, insightful: 0, love: 0 },
  viewerReaction: null,
  comments: [],
};

const getClientId = () => {
  const storageKey = 'ueh_tcc_blog_client_id';
  const existing = safeLocalStorage.getItem(storageKey);
  if (/^[A-Za-z0-9._:-]{8,120}$/.test(existing || '')) return existing;
  const nextId =
    window.crypto?.randomUUID?.() ||
    `reader-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  safeLocalStorage.setItem(storageKey, nextId);
  return nextId;
};

const getReaderName = () => {
  try {
    const user = JSON.parse(safeLocalStorage.getItem('ueh_tcc_user') || 'null');
    return (
      user?.name ||
      user?.displayName ||
      safeLocalStorage.getItem('ueh_tcc_blog_reader_name') ||
      ''
    );
  } catch {
    return safeLocalStorage.getItem('ueh_tcc_blog_reader_name') || '';
  }
};

const getInitials = (name) =>
  String(name || 'B')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const formatCommentDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const persistEngagement = (cacheKey, engagement) => {
  safeLocalStorage.setItem(cacheKey, JSON.stringify(engagement));
};

export default function BlogEngagement({ slug, title }) {
  const [clientId] = useState(() => getClientId());
  const cacheKey = `ueh_tcc_blog_engagement:${slug}`;
  const [engagement, setEngagement] = useState(emptyEngagement);
  const [authorName, setAuthorName] = useState(getReaderName);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const mutationBusy = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadEngagement = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/engagement?clientId=${encodeURIComponent(clientId)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('Community API unavailable');
        const data = await response.json();
        const nextEngagement = data.engagement || emptyEngagement;
        setEngagement(nextEngagement);
        persistEngagement(cacheKey, nextEngagement);
        setIsOfflineFallback(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        try {
          const cached = JSON.parse(safeLocalStorage.getItem(cacheKey) || 'null');
          if (cached) setEngagement({ ...cached, comments: (cached.comments || []).filter(item => !item.commentId.startsWith('local-')) });
        } catch {
          setEngagement(emptyEngagement);
        }
        setIsOfflineFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadEngagement();
    return () => controller.abort();
  }, [cacheKey, clientId, slug]);

  // Only server-confirmed writes enter the public stream or its cache.
  const handleMutation = async (path, body, successMessage = '') => {
    if (mutationBusy.current) return false;
    mutationBusy.current = true;
    setPendingAction(path); setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, ...body }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.engagement) throw new Error(data.message || 'Chưa thể lưu thay đổi. Vui lòng thử lại.');
      setEngagement(data.engagement);
      persistEngagement(cacheKey, data.engagement);
      setIsOfflineFallback(false); setNotice(successMessage);
      return true;
    } catch (error) {
      setNotice(error.message === 'Failed to fetch' ? 'Chưa kết nối được máy chủ. Nội dung của bạn vẫn được giữ lại, hãy thử gửi lại.' : error.message);
      setIsOfflineFallback(true);
      return false;
    } finally { mutationBusy.current = false; setPendingAction(''); }
  };

  const handleReaction = reaction => handleMutation('reactions', { reaction });

  const handleCommentSubmit = async event => {
    event.preventDefault();
    if (mutationBusy.current) return;
    const cleanName = authorName.replace(/\s+/g, ' ').trim();
    const cleanComment = comment.trim();
    if (cleanName.length < 2 || cleanComment.length < 3) {
      setNotice('Vui lòng nhập tên và một bình luận rõ ràng.'); return;
    }
    setIsSubmitting(true);
    safeLocalStorage.setItem('ueh_tcc_blog_reader_name', cleanName);
    const saved = await handleMutation('comments', { authorName: cleanName, content: cleanComment }, 'Bình luận của bạn đã được đăng.');
    if (saved) setComment('');
    setIsSubmitting(false);
  };

  const handleCommentLike = commentId => handleMutation(`comments/${encodeURIComponent(commentId)}/like`, {});

  const totalReactions = Object.values(engagement.reactions || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return (
    <section className="blog-engagement" aria-labelledby="blog-discussion-title">
      <header className="blog-engagement-header">
        <div>
          <span className="blog-engagement-kicker">Cộng đồng học tập</span>
          <h2 id="blog-discussion-title">Trao đổi về bài viết</h2>
          <p>
            Bài viết giúp bạn hiểu rõ hơn chứ? Hãy để lại cảm nhận hoặc một câu hỏi học thuật.
          </p>
        </div>
        <div className="blog-engagement-stats" aria-label="Thống kê tương tác">
          <span><UsersRound size={17} /> {totalReactions} cảm xúc</span>
          <span><MessageCircle size={17} /> {engagement.comments?.length || 0} bình luận</span>
        </div>
      </header>

      <div className="blog-reaction-panel">
        <div>
          <strong>Bạn đánh giá bài viết này thế nào?</strong>
          <span>{isLoading ? 'Đang tải tương tác…' : 'Chọn một cảm xúc phù hợp nhất'}</span>
        </div>
        <div className="blog-reaction-list">
          {reactionOptions.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              className={engagement.viewerReaction === id ? 'is-selected' : ''}
              aria-pressed={engagement.viewerReaction === id}
              disabled={Boolean(pendingAction) || isLoading} onClick={() => handleReaction(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <strong>{engagement.reactions?.[id] || 0}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="blog-discussion-grid">
        <form className="blog-comment-form" onSubmit={handleCommentSubmit}>
          <div className="blog-comment-form-heading">
            <span className="comment-avatar">{getInitials(authorName || 'Bạn')}</span>
            <div>
              <strong>Tham gia thảo luận</strong>
              <span>Chia sẻ câu hỏi, cách giải hoặc góp ý cho bài viết.</span>
            </div>
          </div>

          <label htmlFor="blog-comment-name">Tên hiển thị</label>
          <input
            id="blog-comment-name"
            type="text"
            value={authorName}
            maxLength={60}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Ví dụ: Nguyễn An"
            autoComplete="name"
            disabled={isSubmitting}
          />

          <div className="blog-comment-label-row">
            <label htmlFor="blog-comment-content">Bình luận</label>
            <span>{comment.length}/1200</span>
          </div>
          <textarea
            id="blog-comment-content"
            value={comment}
            maxLength={1200}
            rows={6}
            disabled={isSubmitting}
            onChange={(event) => setComment(event.target.value)}
            placeholder={`Bạn muốn trao đổi điều gì về “${title}”?`}
          />

          <div className="blog-comment-form-footer">
            <p>Bình luận được hiển thị công khai. Vui lòng trao đổi lịch sự và đúng chủ đề.</p>
            <button type="submit" disabled={isSubmitting || Boolean(pendingAction) || isLoading}>
              <Send size={17} />
              {isSubmitting ? 'Đang đăng…' : 'Đăng bình luận'}
            </button>
          </div>
          {notice && <div className="blog-comment-notice" role="status">{notice}</div>}
          {isOfflineFallback && (
            <div className="blog-community-status">
              Chưa kết nối được khu vực thảo luận. Bản đã lưu chỉ dùng để đọc; hãy thử gửi lại khi kết nối ổn định.
            </div>
          )}
        </form>

        <div className="blog-comment-stream">
          <div className="blog-comment-stream-heading">
            <div>
              <span>Thảo luận gần đây</span>
              <strong>{engagement.comments?.length || 0} phản hồi</strong>
            </div>
            <MessageCircle size={20} />
          </div>

          {!isLoading && !engagement.comments?.length ? (
            <div className="blog-comment-empty">
              <MessageCircle size={28} />
              <strong>Hãy mở đầu cuộc thảo luận</strong>
              <p>Đặt một câu hỏi hoặc chia sẻ bước giải mà bạn thấy quan trọng nhất.</p>
            </div>
          ) : (
            <div className="blog-comment-list">
              {(engagement.comments || []).map((item) => (
                <article className="blog-comment-item" key={item.commentId}>
                  <span className="comment-avatar">{getInitials(item.authorName)}</span>
                  <div>
                    <header>
                      <strong>{item.authorName}</strong>
                      <time dateTime={item.createdAt}>{formatCommentDate(item.createdAt)}</time>
                    </header>
                    <p>{item.content}</p>
                    <button
                      type="button"
                      className={item.viewerLiked ? 'is-liked' : ''}
                      disabled={Boolean(pendingAction) || isLoading} onClick={() => handleCommentLike(item.commentId)}
                    >
                      <ThumbsUp size={15} />
                      Hữu ích
                      {item.likes > 0 && <span>{item.likes}</span>}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
