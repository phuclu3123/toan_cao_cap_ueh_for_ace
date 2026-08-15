import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
  HelpCircle,
  CheckCircle2,
  Bookmark,
  Grid,
  TrendingUp,
  Maximize2,
  BarChart3,
  PieChart,
  GraduationCap,
  Cpu,
  Globe
} from 'lucide-react';
import { SUBJECT_CATEGORIES, DIFFICULTY_LEVELS } from '../../services/communityService';
import '../../assets/styles/community.css';

const SUBJECT_ICONS = {
  Grid,
  TrendingUp,
  Maximize2,
  BarChart3,
  PieChart,
  GraduationCap,
  Cpu
};

const STATUS_OPTIONS = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'unsolved', label: 'Cần trợ giúp', icon: HelpCircle },
  { id: 'solved', label: 'Đã giải', icon: CheckCircle2 },
  { id: 'saved', label: 'Đã lưu', icon: Bookmark }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'popular', label: 'Nhiều lượt thích' },
  { id: 'mostViewed', label: 'Xem nhiều nhất' },
  { id: 'unanswered', label: 'Chưa có lời giải' }
];

/**
 * Bottom sheet holding the filters that don't fit the mobile toolbar.
 */
export default function MobileFilterDrawer({
  isOpen,
  onClose,
  activeSubject,
  activeDifficulty,
  activeStatus,
  activeSort,
  onSubjectChange,
  onDifficultyChange,
  onStatusChange,
  onSortChange,
  onClearFilters
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop-overlay qa-sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-filter-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mobile-filter-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-drag-pill" />

        <div className="mobile-filter-header">
          <div className="header-title-box">
            <SlidersHorizontal size={17} />
            <h3 id="mobile-filter-title">Bộ lọc bài toán</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Đóng bộ lọc">
            <X size={17} />
          </button>
        </div>

        <div className="mobile-filter-content">
          <section className="filter-section">
            <h4 className="filter-section-title">Trạng thái</h4>
            <div className="filter-chips-grid">
              {STATUS_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`filter-chip ${activeStatus === id ? 'active' : ''}`}
                  onClick={() => onStatusChange?.(id)}
                >
                  {Icon && <span className="chip-icon"><Icon size={14} /></span>}
                  <span className="chip-text">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="filter-section">
            <h4 className="filter-section-title">Chuyên mục</h4>
            <div className="filter-chips-list">
              {SUBJECT_CATEGORIES.map((sub) => {
                const Icon = SUBJECT_ICONS[sub.iconKey] || Globe;
                const isActive = activeSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    className={`filter-chip filter-chip-row ${isActive ? 'active' : ''}`}
                    onClick={() => onSubjectChange?.(sub.id)}
                  >
                    <span className="chip-icon"><Icon size={14} /></span>
                    <span className="chip-text">{sub.label}</span>
                    {isActive && <Check size={15} className="chip-check" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="filter-section">
            <h4 className="filter-section-title">Mức độ</h4>
            <div className="filter-chips-grid">
              {DIFFICULTY_LEVELS.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  className={`filter-chip ${activeDifficulty === diff.id ? 'active' : ''}`}
                  onClick={() => onDifficultyChange?.(diff.id)}
                >
                  <span className="chip-text">{diff.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="filter-section">
            <h4 className="filter-section-title">Sắp xếp</h4>
            <div className="filter-chips-grid">
              {SORT_OPTIONS.map((srt) => (
                <button
                  key={srt.id}
                  type="button"
                  className={`filter-chip ${activeSort === srt.id ? 'active' : ''}`}
                  onClick={() => onSortChange?.(srt.id)}
                >
                  <span className="chip-text">{srt.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mobile-filter-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onClearFilters?.();
              onClose();
            }}
          >
            <RotateCcw size={15} />
            Đặt lại
          </button>

          <button type="button" className="btn btn-primary" onClick={onClose}>
            Xem kết quả
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
