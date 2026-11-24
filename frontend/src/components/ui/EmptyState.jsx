import {
  FileQuestion,
  SearchX,
  BookmarkCheck,
  MessageSquareOff,
  HelpCircle,
  PlusCircle,
  RotateCcw,
  Compass,
  ArrowRight
} from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * EmptyState component with refined academic aesthetic
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
      title: 'Chưa có câu hỏi nào trong mục này',
      desc: 'Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ bài toán để cộng đồng cùng giải đáp!',
      action: 'Đặt câu hỏi ngay',
      actionIcon: PlusCircle
    },
    'no-results': {
      icon: SearchX,
      title: 'Không tìm thấy bài toán phù hợp',
      desc: 'Hãy thử tìm bằng từ khóa khái quát hơn (ví dụ: Lagrange, Định thức, Leontief, Vi phân...) hoặc xóa bộ lọc.',
      action: 'Xóa bộ lọc tìm kiếm',
      actionIcon: RotateCcw
    },
    'no-saved': {
      icon: BookmarkCheck,
      title: 'Bạn chưa lưu bài toán nào',
      desc: 'Bấm vào biểu tượng Lưu (Bookmark) ở bất kỳ câu hỏi nào để lưu lại và ôn tập bất cứ lúc nào.',
      action: 'Khám phá bài toán hay',
      actionIcon: Compass
    },
    'no-answers': {
      icon: MessageSquareOff,
      title: 'Chưa có lời giải nào cho bài toán này',
      desc: 'Bạn biết phương pháp giải bài này? Hãy là người đầu tiên gửi lời giải chuẩn xác để nhận ngay +15 điểm First Solver!',
      action: 'Gửi lời giải ngay',
      actionIcon: ArrowRight
    },
    'no-activity': {
      icon: HelpCircle,
      title: 'Chưa có hoạt động gần đây',
      desc: 'Hãy tham gia giải toán, thảo luận và đánh giá bài viết để tích lũy thành tích tại α∫M4A.',
      action: 'Khám phá diễn đàn',
      actionIcon: Compass
    }
  };

  const current = defaults[variant] || defaults['no-posts'];
  const IconComponent = current.icon;
  const ActionIcon = current.actionIcon || PlusCircle;

  return (
    <div className="se-empty-state-container" role="status">
      <div className="se-empty-icon-box">
        <IconComponent size={32} className="se-empty-icon-svg" />
      </div>

      <h3 className="se-empty-state-title">
        {title || current.title}
      </h3>

      <p className="se-empty-state-desc">
        {description || current.desc}
      </p>

      <div className="se-empty-state-actions">
        {onAction && (
          <button
            type="button"
            className="se-empty-action-btn"
            onClick={onAction}
          >
            <ActionIcon size={15} />
            <span>{actionLabel || current.action}</span>
          </button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <button
            type="button"
            className="se-empty-secondary-btn"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
