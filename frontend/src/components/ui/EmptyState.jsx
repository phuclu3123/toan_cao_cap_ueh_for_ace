import {
  FileQuestion,
  SearchX,
  BookmarkCheck,
  MessageSquareOff,
  HelpCircle,
  PlusCircle,
  RotateCcw,
  Send,
  Compass
} from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * EmptyState component for clean and contextual feedback (Zero emojis, 100% SVG icons).
 * Variants: 'no-posts', 'no-results', 'no-saved', 'no-answers', 'no-activity'
 */
export default function EmptyState({
  variant = 'no-posts',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) {
  const defaults = {
    'no-posts': {
      icon: FileQuestion,
      title: 'Chưa có bài toán nào trong chuyên mục này',
      desc: 'Hãy là người tiên phong đăng bài toán hoặc câu hỏi đầu tiên để nhận ngay +5 điểm cống hiến!',
      action: 'Đặt câu hỏi đầu tiên',
      actionIcon: PlusCircle
    },
    'no-results': {
      icon: SearchX,
      title: 'Không tìm thấy kết quả phù hợp',
      desc: 'Thử tìm với từ khóa tổng quát hơn hoặc xóa bớt các bộ lọc đang chọn.',
      action: 'Xóa tất cả bộ lọc',
      actionIcon: RotateCcw
    },
    'no-saved': {
      icon: BookmarkCheck,
      title: 'Bạn chưa lưu bài toán nào',
      desc: 'Nhấn vào biểu tượng Bookmark trên các bài toán hay để lưu lại và ôn tập bất cứ lúc nào.',
      action: 'Khám phá bài toán hay',
      actionIcon: Compass
    },
    'no-answers': {
      icon: MessageSquareOff,
      title: 'Chưa có lời giải nào cho bài toán này',
      desc: 'Bạn biết cách giải bài này? Hãy viết lời giải chi tiết đầu tiên để nhận ngay +15 điểm First Solver!',
      action: 'Gửi lời giải ngay',
      actionIcon: Send
    },
    'no-activity': {
      icon: HelpCircle,
      title: 'Chưa có hoạt động gần đây',
      desc: 'Hãy tham gia giải toán, thảo luận và upvote bài viết để tích lũy thành tích tại UEH TCC.',
      action: 'Khám phá diễn đàn',
      actionIcon: Compass
    }
  };

  const current = defaults[variant] || defaults['no-posts'];
  const IconComponent = current.icon;
  const ActionIcon = current.actionIcon || PlusCircle;

  return (
    <div className="empty-state-card glass-panel animate-fade-in" role="status">
      <div className="empty-state-icon-wrap">
        <IconComponent size={38} className="empty-state-icon" />
      </div>

      <h3 className="empty-state-title">
        {title || current.title}
      </h3>

      <p className="empty-state-desc">
        {description || current.desc}
      </p>

      <div className="empty-state-actions">
        {onAction && (
          <button
            type="button"
            className="btn btn-primary empty-state-btn"
            onClick={onAction}
          >
            <ActionIcon size={15} />
            <span>{actionLabel || current.action}</span>
          </button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <button
            type="button"
            className="btn btn-secondary empty-state-btn"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
