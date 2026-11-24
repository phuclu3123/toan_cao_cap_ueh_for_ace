import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  HelpCircle,
  Clock,
  Tag,
  Trophy,
  BookOpen,
  Bookmark,
  Layers
} from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * Left navigation sidebar matching Mathematics & Physics Stack Exchange layout.
 */
export default function CommunityNavSidebar({
  activeNav = 'questions',
  activeStatus = 'all',
  onSelectNav,
  onOpenLeaderboard,
  onOpenCheatsheet,
  totalUnanswered = 0,
  savedCount = 0
}) {
  const location = useLocation();

  const isQuestionsActive =
    (activeNav === 'questions' || !activeNav) && activeStatus === 'all' && location.pathname === '/community';
  const isUnansweredActive = activeStatus === 'unsolved' || activeNav === 'unanswered';
  const isSavedActive = activeStatus === 'saved' || location.pathname === '/community/saved';

  return (
    <nav className="qa-left-nav" aria-label="Thanh điều hướng diễn đàn">
      <div className="qa-left-nav-inner">
        {/* Main Nav Section */}
        <div className="qa-nav-group">
          <Link
            to="/"
            className="qa-nav-item"
            title="Trang chủ UEH Toán Cao Cấp"
          >
            <Home size={16} />
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* Public Q&A Section */}
        <div className="qa-nav-group">
          <div className="qa-nav-heading">Khám phá toán học</div>

          <Link
            to="/community"
            className={`qa-nav-item ${isQuestionsActive ? 'is-active' : ''}`}
            onClick={() => onSelectNav?.('questions')}
          >
            <HelpCircle size={16} />
            <span>Câu hỏi & Thảo luận</span>
          </Link>

          <button
            type="button"
            className={`qa-nav-item ${isUnansweredActive ? 'is-active' : ''}`}
            onClick={() => onSelectNav?.('unanswered')}
          >
            <Clock size={16} />
            <span>Chưa có lời giải</span>
            {totalUnanswered > 0 && (
              <span className="qa-nav-badge">{totalUnanswered}</span>
            )}
          </button>

          <button
            type="button"
            className="qa-nav-item"
            onClick={() => onSelectNav?.('tags')}
          >
            <Tag size={16} />
            <span>Chủ đề & Thẻ</span>
          </button>

          <button
            type="button"
            className={`qa-nav-item ${isSavedActive ? 'is-active' : ''}`}
            onClick={() => onSelectNav?.('saved')}
          >
            <Bookmark size={16} />
            <span>Bài đã lưu</span>
            {savedCount > 0 && (
              <span className="qa-nav-badge is-saved">{savedCount}</span>
            )}
          </button>
        </div>

        {/* Learning Tools & Hub */}
        <div className="qa-nav-group">
          <div className="qa-nav-heading">Công cụ học tập</div>

          <button
            type="button"
            className="qa-nav-item"
            onClick={onOpenCheatsheet}
          >
            <BookOpen size={16} />
            <span>Sổ tay của Phúc</span>
          </button>

          <button
            type="button"
            className="qa-nav-item"
            onClick={onOpenLeaderboard}
          >
            <Trophy size={16} />
            <span>Bảng vàng tích cực</span>
          </button>

          <Link
            to="/resources"
            className="qa-nav-item"
          >
            <Layers size={16} />
            <span>Kho tài liệu giải</span>
          </Link>
        </div>


      </div>
    </nav>
  );
}
