import {
  Search,
  X,
  Grid,
  TrendingUp,
  Maximize2,
  BarChart3,
  PieChart,
  GraduationCap,
  Cpu,
  Globe,
  SlidersHorizontal,
  HelpCircle,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { SUBJECT_CATEGORIES, DIFFICULTY_LEVELS } from '../../services/communityService';
import CommunitySelect from './CommunitySelect';
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

function SubjectIcon({ iconKey, size = 13 }) {
  const Icon = SUBJECT_ICONS[iconKey] || Globe;
  return <Icon size={size} />;
}

/**
 * Sticky toolbar: search, status segments, sort, difficulty and subject rail.
 */
export default function PostFilterBar({
  activeSubject = 'all',
  activeDifficulty = 'all',
  activeStatus = 'all',
  activeSort = 'newest',
  searchQuery = '',
  activeTag = '',
  totalResults = 0,
  onSubjectChange,
  onDifficultyChange,
  onStatusChange,
  onSortChange,
  onSearchChange,
  onTagChange,
  onClearFilters,
  onOpenMobileFilters
}) {
  const hasActiveFilters =
    activeSubject !== 'all' ||
    activeDifficulty !== 'all' ||
    activeStatus !== 'all' ||
    Boolean(searchQuery) ||
    Boolean(activeTag);

  const statusTabs = [
    { id: 'all', label: 'Tất cả', icon: null },
    { id: 'unsolved', label: 'Cần trợ giúp', icon: HelpCircle },
    { id: 'solved', label: 'Đã giải', icon: CheckCircle2 },
    { id: 'saved', label: 'Đã lưu', icon: Bookmark }
  ];

  return (
    <div className="qa-toolbar">
      <div className="qa-toolbar-row">
        <div className="qa-search">
          <Search size={15} />
          <input
            type="search"
            value={searchQuery}
            placeholder="Tìm bài toán, công thức LaTeX (Lagrange, \det, Cobb-Douglas)..."
            onChange={(e) => onSearchChange?.(e.target.value)}
            aria-label="Tìm kiếm bài toán"
          />
          {searchQuery && (
            <button
              type="button"
              className="qa-search-clear"
              onClick={() => onSearchChange?.('')}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="qa-segment" role="tablist" aria-label="Lọc theo trạng thái">
          {statusTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeStatus === id}
              className={activeStatus === id ? 'is-active' : ''}
              onClick={() => onStatusChange?.(id)}
            >
              {Icon && <Icon size={13} />}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {onOpenMobileFilters && (
          <button
            type="button"
            className={`qa-mobile-filter ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={onOpenMobileFilters}
            aria-label="Mở bộ lọc"
          >
            <SlidersHorizontal size={16} />
          </button>
        )}
      </div>

      <div className="qa-subjects">
        <span className="qa-subjects-label">Chuyên mục</span>
        <div className="qa-subjects-rail">
          {SUBJECT_CATEGORIES.map((subject) => (
            <button
              key={subject.id}
              type="button"
              className={`qa-subject-chip ${activeSubject === subject.id ? 'is-active' : ''}`}
              aria-pressed={activeSubject === subject.id}
              onClick={() => onSubjectChange?.(subject.id)}
            >
              <SubjectIcon iconKey={subject.iconKey} size={12} />
              <span>{subject.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="qa-toolbar-meta">
        <span>
          <strong className="q-num">{totalResults}</strong> bài toán phù hợp
        </span>

        {activeTag && (
          <span className="qa-tagchip">
            #{activeTag}
            <button type="button" onClick={() => onTagChange?.('')} aria-label="Bỏ lọc theo thẻ">
              <X size={11} />
            </button>
          </span>
        )}

        {hasActiveFilters && (
          <button type="button" className="qa-reset" onClick={onClearFilters}>
            <X size={12} />
            <span>Xóa bộ lọc</span>
          </button>
        )}

        <div className="qa-meta-selects">
          <CommunitySelect
            compact
            value={activeDifficulty}
            options={DIFFICULTY_LEVELS.map((level) => ({ value: level.id, label: level.label }))}
            onChange={onDifficultyChange}
            ariaLabel="Lọc theo mức độ"
          />

          <CommunitySelect
            compact
            value={activeSort}
            options={[
              { value: 'newest', label: 'Mới nhất' },
              { value: 'popular', label: 'Nhiều lượt thích' },
              { value: 'mostViewed', label: 'Xem nhiều nhất' },
              { value: 'unanswered', label: 'Chưa có lời giải' }
            ]}
            onChange={onSortChange}
            ariaLabel="Sắp xếp bài toán"
          />
        </div>
      </div>
    </div>
  );
}
