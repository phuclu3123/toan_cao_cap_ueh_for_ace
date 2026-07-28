import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle, ShieldCheck, QrCode, Copy, 
  PhoneCall, MessageSquare, Sparkles, ArrowRight, 
  CreditCard, Check, User, Mail, Phone, Lock, ChevronRight
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

  // Payment Tab & Flow States
  const [paymentTab, setPaymentTab] = useState('qr'); // 'qr' | 'consult'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [copiedField, setCopiedField] = useState('');

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

  // Extract raw numeric price for QR generation
  const parseNumericPrice = (priceStr) => {
    if (!priceStr) return 0;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const rawPrice = parseNumericPrice(course.discountPrice || course.originalPrice);
  const finalPrice = voucherApplied ? Math.max(0, rawPrice - voucherDiscount) : rawPrice;
  const formattedFinalPrice = finalPrice > 0 ? `${finalPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí';

  // Bank transfer info
  const bankName = 'MBBank (Ngân hàng Quân Đội)';
  const bankAccountNo = '033830322';
  const bankAccountHolder = 'LU PHUC';
  const transferMemo = `TCC ${course.id?.toUpperCase() || 'KH'} ${learnerPhone.trim() || '0833830322'}`;

  // VietQR URL
  const vietQrUrl = `https://img.vietqr.io/image/MB-033830322-compact2.png?amount=${finalPrice}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(bankAccountHolder)}`;

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
    const newOrderCode = `TCC-ORD-${Date.now().toString().slice(-6)}`;
    setOrderCode(newOrderCode);

    try {
      // Send registration to backend contact/payment route if available
      await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: learnerName.trim(),
          email: learnerEmail.trim(),
          subject: `[ĐĂNG KÝ KHÓA HỌC] ${course.title}`,
          message: `Thông tin đăng ký:\n- Khóa học: ${course.title} (${course.id})\n- Mã đơn hàng: ${newOrderCode}\n- Số điện thoại: ${learnerPhone.trim()}\n- Giá thanh toán: ${formattedFinalPrice}\n- Phương thức: ${paymentTab === 'qr' ? 'Chuyển khoản QR' : 'Tư vấn trực tiếp'}\n- Ghi chú: ${note}`
        })
      }).catch(() => {});

      // Mark course as enrolled in localStorage
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
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay enrollment-modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel enrollment-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%', borderRadius: '24px', padding: '0', overflow: 'hidden' }}
      >
        {/* Header Banner */}
        <div className="enroll-modal-header" style={{
          background: 'linear-gradient(135deg, #0e4e35 0%, #176b4a 60%, #063121 100%)',
          padding: '28px 28px 24px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            style={{ color: '#ffffff', background: 'rgba(255,255,255,0.15)', top: '20px', right: '20px' }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src={course.image} 
              alt={course.title} 
              style={{ width: '80px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            <div>
              <span className="hero-badge" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                LUỒNG ĐĂNG KÝ HỌC VIÊN
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '6px 0 2px', color: '#ffffff' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Kích hoạt tài khoản & mở khóa toàn bộ bài học video HD 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px 28px', maxHeight: '78vh', overflowY: 'auto' }}>
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
                Đăng Ký Khóa Học Thành Công!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Hệ thống đã ghi nhận đơn đăng ký của học viên <strong>{learnerName}</strong>.<br />
                Mã xác thực đơn hàng: <strong style={{ color: '#0d9488', fontFamily: 'monospace' }}>{orderCode}</strong>
              </p>

              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px',
                padding: '16px 20px', textAlign: 'left', marginBottom: '24px', fontSize: '0.9rem', color: '#166534'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
                  <ShieldCheck size={18} />
                  <span>Quyền lợi đã được kích hoạt:</span>
                </div>
                <ul style={{ paddingLeft: '22px', margin: 0, lineHeight: '1.6' }}>
                  <li>Đã tự động mở khóa full toàn bộ bài học và video giảng dạy.</li>
                  <li>Ban Quản Trị UEH TCC sẽ gửi thông tin hỗ trợ qua Zalo/Phone ({learnerPhone}).</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={onClose}
                style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
              >
                ▶ BẮT ĐẦU HỌC NGAY BÂY GIỜ
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

                {/* Voucher Code Box */}
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
                    <CreditCard size={16} className="text-teal" /> 2. Phương Thức Đăng Ký & Thanh Toán
                  </h4>

                  {/* Payment Tabs */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentTab('qr')}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: paymentTab === 'qr' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        background: paymentTab === 'qr' ? '#f0fdf4' : '#ffffff', color: paymentTab === 'qr' ? '#0f766e' : '#64748b',
                        fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <QrCode size={16} /> Chuyển Khoản QR / VietQR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentTab('consult')}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: paymentTab === 'consult' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        background: paymentTab === 'consult' ? '#f0fdf4' : '#ffffff', color: paymentTab === 'consult' ? '#0f766e' : '#64748b',
                        fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <PhoneCall size={16} /> Tư Vấn Trực Tiếp (Zalo)
                    </button>
                  </div>

                  {paymentTab === 'qr' ? (
                    <div style={{
                      background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '18px',
                      display: 'grid', gridTemplateColumns: '170px 1fr', gap: '18px', alignItems: 'center'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <img 
                          src={vietQrUrl} 
                          alt="Mã QR Chuyển khoản" 
                          style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
                        />
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                          Quét mã bằng App Ngân hàng / MoMo
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Ngân hàng: </span>
                          <strong>{bankName}</strong>
                        </div>

                        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b' }}>Số tài khoản: </span>
                          <strong style={{ color: '#0d9488', fontSize: '1rem', fontFamily: 'monospace' }}>{bankAccountNo}</strong>
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px' }}>
                      <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', marginBottom: '12px' }}>
                        Bạn có thể liên hệ trực tiếp Ban Quản Trị UEH TCC qua Zalo hoặc Hotline để được giải đáp thắc mắc và cấp tài khoản học nhanh nhất:
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <a
                          href="https://zalo.me/0833830322"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '10px' }}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
                style={{
                  padding: '14px 24px', fontSize: '1rem', fontWeight: '800', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
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
