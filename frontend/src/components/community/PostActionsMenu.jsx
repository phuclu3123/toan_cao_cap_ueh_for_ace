import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Trash2, Share2, Bookmark, EyeOff, Flag } from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * 3-dot Actions Menu component for Posts, Answers, and Comments.
 * Zero emojis, 100% Lucide SVG with robust dropdown positioning.
 */
export default function PostActionsMenu({
  isAuthor = false,
  isSaved = false,
  onEdit,
  onDelete,
  onShare,
  onToggleSave,
  onHide,
  onReport
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="post-actions-menu-container" ref={menuRef}>
      <button
        type="button"
        className="action-icon-btn action-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở menu tùy chọn"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="post-actions-dropdown glass-panel" role="menu">
          {isAuthor && onEdit && (
            <button
              type="button"
              className="post-dropdown-item"
              role="menuitem"
              onClick={() => { setIsOpen(false); onEdit(); }}
            >
              <Edit3 size={14} className="dropdown-item-icon" />
              <span>Chỉnh sửa nội dung</span>
            </button>
          )}

          {isAuthor && onDelete && (
            <button
              type="button"
              className="post-dropdown-item item-danger"
              role="menuitem"
              onClick={() => { setIsOpen(false); onDelete(); }}
            >
              <Trash2 size={14} className="dropdown-item-icon" />
              <span>Xóa bài viết</span>
            </button>
          )}

          {onShare && (
            <button
              type="button"
              className="post-dropdown-item"
              role="menuitem"
              onClick={() => { setIsOpen(false); onShare(); }}
            >
              <Share2 size={14} className="dropdown-item-icon" />
              <span>Sao chép liên kết</span>
            </button>
          )}

          {onToggleSave && (
            <button
              type="button"
              className="post-dropdown-item"
              role="menuitem"
              onClick={() => { setIsOpen(false); onToggleSave(); }}
            >
              <Bookmark size={14} className="dropdown-item-icon" />
              <span>{isSaved ? 'Bỏ lưu bài toán' : 'Lưu bài toán'}</span>
            </button>
          )}

          {onHide && (
            <button
              type="button"
              className="post-dropdown-item"
              role="menuitem"
              onClick={() => { setIsOpen(false); onHide(); }}
            >
              <EyeOff size={14} className="dropdown-item-icon" />
              <span>Ẩn khỏi giao diện của tôi</span>
            </button>
          )}

          {onReport && (
            <button
              type="button"
              className="post-dropdown-item item-warning"
              role="menuitem"
              onClick={() => { setIsOpen(false); onReport(); }}
            >
              <Flag size={14} className="dropdown-item-icon" />
              <span>Báo cáo nội dung</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
