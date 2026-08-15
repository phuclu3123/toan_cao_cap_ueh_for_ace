import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flag, X, CheckCircle2 } from 'lucide-react';
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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      setDetail('');
      setReason('math_error');
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const reasons = [
    { id: 'math_error', label: '⚠️ Sai lệch kiến thức Toán học / Lời giải sai nghiêm trọng' },
    { id: 'spam', label: '🚫 Spam / Quảng cáo thương mại / Đăng bài trùng lặp' },
    { id: 'inappropriate', label: '🚯 Ngôn từ xúc phạm, thiếu văn hóa học đường' },
    { id: 'wrong_category', label: '📌 Đăng sai chuyên mục môn học / Sai yêu cầu' },
    { id: 'other', label: '📝 Lý do khác' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ reason, detail: detail.trim() });
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
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
      <div className="report-modal-card glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Đóng modal"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="report-success-view">
            <CheckCircle2 size={48} className="report-success-icon" />
            <h3 className="report-modal-title">Cảm ơn bạn đã báo cáo!</h3>
            <p className="report-modal-desc">
              Ban Cố vấn & Quản trị viên UEH TCC sẽ kiểm duyệt nội dung này trong thời gian sớm nhất để giữ gìn môi trường học tập chất lượng.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="report-modal-header">
              <div className="report-icon-wrap">
                <Flag size={22} />
              </div>
              <div>
                <h3 id="report-modal-title" className="report-modal-title">Báo cáo vi phạm</h3>
                <p className="report-modal-target">Đối tượng: <strong>{contentTitle.slice(0, 50)}...</strong></p>
              </div>
            </div>

            <div className="report-form-group">
              <label className="form-label">Chọn lý do báo cáo:</label>
              <div className="report-reasons-list">
                {reasons.map((r) => (
                  <label key={r.id} className="report-reason-item">
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="report-form-group">
              <label className="form-label" htmlFor="report-detail">Mô tả thêm chi tiết (tùy chọn):</label>
              <textarea
                id="report-detail"
                className="form-input form-textarea"
                rows={3}
                placeholder="VD: Lời giải tại bước 2 tính sai đạo hàm riêng f'_x..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
            </div>

            <div className="report-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary">
                Gửi báo cáo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
