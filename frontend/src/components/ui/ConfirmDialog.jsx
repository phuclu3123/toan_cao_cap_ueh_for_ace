import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * Accessible ConfirmDialog modal with Escape listener and focus management.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  variant = 'danger', // 'danger' | 'warning' | 'primary' | 'success'
  isLoading = false
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Auto-focus confirm or cancel button
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: { icon: AlertTriangle, color: 'var(--accent-rose, #ef4444)' },
    warning: { icon: AlertCircle, color: '#f59e0b' },
    primary: { icon: HelpCircle, color: 'var(--accent-teal, #0f766e)' },
    success: { icon: CheckCircle2, color: 'var(--accent-emerald, #10b981)' }
  };

  const currentIcon = iconConfig[variant] || iconConfig.primary;
  const IconComponent = currentIcon.icon;

  return createPortal(
    <div
      className="modal-backdrop-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="confirm-dialog-card glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
        >
          <X size={18} />
        </button>

        <div className="confirm-dialog-header">
          <div className="confirm-icon-wrap" style={{ color: currentIcon.color, backgroundColor: `${currentIcon.color}18` }}>
            <IconComponent size={24} />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
            <p className="confirm-dialog-message">{message}</p>
          </div>
        </div>

        <div className="confirm-dialog-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
