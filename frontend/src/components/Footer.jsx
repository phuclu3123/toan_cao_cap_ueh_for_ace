import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import '../assets/styles/Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      // Offline fallback success for demo
      setTimeout(() => {
        setStatus('success');
        setMessage('Đăng ký nhận bài viết mới thành công! (Chế độ demo offline)');
        setEmail('');
      }, 1000);
    }
  };

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="footer">
      <div className="container footer-top">
        <div className="footer-grid">
          {/* Info Area */}
          <div className="footer-about">
            <a href="/" className="footer-logo" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>
              <span className="logo-helper">UEH</span> <span className="logo-main">TCC</span>
            </a>
            <p className="footer-desc">
              Trang web phi lợi nhuận hỗ trợ học tập môn Toán Cao Cấp cho sinh viên UEH. Cung cấp bài giải đề thi chi tiết, câu hỏi ôn tập chất lượng.
            </p>
            <div className="footer-contact">
              <p className="contact-item">
                <Phone size={15} />
                <span>0815451095</span>
              </p>
              <p className="contact-item">
                <Mail size={15} />
                <span>luphuc321@gmail.com</span>
              </p>
            </div>
            <div className="social-links">
              <a href="https://www.facebook.com/Luphuc08092006/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <svg className="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg className="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Linkedin">
                <svg className="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Tài Nguyên</h4>
            <ul>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Trang Chủ</button></li>
              <li><button onClick={() => handleScrollToSection('about')}>Về Chúng Tôi</button></li>
              <li><button onClick={() => handleScrollToSection('exams')}>Đề Thi TCC</button></li>
              <li><button onClick={() => handleScrollToSection('midterm')}>Đề Giữa Kỳ</button></li>
              <li><button onClick={() => handleScrollToSection('docs')}>Ấn Phẩm</button></li>
            </ul>
          </div>

          {/* Donations */}
          <div className="footer-links">
            <h4>Ủng Hộ & Từ Thiện</h4>
            <p className="donate-desc">
              Ủng hộ duy trì trang web và đóng góp vào các quỹ hoạt động từ thiện của cộng đồng sinh viên:
            </p>
            <ul className="donate-list">
              <li className="donate-item">
                <span className="bank-name">MB-BANK:</span>
                <span className="bank-number">08092006192939</span>
              </li>
              <li className="donate-item">
                <span className="bank-name">Sacombank:</span>
                <span className="bank-number">070128368343</span>
              </li>
              <li className="bank-owner">Chủ tài khoản: Lữ Phúc</li>
            </ul>
          </div>

          {/* Newsletter subscription form */}
          <div className="footer-newsletter">
            <h4>Nhận Bài Viết Mới</h4>
            <p className="newsletter-desc">Điền email của bạn để tự động nhận lời giải chi tiết và bài viết hướng dẫn mới nhất:</p>
            
            <form onSubmit={handleSubscribeSubmit} className="newsletter-form">
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Địa chỉ email của bạn..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
                <button type="submit" className="btn-send" disabled={status === 'loading'} aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </div>
            </form>

            {status === 'loading' && <div className="status-msg loading">Đang đăng ký nhận tin...</div>}
            
            {status === 'success' && (
              <div className="status-msg success">
                <CheckCircle size={15} />
                <span>{message}</span>
              </div>
            )}
            
            {status === 'error' && (
              <div className="status-msg error">
                <AlertCircle size={15} />
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p className="copyright">
            © <span>{new Date().getFullYear()}</span> <strong className="logo-main">UEH TCC</strong> - Hỗ Trợ Học Tập Toán Cao Cấp. All Rights Reserved.
          </p>
          <div className="credits">
            Phát triển bởi <a href="https://www.facebook.com/Luphuc08092006/" target="_blank" rel="noopener noreferrer" className="author-link">Lữ Phúc</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
