import { lazy, Suspense, useState, useContext, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Heart, Mail, Phone } from 'lucide-react';
import SocialLinks from './ui/SocialLinks';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import { openCookieSettings } from '../utils/cookieConsent';
import '../assets/styles/Footer.css';
const SupportModal=lazy(()=>import('./modals/SupportModal'));

export default function Footer() {
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
          <h4>{vi ? 'Hẹn bạn ở điều mới.' : 'Keep discovering.'}</h4>
          <p className="newsletter-desc">{vi ? 'Bài viết và trao đổi mới ở thông báo trên web. Email giới thiệu khóa học chỉ gửi khi bạn bật nhận.' : 'Find new articles and replies in your web inbox. Course emails are opt-in.'}</p>
          <Link to="/notifications/settings" className="footer-notification-settings">{vi ? 'Chọn cách nhận thông báo' : 'Notification preferences'} <ArrowRight size={20}/></Link>
        </div>
      </div>
      <button type="button" className="footer-support" onClick={()=>setSupportOpen(true)}><span><Heart size={17}/>{vi ? 'Cùng duy trì học liệu mở' : 'Support open learning resources'}</span><span>{vi ? 'Ủng hộ qua PayOS' : 'Support via PayOS'} <ArrowRight size={17}/></span></button>
      <div className="footer-bottom-content"><p>© {new Date().getFullYear()} α∫M4A</p><div className="credits"><Link to="/purchase-terms">{vi ? 'Điều khoản mua khóa học' : 'Purchase terms'}</Link><button type="button" onClick={openCookieSettings}>{vi ? 'Cài đặt cookie' : 'Cookie settings'}</button><span>{vi ? 'Phát triển bởi ' : 'Built by '}<a href="https://www.facebook.com/Luphuc08092006/" target="_blank" rel="noopener noreferrer">{vi ? 'Lữ Phúc' : 'Lu Phuc'}</a></span></div></div>
    </div>
    {supportOpen && <Suspense fallback={null}><SupportModal onClose={handleCloseSupport} returnedOrder={returnedOrder}/></Suspense>}
  </footer>;
}
