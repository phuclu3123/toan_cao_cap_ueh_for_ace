import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flag, X, CheckCircle2, Check, AlertTriangle, Send } from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * ReportContentModal component for reporting academic or community violations.
 */
export default function ReportContentModal({
  isOpen,
  onClose,
  onSubmit,
  contentTitle = 'Nội dung này'
}) {
  const [reason, setReason] = useState('math_error');
  const [detail, setDetail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      setDetail('');
      setReason('math_error');
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const reasons = [
    {
      id: 'math_error',
      icon: '⚠️',
      title: 'Sai lệch kiến thức Toán học',
      desc: 'Công thức toán, lý thuyết hoặc các bước biến đổi sai nghiêm trọng'
    },
    {
      id: 'spam',
      icon: '🚫',
      title: 'Spam & Quảng cáo',
      desc: 'Quảng cáo thương mại, nội dung trùng lặp hoặc tin rác'
    },
    {
      id: 'inappropriate',
      icon: '🚯',
      title: 'Ngôn từ không phù hợp',
      desc: 'Xúc phạm, thiếu văn hóa học đường hoặc gây công kích'
    },
    {
      id: 'wrong_category',
      icon: '📌',
      title: 'Sai chuyên mục / Không đúng yêu cầu',
      desc: 'Đăng sai môn học, đề bài mờ hoặc thiếu thông tin quan trọng'
    },
    {
      id: 'other',
      icon: '📝',
      title: 'Lý do khác',
      desc: 'Các vấn đề vi phạm khác cần Ban Quản trị hỗ trợ'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit({ reason, detail: detail.trim() });
      }
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi báo cáo lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="report-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="report-modal-close-btn"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="report-success-view">
            <div className="report-success-icon-wrap">
              <CheckCircle2 size={44} className="report-success-icon" />
            </div>
            <h3 className="report-success-title">Cảm ơn bạn đã gửi báo cáo!</h3>
            <p className="report-success-desc">
              Ban Cố vấn & Quản trị viên UEH TCC sẽ kiểm duyệt nội dung này trong thời gian sớm nhất để bảo đảm môi trường học thuật chất lượng.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-modal-form">
            <div className="report-modal-header">
              <div className="report-badge-icon">
                <Flag size={20} />
              </div>
              <div className="report-header-text">
                <h3 id="report-modal-title" className="report-modal-title">Báo cáo vi phạm</h3>
                <p className="report-modal-subtitle">Góp phần xây dựng diễn đàn Toán học UEH trong sạch & chuẩn mực</p>
              </div>
            </div>

            {/* Target snippet quote preview */}
            <div className="report-target-preview">
              <span className="report-target-label">Đối tượng báo cáo:</span>
              <p className="report-target-content">
                &ldquo;{contentTitle.slice(0, 90)}{contentTitle.length > 90 ? '...' : ''}&rdquo;
              </p>
            </div>

            <div className="report-form-section">
              <label className="report-section-label">
                <AlertTriangle size={14} />
                <span>Chọn lý do báo cáo:</span>
              </label>
              
              <div className="report-reasons-vertical-list" role="radiogroup">
                {reasons.map((r) => {
                  const isSelected = reason === r.id;
                  return (
                    <label
                      key={r.id}
                      className={`report-reason-card ${isSelected ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.id}
                        checked={isSelected}
                        onChange={(e) => setReason(e.target.value)}
                        className="report-radio-input"
                      />
                      <span className="report-reason-emoji">{r.icon}</span>
                      <div className="report-reason-info">
                        <span className="report-reason-title">{r.title}</span>
                        <span className="report-reason-desc">{r.desc}</span>
                      </div>
                      <span className={`report-check-circle ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="report-form-section">
              <label className="report-section-label" htmlFor="report-detail-input">
                <span>Mô tả thêm chi tiết (tùy chọn):</span>
              </label>
              <textarea
                id="report-detail-input"
                className="report-textarea-input"
                rows={3}
                placeholder="VD: Lời giải tại bước 2 tính sai ma trận phụ hợp, hoặc link spam không liên quan..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                maxLength={500}
              />
              <span className="report-char-count">{detail.length}/500 ký tự</span>
            </div>

            <div className="report-modal-footer">
              {error && <div className="form-error-msg" role="alert">{error}</div>}
              <button type="button" className="report-btn report-btn-cancel" onClick={onClose}>
                Hủy bỏ
              </button>
              <button type="submit" className="report-btn report-btn-submit" disabled={isSubmitting}>
                <Send size={15} />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
