import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Landmark,
  Loader2,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserRound,
  WalletCards,
  X
} from 'lucide-react';
import { apiFetch, readApiJson } from '../../utils/apiClient';
import '../../assets/styles/CourseEnrollmentModal.css';

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
  if (/^(https?:\/\/|data:image)/i.test(qrCode)) return qrCode;
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrCode)}`;
};

export default function CourseEnrollmentModal({
  isOpen,
  onClose,
  course,
  onEnrollSuccess
}) {
  if (!isOpen || !course) return null;

  return (
    <CourseEnrollmentModalContent
      onClose={onClose}
      course={course}
      onEnrollSuccess={onEnrollSuccess}
    />
  );
}

function CourseEnrollmentModalContent({ onClose, course, onEnrollSuccess }) {
  const [learnerName, setLearnerName] = useState('');
  const [learnerEmail, setLearnerEmail] = useState('');
  const [learnerPhone, setLearnerPhone] = useState('');
  const [step, setStep] = useState('details');
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('IDLE');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const completionRef = useRef(false);
  const idempotencyKeyRef = useRef(createIdempotencyKey());

  const isFree = course.isFree;
  const listedPrice = parseNumericPrice(course.discountPrice || course.originalPrice);
  const displayPrice = formatPrice(listedPrice);
  const qrImageUrl = getQrImageUrl(order?.qrCode);
  const orderCode = order?.orderCode;

  const closeAndReset = useCallback(() => {
    onClose();
  }, [onClose]);

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

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/auth/me')
      .then(readApiJson)
      .then(({ user }) => {
        if (cancelled || !user) return;
        setLearnerName(user.name || '');
        setLearnerEmail(user.email || user.username || '');
        setLearnerPhone(user.phoneNumber || '');
      })
      .catch(() => {
        if (!cancelled) {
          setError('Bạn cần đăng nhập đúng tài khoản học viên để tiếp tục.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const completeEnrollment = useCallback((entitlement) => {
    if (!entitlement?.allowed || completionRef.current) return;
    completionRef.current = true;
    setStatus('PAID');
    setStep('complete');
    setError('');
    onEnrollSuccess?.(course.id, entitlement);
  }, [course.id, onEnrollSuccess]);

  const verifyCourseEntitlement = useCallback(async () => {
    const response = await apiFetch(`/api/courses/${encodeURIComponent(course.id)}/access`);
    const payload = await readApiJson(response);
    return payload.data;
  }, [course.id]);

  const loadOrderStatus = useCallback(async () => {
    if (!orderCode || completionRef.current) return;
    setChecking(true);

    try {
      const response = await apiFetch(`/api/orders/${orderCode}`);
      const payload = await readApiJson(response);
      const payment = payload.data || {};

      if (payment.entitlement?.allowed) {
        completeEnrollment(payment.entitlement);
        return;
      }

      if (payment.status === 'PAID') {
        const access = await verifyCourseEntitlement();
        if (access?.allowed) {
          completeEnrollment(access);
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
      if (pollError.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục đối soát.');
        setStatus('AUTH_REQUIRED');
      }
    } finally {
      setChecking(false);
    }
  }, [completeEnrollment, orderCode, verifyCourseEntitlement]);

  useEffect(() => {
    if (
      !orderCode
      || step !== 'payment'
      || completionRef.current
      || ['CANCELLED', 'FAILED', 'AUTH_REQUIRED'].includes(status)
    ) return undefined;

    const initialCheck = window.setTimeout(loadOrderStatus, 0);
    const interval = window.setInterval(loadOrderStatus, 3000);
    return () => {
      window.clearTimeout(initialCheck);
      window.clearInterval(interval);
    };
  }, [loadOrderStatus, orderCode, status, step]);

  const createOrder = async (event) => {
    event.preventDefault();
    setError('');

    if (!isFree && (!learnerName.trim() || !learnerEmail.trim() || !learnerPhone.trim())) {
      setError('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current
        },
        body: JSON.stringify({
          courseId: course.id,
          buyerName: learnerName.trim(),
          buyerEmail: learnerEmail.trim(),
          buyerPhone: learnerPhone.trim()
        })
      });
      const payload = await readApiJson(response);
      const payment = payload.data || {};

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
      if (createError.status === 401) {
        setError('Bạn cần đăng nhập trước khi đăng ký khóa học.');
      } else {
        setError(createError.message || (
          isFree
            ? 'Không thể kích hoạt khóa học miễn phí.'
            : 'Không thể khởi tạo thanh toán PayOS.'
        ));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const restartCheckout = () => {
    idempotencyKeyRef.current = createIdempotencyKey();
    setOrder(null);
    setStatus('IDLE');
    setError('');
    setChecking(false);
    setStep('details');
  };

  const activePaidStep = step === 'complete' ? 4 : step === 'payment' ? (checking ? 3 : 2) : 1;

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
        <header className="enrollment-modal__header">
          <button
            type="button"
            className="enrollment-modal__close"
            onClick={closeAndReset}
            ref={closeButtonRef}
            aria-label="Đóng cửa sổ đăng ký"
          >
            <X size={20} />
          </button>

          <div className="enrollment-modal__course">
            {!imageFailed && course.image ? (
              <img src={course.image} alt="" onError={() => setImageFailed(true)} />
            ) : (
              <span className="enrollment-modal__image-fallback">
                <BookOpen size={24} />
              </span>
            )}
            <div>
              <span className="enrollment-modal__eyebrow">
                {isFree ? 'Kích hoạt khóa học miễn phí' : 'Đăng ký học qua PayOS'}
              </span>
              <h2 id="enrollment-title">{course.title}</h2>
              <p id="enrollment-description">
                {isFree
                  ? 'Không qua cổng thanh toán. Quyền học được gắn trực tiếp với tài khoản của bạn.'
                  : 'Học phí do máy chủ xác nhận; quyền học chỉ mở sau khi PayOS báo giao dịch thành công.'}
              </p>
            </div>
          </div>
        </header>

        {!isFree && (
          <ol className="enrollment-progress" aria-label="Tiến trình đăng ký">
            {[
              ['Thông tin', UserRound],
              ['PayOS', WalletCards],
              ['Xác nhận', Clock3],
              ['Kích hoạt', CheckCircle2]
            ].map(([label, Icon], index) => {
              const number = index + 1;
              const isActive = number === activePaidStep;
              const isDone = number < activePaidStep;
              return (
                <li className={`${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`} key={label}>
                  <span>{isDone ? <Check size={15} /> : <Icon size={15} />}</span>
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
              <div className="enrollment-section-title">
                <UserRound size={19} />
                <div>
                  <strong>Thông tin học viên</strong>
                  <span>Điền đúng thông tin của tài khoản sẽ nhận quyền học.</span>
                </div>
              </div>

              <div className="enrollment-fields">
                <label>
                  Họ và tên
                  <input
                    value={learnerName}
                    onChange={(event) => setLearnerName(event.target.value)}
                    autoComplete="name"
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
                    required
                  />
                </label>
                <label className="enrollment-field--wide">
                  Email tài khoản nhận quyền học
                  <input
                    value={learnerEmail}
                    onChange={(event) => setLearnerEmail(event.target.value)}
                    autoComplete="email"
                    type="email"
                    required
                  />
                </label>
              </div>

              <div className="paid-order-summary">
                <div>
                  <span>Khóa học</span>
                  <strong>{course.title}</strong>
                </div>
                <div className="paid-order-summary__price">
                  <span>Học phí</span>
                  <strong>{displayPrice}</strong>
                </div>
                <small>Giá cuối cùng được kiểm tra từ danh mục khóa học trên máy chủ.</small>
              </div>

              <div className="payment-provider-list" aria-label="Phương thức thanh toán">
                <div className="payment-provider is-active">
                  <ShieldCheck size={18} />
                  <span><strong>PayOS</strong><small>Đang hoạt động</small></span>
                </div>
                <div className="payment-provider is-disabled" aria-disabled="true">
                  <Smartphone size={18} />
                  <span><strong>MoMo</strong><small>Coming soon</small></span>
                </div>
                <div className="payment-provider is-disabled" aria-disabled="true">
                  <WalletCards size={18} />
                  <span><strong>VNPay</strong><small>Coming soon</small></span>
                </div>
                <div className="payment-provider is-disabled" aria-disabled="true">
                  <Landmark size={18} />
                  <span><strong>Ngân hàng</strong><small>Coming soon</small></span>
                </div>
              </div>

              {error && <p className="enrollment-error" role="alert">{error}</p>}

              <button type="submit" className="enrollment-primary-action" disabled={submitting}>
                {submitting
                  ? <><Loader2 size={18} className="spinner" /> Đang tạo đơn…</>
                  : <>Tiếp tục với PayOS <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="payos-payment">
              <div className="payos-status" aria-live="polite">
                <span className={checking ? 'is-checking' : ''}>
                  {checking ? <Loader2 size={17} className="spinner" /> : <Clock3 size={17} />}
                  {checking ? 'Đang xác nhận với PayOS' : 'Đang chờ thanh toán'}
                </span>
                <small>Đơn #{orderCode} · {status}</small>
              </div>

              <div className="payos-payment__grid">
                <div className="payos-qr">
                  {qrImageUrl ? (
                    <img src={qrImageUrl} alt="Mã QR thanh toán PayOS" />
                  ) : (
                    <div className="payos-qr__fallback">
                      <QrCode size={44} />
                      <span>Mở trang PayOS để thanh toán</span>
                    </div>
                  )}
                </div>

                <div className="payos-instructions">
                  <span className="enrollment-modal__eyebrow">Cổng thanh toán chính thức</span>
                  <h3>Thanh toán {displayPrice}</h3>
                  <ol>
                    <li>Quét mã bằng ứng dụng ngân hàng hoặc mở trang PayOS.</li>
                    <li>Kiểm tra đúng số tiền và nội dung trên đơn.</li>
                    <li>Giữ cửa sổ này mở; hệ thống tự đối soát và kích hoạt.</li>
                  </ol>

                  {order?.checkoutUrl && (
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
                <span><LockKeyhole size={15} /> Quyền học không lưu trong trình duyệt</span>
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
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}
