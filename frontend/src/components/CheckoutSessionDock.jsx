import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Clock3, CreditCard, Maximize2, X } from 'lucide-react';
import { useCheckoutSessions } from '../contexts/CheckoutSessionContext';
import { useAuth } from '../contexts/AuthContext';
import useCourseCatalog from '../hooks/useCourseCatalog';
import { commerceRequest, money, paymentClock, paymentSecondsLeft } from '../services/courseCommerceService';
import { notifyCourseAccessChanged } from '../services/courseAccessService';
import CourseEnrollmentModal from './modals/CourseEnrollmentModal';
import '../assets/styles/CheckoutSessionDock.css';

export default function CheckoutSessionDock() {
  const { currentUser } = useAuth();
  const { views, now, checkoutVisible, clearOrder } = useCheckoutSessions();
  const { courses } = useCourseCatalog();
  const [openCourseId, setOpenCourseId] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const handledLink = useRef('');
  const selected = [...views].filter(view => view.order).sort((a, b) => Number(b.order.orderCode) - Number(a.order.orderCode))[0];
  const openCourse = courses.find(course => course.id === openCourseId);
  useEffect(() => {
    const timer = window.setTimeout(() => { setOpenCourseId(''); setError(''); }, 0);
    return () => window.clearTimeout(timer);
  }, [currentUser?.id]);
  useEffect(() => {
    const code = new URLSearchParams(location.search).get('checkout');
    const view = views.find(item => String(item.order?.orderCode) === code);
    if (!view || handledLink.current === `${currentUser?.id}:${location.key}`) return;
    handledLink.current = `${currentUser?.id}:${location.key}`;
    const timer = window.setTimeout(() => setOpenCourseId(view.courseId), 0);
    return () => window.clearTimeout(timer);
  }, [location.key, location.search, views, currentUser?.id]);
  const handleDismiss = async () => {
    try { await commerceRequest(`/checkout/${selected.courseId}/dismiss`, {}); clearOrder(selected.courseId); setError(''); }
    catch (failure) { setError(failure.message); }
  };
  const order = selected?.order;
  const seconds = order ? paymentSecondsLeft(order, now) : null;
  const terminal = order && ['PAID', 'CANCELLED', 'FAILED'].includes(order.status);
  return <>
    {selected && !checkoutVisible && !openCourseId && <aside className={`checkout-session-dock ${seconds !== null && seconds <= 120 && !terminal ? 'is-urgent' : ''}`} aria-label="Phiên thanh toán">
      <button className="checkout-session-dock__open" onClick={() => setOpenCourseId(selected.courseId)}>
        {order.status === 'PAID' ? <CheckCircle2 size={21} /> : <CreditCard size={21} />}
        <span><small>{order.status === 'PAID' ? 'Đã thanh toán' : terminal ? 'Phiên đã đóng' : 'Phiên thanh toán'}</small><strong>{money(order.amount)}{!terminal && <><i /> <Clock3 size={13} /><time>{paymentClock(seconds)}</time></>}</strong></span><Maximize2 size={16} />
      </button>
      {terminal && <button className="checkout-session-dock__close" aria-label="Đóng phiên đã kết thúc" onClick={handleDismiss}><X size={17} /></button>}
      {error && <p role="alert">{error}</p>}
    </aside>}
    <CourseEnrollmentModal isOpen={Boolean(openCourse)} course={openCourse} onClose={() => setOpenCourseId('')} onEnrollSuccess={courseId => notifyCourseAccessChanged(courseId)} />
  </>;
}
