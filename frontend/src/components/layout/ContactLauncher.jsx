import { useState, useContext } from 'react';
import { MessageSquare, X, Send, PhoneCall, FileText } from 'lucide-react';
import { LanguageContext } from '../../App';
import ConsultationForm from '../ConsultationForm';
import './ContactLauncher.css';

export default function ContactLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const { language } = useContext(LanguageContext);

  const labels = {
    vi: {
      launcher: 'Hỗ trợ & Liên hệ',
      zalo: 'Zalo Hỗ Trợ (0833 830 322)',
      telegram: 'Telegram Hỗ Trợ',
      consultation: 'Đăng Ký Tư Vấn 1-1'
    },
    en: {
      launcher: 'Support & Contact',
      zalo: 'Zalo Support (0833 830 322)',
      telegram: 'Telegram Support',
      consultation: 'Request 1-on-1 Consultation'
    },
    ja: {
      launcher: 'サポート・お問い合わせ',
      zalo: 'Zalo サポート (0833 830 322)',
      telegram: 'Telegram サポート',
      consultation: '1対1相談の申し込み'
    },
    zh: {
      launcher: '支持与联系',
      zalo: 'Zalo 支持 (0833 830 322)',
      telegram: 'Telegram 支持',
      consultation: '预约一对一咨询'
    }
  };

  const t = labels[language] || labels.vi;

  return (
    <>
      <div className="contact-launcher-container">
        {isOpen && (
          <div className="contact-launcher-menu">
            <a
              href="https://zalo.me/0833830322"
              target="_blank"
              rel="noopener noreferrer"
              className="launcher-item"
            >
              <PhoneCall size={18} />
              <span>{t.zalo}</span>
            </a>
            <a
              href="https://t.me/phuclu3123"
              target="_blank"
              rel="noopener noreferrer"
              className="launcher-item"
            >
              <Send size={18} />
              <span>{t.telegram}</span>
            </a>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowConsultationModal(true);
              }}
              className="launcher-item btn-consultation"
            >
              <FileText size={18} />
              <span>{t.consultation}</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`contact-launcher-trigger ${isOpen ? 'active' : ''}`}
          aria-label={t.launcher}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {showConsultationModal && (
        <ConsultationForm onClose={() => setShowConsultationModal(false)} />
      )}
    </>
  );
}
