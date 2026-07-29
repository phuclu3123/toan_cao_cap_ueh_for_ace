import { SearchX } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'Không tìm thấy dữ liệu',
  description = 'Vui lòng thử lại với từ khóa hoặc bộ lọc khác.',
  action,
  className = ''
}) {
  return (
    <div className={`ui-empty-state ${className}`}>
      <div className="ui-empty-icon-box">
        <Icon size={32} />
      </div>
      <h3 className="ui-empty-title">{title}</h3>
      <p className="ui-empty-description">{description}</p>
      {action && <div className="ui-empty-action">{action}</div>}
    </div>
  );
}
