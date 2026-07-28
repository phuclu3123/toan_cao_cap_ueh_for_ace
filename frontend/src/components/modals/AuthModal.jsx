import React from 'react';
import { X, User, KeyRound, Mail, Lock, Shield, Smartphone, PhoneCall, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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
  handleGoogleAuthSuccess,
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
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleAuthSuccess}
                  onError={() => setAuthError('Đăng nhập Google thất bại')}
                  type="standard"
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              {/* Facebook Button */}
              <button 
                type="button" 
                className="btn-social facebook" 
                onClick={handleFacebookLogin}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" fill="#1877F2"/>
                </svg>
                <span>Facebook</span>
              </button>

              {/* GitHub Button */}
              <button 
                type="button" 
                className="btn-social github" 
                onClick={handleGithubLogin}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.63 0-12 5.28-12 11.79 0 5.21 3.44 9.63 8.21 11.19.6.11.82-.26.82-.57v-2.18c-3.34.71-4.04-1.54-4.04-1.54-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.83 1.21 1.83 1.21 1.07 1.8 2.8 1.28 3.49.98.11-.76.42-1.28.76-1.58-2.66-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.5.12-3.12 0 0 1.01-.32 3.31 1.21.96-.26 1.98-.39 3-.4 1.02 0 2.04.14 3 .4 2.3-1.53 3.3-1.21 3.3-1.21.66 1.62.24 2.82.12 3.12.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.09.81 2.2v3.27c0 .32.22.69.82.57 4.77-1.56 8.2-5.98 8.2-11.19C24 5.28 18.63 0 12 0z" fill="#24292e"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="auth-modal-switch mt-4 text-center text-sm text-gray-400">
              <span>Chưa có tài khoản? </span>
              <button type="button" className="text-teal font-semibold hover:underline" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}>Đăng ký ngay</button>
            </div>

            <div className="auth-footer-note">
              🔒 Cam kết bảo mật an toàn thông tin tài khoản học viên.
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

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', marginTop: '10px' }}>
                Mã xác thực OTP có hiệu lực trong 10 phút.<br/>Vui lòng kiểm tra cả thư mục Spam/Quảng cáo nếu chưa thấy email!
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
