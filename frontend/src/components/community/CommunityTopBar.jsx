import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Trophy,
  Moon,
  Sun,
  LogIn,
  LogOut,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeContext } from '../../App';
import AuthModal from '../modals/AuthModal';
import '../../assets/styles/community.css';

/**
 * CommunityTopBar: Dedicated Stack Exchange Mathematics Top Navigation Bar
 */
export default function CommunityTopBar({ onOpenCreate, onOpenCheatsheet, onOpenLeaderboard }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      window.alert(error.message || 'Không thể thu hồi phiên đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="se-site-topbar">
      <div className="se-topbar-inner">
        {/* Left: Brand + Back to Portal Link */}
        <div className="se-topbar-left">
          <Link to="/" className="se-back-to-portal" title="Quay lại trang chủ UEH TCC">
            <ArrowLeft size={14} />
            <span>UEH TCC Hub</span>
          </Link>

          <Link to="/community" className="se-brand-logo-group">
            <div className="se-brand-icon-box">
              <span className="se-math-symbol">∑</span>
            </div>
            <div className="se-brand-text-block">
              <span className="se-brand-title">MATHEMATICS</span>
              <span className="se-brand-sub">UEH FORUM</span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <form className="se-topbar-search-form" onSubmit={handleSearchSubmit}>
          <Search size={15} className="se-topbar-search-icon" />
          <input
            type="search"
            className="se-topbar-search-input"
            placeholder="Search on Mathematics (công thức LaTeX, Lagrange, Định thức, Ma trận...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm trên diễn đàn Toán học"
          />
        </form>

        {/* Right: Quick Tools + Theme + Auth */}
        <div className="se-topbar-right">
          {onOpenCheatsheet && (
            <button
              type="button"
              className="se-topbar-btn"
              onClick={onOpenCheatsheet}
              title="Tra cứu Sổ tay công thức toán của Phúc"
            >
              <BookOpen size={15} />
              <span className="hide-on-mobile">Sổ tay công thức của Phúc</span>
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              type="button"
              className="se-topbar-btn"
              onClick={onOpenLeaderboard}
              title="Bảng vàng giải toán"
            >
              <Trophy size={15} />
              <span className="hide-on-mobile">Bảng vàng</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            className="se-topbar-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            aria-label="Đổi giao diện"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <div className="se-topbar-user-profile">
              <Link to={`/community/user/${currentUser.id || currentUser.uid}`} className="se-topbar-avatar-link">
                {currentUser.photoURL || currentUser.avatar ? (
                  <img src={currentUser.photoURL || currentUser.avatar} alt={currentUser.displayName || currentUser.name} />
                ) : (
                  <div className="se-topbar-avatar-fallback">
                    {(currentUser.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="se-topbar-user-name hide-on-mobile">
                  {currentUser.displayName || currentUser.name || 'Thành viên'}
                </span>
              </Link>
              <button
                type="button"
                className="se-topbar-logout-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Đăng xuất"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="se-topbar-auth-actions">
              <button
                type="button"
                className="se-topbar-login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn size={14} />
                <span>Đăng nhập</span>
              </button>
            </div>
          )}

          {/* Ask Question Fast CTA */}
          {onOpenCreate && (
            <button
              type="button"
              className="se-topbar-ask-btn"
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                } else {
                  onOpenCreate();
                }
              }}
            >
              <Plus size={15} />
              <span>Ask Question</span>
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          showLoginModal={showAuthModal}
          setShowLoginModal={setShowAuthModal}
        />
      )}
    </header>
  );
}
