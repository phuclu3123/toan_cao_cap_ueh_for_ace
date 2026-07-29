import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  CircleUserRound,
  KeyRound,
  Lock,
  Mail,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  User,
  X
} from 'lucide-react';
import '../../assets/styles/AuthModal.css';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function AuthModal({
  showLoginModal,
  setShowLoginModal,
  authMode,
  setAuthMode,
  authError,
  setAuthError,
  authSuccessMsg,
  setAuthSuccessMsg,
  username,
  setUsername,
  password,
  setPassword,
  signupName,
  setSignupName,
  signupUsername,
  setSignupUsername,
  signupPassword,
  setSignupPassword,
  signupConfirmPassword,
  setSignupConfirmPassword,
  forgotEmail,
  setForgotEmail,
  forgotLoading,
  forgotStep,
  setForgotStep,
  forgotOtp,
  setForgotOtp,
  forgotNewPassword,
  setForgotNewPassword,
  forgotConfirmNewPassword,
  setForgotConfirmNewPassword,
  phoneInput,
  setPhoneInput,
  verificationCode,
  setVerificationCode,
  isOtpSent,
  setIsOtpSent,
  otpLoading,
  setConfirmationResult,
  handleLoginSubmit,
  handleGoogleLogin,
  handleGithubLogin,
  handleSignupSubmit,
  handleForgotPasswordSubmit,
  handleResetPasswordSubmit,
  handleSendOtp,
  handleVerifyOtp
}) {
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const closeModal = useCallback(() => {
    setShowLoginModal(false);
  }, [setShowLoginModal]);

  useEffect(() => {
    if (!showLoginModal) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusInitialControl = () => {
      const panel = panelRef.current;
      const initialControl = panel?.querySelector('[data-auth-autofocus]');
      (initialControl || panel)?.focus({ preventScroll: true });
    };
    const focusFrame = window.requestAnimationFrame(focusInitialControl);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const controls = Array.from(panelRef.current.querySelectorAll(focusableSelector))
        .filter((element) => element.getClientRects().length > 0);
      if (controls.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const previousControl = previouslyFocusedRef.current;
      if (previousControl && document.contains(previousControl)) {
        window.requestAnimationFrame(() => previousControl.focus({ preventScroll: true }));
      }
    };
  }, [closeModal, showLoginModal]);

  useEffect(() => {
    if (!showLoginModal) return undefined;
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector('[data-auth-autofocus]')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [authMode, forgotStep, isOtpSent, showLoginModal]);

  if (!showLoginModal) return null;

  const setMode = (nextMode) => {
    setAuthMode(nextMode);
    setAuthError('');
    setAuthSuccessMsg('');
  };

  const modalHeading = authMode === 'signup'
    ? 'Tạo tài khoản học tập'
    : authMode === 'forgot'
      ? forgotStep === 1
        ? 'Khôi phục mật khẩu'
        : 'Xác nhận mã OTP'
      : authMode === 'phone'
        ? 'Đăng nhập bằng số điện thoại'
        : 'Chào mừng bạn trở lại';

  const modalDescription = authMode === 'signup'
    ? 'Tạo một tài khoản để lưu khóa học và tiến độ của bạn.'
    : authMode === 'forgot'
      ? forgotStep === 1
        ? 'Nhập email đã đăng ký để nhận mã OTP gồm 6 chữ số.'
        : 'Nhập mã OTP trong email và đặt mật khẩu mới cho tài khoản.'
      : authMode === 'phone'
        ? isOtpSent
          ? 'Nhập mã OTP gồm 6 chữ số vừa được gửi đến điện thoại.'
          : 'Dùng số điện thoại đã liên kết với tài khoản của bạn.'
        : 'Tiếp tục hành trình học Toán Cao Cấp trên UEH TCC.';

  return createPortal(
    <div
      className="auth-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        ref={panelRef}
        className={`auth-modal-panel auth-modal-${authMode}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={closeModal}
          aria-label="Đóng cửa sổ xác thực"
        >
          <X size={19} aria-hidden="true" />
        </button>

        <header className="auth-modal-header">
          <span className="auth-modal-mark" aria-hidden="true">
            {authMode === 'forgot' ? <KeyRound size={21} /> : <CircleUserRound size={22} />}
          </span>
          <div>
            <p className="auth-modal-eyebrow">Tài khoản học viên</p>
            <h2 id={titleId}>{modalHeading}</h2>
            <p id={descriptionId}>{modalDescription}</p>
          </div>
        </header>

        {(authError || authSuccessMsg) && (
          <div
            className={`auth-modal-alert ${authError ? 'is-error' : 'is-success'}`}
            role={authError ? 'alert' : 'status'}
            aria-live="polite"
          >
            {authError || authSuccessMsg}
          </div>
        )}

        {authMode === 'login' && (
          <form className="auth-modal-form" onSubmit={handleLoginSubmit}>
            <label className="auth-field" htmlFor="username">
              <span>Email hoặc tài khoản</span>
              <span className="auth-input-shell">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập email hoặc tài khoản"
                  autoComplete="username"
                  data-auth-autofocus
                  required
                />
              </span>
            </label>

            <label className="auth-field" htmlFor="password">
              <span className="auth-field-heading">
                <span>Mật khẩu</span>
                <button type="button" onClick={() => setMode('forgot')}>
                  Quên mật khẩu?
                </button>
              </span>
              <span className="auth-input-shell">
                <Lock size={17} aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
              </span>
            </label>

            <button type="submit" className="auth-primary-button">
              Đăng nhập
            </button>

            <div className="auth-modal-divider" aria-hidden="true">
              <span>hoặc tiếp tục với</span>
            </div>

            <div className="auth-provider-grid" aria-label="Nhà cung cấp đăng nhập">
              <button type="button" className="auth-provider-button" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              <button type="button" className="auth-provider-button" onClick={handleGithubLogin}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.63 0-12 5.28-12 11.79 0 5.21 3.44 9.63 8.21 11.19.6.11.82-.26.82-.57v-2.18c-3.34.71-4.04-1.54-4.04-1.54-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.83 1.21 1.83 1.21 1.07 1.8 2.8 1.28 3.49.98.11-.76.42-1.28.76-1.58-2.66-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.5.12-3.12 0 0 1.01-.32 3.31 1.21.96-.26 1.98-.39 3-.4 1.02 0 2.04.14 3 .4 2.3-1.53 3.3-1.21 3.3-1.21.66 1.62.24 2.82.12 3.12.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.09.81 2.2v3.27c0 .32.22.69.82.57 4.77-1.56 8.2-5.98 8.2-11.19C24 5.28 18.63 0 12 0z" fill="currentColor" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <p className="auth-switch">
              Chưa có tài khoản?
              <button type="button" onClick={() => setMode('signup')}>Đăng ký ngay</button>
            </p>
          </form>
        )}

        {authMode === 'signup' && (
          <form className="auth-modal-form" onSubmit={handleSignupSubmit}>
            <label className="auth-field" htmlFor="signupName">
              <span>Họ và tên</span>
              <span className="auth-input-shell">
                <User size={17} aria-hidden="true" />
                <input
                  id="signupName"
                  type="text"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  data-auth-autofocus
                  required
                />
              </span>
            </label>

            <label className="auth-field" htmlFor="signupUsername">
              <span>Địa chỉ email</span>
              <span className="auth-input-shell">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="signupUsername"
                  type="email"
                  value={signupUsername}
                  onChange={(event) => setSignupUsername(event.target.value)}
                  placeholder="sinhvien@ueh.edu.vn"
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <div className="auth-password-grid">
              <label className="auth-field" htmlFor="signupPassword">
                <span>Mật khẩu</span>
                <span className="auth-input-shell">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="signupPassword"
                    type="password"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </span>
              </label>
              <label className="auth-field" htmlFor="signupConfirmPassword">
                <span>Nhập lại mật khẩu</span>
                <span className="auth-input-shell">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="signupConfirmPassword"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(event) => setSignupConfirmPassword(event.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </span>
              </label>
            </div>

            <button type="submit" className="auth-primary-button">Tạo tài khoản</button>
            <p className="auth-switch">
              Đã có tài khoản?
              <button type="button" onClick={() => setMode('login')}>Đăng nhập</button>
            </p>
          </form>
        )}

        {authMode === 'forgot' && forgotStep === 1 && (
          <form className="auth-modal-form" onSubmit={handleForgotPasswordSubmit}>
            <label className="auth-field" htmlFor="forgotEmail">
              <span>Email đã đăng ký</span>
              <span className="auth-input-shell">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="sinhvien@ueh.edu.vn"
                  autoComplete="email"
                  data-auth-autofocus
                  required
                />
              </span>
            </label>

            <button type="submit" className="auth-primary-button" disabled={forgotLoading}>
              {forgotLoading ? 'Đang gửi mã OTP…' : 'Gửi mã OTP'}
            </button>
            <p className="auth-helper-copy">
              Mã OTP có hiệu lực trong 10 phút. Nếu chưa thấy email, vui lòng kiểm tra thư mục Spam hoặc Quảng cáo.
            </p>
            <button
              type="button"
              className="auth-back-button"
              onClick={() => {
                setMode('login');
                setForgotStep(1);
              }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Quay lại đăng nhập
            </button>
          </form>
        )}

        {authMode === 'forgot' && forgotStep === 2 && (
          <form className="auth-modal-form" onSubmit={handleResetPasswordSubmit}>
            <label className="auth-field" htmlFor="forgotOtp">
              <span>Mã OTP gồm 6 chữ số</span>
              <span className="auth-input-shell">
                <ShieldCheck size={17} aria-hidden="true" />
                <input
                  id="forgotOtp"
                  type="text"
                  value={forgotOtp}
                  onChange={(event) => setForgotOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Nhập mã OTP"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  data-auth-autofocus
                  required
                />
              </span>
            </label>

            <div className="auth-password-grid">
              <label className="auth-field" htmlFor="forgotNewPassword">
                <span>Mật khẩu mới</span>
                <span className="auth-input-shell">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="forgotNewPassword"
                    type="password"
                    value={forgotNewPassword}
                    onChange={(event) => setForgotNewPassword(event.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </span>
              </label>
              <label className="auth-field" htmlFor="forgotConfirmNewPassword">
                <span>Xác nhận mật khẩu</span>
                <span className="auth-input-shell">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="forgotConfirmNewPassword"
                    type="password"
                    value={forgotConfirmNewPassword}
                    onChange={(event) => setForgotConfirmNewPassword(event.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </span>
              </label>
            </div>

            <button type="submit" className="auth-primary-button" disabled={forgotLoading}>
              {forgotLoading ? 'Đang xác nhận…' : 'Đổi mật khẩu'}
            </button>
            <div className="auth-form-footer">
              <button
                type="button"
                className="auth-back-button"
                onClick={() => {
                  setForgotStep(1);
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Đổi email
              </button>
              <button type="button" className="auth-text-button" onClick={handleForgotPasswordSubmit} disabled={forgotLoading}>
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        )}

        {authMode === 'phone' && (
          <form className="auth-modal-form" onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
            {!isOtpSent ? (
              <>
                <label className="auth-field" htmlFor="phoneInput">
                  <span>Số điện thoại</span>
                  <span className="auth-input-shell">
                    <Smartphone size={17} aria-hidden="true" />
                    <input
                      id="phoneInput"
                      type="tel"
                      value={phoneInput}
                      onChange={(event) => setPhoneInput(event.target.value)}
                      placeholder="+84912345678"
                      autoComplete="tel"
                      data-auth-autofocus
                      required
                    />
                  </span>
                </label>
                <div id="recaptcha-container" />
                <button type="submit" className="auth-primary-button" disabled={otpLoading}>
                  <PhoneCall size={16} aria-hidden="true" />
                  {otpLoading ? 'Đang gửi mã OTP…' : 'Gửi mã OTP'}
                </button>
              </>
            ) : (
              <>
                <label className="auth-field" htmlFor="verificationCode">
                  <span>Mã OTP gồm 6 chữ số</span>
                  <span className="auth-input-shell">
                    <ShieldCheck size={17} aria-hidden="true" />
                    <input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Nhập mã OTP"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      data-auth-autofocus
                      required
                    />
                  </span>
                </label>
                <button type="submit" className="auth-primary-button" disabled={otpLoading}>
                  {otpLoading ? 'Đang xác nhận…' : 'Xác nhận đăng nhập'}
                </button>
                <button type="button" className="auth-text-button auth-center-button" onClick={handleSendOtp} disabled={otpLoading}>
                  Gửi lại mã OTP
                </button>
              </>
            )}
            <button
              type="button"
              className="auth-back-button"
              onClick={() => {
                setMode('login');
                setIsOtpSent(false);
                setConfirmationResult(null);
              }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Quay lại đăng nhập
            </button>
          </form>
        )}
      </section>
    </div>,
    document.body
  );
}
