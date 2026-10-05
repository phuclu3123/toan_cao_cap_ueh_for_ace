import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'ueh_tcc_notifications_v2';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
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
