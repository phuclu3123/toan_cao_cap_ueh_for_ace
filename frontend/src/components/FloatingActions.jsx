import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle, Send } from 'lucide-react';
import ConsultationForm from './ConsultationForm';
import '../assets/styles/FloatingActions.css';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <button
        type="button"
        className="consultation-ribbon"
        onClick={() => setIsModalOpen(true)}
        aria-label="Mở đăng ký tư vấn"
      >
        Đăng ký tư vấn
      </button>

      {isModalOpen && (
        <div className="consultation-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="consultation-modal-content" onClick={(e) => e.stopPropagation()}>
            <ConsultationForm theme="light" onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}

      <div className="floating-actions" aria-label="Liên hệ nhanh">
        <a className="floating-action zalo" href="https://zalo.me/0833830322" target="_blank" rel="noopener noreferrer" aria-label="Liên hệ qua Zalo">
          Zalo
        </a>
        <a className="floating-action messenger" href="https://m.me/Luphuc08092006" target="_blank" rel="noopener noreferrer" aria-label="Liên hệ qua Messenger">
          <MessageCircle size={18} />
        </a>
        <a className="floating-action telegram" href="mailto:luphuc321@gmail.com" aria-label="Gửi email">
          <Send size={17} />
        </a>
        {showTop && (
          <button className="floating-action back-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Cuộn lên đầu trang">
            <ArrowUp size={18} />
          </button>
        )}
      </div>
    </>
  );
}
