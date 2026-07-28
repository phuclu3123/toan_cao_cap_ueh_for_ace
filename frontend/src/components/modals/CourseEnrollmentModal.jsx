import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle, ShieldCheck, QrCode, Copy, 
  PhoneCall, Sparkles, CreditCard, Check, User, Mail, 
  Phone, Lock, Wallet, Smartphone, ExternalLink, RefreshCw, Clock, ArrowRight, Zap, ChevronRight
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
        setPayosError(data.message || 'Hệ thống đã tự động kết nối mã VietQR MBBank Pro.');
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
        alert('Hệ thống đang chờ ngân hàng xác nhận giao dịch. Nếu bạn đã chuyển khoản, bài học sẽ tự động mở khóa trong vài giây nữa!');
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
        backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
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
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Header Banner */}
        <div className="enroll-modal-header" style={{
          background: 'linear-gradient(135deg, #0e4e35 0%, #0d9488 60%, #042f2e 100%)',
          padding: '22px 28px', color: '#ffffff', position: 'relative', flexShrink: 0
        }}>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            style={{
              color: '#ffffff', background: 'rgba(255,255,255,0.2)',
              top: '18px', right: '18px', border: 'none', borderRadius: '50%',
              width: '34px', height: '34px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src={course.image} 
              alt={course.title} 
              style={{ width: '74px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
            />
            <div>
              <span className="hero-badge" style={{ background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', fontSize: '0.75rem', padding: '3px 12px', borderRadius: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
                <Zap size={13} style={{ display: 'inline', marginRight: '4px' }} />
                CỔNG THANH TOÁN TỰ ĐỘNG PAYOS
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '4px 0 2px', color: '#ffffff' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Kích hoạt tài khoản & tự động mở khóa toàn bộ bài học 24/7
              </p>
            </div>
          </div>

          {/* Stepper Bar Header */}
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

        {/* Modal Body (Scrollable Area) */}
        <div style={{ padding: '24px 28px 32px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          
          {/* STATE 3: COMPLETED SUCCESS */}
          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '4px solid #10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#059669', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
              }}>
                <CheckCircle size={44} />
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Thanh Toán & Đăng Ký Thành Công!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '22px' }}>
                Hệ thống đã tự động đối soát và xác nhận đơn hàng cho <strong>{learnerName || 'Học viên'}</strong>.<br />
                Mã đơn PayOS: <strong style={{ color: '#0d9488', fontFamily: 'monospace' }}>#{payosOrderCode || Date.now()}</strong>
              </p>

              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '18px',
                padding: '18px 22px', textAlign: 'left', marginBottom: '24px', fontSize: '0.92rem', color: '#166534',
                boxShadow: '0 4px 14px rgba(16,185,129,0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', fontSize: '0.98rem' }}>
                  <ShieldCheck size={20} color="#16a34a" />
                  <span>Quyền lợi đã được tự động mở khóa:</span>
                </div>
                <ul style={{ paddingLeft: '24px', margin: 0, lineHeight: '1.7' }}>
                  <li>Full bài học video HD & bộ đề thi trắc nghiệm đã tự động mở khóa 24/7.</li>
                  <li>Hỗ trợ giải đáp bài tập 1-1 từ Đội ngũ trợ giảng UEH TCC.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={onClose}
                style={{ padding: '15px 24px', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', boxShadow: '0 6px 20px rgba(13,148,136,0.35)' }}
              >
                ▶ BẮT ĐẦU HỌC NGAY BÂY GIỜ
              </button>
            </div>
          ) : modalStep === 1 ? (
            /* STEP 1: LEARNER FORM & PRICING */
            <form onSubmit={handleProceedToPayment}>
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} className="text-teal" /> 1. Thông Tin Học Viên
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>Họ và tên học viên *</label>
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
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>Số điện thoại (Zalo) *</label>
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

                <div className="form-group" style={{ marginTop: '14px', marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>Địa chỉ Email nhận quyền học *</label>
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
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px',
                padding: '18px 22px', marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Học phí niêm yết:</span>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.95rem' }}>{course.originalPrice || course.discountPrice}</span>
                </div>

                {voucherApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#16a34a' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mã ưu đãi (UEHTCC):</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>-500.000đ</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0d9488' }}>{formattedFinalPrice}</span>
                </div>

                {!course.isFree && !voucherApplied && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập mã ưu đãi (Ví dụ: UEHTCC)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '10px 14px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleApplyVoucher}
                      style={{ whiteSpace: 'nowrap', padding: '10px 18px', fontSize: '0.85rem', fontWeight: '700' }}
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
                  padding: '15px 24px', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {course.isFree ? (
                  <span>🚀 KÍCH HOẠT HỌC MIỄN PHÍ NGAY</span>
                ) : (
                  <>
                    <span>TIẾP TỤC ĐẾN BƯỚC THANH TOÁN PAYOS</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: PAYOS PAYMENT GATEWAY & MULTI-TAB SELECTION */
            <div>
              {/* Payment Grid Selection Tabs */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('vietqr')}
                    style={{
                      padding: '12px 10px', borderRadius: '14px',
                      border: paymentTab === 'vietqr' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                      background: paymentTab === 'vietqr' ? '#f0fdf4' : '#ffffff',
                      color: paymentTab === 'vietqr' ? '#0f766e' : '#475569',
                      fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: paymentTab === 'vietqr' ? '0 4px 12px rgba(13,148,136,0.15)' : 'none'
                    }}
                  >
                    <QrCode size={18} color="#0d9488" /> Cổng PayOS / VietQR (MBBank)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTab('momo')}
                    style={{
                      padding: '12px 10px', borderRadius: '14px',
                      border: paymentTab === 'momo' ? '2px solid #a21caf' : '1px solid #cbd5e1',
                      background: paymentTab === 'momo' ? '#fdf4ff' : '#ffffff',
                      color: paymentTab === 'momo' ? '#86198f' : '#475569',
                      fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Wallet size={18} color="#a21caf" /> Ví MoMo
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTab('vnpay')}
                    style={{
                      padding: '12px 10px', borderRadius: '14px',
                      border: paymentTab === 'vnpay' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: paymentTab === 'vnpay' ? '#f0f9ff' : '#ffffff',
                      color: paymentTab === 'vnpay' ? '#0369a1' : '#475569',
                      fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Smartphone size={18} color="#0284c7" /> VNPay QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentTab('consult')}
                    style={{
                      padding: '12px 10px', borderRadius: '14px',
                      border: paymentTab === 'consult' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: paymentTab === 'consult' ? '#eff6ff' : '#ffffff',
                      color: paymentTab === 'consult' ? '#1d4ed8' : '#475569',
                      fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <PhoneCall size={18} color="#2563eb" /> Zalo / Hotline
                  </button>
                </div>
              </div>

              {/* TAB 1: PAYOS / VIETQR (MBBANK) */}
              {paymentTab === 'vietqr' && (
                <div style={{
                  background: '#ffffff', border: '1.5px solid #0d9488', borderRadius: '20px', padding: '20px',
                  boxShadow: '0 8px 24px rgba(13,148,136,0.12)'
                }}>
                  {/* Status Banner + Countdown Timer */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0',
                    borderRadius: '14px', padding: '12px 16px', marginBottom: '18px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#166534'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                      <RefreshCw size={15} style={{ animation: 'spin 2s linear infinite', color: '#059669' }} />
                      <span>Trạng thái: 🟢 Đang quét đối soát 24/7</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#dc2626', background: '#ffffff', padding: '3px 10px', borderRadius: '20px', border: '1px solid #fecaca' }}>
                      <Clock size={14} />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'center'
                  }}>
                    {/* QR Code Container with Glowing Frame */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: '10px', background: '#ffffff', borderRadius: '16px',
                        border: '2px solid #0d9488', boxShadow: '0 6px 18px rgba(13,148,136,0.18)',
                        position: 'relative'
                      }}>
                        {payosLoading ? (
                          <div style={{ padding: '50px 0', color: '#0d9488', fontSize: '0.85rem', fontWeight: '700' }}>
                            <span>⏳ Đang tạo mã QR PayOS...</span>
                          </div>
                        ) : (
                          <img 
                            src={getDisplayQrUrl()} 
                            alt="Mã QR PayOS MBBank Động" 
                            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px' }} 
                          />
                        )}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#475569', display: 'block', marginTop: '8px', fontWeight: '600' }}>
                        Quét mã bằng App MBBank / Vietcombank / Agribank / Banking Apps
                      </span>
                    </div>

                    {/* Transaction Details */}
                    <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Ngân hàng thụ hưởng: </span><br />
                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{bankName}</strong>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Số tài khoản: </span><br />
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', marginTop: '2px' }}>
                          <strong style={{ color: '#0d9488', fontSize: '1.15rem', fontFamily: 'monospace' }}>{bankAccountNo}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankAccountNo, 'stk')}
                            style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', padding: 0 }}
                            title="Sao chép STK"
                          >
                            {copiedField === 'stk' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Chủ tài khoản: </span><br />
                        <strong style={{ color: '#0f172a' }}>{bankAccountHolder}</strong>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Nội dung chuyển khoản (Bắt buộc): </span><br />
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '2px' }}>
                          <strong style={{ color: '#dc2626', fontSize: '1.05rem', fontFamily: 'monospace' }}>{transferMemo}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(transferMemo, 'memo')}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                            title="Sao chép Nội dung"
                          >
                            {copiedField === 'memo' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* PayOS Direct Checkout Button */}
                      {payosCheckoutUrl && (
                        <a
                          href={payosCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn w-full"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                            color: '#ffffff', padding: '12px 18px', borderRadius: '12px',
                            fontWeight: '800', fontSize: '0.88rem', textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(13,148,136,0.35)', width: '100%'
                          }}
                        >
                          🚀 MỞ CỔNG THANH TOÁN PAYOS (MOMO/BANK) <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOMO */}
              {paymentTab === 'momo' && (
                <div style={{
                  background: '#fdf4ff', border: '1.5px solid #f5d0fe', borderRadius: '20px', padding: '20px',
                  display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={momoQrUrl} 
                      alt="Mã QR Ví MoMo" 
                      style={{ width: '100%', borderRadius: '12px', border: '1px solid #f5d0fe', boxShadow: '0 4px 14px rgba(162,28,175,0.12)' }} 
                    />
                    <span style={{ fontSize: '0.74rem', color: '#86198f', display: 'block', marginTop: '8px', fontWeight: '700' }}>
                      Mở App MoMo quét mã QR
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span className="hero-badge" style={{ background: '#fbcfe8', color: '#9d174d', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                        Sắp ra mắt API trực tiếp (Khuyên dùng Cổng PayOS)
                      </span>
                    </div>

                    <div style={{ marginBottom: '10px', marginTop: '8px' }}>
                      <span style={{ color: '#701a75', fontSize: '0.82rem' }}>Tài khoản Ví MoMo: </span><br />
                      <strong style={{ color: '#a21caf', fontSize: '1.1rem', fontFamily: 'monospace' }}>0833830322</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy('0833830322', 'momo_stk')}
                        style={{ background: 'none', border: 'none', color: '#a21caf', cursor: 'pointer', padding: '0 0 0 8px' }}
                      >
                        {copiedField === 'momo_stk' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                      </button>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#701a75', fontSize: '0.82rem' }}>Chủ tài khoản: </span><br />
                      <strong>LƯ PHÚC</strong>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ color: '#701a75', fontSize: '0.82rem' }}>Lời nhắn MoMo: </span><br />
                      <strong style={{ color: '#dc2626', fontFamily: 'monospace' }}>{transferMemo}</strong>
                    </div>

                    <a 
                      href="https://nhantien.momo.vn/0833830322" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        display: 'inline-block', background: '#a21caf', color: '#ffffff',
                        padding: '10px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem',
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
                <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1' }}>
                      <Smartphone size={22} />
                      <strong style={{ fontSize: '1rem' }}>Thanh toán VNPay QR & Thẻ ATM / Napas</strong>
                    </div>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                      Sắp ra mắt API trực tiếp
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6', marginBottom: '14px' }}>
                    Hệ thống hỗ trợ quét mã **VNPay QR** trên ứng dụng Ngân hàng (VietinBank, VCB, BIDV, Agribank, VPBank...) hoặc thanh toán qua thẻ Napas/ATM nội địa thông qua Cổng PayOS.
                  </p>
                  {payosCheckoutUrl ? (
                    <a
                      href={payosCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: '#0284c7', color: '#ffffff', padding: '12px 20px', borderRadius: '12px',
                        fontWeight: '800', fontSize: '0.88rem', textDecoration: 'none'
                      }}
                    >
                      🚀 Thanh toán VNPay qua Cổng PayOS <ExternalLink size={16} />
                    </a>
                  ) : (
                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e0f2fe', fontSize: '0.85rem' }}>
                      <span>Nội dung chuyển khoản VNPay: </span>
                      <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{transferMemo}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CONSULTATION */}
              {paymentTab === 'consult' && (
                <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '20px', padding: '20px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.6', marginBottom: '14px' }}>
                    Bạn có thể liên hệ trực tiếp Ban Quản Trị UEH TCC qua Zalo hoặc Hotline để được tư vấn lộ trình học tập và hỗ trợ cấp quyền nhanh nhất:
                  </p>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <a
                      href="https://zalo.me/0833830322"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '12px', background: '#2563eb', color: '#ffffff', fontWeight: '800' }}
                    >
                      💬 Chat Zalo: 0833830322
                    </a>
                    <a
                      href="tel:0833830322"
                      className="btn btn-secondary"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '12px', fontWeight: '800' }}
                    >
                      📞 Gọi Hotline: 0833830322
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons for Step 2 */}
              <div style={{ marginTop: '22px', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalStep(1)}
                  style={{ flex: '1', padding: '14px', fontSize: '0.9rem', fontWeight: '700', borderRadius: '14px' }}
                >
                  ← Quay lại Sửa thông tin
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCheckPaymentStatusManual}
                  disabled={manualCheckLoading}
                  style={{
                    flex: '2', padding: '14px', fontSize: '0.95rem', fontWeight: '800', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {manualCheckLoading ? (
                    <span>⏳ Đang kiểm tra đối soát...</span>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>XÁC NHẬN ĐÃ CHUYỂN KHOẢN (KIỂM TRA NGAY)</span>
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
