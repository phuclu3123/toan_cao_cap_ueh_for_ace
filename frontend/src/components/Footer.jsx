import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Mail, Phone, Send } from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { API_BASE_URL } from '../config';
import '../assets/styles/Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const handleSubscribeSubmit = async (event) => {
    event.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || (language === 'vi' ? 'Đã gửi đăng ký nhận bài viết mới.' : 'Successfully subscribed.'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || (language === 'vi' ? 'Không thể gửi đăng ký lúc này.' : 'Subscription failed.'));
      }
    } catch {
      setStatus('error');
      setMessage(language === 'vi' 
        ? 'Không thể gửi đăng ký lúc này. Vui lòng liên hệ Zalo 0833830322 hoặc email luphuc321@gmail.com.'
        : 'Could not connect to server. Please try again later.');
    }
  };

  return (
    <footer id="footer" className="footer">
      <div className="container footer-top">
        <div className="footer-grid">
          <div className="footer-about">
            <span className="footer-kicker">{language === 'vi' ? 'Nền tảng học tập độc lập' : 'Independent learning platform'}</span>
            <Link to="/" className="footer-logo">
              <span className="logo-helper">UEH</span> <span className="logo-main">TCC</span>
            </Link>
            <p className="footer-desc">
              {t.footer.desc}
            </p>
            <div className="footer-contact">
              <a className="contact-item" href="tel:0833830322">
                <Phone size={15} />
                <span>0833830322</span>
              </a>
              <a className="contact-item" href="mailto:luphuc321@gmail.com">
                <Mail size={15} />
                <span>luphuc321@gmail.com</span>
              </a>
            </div>
            <div className="social-links">
              <a href="https://www.facebook.com/Luphuc08092006/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg className="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span>Facebook</span>
              </a>
              <a href="https://zalo.me/0833830322" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span className="social-letter" aria-hidden="true">Z</span>
                <span>Zalo</span>
              </a>
            </div>
          </div>

          <nav className="footer-links" aria-label={language === 'vi' ? 'Điều hướng cuối trang' : 'Footer navigation'}>
            <h4>{language === 'vi' ? 'Điều hướng' : (language === 'en' ? 'Navigation' : (language === 'ja' ? 'ナビゲーション' : '导航'))}</h4>
            <ul>
              <li><Link to="/">{t.nav.home}</Link></li>
              <li><Link to="/courses">{t.nav.courses}</Link></li>
              <li><Link to="/resources?category=all">{t.nav.library}</Link></li>
              <li><Link to="/exams">{t.nav.exams}</Link></li>
              <li><Link to="/blog">{t.nav.blog}</Link></li>
            </ul>
          </nav>

          <div className="footer-links footer-support">
            <h4>{t.footer.donateTitle}</h4>
            <p className="donate-desc">{t.footer.donateDesc}</p>
            <ul className="donate-list">
              <li className="donate-item">
                <span className="bank-name">MB-BANK:</span>
                <span className="bank-number">08092006192939</span>
              </li>
              <li className="donate-item">
                <span className="bank-name">Sacombank:</span>
                <span className="bank-number">070128368343</span>
              </li>
              <li className="bank-owner">{language === 'vi' ? 'Lữ Phúc' : 'Lu Phuc'}</li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>{t.footer.subscribeTitle}</h4>
            <p className="newsletter-desc">{t.footer.subscribeDesc}</p>
            <form onSubmit={handleSubscribeSubmit} className="newsletter-form">
              <div className="input-group">
                <label className="footer-sr-only" htmlFor="footer-newsletter-email">
                  {t.footer.subscribePlaceholder}
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  placeholder={t.footer.subscribePlaceholder}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={status === 'loading'}
                  autoComplete="email"
                  required
                />
                <button type="submit" className="btn-send" disabled={status === 'loading'} aria-label={language === 'vi' ? 'Đăng ký nhận bài viết' : 'Subscribe'}>
                  <Send size={17} aria-hidden="true" />
                </button>
              </div>
            </form>

            {status === 'loading' && <div className="status-msg loading">{language === 'vi' ? 'Đang gửi...' : 'Sending...'}</div>}
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
            © <span>{new Date().getFullYear()}</span> <strong className="logo-main">UEH TCC</strong>. {language === 'vi' ? 'Hỗ Trợ Học Tập Toán Cao Cấp.' : 'Advanced Calculus Learning Support.'}
          </p>
          <div className="credits">
            {t.footer.credits} <a href="https://www.facebook.com/Luphuc08092006/" target="_blank" rel="noopener noreferrer" className="author-link">{language === 'vi' ? 'Lữ Phúc' : 'Lu Phuc'}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
