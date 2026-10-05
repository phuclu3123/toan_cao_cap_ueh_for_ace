import { useState } from 'react';
import {
  PenLine,
  BookOpen,
  Trophy,
  Search,
  X,
  Sigma,
  CheckCircle2
} from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * Modern Mathematics Stack Exchange Style Header Banner
 * Clean academic branding + quick stats + global search + direct Ask Question CTA
 */
export default function CommunityHeader({
  stats,
  searchQuery = '',
  onSearchChange,
  onOpenCreate,
  onOpenLeaderboard,
  onOpenCheatsheet
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const totalDiscussions = stats?.totalDiscussions || 0;
  const totalAnswers = stats?.totalAnswers || 0;
  const solvedRate = stats?.solvedRate || 0;
  const openCount = stats?.openCount || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  const handleClear = () => {
    setLocalSearch('');
    onSearchChange?.('');
  };

  return (
    <header className="qa-math-masthead">
      {/* Background Math Graph Grid is styled via CSS */}
      <div className="qa-masthead-container">
        {/* Brand Row */}
        <div className="qa-masthead-brand-row">
          <div className="qa-brand-identity">
            <div className="qa-brand-icon-box">
              <Sigma size={24} className="qa-brand-sigma" />
            </div>
            <div className="qa-brand-text">
              <div className="qa-brand-title">
                <span>MATHEMATICS</span>
                <span className="qa-brand-subbadge">UEH FORUM</span>
              </div>
              <p className="qa-brand-tagline">
                Diễn đàn Thảo luận & Hỏi đáp Toán Cao Cấp · Đại học Kinh tế TP.HCM
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="qa-header-stats-strip">
            <div className="qa-hstat-item">
              <span className="hstat-num">{totalDiscussions}</span>
              <span className="hstat-label">Bài toán</span>
            </div>
            <div className="qa-hstat-divider" />
            <div className="qa-hstat-item">
              <span className="hstat-num">{totalAnswers}</span>
              <span className="hstat-label">Lời giải</span>
            </div>
            <div className="qa-hstat-divider" />
            <div className="qa-hstat-item is-solved-stat">
              <span className="hstat-num">
                <CheckCircle2 size={13} /> {solvedRate}%
              </span>
              <span className="hstat-label">Đã giải</span>
            </div>
            <div className="qa-hstat-divider" />
            <div className="qa-hstat-item is-waiting-stat">
              <span className="hstat-num">{openCount}</span>
              <span className="hstat-label">Đang chờ</span>
            </div>
          </div>
        </div>

        {/* Search & Actions Sub-row */}
        <div className="qa-masthead-search-row">
          <form className="qa-global-search-form" onSubmit={handleSearchSubmit}>
            <Search size={16} className="qa-search-icon" />
            <input
              type="search"
              className="qa-global-search-input"
              value={localSearch}
              placeholder="Tìm kiếm bài toán, khái niệm, công thức LaTeX (Lagrange, \det, Cobb-Douglas, Trị riêng...)"
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              aria-label="Tìm kiếm câu hỏi Toán học"
            />
            {localSearch && (
              <button
                type="button"
                className="qa-search-clear-btn"
                onClick={handleClear}
                aria-label="Xóa từ khóa"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="qa-header-cta-group">
            <button
              type="button"
              className="qa-btn-cheatsheet"
              onClick={onOpenCheatsheet}
              title="Mở Sổ tay công thức toán của Phúc"
            >
              <BookOpen size={15} />
              <span>Sổ tay công thức của Phúc</span>
            </button>

            <button
              type="button"
              className="qa-btn-leaderboard"
              onClick={onOpenLeaderboard}
              title="Xem bảng vàng top thành viên đóng góp"
            >
              <Trophy size={15} />
              <span>Bảng vàng</span>
            </button>

            <button
              type="button"
              className="qa-btn-ask-primary"
              onClick={onOpenCreate}
            >
              <PenLine size={15} />
              <span>Đặt câu hỏi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
