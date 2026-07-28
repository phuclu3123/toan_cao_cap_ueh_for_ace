import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle, ShieldCheck, QrCode, Copy, 
  PhoneCall, MessageSquare, Sparkles, ArrowRight, 
  CreditCard, Check, User, Mail, Phone, Lock, ChevronRight, Wallet, Smartphone, ExternalLink, RefreshCw
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

  // Payment Tab: 'vietqr' | 'momo' | 'vnpay' | 'consult'
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
  const bankName = 'MBBank (Ngân hàng Quân Đội - VietQR Pro)';
  const bankAccountNo = '08092006192939';
  const bankAccountHolder = 'LU VO HOANG PHUC';
  const cleanPhone = learnerPhone.replace(/[^0-9]/g, '').slice(-10) || '0833830322';
  const transferMemo = `TCC ${cleanPhone} K50`;

  // Fallback VietQR Compact URL
  const fallbackVietQrUrl = `https://img.vietqr.io/image/MB-08092006192939-compact2.png?amount=${finalPrice}&addInfo=${encodeURIComponent(transferMemo)}&accountName=LU%20VO%20HOANG%20PHUC`;

  // MoMo QR Code URL
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`2|99|0833830322|LU PHUC|luphuc321@gmail.com|0|0|${finalPrice}|${transferMemo}`)}`;

  // Function to create Real PayOS Payment Link
  const handleCreatePayOSPayment = async () => {
    if (course.isFree || finalPrice <= 0) return;

    setPayosLoading(true);
    setPayosError('');

    // Generate unique numeric orderCode (max 6-8 digits for PayOS)
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
        console.warn('PayOS API response note:', data);
        setPayosError(data.message || 'Chưa khởi tạo được link PayOS trực tiếp, đã tự động chuyển sang VietQR MBBank Pro.');
      }
    } catch (err) {
      console.error('Lỗi khởi tạo PayOS payment:', err);
      setPayosError('Không thể kết nối đến máy chủ PayOS. Đã chuyển sang mã VietQR MBBank mặc định.');
    } finally {
      setPayosLoading(false);
    }
  };

  // Trigger PayOS creation when modal opens or when price changes
  useEffect(() => {
    if (isOpen && !course.isFree && finalPrice > 0 && !payosCheckoutUrl && !payosLoading) {
      handleCreatePayOSPayment();
    }
  }, [isOpen, finalPrice]);

  // Real-Time Status Polling (Every 3 Seconds)
  useEffect(() => {
    let pollingInterval = null;

    if (payosOrderCode && paymentStatus === 'PENDING' && !isCompleted) {
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/payments/${payosOrderCode}`);
          const resData = await res.json().catch(() => ({}));

          if (res.ok && resData.data && resData.data.status === 'PAID') {
            setPaymentStatus('PAID');
            clearInterval(pollingInterval);
            handleMarkCompleted();
          }
        } catch (err) {
          console.warn('Polling status error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [payosOrderCode, paymentStatus, isCompleted]);

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

  const handleConfirmEnrollment = async (e) => {
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

    setIsSubmitting(true);

    try {
      await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: learnerName.trim(),
          email: learnerEmail.trim(),
          subject: `[ĐĂNG KÝ KHÓA HỌC] ${course.title}`,
          message: `Thông tin đăng ký:\n- Khóa học: ${course.title} (${course.id})\n- Mã đơn PayOS: ${payosOrderCode || 'TCC-' + Date.now()}\n- Số điện thoại: ${learnerPhone.trim()}\n- Giá thanh toán: ${formattedFinalPrice}\n- Phương thức: ${paymentTab.toUpperCase()}\n- Ghi chú: ${note}`
        })
      }).catch(() => {});

      handleMarkCompleted();
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setIsSubmitting(false);
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
          maxWidth: '680px', width: '100%', maxHeight: '92vh',
          borderRadius: '24px', padding: '0', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', background: '#ffffff',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header Banner (Fixed Header) */}
        <div className="enroll-modal-header" style={{
          background: 'linear-gradient(135deg, #0e4e35 0%, #176b4a 60%, #063121 100%)',
          padding: '24px 28px', color: '#ffffff', position: 'relative', flexShrink: 0
        }}>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            style={{
              color: '#ffffff', background: 'rgba(255,255,255,0.18)',
              top: '18px', right: '18px', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src={course.image} 
              alt={course.title} 
              style={{ width: '76px', height: '58px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            <div>
              <span className="hero-badge" style={{ background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                ĐĂNG KÝ KHÓA HỌC UEH TCC
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '4px 0 2px', color: '#ffffff' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Kích hoạt tài khoản & mở khóa toàn bộ bài học video HD 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body (Scrollable Content Container) */}
        <div style={{ padding: '24px 28px 36px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {isCompleted ? (
            /* SUCCESS STATE */
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)', border: '3px solid #10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#10b981'
              }}>
                <CheckCircle size={40} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Thanh Toán & Đăng Ký Thành Công!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Hệ thống đã xác nhận thanh toán đơn hàng <strong>{learnerName || 'Học viên'}</strong>.<br />
                Mã giao dịch PayOS: <strong style={{ color: '#0d9488', fontFamily: 'monospace' }}>#{payosOrderCode || Date.now()}</strong>
              </p>

              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px',
                padding: '16px 20px', textAlign: 'left', marginBottom: '24px', fontSize: '0.9rem', color: '#166534'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
                  <ShieldCheck size={18} />
                  <span>Quyền lợi đã được tự động mở khóa:</span>
                </div>
                <ul style={{ paddingLeft: '22px', margin: 0, lineHeight: '1.6' }}>
                  <li>Đã tự động kích hoạt full bài học video & đề thi cho tài khoản của bạn.</li>
                  <li>Ban Quản Trị UEH TCC đã nhận thông tin qua Zalo/Phone ({learnerPhone || 'Học viên'}).</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={onClose}
                style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
              >
                ▶ VÀO HỌC NGAY BÂY GIỜ
              </button>
            </div>
          ) : (
            /* ENROLLMENT FORM & PAYMENT FLOW */
            <form onSubmit={handleConfirmEnrollment}>
              {/* Step 1: Student Information */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} className="text-teal" /> 1. Thông Tin Học Viên
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Họ và tên *</label>
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
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Địa chỉ Email nhận bài học *</label>
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

              {/* Step 2: Voucher & Pricing summary */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '16px 20px', marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Học phí gốc:</span>
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

              {/* Step 3: Payment Method Selection */}
              {!course.isFree && (
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={16} className="text-teal" /> 2. Chọn Phương Thức Thanh Toán
                  </h4>

                  {/* Payment Grid Buttons */}
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

                  {/* TAB 1: PAYOS / VIETQR (MBBANK) */}
                  {paymentTab === 'vietqr' && (
                    <div style={{
                      background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '18px'
                    }}>
                      {/* Live Polling Status Indicator */}
                      <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
                        padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', fontSize: '0.82rem', color: '#166534'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                          <RefreshCw size={14} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
                          <span>Trạng thái: 🟡 Đang chờ thanh toán (Tự động mở khóa 24/7)</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#0d9488', fontFamily: 'monospace' }}>
                          #{payosOrderCode || 'MBBank'}
                        </span>
                      </div>

                      <div style={{
                        display: 'grid', gridTemplateColumns: '170px 1fr', gap: '18px', alignItems: 'center'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          {payosLoading ? (
                            <div style={{ padding: '40px 0', color: '#0d9488', fontSize: '0.85rem' }}>
                              <span>⏳ Đang tạo QR PayOS...</span>
                            </div>
                          ) : (
                            <img 
                              src={payosQrCode || fallbackVietQrUrl} 
                              alt="Mã QR PayOS MBBank" 
                              style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
                            />
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                            Quét mã bằng App MBBank / VCB / Agribank / Banking Apps
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

                          {payosCheckoutUrl && (
                            <a
                              href={payosCheckoutUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                                color: '#ffffff', padding: '10px 16px', borderRadius: '12px',
                                fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(13,148,136,0.3)'
                              }}
                            >
                              🚀 MỞ CỔNG THANH TOÁN TỰ ĐỘNG PAYOS <ExternalLink size={14} />
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
                          style={{ width: '100%', borderRadius: '12px', border: '1px solid #f5d0fe', boxShadow: '0 4px 12px rgba(162,28,175,0.1)' }} 
                        />
                        <span style={{ fontSize: '0.72rem', color: '#86198f', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                          Mở App MoMo quét mã QR
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <div style={{ marginBottom: '6px' }}>
                          <span className="hero-badge" style={{ background: '#fbcfe8', color: '#9d174d', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                            Sắp ra mắt API trực tiếp (Dùng Cổng PayOS)
                          </span>
                        </div>

                        <div style={{ marginBottom: '8px', marginTop: '6px' }}>
                          <span style={{ color: '#701a75' }}>Tài khoản MoMo: </span>
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
                          <span style={{ color: '#701a75' }}>Tên người nhận: </span>
                          <strong>LƯ PHÚC</strong>
                        </div>

                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#701a75' }}>Lời nhắn MoMo: </span>
                          <strong style={{ color: '#dc2626', fontFamily: 'monospace' }}>{transferMemo}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(transferMemo, 'momo_memo')}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                          >
                            {copiedField === 'momo_memo' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          </button>
                        </div>

                        <a 
                          href="https://nhantien.momo.vn/0833830322" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn"
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1' }}>
                          <Smartphone size={20} />
                          <strong style={{ fontSize: '0.95rem' }}>Thanh toán VNPay QR & Thẻ ATM / Napas</strong>
                        </div>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                          Sắp ra mắt API trực tiếp
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', marginBottom: '12px' }}>
                        Hệ thống chấp nhận quét mã **VNPay QR** trên ứng dụng Ngân hàng (VietinBank, VCB, BIDV, Agribank, VPBank...) hoặc thanh toán qua thẻ Napas/ATM nội địa thông qua Cổng PayOS.
                      </p>
                      {payosCheckoutUrl ? (
                        <a
                          href={payosCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#0284c7', color: '#ffffff', padding: '10px 16px', borderRadius: '12px',
                            fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none'
                          }}
                        >
                          🚀 Thanh toán VNPay qua Cổng PayOS <ExternalLink size={14} />
                        </a>
                      ) : (
                        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0f2fe', fontSize: '0.82rem' }}>
                          <span>Nội dung chuyển khoản VNPay: </span>
                          <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{transferMemo}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: CONSULTATION */}
                  {paymentTab === 'consult' && (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '18px' }}>
                      <p style={{ fontSize: '0.88rem', color: '#1e3a8a', lineHeight: '1.6', marginBottom: '12px' }}>
                        Bạn có thể liên hệ trực tiếp Ban Quản Trị UEH TCC qua Zalo hoặc Hotline để được tư vấn lộ trình học tập và hỗ trợ cấp quyền nhanh nhất:
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <a
                          href="https://zalo.me/0833830322"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '10px', background: '#2563eb', color: '#ffffff' }}
                        >
                          💬 Chat Zalo: 0833830322
                        </a>
                        <a
                          href="tel:0833830322"
                          className="btn btn-secondary"
                          style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '10px' }}
                        >
                          📞 Gọi Hotline: 0833830322
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Note input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Ghi chú bổ sung (Tùy chọn)</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Yêu cầu khác hoặc thắc mắc cần hỗ trợ..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Submit Button (Always Visible at bottom of scrollable area) */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
                style={{
                  padding: '14px 24px', fontSize: '1rem', fontWeight: '800', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)', cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {isSubmitting ? (
                  <span>⌛ Đang xử lý đăng ký...</span>
                ) : course.isFree ? (
                  <span>🚀 KÍCH HOẠT HỌC MIỄN PHÍ NGAY</span>
                ) : (
                  <span>XÁC NHẬN ĐĂNG KÝ HỌC VIÊN</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
