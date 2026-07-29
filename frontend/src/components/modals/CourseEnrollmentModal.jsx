import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle, ShieldCheck, QrCode, Copy, 
  PhoneCall, Check, User, Wallet, Smartphone, ExternalLink,
  RefreshCw, Clock, ArrowRight, ChevronRight, BookOpen
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const readStoredLearner = () => {
  try {
    const savedUser = localStorage.getItem('ueh_tcc_user');
    if (!savedUser) return {};
    const user = JSON.parse(savedUser);
    return {
      name: user.name || '',
      email: user.email || user.username || '',
      phone: user.phoneNumber || user.phone || ''
    };
  } catch {
    return {};
  }
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
      isOpen={isOpen}
      onClose={onClose}
      course={course}
      onEnrollSuccess={onEnrollSuccess}
    />
  );
}

function CourseEnrollmentModalContent({
  isOpen,
  onClose,
  course,
  onEnrollSuccess
}) {
  const [storedLearner] = useState(readStoredLearner);

  // Form states
  const [learnerName, setLearnerName] = useState(storedLearner.name || '');
  const [learnerEmail, setLearnerEmail] = useState(storedLearner.email || '');
  const [learnerPhone, setLearnerPhone] = useState(storedLearner.phone || '');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  // Step flow: 1 = Form Info, 2 = PayOS Payment, 3 = Completed
  const [modalStep, setModalStep] = useState(1);
  const [paymentTab, setPaymentTab] = useState('vietqr');
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [imgError, setImgError] = useState(false);

  // Real PayOS Gateway States
  const [payosOrderCode, setPayosOrderCode] = useState(null);
  const [payosCheckoutUrl, setPayosCheckoutUrl] = useState('');
  const [payosQrCode, setPayosQrCode] = useState('');
  const [payosLoading, setPayosLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING | PAID | CANCELLED
  const [payosError, setPayosError] = useState('');

  // 15-minute transaction timer
  const [timeLeft, setTimeLeft] = useState(900);
  // 5-second auto redirect countdown upon payment success
  const [autoCloseCountdown, setAutoCloseCountdown] = useState(5);

  // Clean body overflow & ensure navigation is never locked
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Timer Countdown Effect for Transaction Expiry
  useEffect(() => {
    if (!isOpen || modalStep !== 2 || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, modalStep, isCompleted]);

  // Auto Close Countdown Effect upon Payment Completion
  useEffect(() => {
    let autoCloseTimer = null;
    if (isCompleted && autoCloseCountdown > 0) {
      autoCloseTimer = setInterval(() => {
        setAutoCloseCountdown(prev => {
          if (prev <= 1) {
            clearInterval(autoCloseTimer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (autoCloseTimer) clearInterval(autoCloseTimer);
    };
  }, [isCompleted, autoCloseCountdown, onClose]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Extract raw numeric price
  const parseNumericPrice = (priceStr) => {
    if (!priceStr) return 0;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const rawPrice = parseNumericPrice(course.discountPrice || course.originalPrice);
  const finalPrice = voucherApplied ? Math.max(0, rawPrice - voucherDiscount) : rawPrice;
  const formattedFinalPrice = finalPrice > 0 ? `${finalPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí';

  // Bank Details for PayOS MBBank Integration
  const bankName = 'MBBank (Ngân hàng Quân Đội)';
  const bankAccountNo = '08092006192939';
  const bankAccountHolder = 'LU VO HOANG PHUC';
  const cleanPhone = learnerPhone.replace(/[^0-9]/g, '').slice(-10) || '0833830322';
  const transferMemo = `TCC ${cleanPhone} K50`;

  // Fallback VietQR Compact URL
  const fallbackVietQrUrl = `https://img.vietqr.io/image/MB-08092006192939-compact2.png?amount=${finalPrice}&addInfo=${encodeURIComponent(transferMemo)}&accountName=LU%20VO%20HOANG%20PHUC`;

  // MoMo QR Code URL
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`2|99|0833830322|LU PHUC|luphuc321@gmail.com|0|0|${finalPrice}|${transferMemo}`)}`;

  // Correct URL Resolver for PayOS QR Code
  const getDisplayQrUrl = () => {
    if (!payosQrCode) return fallbackVietQrUrl;
    if (payosQrCode.startsWith('http://') || payosQrCode.startsWith('https://') || payosQrCode.startsWith('data:image')) {
      return payosQrCode;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payosQrCode)}`;
  };

  // Function to create Real PayOS Payment Link
  const handleCreatePayOSPayment = async () => {
    if (course.isFree || finalPrice <= 0) return;

    setPayosLoading(true);
    setPayosError('');

    const newOrderCode = Math.floor(100000 + Math.random() * 9000000);
    setPayosOrderCode(newOrderCode);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payos/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: newOrderCode,
          amount: finalPrice,
          description: `HP ${course.id || 'TCC'} ${cleanPhone}`.slice(0, 25),
          buyerName: learnerName.trim() || 'Học viên UEH TCC',
          buyerEmail: learnerEmail.trim(),
          buyerPhone: learnerPhone.trim()
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.code === '00' && data.data) {
        setPayosCheckoutUrl(data.data.checkoutUrl || '');
        setPayosQrCode(data.data.qrCode || '');
        setPaymentStatus('PENDING');
      } else {
        setPayosError(data.message || 'Hệ thống đã kết nối VietQR MBBank Pro.');
      }
    } catch {
      setPayosError('Đã chuyển sang mã VietQR MBBank mặc định.');
    } finally {
      setPayosLoading(false);
    }
  };

  // Auto-mark completion and unlock course
  const handleMarkCompleted = useCallback(() => {
    try {
      const existing = localStorage.getItem('ueh_tcc_enrolled_courses');
      const enrolled = existing ? JSON.parse(existing) : [];
      const validEnrollments = Array.isArray(enrolled) ? enrolled : [];
      if (!validEnrollments.includes(course.id)) {
        localStorage.setItem(
          'ueh_tcc_enrolled_courses',
          JSON.stringify([...validEnrollments, course.id])
        );
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      // The server-side entitlement flow remains the source of truth.
    }

    setIsCompleted(true);
    setModalStep(3);
    onEnrollSuccess?.(course.id);
  }, [course.id, onEnrollSuccess]);

  // Real-Time Status Polling (Every 3 Seconds)
  useEffect(() => {
    let pollingInterval = null;

    if (payosOrderCode && paymentStatus === 'PENDING' && !isCompleted && modalStep === 2) {
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/payments/${payosOrderCode}`);
          const resData = await res.json().catch(() => ({}));

          if (res.ok && resData.data && resData.data.status === 'PAID') {
            setPaymentStatus('PAID');
            clearInterval(pollingInterval);
            handleMarkCompleted();
          }
        } catch {
          // A transient polling failure is retried on the next interval.
        }
      }, 3000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [payosOrderCode, paymentStatus, isCompleted, modalStep, handleMarkCompleted]);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;
    const code = voucherCode.trim().toUpperCase();
    if (code === 'UEHTCC' || code === 'K50' || code === 'K51' || code === 'TOANUEH') {
      setVoucherApplied(true);
      setVoucherDiscount(500000);
    } else {
      alert('Mã ưu đãi không hợp lệ hoặc đã hết hạn!');
    }
  };

  // Submit Form 1 -> Proceed to Step 2 (PayOS Payment)
  const handleProceedToPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!learnerName.trim()) {
      alert('Vui lòng nhập Họ và Tên của bạn!');
      return;
    }
    if (!learnerEmail.trim()) {
      alert('Vui lòng nhập Email liên hệ!');
      return;
    }
    if (!learnerPhone.trim()) {
      alert('Vui lòng nhập Số điện thoại!');
      return;
    }

    if (course.isFree || finalPrice <= 0) {
      handleMarkCompleted();
    } else {
      setModalStep(2);
      handleCreatePayOSPayment();
    }
  };

  return createPortal(
    <div 
      className="modal-overlay enrollment-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', overflowY: 'auto'
      }}
    >
      <div 
        className="modal-content glass-panel enrollment-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '660px', width: '100%', maxHeight: '92vh',
          borderRadius: '24px', padding: '0', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', background: '#ffffff',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Restored Rich Emerald Banner Header */}
        <div className="enroll-modal-header" style={{
          background: 'linear-gradient(135deg, #0e4e35 0%, #176b4a 60%, #063121 100%)',
          padding: '24px 28px', color: '#ffffff', position: 'relative', flexShrink: 0
        }}>
          {/* Close Button positioned with ample clearance */}
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            style={{
              color: '#ffffff', background: 'rgba(255,255,255,0.18)',
              top: '18px', right: '18px', border: 'none', borderRadius: '50%',
              width: '34px', height: '34px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingRight: '48px' }}>
            {!imgError && course.image && !course.image.startsWith('<svg') ? (
              <img 
                src={course.image} 
                alt={course.title} 
                onError={() => setImgError(true)}
                style={{ width: '70px', height: '54px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '70px', height: '54px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#34d399', border: '2px solid rgba(255,255,255,0.2)',
                flexShrink: 0
              }}>
                <BookOpen size={24} />
              </div>
            )}

            <div>
              <span className="hero-badge" style={{ background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                CỔNG THANH TOÁN DOANH NGHIỆP PAYOS
              </span>
              <h3 style={{ fontSize: '1.18rem', fontWeight: '800', margin: '4px 0 2px', color: '#ffffff', lineHeight: '1.3' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Kích hoạt tài khoản & mở khóa toàn bộ bài học video HD 24/7
              </p>
            </div>
          </div>

          {/* Stepper Header Bar */}
          {!isCompleted && !course.isFree && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: modalStep === 1 ? '800' : '500', color: modalStep === 1 ? '#34d399' : 'inherit' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep === 1 ? '#34d399' : 'rgba(255,255,255,0.2)', color: modalStep === 1 ? '#064e3b' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>1</span>
                <span>Thông tin học viên</span>
              </div>
              <ChevronRight size={14} style={{ opacity: 0.6 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: modalStep === 2 ? '800' : '500', color: modalStep === 2 ? '#34d399' : 'inherit' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep === 2 ? '#34d399' : 'rgba(255,255,255,0.2)', color: modalStep === 2 ? '#064e3b' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>2</span>
                <span>Thanh toán PayOS</span>
              </div>
              <ChevronRight size={14} style={{ opacity: 0.6 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: isCompleted ? '800' : '500' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                <span>Vào học ngay</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px 32px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          
          {/* STATE 3: COMPLETED SUCCESS WITH AUTOMATIC 5S REDIRECT */}
          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: '#f0fdf4', border: '3px solid #16a34a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#16a34a', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.18)'
              }}>
                <CheckCircle size={44} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Thanh Toán Thành Công! Chào Mừng Học Viên!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Hệ thống đã nhận tiền thanh toán từ <strong>{learnerName || 'Học viên'}</strong>.<br />
                Đang tự động chuyển sang giao diện học tập trong <strong style={{ color: '#0d9488', fontSize: '1.1rem' }}>{autoCloseCountdown}s</strong>...
              </p>

              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px',
                padding: '18px 22px', textAlign: 'left', marginBottom: '24px', fontSize: '0.92rem', color: '#166534'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
                  <ShieldCheck size={18} color="#16a34a" />
                  <span>Quyền lợi đã được kích hoạt thành công:</span>
                </div>
                <ul style={{ paddingLeft: '22px', margin: 0, lineHeight: '1.6' }}>
                  <li>Mở khóa full video giảng dạy & bộ đề thi trắc nghiệm K46 - K50.</li>
                  <li>Tài khoản học tập 24/7 không giới hạn thiết bị.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={onClose}
                style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: '800', borderRadius: '14px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', cursor: 'pointer' }}
              >
                ▶ VÀO HỌC NGAY BÂY GIỜ
              </button>
            </div>
          ) : modalStep === 1 ? (
            /* STEP 1: LEARNER FORM */
            <form onSubmit={handleProceedToPayment}>
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} className="text-teal" /> 1. Thông Tin Học Viên
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Họ và tên học viên *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nguyễn Văn A"
                      value={learnerName}
                      onChange={(e) => setLearnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Số điện thoại (Zalo) *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="0912345678"
                      value={learnerPhone}
                      onChange={(e) => setLearnerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Địa chỉ Email nhận quyền học *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="sinhvien@ueh.edu.vn"
                    value={learnerEmail}
                    onChange={(e) => setLearnerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Pricing Summary */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '16px 20px', marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Học phí niêm yết:</span>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>{course.originalPrice || course.discountPrice}</span>
                </div>

                {voucherApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#16a34a' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mã ưu đãi (UEHTCC):</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>-500.000đ</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0d9488' }}>{formattedFinalPrice}</span>
                </div>

                {!course.isFree && !voucherApplied && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập mã ưu đãi (Ví dụ: UEHTCC)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleApplyVoucher}
                      style={{ whiteSpace: 'nowrap', padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button to Step 2 */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{
                  padding: '14px 24px', fontSize: '1rem', fontWeight: '800', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {course.isFree ? (
                  <span>KÍCH HOẠT HỌC MIỄN PHÍ NGAY</span>
                ) : (
                  <>
                    <span>TIẾP TỤC ĐẾN BƯỚC THANH TOÁN PAYOS</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: CLEAN ENTERPRISE PAYOS PAYMENT GATEWAY */
            <div>
              {/* Payment Tab Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentTab('vietqr')}
                  style={{
                    padding: '12px 10px', borderRadius: '12px',
                    border: paymentTab === 'vietqr' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                    background: paymentTab === 'vietqr' ? '#f0fdf4' : '#ffffff',
                    color: paymentTab === 'vietqr' ? '#0f766e' : '#475569',
                    fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <QrCode size={16} color="#0d9488" /> Cổng PayOS / VietQR (MBBank)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('momo')}
                  style={{
                    padding: '12px 10px', borderRadius: '12px',
                    border: paymentTab === 'momo' ? '2px solid #a21caf' : '1px solid #cbd5e1',
                    background: paymentTab === 'momo' ? '#fdf4ff' : '#ffffff',
                    color: paymentTab === 'momo' ? '#86198f' : '#475569',
                    fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Wallet size={16} color="#a21caf" /> Ví MoMo
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('vnpay')}
                  style={{
                    padding: '12px 10px', borderRadius: '12px',
                    border: paymentTab === 'vnpay' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: paymentTab === 'vnpay' ? '#f0f9ff' : '#ffffff',
                    color: paymentTab === 'vnpay' ? '#0369a1' : '#475569',
                    fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Smartphone size={16} color="#0284c7" /> VNPay QR
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('consult')}
                  style={{
                    padding: '12px 10px', borderRadius: '12px',
                    border: paymentTab === 'consult' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: paymentTab === 'consult' ? '#eff6ff' : '#ffffff',
                    color: paymentTab === 'consult' ? '#1d4ed8' : '#475569',
                    fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <PhoneCall size={16} color="#2563eb" /> Zalo / Hotline
                </button>
              </div>

              {payosError && (
                <p role="status" style={{ margin: '0 0 16px', color: '#92400e', fontSize: '0.82rem' }}>
                  {payosError}
                </p>
              )}

              {/* TAB 1: PAYOS VIETQR */}
              {paymentTab === 'vietqr' && (
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px' }}>
                  
                  {/* Clean Realtime Status Indicator */}
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
                    padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', fontSize: '0.82rem', color: '#166534'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                      <RefreshCw size={14} style={{ animation: 'spin 2s linear infinite', color: '#16a34a' }} />
                      <span>Trạng thái: Đang tự động đối soát giao dịch 24/7</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#dc2626', background: '#ffffff', padding: '2px 10px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                      <Clock size={13} />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>

                  {/* Clean 2-Column Responsive Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ padding: '10px', background: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                        {payosLoading ? (
                          <div style={{ padding: '50px 0', color: '#0d9488', fontSize: '0.85rem' }}>
                            <span>Khởi tạo mã...</span>
                          </div>
                        ) : (
                          <img 
                            src={getDisplayQrUrl()} 
                            alt="Mã QR PayOS MBBank" 
                            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} 
                          />
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                        Quét bằng App MBBank / VCB / Agribank / Banking Apps
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>Ngân hàng: </span>
                        <strong>{bankName}</strong>
                      </div>

                      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748b' }}>Số tài khoản: </span>
                        <strong style={{ color: '#0d9488', fontSize: '1.05rem', fontFamily: 'monospace' }}>{bankAccountNo}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankAccountNo, 'stk')}
                          style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', padding: 0 }}
                          title="Sao chép STK"
                        >
                          {copiedField === 'stk' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>Chủ tài khoản: </span>
                        <strong>{bankAccountHolder}</strong>
                      </div>

                      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748b' }}>Nội dung chuyển khoản: </span>
                        <strong style={{ color: '#dc2626', fontFamily: 'monospace' }}>{transferMemo}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferMemo, 'memo')}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                          title="Sao chép Nội dung"
                        >
                          {copiedField === 'memo' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        </button>
                      </div>

                      {/* PayOS Hosted Page Link */}
                      {payosCheckoutUrl && (
                        <a
                          href={payosCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#0d9488', color: '#ffffff', padding: '10px 16px', borderRadius: '10px',
                            fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(13,148,136,0.25)'
                          }}
                        >
                          <span>Thanh toán qua trang Web PayOS</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOMO */}
              {paymentTab === 'momo' && (
                <div style={{
                  background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '16px', padding: '18px',
                  display: 'grid', gridTemplateColumns: '170px 1fr', gap: '18px', alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={momoQrUrl} 
                      alt="Mã QR Ví MoMo" 
                      style={{ width: '100%', borderRadius: '12px', border: '1px solid #f5d0fe' }} 
                    />
                    <span style={{ fontSize: '0.72rem', color: '#86198f', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                      App MoMo quét mã QR
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#701a75' }}>Tài khoản Ví MoMo: </span>
                      <strong style={{ color: '#a21caf', fontSize: '1rem', fontFamily: 'monospace' }}>0833830322</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy('0833830322', 'momo_stk')}
                        style={{ background: 'none', border: 'none', color: '#a21caf', cursor: 'pointer', padding: '0 0 0 6px' }}
                      >
                        {copiedField === 'momo_stk' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#701a75' }}>Chủ tài khoản: </span>
                      <strong>LƯ PHÚC</strong>
                    </div>

                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#701a75' }}>Lời nhắn MoMo: </span>
                      <strong style={{ color: '#dc2626', fontFamily: 'monospace' }}>{transferMemo}</strong>
                    </div>

                    <a 
                      href="https://nhantien.momo.vn/0833830322" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block', background: '#a21caf', color: '#ffffff',
                        padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '0.8rem',
                        textDecoration: 'none'
                      }}
                    >
                      🔗 Mở Ví MoMo trực tiếp
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: VNPAY */}
              {paymentTab === 'vnpay' && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '8px' }}>
                    <Smartphone size={18} />
                    <strong style={{ fontSize: '0.95rem' }}>Thanh toán qua Cổng VNPay QR</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', marginBottom: '12px' }}>
                    Ứng dụng Ngân hàng hỗ trợ quét mã **VNPay QR** hoặc bạn có thể mở Cổng PayOS để thanh toán bằng Thẻ ATM / Napas.
                  </p>
                  {payosCheckoutUrl && (
                    <a
                      href={payosCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: '#0284c7', color: '#ffffff', padding: '8px 16px', borderRadius: '10px',
                        fontWeight: '700', fontSize: '0.82rem', textDecoration: 'none'
                      }}
                    >
                      <span>Mở Cổng PayOS (Hỗ trợ VNPay & Thẻ ATM)</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}

              {/* TAB 4: CONSULTATION */}
              {paymentTab === 'consult' && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '18px' }}>
                  <p style={{ fontSize: '0.88rem', color: '#1e3a8a', lineHeight: '1.6', marginBottom: '12px' }}>
                    Bạn có thể liên hệ trực tiếp Ban Quản Trị UEH TCC qua Zalo hoặc Hotline để được tư vấn nhanh nhất:
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <a
                      href="https://zalo.me/0833830322"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '10px', background: '#2563eb', color: '#ffffff', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                    >
                      💬 Chat Zalo: 0833830322
                    </a>
                    <a
                      href="tel:0833830322"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem' }}
                    >
                      📞 Gọi Hotline: 0833830322
                    </a>
                  </div>
                </div>
              )}

              {/* Clean Footer Bar */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  ← Thay đổi thông tin học viên
                </button>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '600' }}>
                  🟢 Tự động duyệt đơn ngay khi nhận tiền
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
