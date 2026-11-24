import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';
import { apiFetch, readApiJson } from '../utils/apiClient';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);
const storageKey = owner => `ueh_tcc_notifications_v3:${owner}`;
const empty = ownerId => ({ ownerId, local: [], remote: [], unread: 0, asOf: null, error: '', busy: false });
const readLocal = owner => {
  try {
    const entries = JSON.parse(safeLocalStorage.getItem(storageKey(owner)) || '[]');
    return Array.isArray(entries) ? entries.filter(item => item.recipientId === owner).slice(0, 200) : [];
  } catch { return []; }
};

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const ownerId = currentUser?.id || currentUser?.uid || '';
  const [store, setStore] = useState(() => empty(''));
  const refreshRef = useRef(async () => {});

  useEffect(() => {
    let active = true;
    let sequence = 0;
    const requests = new Set();
    // Reset account-scoped state before asynchronous reads; never inherit another inbox.
    setStore({ ...empty(ownerId), local: ownerId ? readLocal(ownerId) : [] });
    const refresh = async () => {
      if (!ownerId || !active) return;
      const current = ++sequence;
      const controller = new AbortController();
      requests.add(controller);
      try {
        const response = await apiFetch('/api/notifications', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        const data = await readApiJson(response);
        if (active && current === sequence) setStore(previous => previous.ownerId !== ownerId ? previous : {
          ...previous, remote: data.notifications.map(item => ({ ...item, source: 'server' })), unread: data.unreadCount, asOf: data.asOf, error: ''
        });
      } catch (error) {
        if (active && current === sequence && !controller.signal.aborted) setStore(previous => previous.ownerId !== ownerId ? previous : { ...previous, error: error.message });
      } finally { requests.delete(controller); }
    };
    refreshRef.current = refresh;
    const handleVisible = () => { if (!document.hidden) refresh(); };
    refresh();
    const timer = ownerId ? window.setInterval(handleVisible, 15000) : null;
    window.addEventListener('focus', handleVisible);
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      for (const request of requests) request.abort();
      window.removeEventListener('focus', handleVisible);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [ownerId]);

  useEffect(() => {
    if (ownerId && store.ownerId === ownerId) safeLocalStorage.setItem(storageKey(ownerId), JSON.stringify(store.local));
  }, [ownerId, store.ownerId, store.local]);

  const addNotification = useCallback(payload => {
    if (!ownerId || (payload.recipientId && payload.recipientId !== ownerId)) return;
    const notification = { ...payload, id: payload.uniqueId || `local-${crypto.randomUUID()}`, recipientId: ownerId,
      type: payload.type || 'comment', title: payload.title || 'UEH TCC', message: payload.message || '', link: payload.link || '/community',
      actor: payload.actor || { name: 'UEH TCC', avatar: '' }, isRead: false, createdAt: new Date().toISOString(), source: 'local' };
    setStore(previous => {
      const base = previous.ownerId === ownerId ? previous : empty(ownerId);
      return base.local.some(item => item.id === notification.id) ? base : { ...base, local: [notification, ...base.local].slice(0, 200) };
    });
  }, [ownerId]);

  const perform = useCallback(async (path, body, update) => {
    if (!ownerId) return false;
    setStore(previous => previous.ownerId === ownerId ? { ...previous, busy: true, error: '' } : previous);
    try {
      if (path) await readApiJson(await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, accountId: ownerId }) }));
      setStore(previous => previous.ownerId === ownerId ? update(previous) : previous);
      if (path) await refreshRef.current();
      return true;
    } catch (error) {
      setStore(previous => previous.ownerId === ownerId ? { ...previous, error: error.message } : previous);
      return false;
    } finally { setStore(previous => previous.ownerId === ownerId ? { ...previous, busy: false } : previous); }
  }, [ownerId]);

  const markAsRead = useCallback(id => {
    if (store.ownerId !== ownerId || store.busy) return;
    const remote = store.remote.some(item => item.id === id);
    return perform(remote ? `/api/notifications/${encodeURIComponent(id)}/read` : null, {}, previous => ({ ...previous,
      local: previous.local.map(item => item.id === id ? { ...item, isRead: true } : item),
      remote: previous.remote.map(item => item.id === id ? { ...item, isRead: true } : item)
    }));
  }, [store, ownerId, perform]);
  const markAllAsRead = useCallback(() => {
    if (store.ownerId !== ownerId || store.busy) return;
    const before = store.asOf || new Date().toISOString();
    return perform(store.asOf ? '/api/notifications/read-all' : null, { before }, previous => ({ ...previous,
      local: previous.local.map(item => new Date(item.createdAt) <= new Date(before) ? { ...item, isRead: true } : item),
      remote: previous.remote.map(item => new Date(item.createdAt) <= new Date(before) ? { ...item, isRead: true } : item)
    }));
  }, [store, ownerId, perform]);
  const clearAllNotifications = useCallback(() => {
    if (store.ownerId !== ownerId || store.busy) return;
    const before = store.asOf || new Date().toISOString();
    return perform(store.asOf ? '/api/notifications/clear' : null, { before }, previous => ({ ...previous,
      local: previous.local.filter(item => new Date(item.createdAt) > new Date(before)),
      remote: previous.remote.filter(item => new Date(item.createdAt) > new Date(before))
    }));
  }, [store, ownerId, perform]);

  const visible = store.ownerId === ownerId && ownerId ? store : empty(ownerId);
  const notifications = [...visible.remote, ...visible.local].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return <NotificationContext.Provider value={{ notifications, unreadCount: visible.unread + visible.local.filter(item => !item.isRead).length,
    addNotification, markAsRead, markAllAsRead, clearAllNotifications, notificationError: visible.error, notificationBusy: visible.busy,
    refreshNotifications: () => refreshRef.current() }}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
export default NotificationContext;
