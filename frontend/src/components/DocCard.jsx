import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../utils/translations';
import '../assets/styles/DocCard.css';
import { formatResourceDate } from '../utils/resourceDate';
import ResourceArtwork from './documents/ResourceArtwork';
import { resourceTitle } from '../utils/resourceTitle';

export default function DocCard({ doc }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  const displayDate = formatResourceDate(doc);

  return (
    <div className="doc-card glass-panel animate-on-scroll">
      <div className="card-image-wrapper">
        <ResourceArtwork resource={doc} />
      </div>
      <div className="card-body">
        <div className="card-meta flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="resource-category">{doc.categoryLabel}</span>
          <span className="flex items-center gap-1"><Calendar size={13} /> {displayDate}</span>
        </div>
        <h3 className="card-title">
          <Link to={`/document/${doc.id}`} title={doc.title}>{resourceTitle(doc)}</Link>
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
