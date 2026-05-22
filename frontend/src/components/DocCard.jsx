import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';
import '../assets/styles/DocCard.css';
import { formatResourceDate } from '../utils/resourceDate';

export default function DocCard({ doc }) {
  // Safe image path checking
  const imageSrc = doc.image ? `/images/${doc.image}` : '/images/tccvang.jpg';
  const displayDate = formatResourceDate(doc);

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
        <div className="card-meta">
          <Calendar size={13} />
          <span>{displayDate}</span>
        </div>
        <h3 className="card-title">
          <Link to={`/document/${doc.id}`}>{doc.title}</Link>
        </h3>
        <p className="card-desc">{doc.desc || 'Tài liệu ôn tập Toán Cao Cấp chi tiết dành cho sinh viên UEH.'}</p>
        <div className="card-footer">
          <Link to={`/document/${doc.id}`} className="btn-read-more">
            <span>Chi tiết</span>
            <ArrowUpRight size={14} className="arrow-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
}
