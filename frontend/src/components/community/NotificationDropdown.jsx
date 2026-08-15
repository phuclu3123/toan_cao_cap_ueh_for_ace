import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, MessageSquare, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import '../../assets/styles/community.css';

/**
 * Format relative date time for notifications
 */
function formatNotifTime(dateString) {
  if (!dateString) return 'Gần đây';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin}m trước`;
  if (diffHour < 24) return `${diffHour}h trước`;
  return `${diffDay}d trước`;
}

/**
 * NotificationDropdown component with real-time updates and deep link scrolling.
 */
export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);

    if (notif.link) {
      navigate(notif.link);
      // If link contains hash (#ans-...), smooth scroll after navigation
      if (notif.link.includes('#')) {
        const hash = notif.link.split('#')[1];
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-target-pulse');
            setTimeout(() => el.classList.remove('highlight-target-pulse'), 3000);
          }
        }, 300);
      }
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'accepted_solution':
        return <CheckCircle2 size={16} className="notif-type-icon icon-accepted" />;
      case 'upvote':
        return <Heart size={16} className="notif-type-icon icon-heart" />;
      case 'answer':
      case 'comment':
      default:
        return <MessageSquare size={16} className="notif-type-icon icon-comment" />;
    }
  };

  return (
    <div className="notif-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className="notif-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Xem thông báo"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge-pill animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown-popover glass-panel animate-scale-up" role="region" aria-label="Trung tâm thông báo">
          <div className="notif-popover-header">
            <div className="notif-title-row">
              <h3>Thông Báo</h3>
              {unreadCount > 0 && (
                <span className="notif-unread-tag">{unreadCount} mới</span>
              )}
            </div>

            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notif-text-btn"
                  onClick={markAllAsRead}
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck size={14} />
                  <span>Đã đọc tất cả</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="notif-text-btn btn-clear-all"
                  onClick={clearAllNotifications}
                  title="Xóa toàn bộ thông báo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="notif-popover-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <Sparkles size={32} className="notif-empty-icon" />
                <p>Bạn không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item-card ${!n.isRead ? 'unread' : 'read'}`}
                  onClick={() => handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-icon-box">
                    {getNotifIcon(n.type)}
                  </div>

                  <div className="notif-item-content">
                    <h4 className="notif-item-title">{n.title}</h4>
                    <p className="notif-item-message">{n.message}</p>
                    <span className="notif-item-time">{formatNotifTime(n.createdAt)}</span>
                  </div>

                  {!n.isRead && <span className="notif-unread-dot" aria-label="Chưa đọc" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
