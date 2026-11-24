import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Tag,
  UserRound,
  X
} from 'lucide-react';
import { apiFetch, readApiJson } from '../../utils/apiClient';
import { commerceRequest, checkoutQuote, stampPayment, paymentSecondsLeft, paymentClock } from '../../services/courseCommerceService';
import { useCheckoutSessions } from '../../contexts/CheckoutSessionContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/CourseCheckout.css';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  }

  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const parseNumericPrice = (price) => {
  const parsed = Number.parseInt(String(price || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPrice = (amount) => `${amount.toLocaleString('vi-VN')}đ`;

const getQrImageUrl = (qrCode) => {
  if (!qrCode) return '';
  if (/^data:image\/(?:png|jpe?g|webp);base64,/i.test(qrCode)) return qrCode;
  try {
    const url = new URL(qrCode);
    if (url.protocol === 'https:' && (url.hostname === 'payos.vn' || url.hostname.endsWith('.payos.vn'))) {
      return url.toString();
    }
  } catch {
    // Raw VietQR payloads are intentionally not sent to a third-party QR service.
  }
  return '';
};

export default function CourseEnrollmentModal({
  isOpen,
  onClose,
  course,
  onEnrollSuccess
}) {
  const { currentUser } = useAuth();
  if (!isOpen || !course || !currentUser) return null;

  return (
    <CourseEnrollmentModalContent
      key={`${currentUser.id}:${course.id}`}
      onClose={onClose}
      course={course}
      onEnrollSuccess={onEnrollSuccess}
    />
  );
}

function CourseEnrollmentModalContent({ onClose, course, onEnrollSuccess }) {
  const { currentUser, syncUserFromBackend } = useAuth();
  const { now, trackOrder, clearOrder, setCheckoutVisible } = useCheckoutSessions();
  const dialogToken = useId();
  const [learnerName, setLearnerName] = useState(currentUser.name || '');
  const [learnerEmail] = useState(currentUser.email || currentUser.username || '');
  const [learnerPhone, setLearnerPhone] = useState(currentUser.phoneNumber || '');
  const [step, setStep] = useState('details');
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('IDLE');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [generatedQr, setGeneratedQr] = useState({ payload: '', imageUrl: '' });
  const [pollDelayMs, setPollDelayMs] = useState(3000);
  const [terms, setTerms] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [promotionInput, setPromotionInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [frozen, setFrozen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const [promotionError, setPromotionError] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const checkoutAttemptRef = useRef(null);
  const quoteRequestRef = useRef(0);

  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const headingRef = useRef(null);
  const closeButtonRef = useRef(null);
  const completionRef = useRef(false);
  const idempotencyKeyRef = useRef(createIdempotencyKey());
  const statusRequestRef = useRef(false);
  const submittingRef = useRef(false);
  const statusGenerationRef = useRef(0);
  const callbacksRef = useRef({ onClose, onEnrollSuccess });
  const nextStatusCheckRef = useRef(0);
  useEffect(() => { callbacksRef.current = { onClose, onEnrollSuccess }; }, [onClose, onEnrollSuccess]);

  const isFree = course.isFree;
  const listedPrice = parseNumericPrice(course.discountPrice || course.originalPrice);
  const serverAmount = Number(order?.amount);
  const displayPrice = formatPrice(
    Number.isSafeInteger(serverAmount) && serverAmount >= 0 ? serverAmount : quote?.amount ?? listedPrice
  );
  const trustedQrImageUrl = getQrImageUrl(order?.qrCode);
  const generatedQrImageUrl = generatedQr.payload === order?.qrCode
    ? generatedQr.imageUrl
    : '';
  const qrImageUrl = trustedQrImageUrl || generatedQrImageUrl;
  const orderCode = order?.orderCode;
  const confirmed = Boolean(terms && quote && agreed && confirmation.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleUpperCase('vi-VN') === terms.confirmation);
  const hasUnappliedCode = promotionInput.trim().toUpperCase() !== appliedCode;
  const secondsLeft = order ? paymentSecondsLeft(order, now) : null;
  const deadlinePassed = secondsLeft === 0;
  useEffect(() => { setCheckoutVisible(dialogToken, true); return () => setCheckoutVisible(dialogToken, false); }, [dialogToken, setCheckoutVisible]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { scrollRef.current?.scrollTo({ top: 0 }); if (step === 'payment') headingRef.current?.focus({ preventScroll: true }); });
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  const loadQuote = useCallback(async (code = '', resume = false) => {
    const requestId = ++quoteRequestRef.current;
    setQuoteLoading(true); setError('');
    try {
      const [policy, saved] = await Promise.all([commerceRequest('/terms'), resume ? commerceRequest(`/checkout/${encodeURIComponent(course.id)}`) : Promise.resolve(null)]);
      if (requestId !== quoteRequestRef.current) return;
      setTerms(policy.data);
      const selectedOrder = saved?.data?.order ? stampPayment(saved.data.order) : null;
      if (resume) setPendingOrder(selectedOrder && !saved.data.resumeAutomatically ? selectedOrder : null);
      if (selectedOrder && saved.data.resumeAutomatically) {
        setOrder(selectedOrder); setStatus(selectedOrder.status); setStep('payment');
        setQuote(selectedOrder.pricingSnapshot || null); trackOrder(selectedOrder); return;
      }
      const draftCode = resume ? saved?.data?.promotionCode || '' : code;
      const pricing = await checkoutQuote(course.id, draftCode);
      if (requestId !== quoteRequestRef.current) return;
      setTerms(policy.data); setQuote(pricing.data); setAppliedCode(draftCode.trim().toUpperCase()); setPromotionInput(draftCode.trim().toUpperCase());
      setAgreed(false); setConfirmation('');
    } catch (failure) {
      if (requestId === quoteRequestRef.current) { setQuote(null); setError(failure.message || 'Chưa xác nhận được học phí. Vui lòng thử lại.'); }
    } finally { if (requestId === quoteRequestRef.current) setQuoteLoading(false); }
  }, [course.id, trackOrder]);
  useEffect(() => {
    const timer = window.setTimeout(() => loadQuote('', true), 0);
    return () => { window.clearTimeout(timer); quoteRequestRef.current += 1; };
  }, [loadQuote]);

  const closeAndReset = useCallback(() => {
    if (submittingRef.current) return;
    callbacksRef.current.onClose();
  }, []);

  useEffect(() => {
    const rawQrPayload = order?.qrCode;
    let cancelled = false;

    if (
      trustedQrImageUrl
      || typeof rawQrPayload !== 'string'
      || rawQrPayload.length < 16
      || rawQrPayload.length > 8_000
    ) {
      return undefined;
    }

    QRCode.toDataURL(rawQrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: { dark: '#0d2d25', light: '#ffffff' }
    }).then((dataUrl) => {
      if (!cancelled) setGeneratedQr({ payload: rawQrPayload, imageUrl: dataUrl });
    }).catch(() => {
      if (!cancelled) setGeneratedQr({ payload: rawQrPayload, imageUrl: '' });
    });

    return () => {
      cancelled = true;
    };
  }, [order?.qrCode, trustedQrImageUrl]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const hadEnrollmentModalClass = document.body.classList.contains('enrollment-modal-open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('enrollment-modal-open');

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReset();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!hadEnrollmentModalClass) {
        document.body.classList.remove('enrollment-modal-open');
      }
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [closeAndReset]);

  const completeEnrollment = useCallback((entitlement) => {
    if (!entitlement?.allowed || completionRef.current) return;
    completionRef.current = true;
    setStatus('PAID');
    setStep('complete');
    setError('');
    callbacksRef.current.onEnrollSuccess?.(course.id, entitlement);
  }, [course.id]);

  const verifyCourseEntitlement = useCallback(async () => {
    const response = await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/access`);
    const payload = await readApiJson(response);
    return payload.data;
  }, [course.id]);

  const loadOrderStatus = useCallback(async () => {
    if (!orderCode || completionRef.current || statusRequestRef.current || Date.now() < nextStatusCheckRef.current) return;
    nextStatusCheckRef.current = Date.now() + 3000;
    statusRequestRef.current = true;
    const generation = statusGenerationRef.current;
    setChecking(true);

    try {
      const response = await apiFetch(`/api/orders/${orderCode}`);
      const payload = await readApiJson(response);
      if (generation !== statusGenerationRef.current) return;
      const payment = stampPayment(payload.data || {});
      trackOrder(payment);
      setOrder((current) => ({ ...(current || {}), ...payment }));
      setPollDelayMs(3000);
      setError('');

      if (payment.entitlement?.allowed) {
        completeEnrollment(payment.entitlement);
        return;
      }

      if (payment.status === 'PAID') {
        const access = payment.entitlement || await verifyCourseEntitlement();
        if (access?.allowed) {
          completeEnrollment(access);
          return;
        }
        if (access?.reason === 'REVOKED') {
          setStatus('ACCESS_REVOKED');
          setError('Đơn đã thanh toán nhưng quyền học đang bị admin thu hồi. Liên hệ luphuc321@gmail.com kèm mã đơn để xử lý; không cần mua lại.');
          return;
        }
      }

      setStatus(payment.status || 'PENDING');
      if (payment.status === 'CANCELLED') {
        setError('Giao dịch đã hủy. Bạn có thể tạo một đơn PayOS mới.');
      } else if (payment.status === 'FAILED') {
        setError('PayOS chưa thể xác nhận giao dịch. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      }
    } catch (pollError) {
      if (generation !== statusGenerationRef.current) return;
      if (pollError.status === 401) {
        const verifiedUser = await syncUserFromBackend();
        if (verifiedUser) { setPollDelayMs(5000); setError('Chưa xác minh được phiên thanh toán. Hệ thống sẽ thử lại.'); return; }
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục đối soát.');
        setStatus('AUTH_REQUIRED');
      } else if (pollError.status === 403 || pollError.status === 404) {
        setError(pollError.message || 'Không thể đối soát đơn thanh toán này.');
        setStatus('POLL_ERROR');
      } else if (pollError.status === 429 || pollError.retryAfterSeconds) {
        const retryDelay = Math.min(3_600_000, Math.max(5_000, (pollError.retryAfterSeconds || 10) * 1000));
        setPollDelayMs(retryDelay);
        nextStatusCheckRef.current = Date.now() + retryDelay;
        setError(`Hệ thống sẽ kiểm tra lại giao dịch sau ${Math.ceil(retryDelay / 1000)} giây. QR vẫn dùng được trong thời hạn hiển thị.`);
      } else {
        setPollDelayMs((current) => Math.min(30_000, Math.max(5_000, current * 2)));
        setError('Kết nối đối soát đang gián đoạn. Hệ thống sẽ tự thử lại.');
      }
    } finally {
      statusRequestRef.current = false;
      setChecking(false);
    }
  }, [completeEnrollment, orderCode, verifyCourseEntitlement, trackOrder, syncUserFromBackend]);

  useEffect(() => {
    if (
      !orderCode
      || step !== 'payment'
      || completionRef.current
      || ['CANCELLED', 'FAILED', 'AUTH_REQUIRED', 'POLL_ERROR', 'ACCESS_REVOKED'].includes(status)
    ) return undefined;

    const initialCheck = window.setTimeout(loadOrderStatus, Math.max(0, nextStatusCheckRef.current - Date.now()));
    const interval = window.setInterval(loadOrderStatus, pollDelayMs);
    return () => {
      window.clearTimeout(initialCheck);
      window.clearInterval(interval);
    };
  }, [loadOrderStatus, orderCode, pollDelayMs, status, step]);

  // Applying a bad code leaves the last valid quote intact. Show the failure
  // beside the field and require applying or removing edited input before pay.
  const handleApplyPromotion = async (code = promotionInput) => {
    if (submittingRef.current || quoteLoading || frozen || pendingOrder) return;
    const requestId = ++quoteRequestRef.current;
    setQuoteLoading(true); setPromotionError(''); setCheckoutNotice('');
    try {
      const normalized = code.trim().toUpperCase();
      const result = await commerceRequest(`/checkout/${encodeURIComponent(course.id)}/draft`, { promotionCode: normalized });
      if (requestId !== quoteRequestRef.current) return;
      setQuote(result.data); setAppliedCode(normalized); setPromotionInput(normalized);
      setAgreed(false); setConfirmation(''); setError('');
    } catch (failure) {
      if (requestId === quoteRequestRef.current) setPromotionError(failure.message || 'Chưa áp dụng được mã. Vui lòng thử lại.');
    } finally { if (requestId === quoteRequestRef.current) setQuoteLoading(false); }
  };

  // An old order is a deliberate choice with its own fixed amount, never an
  // automatic jump that hides the fresh price and promotion field.
  const handleResumePending = () => {
    if (!pendingOrder || replacing) return;
    statusGenerationRef.current += 1;
    setOrder(pendingOrder); setStatus(pendingOrder.status); setError(''); setStep('payment');
    trackOrder(pendingOrder);
  };

  // Replace only after PayOS confirms the old link cannot be paid. A racing
  // completed transfer is reconciled instead of being canceled or overwritten.
  const handleReplacePending = async (oldOrder = pendingOrder || order) => {
    if (!oldOrder?.orderCode || submittingRef.current) return;
    submittingRef.current = true; setReplacing(true); setError(''); setCheckoutNotice('');
    statusGenerationRef.current += 1;
    setPendingOrder(oldOrder); setOrder(null); setStep('details');
    try {
      const result = await commerceRequest(`/orders/${oldOrder.orderCode}/cancel`, {}, AbortSignal.timeout(45_000));
      if (result.data?.status === 'PAID') throw Object.assign(new Error('Đơn vừa được thanh toán. Hệ thống đang kiểm tra quyền học.'), { code: 'ORDER_ALREADY_PAID' });
      if (!['CANCELLED', 'FAILED'].includes(result.data?.status)) throw new Error('Đơn cũ chưa được xác nhận hủy. Vui lòng kiểm tra giao dịch trước khi tạo đơn mới.');
      clearOrder(course.id);
      setPendingOrder(null); checkoutAttemptRef.current = null; setFrozen(false);
      idempotencyKeyRef.current = createIdempotencyKey();
      setStatus('IDLE'); setPromotionInput(''); setPromotionError(''); setAppliedCode('');
      setAgreed(false); setConfirmation(''); setPollDelayMs(3000);
      await loadQuote('');
      setCheckoutNotice('Đã hủy đơn cũ. Bạn có thể nhập mã giảm giá và xác nhận lại theo học phí hiện tại.');
    } catch (failure) {
      if (failure.code === 'ORDER_ALREADY_PAID') {
        try {
          const latest = await readApiJson(await apiFetch(`/api/orders/${oldOrder.orderCode}`, { signal: AbortSignal.timeout(15_000) }));
          if (latest.data?.entitlement?.allowed) { completeEnrollment(latest.data.entitlement); return; }
          setOrder(latest.data); setStatus(latest.data.status); setStep('payment');
        } catch { /* Keep the original provider error visible for manual retry. */ }
      }
      setError(failure.message || 'Chưa hủy được đơn cũ. Bạn chưa bị tạo thêm đơn mới.');
    } finally { submittingRef.current = false; setReplacing(false); }
  };

  const createOrder = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setError('');
    if (pendingOrder && !checkoutAttemptRef.current) { setError('Bạn có một đơn đang chờ. Hãy chọn tiếp tục đơn đó hoặc hủy để dùng giá/mã mới.'); return; }
    if (hasUnappliedCode && !frozen) { setPromotionError('Bấm Áp dụng để kiểm tra mã hoặc xóa mã trước khi tiếp tục.'); return; }

    if (!isFree && (!learnerName.trim() || !learnerEmail.trim() || !learnerPhone.trim())) {
      setError('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.');
      return;
    }
    if (!checkoutAttemptRef.current && (!confirmed || quoteLoading)) {
      setError('Vui lòng kiểm tra học phí, đọc điều khoản và xác nhận mua.'); return;
    }

    // Preserve the exact request after an uncertain network result. Retrying
    // must never create a second order or silently accept a different price.
    if (!checkoutAttemptRef.current) checkoutAttemptRef.current = {
      courseId: course.id, buyerName: learnerName.trim(), buyerEmail: learnerEmail.trim(), buyerPhone: learnerPhone.trim(),
      promotionCode: appliedCode,
      quote: { priceVersion: quote.priceVersion, promotionId: quote.promotionId, amount: quote.amount },
      purchaseConsent: { accepted: true, version: terms.version, confirmation, amount: quote.amount }
    };
    setFrozen(true);

    setSubmitting(true);
    submittingRef.current = true;
    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        signal: AbortSignal.timeout(25_000),
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current
        },
        body: JSON.stringify(checkoutAttemptRef.current)
      });
      const payload = await readApiJson(response);
      const payment = stampPayment(payload.data || {});
      trackOrder(payment);

      if (payment.entitlement?.allowed) {
        completeEnrollment(payment.entitlement);
        return;
      }

      if (payment.isFree || payment.status === 'PAID') {
        const access = await verifyCourseEntitlement();
        if (access?.allowed) {
          completeEnrollment(access);
          return;
        }
      }

      if (isFree) {
        throw new Error('Chưa thể kích hoạt khóa học miễn phí. Vui lòng thử lại.');
      }

      if (!payment.orderCode) {
        throw new Error('PayOS chưa trả về mã đơn hợp lệ. Vui lòng thử lại.');
      }

      setOrder(payment);
      setStatus(payment.status || 'PENDING');
      setStep('payment');
    } catch (createError) {
      if (['CHECKOUT_PRICE_CHANGED', 'PURCHASE_TERMS_CHANGED', 'PROMOTION_UNAVAILABLE', 'PROMOTION_USER_LIMIT'].includes(createError.code)) {
        checkoutAttemptRef.current = null; setFrozen(false);
        idempotencyKeyRef.current = createIdempotencyKey();
        await loadQuote('');
      } else if (createError.status >= 400 && createError.status < 500 && ![408, 429].includes(createError.status)) {
        checkoutAttemptRef.current = null; setFrozen(false);
      }
      if (createError.code === 'CHECKOUT_ACTIVE_ORDER') await loadQuote('', true);
      if (createError.status === 401) {
        const verifiedUser = await syncUserFromBackend();
        setError(verifiedUser
          ? 'Chưa xác minh được phiên thanh toán. Vui lòng thử lại; chưa tự động gửi thêm yêu cầu tạo đơn.'
          : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.');
      } else {
        setError(createError.message || (
          isFree
            ? 'Không thể kích hoạt khóa học miễn phí.'
            : 'Không thể khởi tạo thanh toán PayOS.'
        ));
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const restartCheckout = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true; setReplacing(true);
    try {
      await commerceRequest(`/checkout/${encodeURIComponent(course.id)}/dismiss`, {});
      clearOrder(course.id);
    } catch (failure) {
      setError(failure.message || 'Chưa đóng được phiên cũ. Vui lòng thử lại.');
      return;
    } finally { submittingRef.current = false; setReplacing(false); }
    statusGenerationRef.current += 1;
    setPendingOrder(null); setPromotionInput(''); setPromotionError(''); setAppliedCode('');
    checkoutAttemptRef.current = null; setFrozen(false);
    idempotencyKeyRef.current = createIdempotencyKey();
    setOrder(null);
    setStatus('IDLE');
    setError('');
    setChecking(false);
    setPollDelayMs(3000);
    setStep('details');
    loadQuote('');
  };

  const activePaidStep = step === 'complete' ? 3 : step === 'payment' ? 2 : 1;
  const courseTitle = course.title.replace(/^\d+\.\s*/, '');
  const lessonCount = course.chapters?.reduce((count, chapter) => count + (chapter.lessons?.length || 0), 0);
  const paymentStatusLabel = {
    CANCELLED: 'Giao dịch đã hủy',
    FAILED: 'Giao dịch chưa thành công',
    AUTH_REQUIRED: 'Cần đăng nhập lại',
    POLL_ERROR: 'Chưa kiểm tra được giao dịch',
    ACCESS_REVOKED: 'Đã thanh toán · cần admin hỗ trợ',
    PAID: 'Đang kích hoạt khóa học'
  }[status] || 'Đang chờ bạn thanh toán';

  return createPortal(
    <div
      className="enrollment-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAndReset();
      }}
    >
      <section
        className={`enrollment-modal ${isFree ? 'enrollment-modal--free' : 'enrollment-modal--paid'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-title"
        aria-describedby="enrollment-description"
        ref={dialogRef}
        tabIndex={-1}
      >
          <button
            type="button"
            className="enrollment-modal__close"
            onClick={closeAndReset}
            ref={closeButtonRef}
            aria-label="Đóng cửa sổ đăng ký"
            disabled={submitting || replacing}
          >
            <X size={20} />
          </button>
        <div className="enrollment-scroll" ref={scrollRef}><div className="enrollment-layout">
          <aside className="checkout-summary" aria-label="Tóm tắt khóa học">
            <div className="checkout-brand" aria-label="α∫M4A"><img className="brand-image-mark" src="/images/brand/aim4a-mark.png" alt="α∫M4A" width="52" height="52" /></div>
            <div className="checkout-summary__course">
            {!imageFailed && course.image ? (
              <img src={course.image} alt="" onError={() => setImageFailed(true)} />
            ) : (
              <span className="enrollment-modal__image-fallback">
                <BookOpen size={24} />
              </span>
            )}
              <div><span>Khóa học của bạn</span><h3>{courseTitle}</h3></div>
            </div>
            <ul className="checkout-summary__benefits">
              {Boolean(lessonCount) && <li><Check size={16} aria-hidden="true" />{lessonCount} bài giảng trong lộ trình</li>}
              <li><Check size={16} aria-hidden="true" />Mở các bài học có khóa</li>
              <li><Check size={16} aria-hidden="true" />Quyền học gắn với tài khoản</li>
            </ul>
            {(order?.pricingSnapshot || quote)?.discountAmount > 0 && <div className="checkout-price-breakdown"><span>Học phí <b>{formatPrice((order?.pricingSnapshot || quote).baseAmount)}</b></span><span>Ưu đãi <b>−{formatPrice((order?.pricingSnapshot || quote).discountAmount)}</b></span><small>{(order?.pricingSnapshot || quote).promotionLabel}</small></div>}
            <div className="checkout-summary__total"><span>Tổng thanh toán</span><strong>{quoteLoading && !order ? 'Đang xác nhận…' : displayPrice}</strong><small>{step === 'complete' ? 'Đã hoàn tất đăng ký' : 'Thanh toán một lần'}</small></div>
            <p className="checkout-summary__secure"><ShieldCheck size={16} aria-hidden="true" />{isFree ? 'Kích hoạt cùng α∫M4A' : 'Thanh toán qua PayOS'}</p>
          </aside>
          <div className="enrollment-main">
        <header className="enrollment-modal__header">
          <span className="enrollment-modal__eyebrow">{step === 'complete' ? 'Chào mừng bạn' : 'Đăng ký khóa học'}</span>
          <h2 id="enrollment-title" tabIndex={-1} ref={headingRef}>{step === 'complete' ? 'Sẵn sàng vào học.' : step === 'payment' ? 'Một bước nữa để bắt đầu.' : 'Bắt đầu hành trình học.'}</h2>
          <p id="enrollment-description">{step === 'complete' ? 'Khóa học đã được mở cho tài khoản của bạn.' : step === 'payment' ? 'Quét mã hoặc mở PayOS để thanh toán.' : 'Kiểm tra thông tin trước khi tiếp tục.'}</p>
        </header>

        {!isFree && (
          <ol className="enrollment-progress" aria-label="Tiến trình đăng ký">
            {[
              'Thông tin', 'Thanh toán', 'Vào học'
            ].map((label, index) => {
              const number = index + 1;
              const isActive = number === activePaidStep;
              const isDone = number < activePaidStep;
              return (
                <li className={`${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`} key={label} aria-current={isActive ? 'step' : undefined}>
                  <span>{isDone ? <Check size={13} /> : number}</span>
                  {label}
                </li>
              );
            })}
          </ol>
        )}

        <div className="enrollment-modal__body">
          {step === 'details' && isFree && (
            <form className="free-enrollment" onSubmit={createOrder}>
              <span className="free-enrollment__icon">
                <BookOpen size={29} />
              </span>
              <div>
                <span className="enrollment-modal__eyebrow">Quyền học cộng đồng</span>
                <h3>Mở toàn bộ khóa học miễn phí</h3>
                <p>
                  Bài học được đồng bộ với tài khoản đang đăng nhập để bạn có thể tiếp tục học trên thiết bị khác.
                </p>
              </div>

              <ul className="free-enrollment__benefits">
                <li><CheckCircle2 size={18} /> Mở học ngay, không qua bước thanh toán</li>
                <li><CheckCircle2 size={18} /> Kích hoạt một lần cho tài khoản học viên</li>
                <li><CheckCircle2 size={18} /> Quyền truy cập được kiểm tra từ máy chủ</li>
              </ul>

              {learnerEmail && (
                <div className="free-enrollment__account">
                  <UserRound size={18} />
                  <span>
                    Tài khoản nhận quyền học
                    <strong>{learnerEmail}</strong>
                  </span>
                </div>
              )}

              {error && <p className="enrollment-error" role="alert">{error}</p>}

              <button type="submit" className="enrollment-primary-action" disabled={submitting}>
                {submitting
                  ? <><Loader2 size={18} className="spinner" /> Đang kích hoạt…</>
                  : <><BookOpen size={18} /> Kích hoạt học miễn phí</>}
              </button>
            </form>
          )}

          {step === 'details' && !isFree && (
            <form className="paid-enrollment" onSubmit={createOrder}>
              {pendingOrder && <section className="checkout-pending" aria-label="Đơn đang chờ thanh toán">
                <span className="checkout-pending__eyebrow"><Clock3 size={15} /> Đơn chưa hoàn tất</span>
                <h3>Chọn giá trước khi tiếp tục</h3>
                <p>Đơn #{pendingOrder.orderCode} đã tạo với số tiền <strong>{formatPrice(pendingOrder.amount)}</strong>. {quote && <>Học phí hiện tại: <strong>{formatPrice(quote.amount)}</strong>.</>}</p>
                <p>Muốn dùng giá hiện tại hoặc thêm mã giảm giá, hãy hủy đơn cũ trước. Đơn đã thanh toán sẽ được kiểm tra lại.</p>
                <div><button type="button" className="checkout-pending__replace" disabled={replacing || quoteLoading} onClick={() => handleReplacePending()}>{replacing ? <><Loader2 size={16} className="spinner" /> Đang xác minh đơn cũ…</> : 'Hủy đơn cũ để dùng giá / mã mới'}</button><button type="button" className="checkout-pending__resume" disabled={replacing} onClick={handleResumePending}>Tiếp tục đơn {formatPrice(pendingOrder.amount)}</button></div>
              </section>}
              <section className="checkout-coupon" aria-labelledby="checkout-coupon-title">
                <div className="checkout-coupon__heading"><Tag size={19} aria-hidden="true" /><div><label id="checkout-coupon-title" htmlFor="checkout-coupon">Bạn có mã giảm giá?</label><p>Nhập mã admin cung cấp trước khi thanh toán.</p></div></div>
                <div className="checkout-coupon__input"><input id="checkout-coupon" maxLength={32} value={promotionInput} onChange={event => { setPromotionInput(event.target.value.toUpperCase()); setPromotionError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); handleApplyPromotion(); } }} disabled={frozen || quoteLoading || replacing || Boolean(pendingOrder)} placeholder="Ví dụ: TCC2026" autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-invalid={Boolean(promotionError)} aria-describedby="checkout-coupon-feedback" /><button type="button" disabled={frozen || quoteLoading || replacing || Boolean(pendingOrder)} onClick={() => handleApplyPromotion()}>{quoteLoading ? 'Đang kiểm tra…' : 'Áp dụng'}</button></div>
                <div id="checkout-coupon-feedback">{promotionError ? <p className="checkout-coupon__error" role="alert">{promotionError}</p> : pendingOrder ? <p className="checkout-coupon__hint">Hủy đơn đang chờ phía trên để dùng mã cho đơn mới.</p> : hasUnappliedCode ? <p className="checkout-coupon__hint">Bấm Áp dụng để kiểm tra mã trước khi thanh toán.</p> : appliedCode ? <p className="checkout-coupon__success" role="status"><CheckCircle2 size={16} /><span><strong>{appliedCode}</strong> · Giảm {formatPrice(quote?.discountAmount || 0)}<small>Tổng thanh toán: {formatPrice(quote?.amount || 0)}</small></span><button type="button" disabled={frozen || quoteLoading} onClick={() => handleApplyPromotion('')} aria-label="Bỏ mã giảm giá"><X size={16} /></button></p> : quote?.discountAmount > 0 ? <p className="checkout-coupon__success" role="status">Đã tự áp dụng {quote.promotionLabel}: giảm {formatPrice(quote.discountAmount)}.</p> : null}</div>
              </section>
              {checkoutNotice && <p className="checkout-notice" role="status">{checkoutNotice}</p>}
              <div className="enrollment-fields">
                <label>
                  Họ và tên
                  <input
                    value={learnerName}
                    onChange={(event) => setLearnerName(event.target.value)}
                    autoComplete="name"
                    disabled={submitting || frozen}
                    required
                  />
                </label>
                <label>
                  Số điện thoại (Zalo)
                  <input
                    value={learnerPhone}
                    onChange={(event) => setLearnerPhone(event.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={submitting || frozen}
                    required
                  />
                </label>
                <label className="enrollment-field--wide enrollment-account">
                  Email tài khoản nhận quyền học
                  <input
                    value={learnerEmail}
                    autoComplete="email"
                    type="email"
                    readOnly
                    required
                  />
                  <small><LockKeyhole size={12} aria-hidden="true" />Khóa học sẽ được mở cho email này.</small>
                </label>
              </div>

              {terms && <section className="checkout-consent" aria-label="Xác nhận điều khoản mua">
                <details><summary>Điều khoản mua & chính sách hoàn tiền</summary><div className="checkout-terms-text"><p>Phiên bản {terms.version} · {terms.seller.name}</p>{terms.sections.map(section => <section key={section.title}><h4>{section.title}</h4><p>{section.text}</p></section>)}<a href="/purchase-terms" target="_blank" rel="noopener noreferrer">Mở bản đầy đủ</a></div></details>
                <label className="checkout-agree"><input type="checkbox" checked={agreed} disabled={frozen || quoteLoading} onChange={event => setAgreed(event.target.checked)} /><span>Tôi đã đọc, đồng ý điều khoản và hiểu rằng không hoàn tiền do đổi ý sau khi quyền học được cung cấp đúng cam kết. Các quyền theo pháp luật vẫn được bảo đảm.</span></label>
                <label htmlFor="purchase-confirmation"><span>Nhập <strong>{terms.confirmation}</strong> để xác nhận mua</span><input id="purchase-confirmation" value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={frozen || quoteLoading} autoComplete="off" spellCheck={false} placeholder={terms.confirmation} /></label>
              </section>}
              {frozen && !submitting && <p className="checkout-form-note">Đang giữ nguyên thông tin đơn trước. Bấm tiếp tục để kiểm tra lại, tránh tạo đơn trùng.</p>}
              {error && <p className="enrollment-error" role="alert">{error}</p>}
              {!quote && !quoteLoading && !frozen && <button type="button" className="checkout-retry" onClick={() => loadQuote('')}>Tải lại học phí & điều khoản</button>}

              <button type="submit" className="enrollment-primary-action" disabled={submitting || replacing || quoteLoading || Boolean(pendingOrder) || (!frozen && (hasUnappliedCode || !confirmed))}>
                {submitting
                  ? <><Loader2 size={18} className="spinner" /> Đang tạo đơn…</>
                  : <>Tiếp tục với PayOS <ArrowRight size={18} /></>}
              </button>
              <p className="checkout-form-note"><ShieldCheck size={14} aria-hidden="true" />Thanh toán an toàn qua PayOS</p>
              <button type="button" className="checkout-receipt" onClick={closeAndReset}>Để sau</button>
            </form>
          )}

          {step === 'payment' && (
            <div className="payos-payment">
              {['CREATING', 'PENDING'].includes(status) && pendingOrder?.orderCode === orderCode && <section className="checkout-existing-order"><p>Đơn #{orderCode} giữ số tiền đã xác nhận: <strong>{displayPrice}</strong>. {quote && quote.amount !== order?.amount && <>Giá hiện tại là <strong>{formatPrice(quote.amount)}</strong>.</>}</p><button type="button" disabled={replacing || checking} onClick={() => handleReplacePending(order)}>Dùng giá mới hoặc nhập mã giảm giá</button><small>Hủy link đang chờ và quay lại bước kiểm tra học phí.</small></section>}
              <div className="payos-status" role="status">
                <span className={`payos-status__dot ${['CANCELLED', 'FAILED', 'POLL_ERROR', 'AUTH_REQUIRED'].includes(status) ? 'is-warning' : ''}`} aria-hidden="true" />
                <span>{paymentStatusLabel}</span>
              </div>
              {['CREATING', 'PENDING'].includes(status) && <div className={`checkout-deadline ${secondsLeft !== null && secondsLeft <= 120 ? 'is-urgent' : ''}`}><Clock3 size={18} aria-hidden="true" /><div><span>{deadlinePassed ? 'Đã hết thời gian của QR' : 'Thời gian thanh toán còn lại'}</span><strong role="timer" aria-live="off">{paymentClock(secondsLeft)}</strong></div><small>{deadlinePassed ? 'Đang đối soát với PayOS. Không chuyển theo QR đã hết hạn.' : secondsLeft === null ? 'Đơn cũ chưa có hạn tự động; bạn có thể hủy để tạo phiên mới.' : 'Đóng cửa sổ vẫn giữ nguyên thời hạn này.'}</small></div>}

              <div className="payos-payment__grid">
                <div className="payos-qr">
                  {deadlinePassed || ['CANCELLED', 'FAILED'].includes(status) ? <div className="payos-qr__fallback"><Clock3 size={34} /><span>QR đã đóng hoặc hết hạn<br />Kiểm tra giao dịch trước khi tạo đơn mới</span></div> : qrImageUrl ? (
                    <img src={qrImageUrl} alt="Mã QR thanh toán PayOS" />
                  ) : (
                    <div className="payos-qr__fallback">
                      <QrCode size={44} />
                      <span>Mở trang PayOS để thanh toán</span>
                    </div>
                  )}
                </div>

                <div className="payos-instructions">
                  <p>Dùng ứng dụng ngân hàng quét mã. Khóa học sẽ tự mở khi thanh toán được xác nhận.</p>
                  <div className="payos-order-reference"><span>Mã giao dịch</span><strong>#{orderCode}</strong></div>

                  {order?.checkoutUrl && !deadlinePassed && !['CANCELLED', 'FAILED'].includes(status) && (
                    <a
                      href={order.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="payos-open-link"
                    >
                      Mở trang PayOS
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {error && <p className="enrollment-error" role="alert">{error}</p>}

              <div className="payos-payment__footer">
                <span><Clock3 size={14} aria-hidden="true" />Tự động cập nhật giao dịch</span>
                {['CANCELLED', 'FAILED'].includes(status) ? (
                  <button type="button" onClick={restartCheckout}>
                    Tạo đơn PayOS mới
                  </button>
                ) : (
                  <button type="button" onClick={loadOrderStatus} disabled={checking}>
                    {checking ? 'Đang kiểm tra…' : 'Kiểm tra giao dịch'}
                  </button>
                )}
              </div>
              {['CREATING', 'PENDING'].includes(status) && pendingOrder?.orderCode !== orderCode && <button type="button" className="checkout-receipt" disabled={replacing || checking} onClick={() => handleReplacePending(order)}>Hủy đơn để thay đổi mã giảm giá</button>}
            </div>
          )}

          {step === 'complete' && (
            <div className="enrollment-complete">
              <span className="enrollment-complete__icon">
                <CheckCircle2 size={38} />
              </span>
              <span className="enrollment-modal__eyebrow">
                {isFree ? 'Kích hoạt hoàn tất' : 'PayOS đã xác nhận'}
              </span>
              <h3>Quyền học đã sẵn sàng</h3>
              <p>
                {isFree
                  ? 'Khóa học miễn phí đã được gắn với tài khoản của bạn.'
                  : 'Giao dịch đã được đối soát và backend đã mở quyền truy cập cho tài khoản học viên.'}
              </p>
              <button type="button" className="enrollment-primary-action" onClick={closeAndReset}>
                <BookOpen size={18} />
                Vào học ngay
              </button>
              {orderCode && <a className="checkout-receipt" href={`/payment/result?orderCode=${orderCode}`}>Xem giao dịch & bản xác nhận</a>}
            </div>
          )}
        </div>
          </div>
        </div></div>
      </section>
    </div>,
    document.body
  );
}
