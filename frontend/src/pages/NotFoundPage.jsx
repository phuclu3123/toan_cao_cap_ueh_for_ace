import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { LanguageContext } from '../App';
import '../assets/styles/NotFoundPage.css';

export default function NotFoundPage() {
  const { language } = useContext(LanguageContext);

  const texts = {
    vi: {
      title: '404 - Trang Không Tồn Tại',
      description: 'Đường dẫn bạn truy cập không tồn tại hoặc đã được chuyển sang địa chỉ mới.',
      backHome: 'Về trang chủ',
      backPrev: 'Quay lại trang trước'
    },
    en: {
      title: '404 - Page Not Found',
      description: 'The URL you accessed does not exist or has been relocated.',
      backHome: 'Return Home',
      backPrev: 'Go Back'
    },
    ja: {
      title: '404 - ページが見つかりません',
      description: 'アクセスしたページは存在しないか、移動した可能性があります。',
      backHome: 'ホームに戻る',
      backPrev: '前のページに戻る'
    },
    zh: {
      title: '404 - 页面未找到',
      description: '您访问的页面不存在或已被移动。',
      backHome: '返回首页',
      backPrev: '返回上一页'
    }
  };

  const t = texts[language] || texts.vi;

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">
          <FileQuestion size={48} />
        </div>
        <h1>{t.title}</h1>
        <p>{t.description}</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary btn-with-icon">
            <Home size={18} />
            {t.backHome}
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary btn-with-icon">
            <ArrowLeft size={18} />
            {t.backPrev}
          </button>
        </div>
      </div>
    </div>
  );
}
