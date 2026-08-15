import { WifiOff, AlertTriangle, FileX, ShieldAlert, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../assets/styles/community.css';

/**
 * Universal ErrorState component.
 * Variants: 'offline', 'not-found', 'forbidden', 'server-error'
 */
export default function ErrorState({
  variant = 'server-error',
  title,
  message,
  onRetry,
  retryLabel = 'Thử lại'
}) {
  const configs = {
    offline: {
      icon: WifiOff,
      title: 'Mất kết nối mạng Internet',
      msg: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền Wifi/4G của bạn.',
      color: '#f59e0b'
    },
    'not-found': {
      icon: FileX,
      title: 'Bài toán hoặc nội dung không tồn tại',
      msg: 'Bài viết này có thể đã bị tác giả xóa hoặc đường dẫn bạn truy cập không chính xác.',
      color: '#6366f1'
    },
    forbidden: {
      icon: ShieldAlert,
      title: 'Không có quyền thao tác',
      msg: 'Bạn cần đăng nhập bằng tài khoản có quyền truy cập để thực hiện thao tác này.',
      color: '#ef4444'
    },
    'server-error': {
      icon: AlertTriangle,
      title: 'Đã xảy ra sự cố khi tải dữ liệu',
      msg: 'Hệ thống đang gặp gián đoạn tạm thời. Vui lòng thử lại sau vài giây.',
      color: '#ef4444'
    }
  };

  const current = configs[variant] || configs['server-error'];
  const IconComponent = current.icon;

  return (
    <div className="error-state-card" role="alert" aria-live="assertive">
      <div className="error-state-icon-wrap" style={{ color: current.color, backgroundColor: `${current.color}15` }}>
        <IconComponent size={42} />
      </div>

      <h3 className="error-state-title">{title || current.title}</h3>
      <p className="error-state-desc">{message || current.msg}</p>

      <div className="error-state-actions">
        {onRetry && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRetry}
          >
            <RotateCcw size={16} />
            {retryLabel}
          </button>
        )}

        <Link to="/community" className="btn btn-secondary">
          <Home size={16} />
          Về Diễn đàn Toán học
        </Link>
      </div>
    </div>
  );
}
