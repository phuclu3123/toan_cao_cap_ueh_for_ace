import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { apiFetch, readApiJson } from '../utils/apiClient';
import { downloadOrderReceipt } from '../services/courseCommerceService';
import { useAuth } from '../contexts/AuthContext';
import { useCheckoutSessions } from '../contexts/CheckoutSessionContext';
import { notifyCourseAccessChanged } from '../services/courseAccessService';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const returnedAsCancelled = searchParams.get('cancelled') === '1';
  const { currentUser } = useAuth();
  return <PaymentResultContent key={`${currentUser?.id || 'guest'}:${orderCode}`} orderCode={orderCode} returnedAsCancelled={returnedAsCancelled} />;
}

function PaymentResultContent({ orderCode, returnedAsCancelled }) {
  const { syncUserFromBackend } = useAuth();
  const { trackOrder } = useCheckoutSessions();
  const [payment, setPayment] = useState(null);
  const [viewState, setViewState] = useState(orderCode ? 'checking' : 'invalid');
  const [message, setMessage] = useState('');
  const checkInFlightRef = useRef(false);

  const checkPayment = useCallback(async () => {
    if (!orderCode || checkInFlightRef.current) return;
    checkInFlightRef.current = true;

    try {
      const payload = await readApiJson(await apiFetch(`/api/orders/${encodeURIComponent(orderCode)}`, { signal: AbortSignal.timeout(12_000) }));
      const currentPayment = payload.data || {};
      setPayment(currentPayment);
      trackOrder(currentPayment);

      if (currentPayment.entitlement?.allowed) {
        notifyCourseAccessChanged(currentPayment.courseId);
        setViewState('success');
        setMessage('');
      } else if (currentPayment.status === 'PAID' && currentPayment.entitlement?.reason === 'REVOKED') {
        setViewState('error');
        setMessage('Đơn đã thanh toán nhưng quyền học đang bị admin thu hồi. Liên hệ luphuc321@gmail.com kèm mã đơn để được xử lý; không cần mua lại.');
      } else if (currentPayment.status === 'FAILED') {
        setViewState('failed');
      } else if (currentPayment.status === 'CANCELLED') {
        setViewState('cancelled');
      } else {
        setViewState('pending');
      }
    } catch (error) {
      if (error.status === 401) {
        const verifiedUser = await syncUserFromBackend();
        setViewState(verifiedUser ? 'error' : 'auth');
        setMessage(verifiedUser
          ? 'Chưa xác minh được phiên thanh toán. Vui lòng thử lại.'
          : 'Vui lòng đăng nhập đúng tài khoản đã tạo đơn để kiểm tra quyền học.');
      } else if (error.status === 403) {
        setViewState('auth');
        setMessage('Đơn hàng này không thuộc tài khoản đang đăng nhập.');
      } else {
        setViewState('error');
        setMessage(error.message);
      }
    } finally {
      checkInFlightRef.current = false;
    }
  }, [orderCode, syncUserFromBackend, trackOrder]);

  useEffect(() => {
    const initialCheck = window.setTimeout(checkPayment, 0);
    return () => window.clearTimeout(initialCheck);
  }, [checkPayment]);

  useEffect(() => {
    if (!orderCode || !['checking', 'pending'].includes(viewState)) return undefined;
    const interval = window.setInterval(checkPayment, 3000);
    return () => window.clearInterval(interval);
  }, [checkPayment, orderCode, viewState]);

  const content = {
    invalid: {
      icon: <AlertCircle size={42} />,
      title: 'Thiếu mã đơn hàng',
      description: 'Liên kết trả về từ PayOS không chứa mã đơn hợp lệ.'
    },
    checking: {
      icon: <Loader2 size={42} className="spinner" />,
      title: 'Đang đối soát với PayOS',
      description: 'Hệ thống đang xác nhận giao dịch và quyền học từ backend.'
    },
    pending: {
      icon: <Clock3 size={42} />,
      title: returnedAsCancelled ? 'Thanh toán chưa hoàn tất' : 'Đang chờ PayOS xác nhận',
      description: returnedAsCancelled
        ? 'Bạn đã quay lại trước khi hoàn tất giao dịch. Không có quyền học nào được mở từ liên kết này.'
        : 'Nếu bạn vừa thanh toán, vui lòng giữ trang này mở trong giây lát.'
    },
    success: {
      icon: <CheckCircle size={42} />,
      title: 'Quyền học đã được kích hoạt',
      description: 'Backend đã xác nhận thanh toán và cấp quyền cho đúng tài khoản của bạn.'
    },
    failed: {
      icon: <AlertCircle size={42} />,
      title: 'Không thể xác nhận giao dịch',
      description: 'PayOS chưa xác nhận đúng thông tin đơn. Vui lòng liên hệ hỗ trợ và cung cấp mã đơn.'
    },
    cancelled: {
      icon: <AlertCircle size={42} />,
      title: 'Giao dịch đã hủy',
      description: 'Đơn chưa được thanh toán và chưa mở quyền học.'
    },
    auth: {
      icon: <ShieldCheck size={42} />,
      title: 'Cần xác thực tài khoản',
      description: message
    },
    error: {
      icon: <AlertCircle size={42} />,
      title: 'Chưa thể kiểm tra đơn hàng',
      description: message || 'Vui lòng thử lại sau.'
    }
  }[viewState];

  const isSuccess = viewState === 'success';

  return (
    <div style={{ minHeight: '76vh', padding: '150px 20px 90px', background: '#f6f5ef' }}>
      <div
        style={{
          width: 'min(620px, 100%)',
          margin: '0 auto',
          padding: '38px clamp(22px, 5vw, 44px)',
          textAlign: 'center',
          borderRadius: 28,
          border: '1px solid #dedfd8',
          background: '#fffdf8',
          boxShadow: '0 24px 70px rgba(23, 54, 43, .10)'
        }}
      >
        <span
          style={{
            width: 82,
            height: 82,
            margin: '0 auto 20px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            color: isSuccess ? '#176c50' : '#9a6c2e',
            background: isSuccess ? '#e7f4eb' : '#f6eee0'
          }}
        >
          {content.icon}
        </span>
        <div style={{ color: '#7e725c', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          PayOS · Đơn {orderCode || 'không xác định'}
        </div>
        <h1 style={{ margin: '9px 0 10px', color: '#14251f', fontSize: 'clamp(25px, 5vw, 36px)' }}>
          {content.title}
        </h1>
        <p style={{ maxWidth: 480, margin: '0 auto', color: '#63716b', lineHeight: 1.7 }}>
          {content.description}
        </p>

        {payment?.status && (
          <div style={{ margin: '22px auto 0', padding: '12px 16px', borderRadius: 13, background: '#f2f4ef', color: '#4f635b', fontSize: 13 }}>
            Trạng thái máy chủ: <strong>{payment.status}</strong>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 26 }}>
          {isSuccess && payment?.courseId ? (
            <Link to={`/course/${payment.courseId}`} className="btn btn-primary">
              Vào khóa học
            </Link>
          ) : (
            <button type="button" onClick={checkPayment} className="btn btn-primary">
              <RefreshCw size={16} /> Kiểm tra lại
            </button>
          )}
          <Link to="/courses" className="btn btn-secondary">
            Xem các khóa học
          </Link>
          {payment?.orderCode && <button type="button" className="btn btn-secondary" onClick={() => downloadOrderReceipt(payment.orderCode).catch(failure => setMessage(failure.message))}>Tải xác nhận & điều khoản</button>}
        </div>
        {message && <p role="status" style={{ marginTop: 16, color: '#63716b' }}>{message}</p>}
      </div>
    </div>
  );
}
