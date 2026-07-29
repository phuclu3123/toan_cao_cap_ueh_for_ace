import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ArrowUpRight } from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/DocCard.css';
import { formatResourceDate } from '../utils/resourceDate';
import { getViewCount, formatViewCount } from '../utils/viewCounter';

export default function DocCard({ doc }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  // Safe image path checking
  const imageSrc = doc.image ? `/images/${doc.image}` : '/images/tccvang.jpg';
  const displayDate = formatResourceDate(doc);
  const views = getViewCount(doc.id);

  return (
    <div className="doc-card glass-panel animate-on-scroll">
      <div className="card-image-wrapper">
        <img 
          src={imageSrc} 
          alt={doc.title} 
          className="card-image"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/images/tccvang.jpg'; // Fallback
          }}
        />
        <div className="card-category-tag">{doc.categoryLabel}</div>
      </div>
      <div className="card-body">
        <div className="card-meta flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1"><Calendar size={13} /> {displayDate}</span>
          <span className="flex items-center gap-1"><Eye size={13} /> {formatViewCount(views)} lượt xem</span>
        </div>
        <h3 className="card-title">
          <Link to={`/document/${doc.id}`}>{doc.title}</Link>
        </h3>
        <p className="card-desc">{doc.desc || 'Tài liệu ôn tập Toán Cao Cấp chi tiết dành cho sinh viên UEH.'}</p>
        <div className="card-footer">
          <Link to={`/document/${doc.id}`} className="btn-read-more">
            <span>{t.common.detail}</span>
            <ArrowUpRight size={14} className="arrow-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
}
