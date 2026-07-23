import React from 'react';
import { X, User, KeyRound, Mail, Lock, Shield, Smartphone, PhoneCall, ArrowLeft } from 'lucide-react';

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
  handleFacebookLogin,
  handleGithubLogin,
  handleSignupSubmit,
  handleForgotPasswordSubmit,
  handleResetPasswordSubmit,
  handleSendOtp,
  handleVerifyOtp
}) {
  if (!showLoginModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowLoginModal(false)}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          {authMode === 'login' && <User size={32} className="modal-icon text-teal animate-pulse" />}
          {authMode === 'signup' && <User size={32} className="modal-icon text-teal animate-pulse" />}
          {authMode === 'forgot' && <KeyRound size={32} className="modal-icon text-rose animate-pulse" />}
          
          <h3>
            {authMode === 'login' && 'Đăng Nhập UEH TCC'}
            {authMode === 'signup' && 'Đăng Ký Thành Viên'}
            {authMode === 'forgot' && 'Khôi Phục Mật Khẩu'}
          </h3>
          <p>
            {authMode === 'login' && 'Hệ thống hỗ trợ lưu lịch sử học tập'}
            {authMode === 'signup' && 'Tạo tài khoản học tập cá nhân'}
            {authMode === 'forgot' && 'Nhập email để nhận liên kết khôi phục mật khẩu'}
          </p>
        </div>

        {authError && <div className="error-alert">{authError}</div>}
        {authSuccessMsg && <div className="success-alert">{authSuccessMsg}</div>}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form className="modal-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="username">Email đăng nhập / Tài khoản</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Email hoặc tài khoản đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-group-header">
                <label htmlFor="password">Mật khẩu</label>
                <button 
                  type="button" 
                  className="forgot-password-link" 
                  onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccessMsg(''); }}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '10px' }}>Đăng Nhập</button>
            
            <div className="auth-divider">hoặc đăng nhập bằng</div>

            <div className="social-login-grid">
              {/* Google Button */}
              <button 
                type="button" 
                className="btn-social google" 
                onClick={handleGoogleLogin} 
                title="Đăng nhập qua Google"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              </button>

              {/* Facebook Button */}
              <button 
                type="button" 
                className="btn-social facebook" 
                onClick={handleFacebookLogin} 
                title="Đăng nhập qua Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#1877F2' }}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              {/* GitHub Button */}
              <button 
                type="button" 
                className="btn-social github" 
                onClick={handleGithubLogin} 
                title="Đăng nhập qua GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#F8FAFC' }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </button>
            </div>

            <div className="auth-modal-switch mt-4 text-center text-sm text-gray-400">
              <span>Chưa có tài khoản? </span>
              <button type="button" className="text-teal font-semibold hover:underline" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}>Đăng ký ngay</button>
            </div>

            <div className="auth-footer-note">
              🔒 Dữ liệu lưu trữ đám mây MongoDB Atlas bảo mật tuyệt đối.
            </div>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {authMode === 'signup' && (
          <form className="modal-form" onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label htmlFor="signupName">Họ và Tên của bạn</label>
              <div className="input-with-icon">
                <User size={17} className="input-icon" />
                <input
                  type="text"
                  id="signupName"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signupUsername">Địa chỉ Email</label>
              <div className="input-with-icon">
                <Mail size={17} className="input-icon" />
                <input
                  type="email"
                  id="signupUsername"
                  className="form-input"
                  placeholder="sinhvien@ueh.edu.vn"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">Mật khẩu</label>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  type="password"
                  id="signupPassword"
                  className="form-input"
                  placeholder="Tối thiểu 6 ký tự"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signupConfirmPassword">Nhập lại mật khẩu</label>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  type="password"
                  id="signupConfirmPassword"
                  className="form-input"
                  placeholder="Xác nhận mật khẩu"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">Đăng Ký Tài Khoản</button>
            
            <div className="auth-modal-switch mt-4 text-center text-sm">
              <span>Đã có tài khoản? </span>
              <button type="button" className="text-teal font-semibold hover:underline" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}>Đăng nhập ngay</button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {authMode === 'forgot' && (
          forgotStep === 1 ? (
            <form className="modal-form" onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="forgotEmail">Email đã đăng ký tài khoản</label>
                <div className="input-with-icon">
                  <Mail size={17} className="input-icon" />
                  <input
                    type="email"
                    id="forgotEmail"
                    className="form-input"
                    placeholder="sinhvien@ueh.edu.vn"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={forgotLoading}>
                {forgotLoading ? (
                  <span>⏳ Đang gửi email...</span>
                ) : (
                  'Gửi Mã OTP Xác Thực'
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                Tài khoản email/password dùng mã OTP từ backend MongoDB.<br/>Nhớ kiểm tra cả thư mục Spam!
              </p>

              <div className="text-center mt-3">
                <button 
                  type="button" 
                  className="btn-back-link" 
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setForgotStep(1); }}
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại Đăng nhập</span>
                </button>
              </div>
            </form>
          ) : (
            <form className="modal-form" onSubmit={handleResetPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="forgotOtp">Nhập mã OTP (6 chữ số)</label>
                <div className="input-with-icon">
                  <Shield size={17} className="input-icon" />
                  <input
                    type="text"
                    id="forgotOtp"
                    className="form-input"
                    placeholder="123456"
                    maxLength="6"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="forgotNewPassword">Mật khẩu mới</label>
                <div className="input-with-icon">
                  <Lock size={17} className="input-icon" />
                  <input
                    type="password"
                    id="forgotNewPassword"
                    className="form-input"
                    placeholder="Tối thiểu 3 ký tự"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="forgotConfirmNewPassword">Xác nhận mật khẩu mới</label>
                <div className="input-with-icon">
                  <Lock size={17} className="input-icon" />
                  <input
                    type="password"
                    id="forgotConfirmNewPassword"
                    className="form-input"
                    placeholder="Nhập lại mật khẩu mới"
                    value={forgotConfirmNewPassword}
                    onChange={(e) => setForgotConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={forgotLoading}>
                {forgotLoading ? 'Đang xử lý...' : 'Xác Nhận Đổi Mật Khẩu'}
              </button>

              <div className="text-center mt-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn-back-link" 
                  onClick={() => { setForgotStep(1); setAuthError(''); setAuthSuccessMsg(''); }}
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại</span>
                </button>
                <button 
                  type="button" 
                  className="text-teal text-sm font-semibold hover:underline" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={handleForgotPasswordSubmit}
                  disabled={forgotLoading}
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          )
        )}

        {/* 4. SMS OTP FORM */}
        {authMode === 'phone' && (
          <form className="modal-form" onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
            {!isOtpSent ? (
              <>
                <div className="form-group">
                  <label htmlFor="phoneInput">Số điện thoại của bạn</label>
                  <div className="input-with-icon">
                    <Smartphone size={17} className="input-icon" />
                    <input
                      type="tel"
                      id="phoneInput"
                      className="form-input"
                      placeholder="+84912345678"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div id="recaptcha-container"></div>
                
                <button type="submit" className="btn btn-primary w-full" disabled={otpLoading}>
                  <PhoneCall size={16} />
                  <span>{otpLoading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}</span>
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="verificationCode">Nhập mã OTP gồm 6 chữ số</label>
                  <div className="input-with-icon">
                    <Shield size={17} className="input-icon" />
                    <input
                      type="text"
                      id="verificationCode"
                      className="form-input"
                      placeholder="123456"
                      maxLength="6"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary w-full" disabled={otpLoading}>
                  <span>{otpLoading ? 'Đang xác thực...' : 'Xác nhận Đăng Nhập'}</span>
                </button>
                
                <div className="auth-modal-switch mt-2 text-sm">
                  <span>Không nhận được mã? </span>
                  <button 
                    type="button" 
                    className="text-teal font-semibold hover:underline" 
                    onClick={handleSendOtp} 
                    disabled={otpLoading}
                  >
                    Gửi lại mã
                  </button>
                </div>
              </>
            )}

            <div className="text-center mt-3">
              <button 
                type="button" 
                className="btn-back-link" 
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setIsOtpSent(false); setConfirmationResult(null); }}
              >
                <ArrowLeft size={16} />
                <span>Quay lại Đăng nhập</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
