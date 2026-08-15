import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'ueh_tcc_notifications';

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'accepted_solution', // 'accepted_solution' | 'upvote' | 'answer' | 'comment'
    title: 'Lời giải của bạn đã được chấp nhận! 🎉',
    message: 'Lữ Võ Hoàng Phúc đã chọn lời giải của bạn cho bài toán "Cực trị có điều kiện hàm Cobb-Douglas" làm Lời giải chuẩn xác (+25 điểm).',
    link: '/community/post-1#ans-1-1',
    postId: 'post-1',
    targetId: 'ans-1-1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor: {
      name: 'Lữ Võ Hoàng Phúc',
      avatar: '/images/tccvang.jpg'
    }
  },
  {
    id: 'notif-2',
    type: 'upvote',
    title: 'Nhận được lượt bình chọn mới ❤️',
    message: 'Trần Minh Hoàng và 2 người khác đã thích bài viết của bạn (+10 điểm).',
    link: '/community/post-1',
    postId: 'post-1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    actor: {
      name: 'Trần Minh Hoàng',
      avatar: ''
    }
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    try {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.warn('Lỗi khi lưu thông báo:', err);
    }
  }, [notifications]);

  const addNotification = useCallback(({ type, title, message, link, postId, targetId, actor }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: type || 'comment',
      title: title || 'Thông báo mới',
      message: message || '',
      link: link || '/community',
      postId,
      targetId,
      isRead: false,
      createdAt: new Date().toISOString(),
      actor: actor || { name: 'Thành viên UEH', avatar: '' }
    };

    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    safeLocalStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
