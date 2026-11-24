import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { commerceRequest, stampPayment, paymentSecondsLeft } from '../services/courseCommerceService';
import { apiFetch, readApiJson } from '../utils/apiClient';
import { notifyCourseAccessChanged } from '../services/courseAccessService';

const CheckoutSessionContext = createContext(null);
const waiting = order => ['CREATING', 'PENDING'].includes(order?.status);

export function CheckoutSessionProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '';
  const { addNotification } = useNotifications();
  const [snapshot, setSnapshot] = useState({ ownerId: '', views: [] });
  const [visibleDialogs, setVisibleDialogs] = useState([]);
  const [now, setNow] = useState(Date.now);
  const epochRef = useRef(0);
  const emittedRef = useRef(new Set());
  const runningRef = useRef(false);
  const ownerRef = useRef(userId);
  useLayoutEffect(() => { ownerRef.current = userId; }, [userId]);
  const views = useMemo(() => snapshot.ownerId === userId ? snapshot.views : [], [snapshot, userId]);
  const hasWaiting = views.some(view => waiting(view.order));

  const refreshSessions = useCallback(async () => {
    if (!userId || runningRef.current === userId) return;
    runningRef.current = userId;
    const epoch = epochRef.current;
    try {
      const result = await commerceRequest('/checkout-sessions');
      const next = Array.isArray(result.data) ? result.data.map(view => ({ ...view, order: view.order ? stampPayment(view.order) : null })) : [];
      if (ownerRef.current === userId && epoch === epochRef.current) {
        setNow(Date.now()); setSnapshot({ ownerId: userId, views: next });
      }
    } catch { /* A temporary outage never invents a terminal payment state. */ }
    finally { if (runningRef.current === userId) runningRef.current = false; }
  }, [userId]);

  const trackOrder = useCallback(order => {
    if (!userId || ownerRef.current !== userId || !order?.orderCode || !order.courseId) return;
    epochRef.current += 1;
    setNow(Date.now());
    const stamped = stampPayment(order);
    setSnapshot(previous => {
      const own = previous.ownerId === userId ? previous.views : [];
      const existing = own.find(view => view.courseId === order.courseId);
      return { ownerId: userId, views: [...own.filter(view => view.courseId !== order.courseId), { ...existing, courseId: order.courseId, phase: 'PAYMENT', order: stamped }] };
    });
  }, [userId]);
  const clearOrder = useCallback(courseId => {
    if (ownerRef.current !== userId) return;
    epochRef.current += 1;
    setSnapshot(previous => ({ ownerId: userId, views: (previous.ownerId === userId ? previous.views : []).filter(view => view.courseId !== courseId) }));
  }, [userId]);
  const setCheckoutVisible = useCallback((token, visible) => setVisibleDialogs(previous => visible ? previous.includes(token) ? previous : [...previous, token] : previous.filter(item => item !== token)), []);

  useEffect(() => {
    epochRef.current += 1;
    const timer = window.setTimeout(refreshSessions, 0);
    const handleVisible = () => { if (document.visibilityState === 'visible') refreshSessions(); };
    window.addEventListener('focus', handleVisible); document.addEventListener('visibilitychange', handleVisible);
    const interval = window.setInterval(handleVisible, 30_000);
    return () => { epochRef.current += 1; window.clearTimeout(timer); window.clearInterval(interval); window.removeEventListener('focus', handleVisible); document.removeEventListener('visibilitychange', handleVisible); };
  }, [refreshSessions]);
  useEffect(() => {
    if (!hasWaiting) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [hasWaiting]);

  useEffect(() => {
    if (!userId || !hasWaiting || visibleDialogs.length) return;
    let active = true; let running = false;
    const poll = async () => {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        for (const view of views.filter(item => waiting(item.order))) {
          const epoch = epochRef.current;
          try {
            const result = await readApiJson(await apiFetch(`/api/orders/${view.order.orderCode}`, { signal: AbortSignal.timeout(15_000) }));
            if (active && epoch === epochRef.current) {
              trackOrder(result.data);
              if (result.data?.entitlement?.allowed) notifyCourseAccessChanged(view.courseId);
            }
          } catch { /* Keep the session and its actual deadline for retry. */ }
        }
      } finally { running = false; }
    };
    const timer = window.setInterval(poll, 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [userId, hasWaiting, views, trackOrder, visibleDialogs.length]);

  useEffect(() => {
    if (!userId) return;
    for (const view of views) {
      const order = view.order;
      if (!order) continue;
      const seconds = paymentSecondsLeft(order, now);
      let event = ''; let title = ''; let message = '';
      if (order.status === 'PAID') { event = 'paid'; title = 'Thanh toán đã được xác nhận'; message = `Đơn #${order.orderCode} đã được xác nhận thanh toán. Mở giao dịch để xem quyền học.`; }
      else if (['CANCELLED', 'FAILED'].includes(order.status)) { event = 'closed'; title = order.status === 'FAILED' ? 'Thanh toán chưa thành công' : 'Phiên thanh toán đã đóng'; message = `Đơn #${order.orderCode} đã ${order.status === 'FAILED' ? 'không thành công' : 'hủy hoặc hết hạn'}. Bạn có thể đăng ký lại nếu còn nhu cầu.`; }
      else if (waiting(order) && seconds !== null && seconds > 0 && seconds <= 120) { event = 'expiring'; title = 'Phiên thanh toán sắp hết hạn'; message = `Đơn #${order.orderCode} còn dưới 2 phút. Mở lại QR để kiểm tra và tiếp tục thanh toán.`; }
      const key = `${userId}:${order.orderCode}:${event}`;
      if (!event || emittedRef.current.has(key)) continue;
      emittedRef.current.add(key);
      addNotification({ uniqueId: `payment:${key}`, recipientId: userId, type: `payment_${event}`, title, message, link: `/course/${view.courseId}?checkout=${order.orderCode}`, actor: { name: 'UEH TCC · Thanh toán' } });
    }
  }, [views, now, userId, addNotification]);

  return <CheckoutSessionContext.Provider value={{ views, now, trackOrder, clearOrder, refreshSessions, setCheckoutVisible, checkoutVisible: visibleDialogs.length > 0 }}>{children}</CheckoutSessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCheckoutSessions() {
  const context = useContext(CheckoutSessionContext);
  if (!context) throw new Error('CheckoutSessionProvider is required');
  return context;
}
