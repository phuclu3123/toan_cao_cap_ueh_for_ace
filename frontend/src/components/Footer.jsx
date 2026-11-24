import { lazy, Suspense, useState, useContext, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle, Heart, Mail, Phone } from 'lucide-react';
import TurnstileWidget from './TurnstileWidget';
import SocialLinks from './ui/SocialLinks';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { API_BASE_URL } from '../config';
import { openCookieSettings } from '../utils/cookieConsent';
import '../assets/styles/Footer.css';
const SupportModal=lazy(()=>import('./modals/SupportModal'));

export default function Footer() {
  const turnstileRef = useRef(null);
  const [email, setEmail] = useState('');
  const [newsletterActive, setNewsletterActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [supportOpen,setSupportOpen]=useState(false);
  const [searchParams,setSearchParams]=useSearchParams();
  const returnedOrder=searchParams.get('supportOrder');
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const vi = language === 'vi';
  useEffect(()=>{
    if(!returnedOrder || !/^\d{1,16}$/.test(returnedOrder)) return;
    const timer=setTimeout(()=>setSupportOpen(true),0);
    return ()=>clearTimeout(timer);
  },[returnedOrder]);
  const handleCloseSupport=()=>{
    setSupportOpen(false);
    if(returnedOrder) {const next=new URLSearchParams(searchParams);next.delete('supportOrder');next.delete('supportCancelled');setSearchParams(next,{replace:true});}
  };

  // Mount verification when the visitor starts subscribing, before any request.
  const handleSubscribeSubmit = async event => {
    event.preventDefault();
    if (!email) return;
    if (!newsletterActive) { setNewsletterActive(true); return; }
    setStatus('loading');
    setMessage('');
    try {
      const turnstileToken = turnstileRef.current?.getToken() || '';
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, 'cf-turnstile-response': turnstileToken })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || (vi ? 'Đã đăng ký nhận bài viết mới.' : 'Successfully subscribed.'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || (vi ? 'Chưa thể đăng ký. Vui lòng thử lại.' : 'Subscription failed.'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || (vi ? 'Vui lòng thử lại hoặc liên hệ Zalo 0833830322.' : 'Could not connect. Please try again.'));
    } finally { turnstileRef.current?.reset(); }
  };

  return <footer id="footer" className="footer">
    <div className="container footer-top">
      <div className="footer-grid">
        <div className="footer-about">
          <span className="footer-kicker">{vi ? 'HỌC HIỂU. LÀM ĐƯỢC.' : 'UNDERSTAND. PUT IT INTO PRACTICE.'}</span>
          <Link to="/" className="footer-logo" aria-label="α∫M4A — Trang chủ"><img className="brand-image-mark" src="/images/brand/aim4a-mark.png" alt="α∫M4A" width="52" height="52" /></Link>
          <p className="footer-desc">{vi ? 'Một nơi để học Toán Cao Cấp, tìm lời giải và cùng nhau tiến bộ.' : 'A place to learn advanced mathematics, find solutions and grow together.'}</p>
          <div className="footer-contact"><a href="tel:0833830322"><Phone size={15}/><span>0833830322</span></a><a href="mailto:luphuc321@gmail.com"><Mail size={15}/><span>luphuc321@gmail.com</span></a></div>
          <SocialLinks/>
        </div>
        <nav className="footer-links" aria-label={vi ? 'Khám phá α∫M4A' : 'Explore α∫M4A'}>
          <h4>{vi ? 'Khám phá' : 'Explore'}</h4>
          <ul><li><Link to="/courses">{t.nav.courses}</Link></li><li><Link to="/exams">{t.nav.exams}</Link></li><li><Link to="/resources?category=all">{t.nav.library}</Link></li><li><Link to="/community">{vi ? 'Hỏi đáp cộng đồng' : 'Community'}</Link></li><li><Link to="/flashcards">Flashcard</Link></li><li><Link to="/blog">{t.nav.blog}</Link></li></ul>
        </nav>
        <div className="footer-newsletter paper-surface" data-paper="sun">
          <span className="footer-kicker">{vi ? 'MỘT CHÚT KIẾN THỨC MỚI' : 'SOMETHING NEW TO LEARN'}</span>
          <h4>{vi ? 'Hẹn bạn ở bài viết tới.' : 'See you in the next article.'}</h4>
          <p className="newsletter-desc">{vi ? 'Nhận bài viết và lời giải mới qua email.' : 'New articles and solutions, delivered to your inbox.'}</p>
          <form onSubmit={handleSubscribeSubmit} className="newsletter-form">
            <label className="footer-sr-only" htmlFor="footer-newsletter-email">Email</label>
            <div className="input-group"><input id="footer-newsletter-email" type="email" placeholder={vi ? 'Email của bạn' : 'Your email'} value={email} onFocus={()=>setNewsletterActive(true)} onChange={event=>setEmail(event.target.value)} disabled={status==='loading'} autoComplete="email" required/><button type="submit" className="btn-send" disabled={status==='loading'} aria-label={vi ? 'Đăng ký nhận bài viết' : 'Subscribe'}><ArrowRight size={20}/></button></div>
            {newsletterActive && <div className="footer-verification"><TurnstileWidget ref={turnstileRef} action="subscribe"/></div>}
          </form>
          <div aria-live="polite">{status==='loading' && <p className="status-msg">{vi ? 'Đang gửi…' : 'Sending…'}</p>}{status==='success' && <p className="status-msg success"><CheckCircle size={15}/>{message}</p>}{status==='error' && <p className="status-msg error"><AlertCircle size={15}/>{message}</p>}</div>
        </div>
      </div>
      <button type="button" className="footer-support" onClick={()=>setSupportOpen(true)}><span><Heart size={17}/>{vi ? 'Cùng duy trì học liệu mở' : 'Support open learning resources'}</span><span>{vi ? 'Ủng hộ qua PayOS' : 'Support via PayOS'} <ArrowRight size={17}/></span></button>
      <div className="footer-bottom-content"><p>© {new Date().getFullYear()} α∫M4A</p><div className="credits"><Link to="/purchase-terms">{vi ? 'Điều khoản mua khóa học' : 'Purchase terms'}</Link><button type="button" onClick={openCookieSettings}>{vi ? 'Cài đặt cookie' : 'Cookie settings'}</button><span>{vi ? 'Phát triển bởi ' : 'Built by '}<a href="https://www.facebook.com/Luphuc08092006/" target="_blank" rel="noopener noreferrer">{vi ? 'Lữ Phúc' : 'Lu Phuc'}</a></span></div></div>
    </div>
    {supportOpen && <Suspense fallback={null}><SupportModal onClose={handleCloseSupport} returnedOrder={returnedOrder}/></Suspense>}
  </footer>;
}
