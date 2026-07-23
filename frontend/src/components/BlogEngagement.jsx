import { useEffect, useState } from 'react';
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
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const nextId =
    window.crypto?.randomUUID?.() ||
    `reader-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(storageKey, nextId);
  return nextId;
};

const getReaderName = () => {
  try {
    const user = JSON.parse(window.localStorage.getItem('ueh_tcc_user') || 'null');
    return (
      user?.name ||
      user?.displayName ||
      window.localStorage.getItem('ueh_tcc_blog_reader_name') ||
      ''
    );
  } catch {
    return window.localStorage.getItem('ueh_tcc_blog_reader_name') || '';
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
  window.localStorage.setItem(cacheKey, JSON.stringify(engagement));
};

const createOptimisticComment = (authorName, content) => ({
  commentId: `local-${window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10)}`,
  authorName,
  content,
  createdAt: new Date().toISOString(),
  likes: 0,
  viewerLiked: false,
});

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
          const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null');
          if (cached) setEngagement(cached);
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

  const updateLocalEngagement = (updater) => {
    setEngagement((current) => {
      const next = updater(current);
      persistEngagement(cacheKey, next);
      return next;
    });
  };

  const handleReaction = async (reaction) => {
    const previousReaction = engagement.viewerReaction;
    updateLocalEngagement((current) => {
      const reactions = { ...emptyEngagement.reactions, ...current.reactions };
      if (current.viewerReaction) {
        reactions[current.viewerReaction] = Math.max(
          0,
          Number(reactions[current.viewerReaction] || 0) - 1,
        );
      }
      const viewerReaction = current.viewerReaction === reaction ? null : reaction;
      if (viewerReaction) {
        reactions[viewerReaction] = Number(reactions[viewerReaction] || 0) + 1;
      }
      return { ...current, reactions, viewerReaction };
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, reaction }),
        },
      );
      if (!response.ok) throw new Error('Reaction request failed');
      const data = await response.json();
      setEngagement(data.engagement);
      persistEngagement(cacheKey, data.engagement);
      setIsOfflineFallback(false);
    } catch {
      setIsOfflineFallback(true);
      if (previousReaction !== reaction) {
        setNotice('Cảm xúc đã được lưu trên thiết bị và sẽ đồng bộ khi kết nối ổn định.');
      }
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const cleanName = authorName.replace(/\s+/g, ' ').trim();
    const cleanComment = comment.trim();

    if (cleanName.length < 2 || cleanComment.length < 3) {
      setNotice('Vui lòng nhập tên và một bình luận rõ ràng.');
      return;
    }

    setIsSubmitting(true);
    setNotice('');
    window.localStorage.setItem('ueh_tcc_blog_reader_name', cleanName);

    const optimisticComment = createOptimisticComment(cleanName, cleanComment);

    updateLocalEngagement((current) => ({
      ...current,
      comments: [optimisticComment, ...(current.comments || [])],
    }));
    setComment('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            authorName: cleanName,
            content: cleanComment,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Comment request failed');
      setEngagement(data.engagement);
      persistEngagement(cacheKey, data.engagement);
      setNotice('Bình luận của bạn đã được đăng.');
      setIsOfflineFallback(false);
    } catch {
      setNotice('Bình luận đang được lưu trên thiết bị; hệ thống sẽ hiển thị bản cục bộ này.');
      setIsOfflineFallback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    updateLocalEngagement((current) => ({
      ...current,
      comments: current.comments.map((item) =>
        item.commentId === commentId
          ? {
              ...item,
              viewerLiked: !item.viewerLiked,
              likes: Math.max(0, Number(item.likes || 0) + (item.viewerLiked ? -1 : 1)),
            }
          : item,
      ),
    }));

    if (commentId.startsWith('local-')) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/comments/${encodeURIComponent(commentId)}/like`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        },
      );
      if (!response.ok) throw new Error('Like request failed');
      const data = await response.json();
      setEngagement(data.engagement);
      persistEngagement(cacheKey, data.engagement);
      setIsOfflineFallback(false);
    } catch {
      setIsOfflineFallback(true);
    }
  };

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
              onClick={() => handleReaction(id)}
              disabled={isLoading}
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
            onChange={(event) => setComment(event.target.value)}
            placeholder={`Bạn muốn trao đổi điều gì về “${title}”?`}
          />

          <div className="blog-comment-form-footer">
            <p>Bình luận được hiển thị công khai. Vui lòng trao đổi lịch sự và đúng chủ đề.</p>
            <button type="submit" disabled={isSubmitting}>
              <Send size={17} />
              {isSubmitting ? 'Đang đăng…' : 'Đăng bình luận'}
            </button>
          </div>
          {notice && <div className="blog-comment-notice" role="status">{notice}</div>}
          {isOfflineFallback && (
            <div className="blog-community-status">
              Kết nối cộng đồng đang ở chế độ dự phòng trên thiết bị.
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
                      onClick={() => handleCommentLike(item.commentId)}
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
