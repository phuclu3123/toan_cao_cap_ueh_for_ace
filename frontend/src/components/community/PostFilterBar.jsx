import { useEffect, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Tag
} from 'lucide-react';
import { SUBJECT_CATEGORIES, DIFFICULTY_LEVELS } from '../../services/communityService';
import CommunitySelect from './CommunitySelect';
import '../../assets/styles/community.css';

const POPULAR_MATH_TAGS = [
  'calculus',
  'linear-algebra',
  'real-analysis',
  'probability',
  'matrices',
  'integration',
  'Lagrange',
  'CobbDouglas',
  'Leontief',
  'GaussJordan',
  'CucTri'
];

/**
 * Filter bar with Integrated Search + Popular Tags Strip + StackExchange Tabs + Category Dropdowns
 */
export default function PostFilterBar({
  activeSubject = 'all',
  activeDifficulty = 'all',
  activeStatus = 'all',
  activeSort = 'newest',
  activeTag = '',
  searchQuery = '',
  totalResults = 0,
  onSubjectChange,
  onDifficultyChange,
  onStatusChange,
  onSortChange,
  onSearchChange,
  onTagChange,
  onClearFilters,
  onOpenMobileFilters,
  onOpenCreate
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (localSearch === searchQuery) return undefined;
    const timer = window.setTimeout(() => onSearchChange?.(localSearch), 350);
    return () => window.clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const hasActiveFilters =
    activeSubject !== 'all' ||
    activeDifficulty !== 'all' ||
    activeStatus !== 'all' ||
    Boolean(searchQuery) ||
    Boolean(activeTag);

  const filterTabs = [
    { id: 'interesting', label: 'Quan tâm', icon: Sparkles },
    { id: 'hot', label: 'Sôi nổi (Hot)', icon: Flame },
    { id: 'newest', label: 'Mới nhất', icon: Clock },
    { id: 'unanswered', label: 'Chưa giải', icon: HelpCircle },
    { id: 'solved', label: 'Đã giải', icon: CheckCircle2 }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'unanswered') {
      onStatusChange?.('unsolved');
      onSortChange?.('newest');
    } else if (tabId === 'solved') {
      onStatusChange?.('solved');
      onSortChange?.('newest');
    } else if (tabId === 'interesting') {
      onStatusChange?.('all');
      onSortChange?.('popular');
    } else if (tabId === 'hot') {
      onStatusChange?.('all');
      onSortChange?.('mostViewed');
    } else if (tabId === 'newest') {
      onStatusChange?.('all');
      onSortChange?.('newest');
    }
  };

  const getCurrentTabId = () => {
    if (activeStatus === 'unsolved') return 'unanswered';
    if (activeStatus === 'solved') return 'solved';
    if (activeSort === 'popular') return 'interesting';
    if (activeSort === 'mostViewed') return 'hot';
    return 'newest';
  };

  const currentTab = getCurrentTabId();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange?.('');
  };

  return (
    <div className="qa-feed-header-section">
      {/* 1. Header Row: "Explore our questions" + "Ask Question" Button */}
      <div className="qa-explore-row">
        <div className="qa-explore-title-group">
          <h2 className="qa-explore-heading">Explore our questions</h2>
          <span className="qa-explore-count-pill">
            {totalResults} câu hỏi
          </span>
        </div>

        <button
          type="button"
          className="qa-ask-question-btn"
          onClick={onOpenCreate}
        >
          <Plus size={16} />
          <span>Ask Question</span>
        </button>
      </div>

      {/* 2. Integrated Search Bar */}
      <form className="qa-feed-search-form" onSubmit={handleSearchSubmit}>
        <Search size={15} className="qa-search-icon" />
        <input
          type="search"
          className="qa-feed-search-input"
          value={localSearch}
          placeholder="Tìm bài toán, công thức LaTeX (\det, Lagrange, Leontief, Cobb-Douglas, Trị riêng...)"
          onChange={(e) => {
            setLocalSearch(e.target.value);
          }}
          aria-label="Tìm kiếm câu hỏi"
        />
        {localSearch && (
          <button
            type="button"
            className="qa-search-clear-btn"
            onClick={handleClearSearch}
            aria-label="Xóa từ khóa"
          >
            <X size={13} />
          </button>
        )}
      </form>

      {/* 3. Popular Tags Quick Pill Strip */}
      <div className="qa-popular-tags-strip">
        <span className="qa-tags-strip-label">
          <Tag size={13} /> Thẻ phổ biến:
        </span>
        <div className="qa-tags-scroll-wrap">
          {POPULAR_MATH_TAGS.map((tag) => {
            const isSelected = activeTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                className={`qa-math-tag-pill ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onTagChange?.(isSelected ? '' : tag)}
              >
                <span>{tag}</span>
                {isSelected && <X size={11} className="tag-clear-icon" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Tabs Bar & Dropdown Selects */}
      <div className="qa-tabs-and-selects-bar">
        {/* Left: Filter Tabs (Interesting, Hot, Newest, Unanswered, Solved) */}
        <div className="qa-filter-tabs-group" role="tablist">
          {filterTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={currentTab === id}
              className={`qa-ftab-btn ${currentTab === id ? 'is-active' : ''}`}
              onClick={() => handleTabClick(id)}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Category & Difficulty Dropdowns + Clear filters */}
        <div className="qa-dropdowns-group">
          {hasActiveFilters && (
            <button
              type="button"
              className="qa-reset-filter-btn"
              onClick={onClearFilters}
              title="Đặt lại tất cả bộ lọc"
            >
              <X size={12} />
              <span>Xóa lọc</span>
            </button>
          )}

          <div className="qa-select-wrapper">
            <CommunitySelect
              compact
              value={activeSubject}
              options={SUBJECT_CATEGORIES.map((sub) => ({
                value: sub.id,
                label: sub.label
              }))}
              onChange={onSubjectChange}
              ariaLabel="Lọc theo môn học"
            />
          </div>

          <div className="qa-select-wrapper">
            <CommunitySelect
              compact
              value={activeDifficulty}
              options={DIFFICULTY_LEVELS.map((level) => ({
                value: level.id,
                label: level.label
              }))}
              onChange={onDifficultyChange}
              ariaLabel="Lọc theo độ khó"
            />
          </div>

          {onOpenMobileFilters && (
            <button
              type="button"
              className="qa-mobile-filter-trigger"
              onClick={onOpenMobileFilters}
              aria-label="Mở bộ lọc di động"
            >
              <SlidersHorizontal size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
