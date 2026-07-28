import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle, ShieldCheck, QrCode, Copy, 
  PhoneCall, Sparkles, CreditCard, Check, User, Mail, 
  Phone, Lock, Wallet, Smartphone, ExternalLink, RefreshCw, Clock, ArrowRight, Zap, ChevronRight, BookOpen, Building2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function CourseEnrollmentModal({
  isOpen,
  onClose,
  course,
  onEnrollSuccess
}) {
  if (!isOpen || !course) return null;

  // Form states
  const [learnerName, setLearnerName] = useState('');
  const [learnerEmail, setLearnerEmail] = useState('');
  const [learnerPhone, setLearnerPhone] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [note, setNote] = useState('');

  // Step flow: 1 = Form Info, 2 = PayOS Payment, 3 = Completed
  const [modalStep, setModalStep] = useState(1);
  const [paymentTab, setPaymentTab] = useState('vietqr');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [manualCheckLoading, setManualCheckLoading] = useState(false);

  // 15-minute countdown timer
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds

  // Pre-fill user info if logged in
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('ueh_tcc_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.name) setLearnerName(u.name);
        if (u.email || u.username) setLearnerEmail(u.email || u.username);
        if (u.phoneNumber || u.phone) setLearnerPhone(u.phoneNumber || u.phone);
      }
    } catch (e) {}
  }, [isOpen]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isOpen || modalStep !== 2 || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, modalStep, isCompleted]);

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
    // If raw VietQR EMVCo payload string (starts with 000201...), render via QR Server API
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
    } catch (err) {
      setPayosError('Đã chuyển sang mã VietQR MBBank mặc định.');
    } finally {
      setPayosLoading(false);
    }
  };

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
        } catch (err) {}
      }, 3000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [payosOrderCode, paymentStatus, isCompleted, modalStep]);

  // Manual Payment Status Check
  const handleCheckPaymentStatusManual = async () => {
    if (!payosOrderCode) return;
    setManualCheckLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/${payosOrderCode}`);
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.data && resData.data.status === 'PAID') {
        setPaymentStatus('PAID');
        handleMarkCompleted();
      } else {
        alert('Hệ thống đang chờ ngân hàng đối soát. Nếu bạn đã chuyển khoản, bài học sẽ tự động mở khóa trong vài giây nữa!');
      }
    } catch (err) {
      alert('Không thể kết nối đối soát. Hệ thống sẽ tự động quét lại khi có biến động.');
    } finally {
      setManualCheckLoading(false);
    }
  };

  // Auto-mark completion and unlock course
  const handleMarkCompleted = () => {
    try {
      const existing = localStorage.getItem('ueh_tcc_enrolled_courses');
      let enrolled = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(enrolled)) enrolled = [];
      if (!enrolled.includes(course.id)) {
        enrolled.push(course.id);
        localStorage.setItem('ueh_tcc_enrolled_courses', JSON.stringify(enrolled));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {}

    setIsCompleted(true);
    setModalStep(3);
    if (onEnrollSuccess) {
      onEnrollSuccess(course.id);
    }
  };

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
        backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', overflowY: 'auto'
      }}
    >
      <div 
        className="modal-content enrollment-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px', width: '100%', maxHeight: '92vh',
          borderRadius: '24px', padding: '0', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', background: '#ffffff',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.45)', border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Modern Corporate Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '24px 32px', color: '#ffffff', position: 'relative', flexShrink: 0
        }}>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            style={{
              color: '#94a3b8', background: 'rgba(255,255,255,0.08)',
              top: '20px', right: '20px', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {!imgError && course.image && !course.image.startsWith('<svg') ? (
                <img 
                  src={course.image} 
                  alt={course.title} 
                  onError={() => setImgError(true)}
                  style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }}
                />
              ) : (
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(13,148,136,0.3)', flexShrink: 0
                }}>
                  <BookOpen size={26} />
                </div>
              )}

              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <Building2 size={12} />
                  <span>UEH TCC Official Gateway</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '2px 0', color: '#ffffff', lineHeight: '1.3' }}>
                  {course.title}
                </h3>
              </div>
            </div>

            {/* Price Badge in Header */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Học phí thanh toán</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#34d399', fontFamily: 'monospace' }}>{formattedFinalPrice}</div>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          {!isCompleted && !course.isFree && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.8rem', color: '#94a3b8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: modalStep === 1 ? '#38bdf8' : '#64748b', fontWeight: modalStep === 1 ? '700' : '500' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: modalStep === 1 ? '#0284c7' : '#334155', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>1</span>
                <span>Thông tin người đăng ký</span>
              </div>
              <ChevronRight size={14} style={{ color: '#475569' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: modalStep === 2 ? '#34d399' : '#64748b', fontWeight: modalStep === 2 ? '700' : '500' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: modalStep === 2 ? '#059669' : '#334155', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>2</span>
                <span>Thanh toán PayOS & Mở khóa</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px 36px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch', background: '#fafafa' }}>
          
          {/* STATE 3: COMPLETED SUCCESS */}
          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: '#dcfce7', border: '3px solid #16a34a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#16a34a', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.2)'
              }}>
                <CheckCircle size={44} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Thanh Toán & Đăng Ký Thành Công!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Hệ thống đã tự động đối soát và kích hoạt quyền học cho <strong>{learnerName || 'Học viên'}</strong>.<br />
                Mã giao dịch PayOS: <strong style={{ color: '#0d9488', fontFamily: 'monospace' }}>#{payosOrderCode || Date.now()}</strong>
              </p>

              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '20px 24px', textAlign: 'left', marginBottom: '24px', fontSize: '0.92rem', color: '#1e293b',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', fontSize: '0.95rem', color: '#15803d' }}>
                  <ShieldCheck size={20} />
                  <span>Quyền lợi đã tự động được mở khóa 24/7:</span>
                </div>
                <ul style={{ paddingLeft: '24px', margin: 0, lineHeight: '1.7', color: '#475569' }}>
                  <li>Toàn bộ bài học video HD & bộ đề thi trắc nghiệm đã được mở khóa.</li>
                  <li>Đội ngũ trợ giảng UEH TCC đã sẵn sàng hỗ trợ giải đáp 1-1.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={onClose}
                style={{ padding: '16px 24px', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px', background: '#0f172a', color: '#ffffff', boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)', cursor: 'pointer', border: 'none' }}
              >
                ▶ VÀO HỌC NGAY BÂY GIỜ
              </button>
            </div>
          ) : modalStep === 1 ? (
            /* STEP 1: LEARNER FORM */
            <form onSubmit={handleProceedToPayment}>
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} className="text-teal" /> 1. Nhập Thông Tin Học Viên
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Họ và tên học viên *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nguyễn Văn A"
                      value={learnerName}
                      onChange={(e) => setLearnerName(e.target.value)}
                      required
                      style={{ borderRadius: '12px', padding: '12px 14px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Số điện thoại (Zalo) *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="0912345678"
                      value={learnerPhone}
                      onChange={(e) => setLearnerPhone(e.target.value)}
                      required
                      style={{ borderRadius: '12px', padding: '12px 14px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block' }}>Địa chỉ Email nhận bài học *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="sinhvien@ueh.edu.vn"
                    value={learnerEmail}
                    onChange={(e) => setLearnerEmail(e.target.value)}
                    required
                    style={{ borderRadius: '12px', padding: '12px 14px' }}
                  />
                </div>
              </div>

              {/* Pricing & Voucher Summary */}
              <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Học phí niêm yết:</span>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.95rem' }}>{course.originalPrice || course.discountPrice}</span>
                </div>

                {voucherApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', color: '#16a34a' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mã ưu đãi (UEHTCC):</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>-500.000đ</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Tổng tiền thanh toán:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0d9488', fontFamily: 'monospace' }}>{formattedFinalPrice}</span>
                </div>

                {!course.isFree && !voucherApplied && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập mã ưu đãi (Ví dụ: UEHTCC)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '10px 14px', borderRadius: '12px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleApplyVoucher}
                      style={{ whiteSpace: 'nowrap', padding: '10px 18px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '12px' }}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button to Step 2 */}
              <button
                type="submit"
                className="btn w-full"
                style={{
                  padding: '16px 24px', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px',
                  background: '#0f172a', color: '#ffffff', border: 'none',
                  boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {course.isFree ? (
                  <span>🚀 KÍCH HOẠT HỌC MIỄN PHÍ NGAY</span>
                ) : (
                  <>
                    <span>TIẾP TỤC ĐẾN CỔNG THANH TOÁN PAYOS</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: CORPORATE STREAMLINED PAYOS CHECKOUT */
            <div>
              {/* Payment Tab Selectors (Clean Minimal Segmented Control) */}
              <div style={{
                background: '#e2e8f0', padding: '3px', borderRadius: '14px',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setPaymentTab('vietqr')}
                  style={{
                    padding: '10px 8px', borderRadius: '12px', border: 'none',
                    background: paymentTab === 'vietqr' ? '#ffffff' : 'transparent',
                    color: paymentTab === 'vietqr' ? '#0f172a' : '#64748b',
                    fontWeight: paymentTab === 'vietqr' ? '800' : '600', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: paymentTab === 'vietqr' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <QrCode size={16} color={paymentTab === 'vietqr' ? '#0d9488' : '#64748b'} />
                  <span>Cổng PayOS VietQR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('momo')}
                  style={{
                    padding: '10px 8px', borderRadius: '12px', border: 'none',
                    background: paymentTab === 'momo' ? '#ffffff' : 'transparent',
                    color: paymentTab === 'momo' ? '#0f172a' : '#64748b',
                    fontWeight: paymentTab === 'momo' ? '800' : '600', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: paymentTab === 'momo' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <Wallet size={16} color={paymentTab === 'momo' ? '#a21caf' : '#64748b'} />
                  <span>Ví MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('vnpay')}
                  style={{
                    padding: '10px 8px', borderRadius: '12px', border: 'none',
                    background: paymentTab === 'vnpay' ? '#ffffff' : 'transparent',
                    color: paymentTab === 'vnpay' ? '#0f172a' : '#64748b',
                    fontWeight: paymentTab === 'vnpay' ? '800' : '600', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: paymentTab === 'vnpay' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <Smartphone size={16} color={paymentTab === 'vnpay' ? '#0284c7' : '#64748b'} />
                  <span>VNPay QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('consult')}
                  style={{
                    padding: '10px 8px', borderRadius: '12px', border: 'none',
                    background: paymentTab === 'consult' ? '#ffffff' : 'transparent',
                    color: paymentTab === 'consult' ? '#0f172a' : '#64748b',
                    fontWeight: paymentTab === 'consult' ? '800' : '600', fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: paymentTab === 'consult' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <PhoneCall size={16} color={paymentTab === 'consult' ? '#2563eb' : '#64748b'} />
                  <span>Hỗ trợ Admin Zalo</span>
                </button>
              </div>

              {/* TAB 1: STREAMLINED PAYOS VIETQR */}
              {paymentTab === 'vietqr' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  
                  {/* Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                      <span>Hệ thống đang tự động đối soát giao dịch 24/7</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                      Mã đơn: #{payosOrderCode || 'MBBank'}
                    </div>
                  </div>

                  {/* 2-Column Clean Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'center' }}>
                    {/* Left: Crisp Scannable QR Code */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ padding: '12px', background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                        {payosLoading ? (
                          <div style={{ padding: '60px 0', color: '#64748b', fontSize: '0.85rem' }}>
                            <span>⏳ Khởi tạo QR...</span>
                          </div>
                        ) : (
                          <img 
                            src={getDisplayQrUrl()} 
                            alt="Mã QR VietQR MBBank" 
                            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} 
                          />
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '8px' }}>
                        Quét bằng App MBBank / VCB / Agribank / Banking Apps
                      </span>
                    </div>

                    {/* Right: Transfer Information List */}
                    <div style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Ngân hàng thụ hưởng</span>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{bankName}</div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Số tài khoản</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                          <strong style={{ color: '#0d9488', fontSize: '1.2rem', fontFamily: 'monospace' }}>{bankAccountNo}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankAccountNo, 'stk')}
                            style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {copiedField === 'stk' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                            <span>{copiedField === 'stk' ? 'Đã chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Chủ tài khoản</span>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{bankAccountHolder}</div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Nội dung chuyển khoản (Bắt buộc)</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                          <strong style={{ color: '#dc2626', fontSize: '1.05rem', fontFamily: 'monospace' }}>{transferMemo}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(transferMemo, 'memo')}
                            style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {copiedField === 'memo' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                            <span>{copiedField === 'memo' ? 'Đã chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </div>

                      {/* PayOS Official Direct Checkout Button */}
                      {payosCheckoutUrl && (
                        <a
                          href={payosCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            background: '#0d9488', color: '#ffffff', padding: '12px 16px', borderRadius: '12px',
                            fontWeight: '800', fontSize: '0.88rem', textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(13,148,136,0.25)', width: '100%', boxSizing: 'border-box'
                          }}
                        >
                          <span>🚀 Thanh toán qua Cổng Web PayOS</span>
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOMO */}
              {paymentTab === 'momo' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <img src={momoQrUrl} alt="Mã QR Ví MoMo" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '8px' }}>App MoMo quét mã QR</span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Số Ví MoMo</span>
                      <div style={{ fontWeight: '800', color: '#a21caf', fontSize: '1.1rem', fontFamily: 'monospace' }}>0833830322</div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Tên người nhận</span>
                      <div style={{ fontWeight: '800' }}>LƯ PHÚC</div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Lời nhắn MoMo</span>
                      <div style={{ fontWeight: '800', color: '#dc2626', fontFamily: 'monospace' }}>{transferMemo}</div>
                    </div>

                    <a 
                      href="https://nhantien.momo.vn/0833830322" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', background: '#a21caf', color: '#ffffff', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      🔗 Mở Ví MoMo trực tiếp
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: VNPAY */}
              {paymentTab === 'vnpay' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0369a1', marginBottom: '10px' }}>Thanh toán qua Cổng VNPay QR</h4>
                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                    Bạn có thể sử dụng ứng dụng Ngân hàng của mình quét mã **VNPay QR** hoặc mở cổng thanh toán PayOS bên trên để thanh toán trực tiếp bằng Thẻ ATM / Napas / VNPay.
                  </p>
                  {payosCheckoutUrl && (
                    <a
                      href={payosCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0284c7', color: '#ffffff', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', textDecoration: 'none' }}
                    >
                      🚀 Mở Cổng PayOS (Hỗ trợ VNPay & Thẻ ATM) <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              )}

              {/* TAB 4: CONSULTATION */}
              {paymentTab === 'consult' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.6', marginBottom: '16px' }}>
                    Liên hệ trực tiếp Ban Quản Trị UEH TCC qua Zalo hoặc Hotline để được hỗ trợ nhanh nhất:
                  </p>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <a
                      href="https://zalo.me/0833830322"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '14px', background: '#2563eb', color: '#ffffff', fontWeight: '800', borderRadius: '12px' }}
                    >
                      💬 Chat Zalo: 0833830322
                    </a>
                    <a
                      href="tel:0833830322"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '14px', background: '#f1f5f9', color: '#1e293b', fontWeight: '800', borderRadius: '12px' }}
                    >
                      📞 Gọi Hotline: 0833830322
                    </a>
                  </div>
                </div>
              )}

              {/* Action Bar (Clean Minimal Footer) */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ← Thay đổi thông tin người mua
                </button>

                <button
                  type="button"
                  onClick={handleCheckPaymentStatusManual}
                  disabled={manualCheckLoading}
                  style={{
                    padding: '14px 24px', fontSize: '0.95rem', fontWeight: '800', borderRadius: '12px',
                    background: '#0f172a', color: '#ffffff', border: 'none',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {manualCheckLoading ? (
                    <span>⏳ Đang kiểm tra đối soát...</span>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>XÁC NHẬN ĐÃ CHUYỂN KHOẢN (ĐỐI SOÁT NGAY)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
