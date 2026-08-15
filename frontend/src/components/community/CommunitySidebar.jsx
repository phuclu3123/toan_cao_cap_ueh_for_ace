import { Link } from 'react-router-dom';
import {
  Trophy,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Crown,
  Medal,
  Check
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import UserRankBadge from './UserRankBadge';
import '../../assets/styles/community.css';

function MedalIcon({ index }) {
  if (index === 0) return <Crown size={14} className="medal-crown-gold" />;
  if (index === 1) return <Medal size={14} className="medal-silver" />;
  if (index === 2) return <Medal size={14} className="medal-bronze" />;
  return <span className="rank-plain-number">{index + 1}</span>;
}

/**
 * Sidebar: top contributors, weekly challenge, trending tags and house rules.
 */
export default function CommunitySidebar({
  leaderboard = [],
  topUsers,
  trendingTags = [],
  onOpenLeaderboard,
  onOpenCheatsheet
}) {
  const solvers = (topUsers || leaderboard || []).slice(0, 5);

  return (
    <aside className="community-signature-sidebar">
      {/* 1. Top contributors */}
      {solvers.length > 0 && (
        <section className="sidebar-signature-card leaderboard-widget">
          <div className="widget-top-bar">
            <div className="widget-heading-wrap">
              <span className="widget-icon-frame gold-glow">
                <Trophy size={15} />
              </span>
              <h3 className="widget-title-text">Bảng vàng đóng góp</h3>
            </div>
            <button type="button" className="widget-link-btn" onClick={onOpenLeaderboard}>
              Xem tất cả
            </button>
          </div>

          <div className="top-solvers-stack">
            {solvers.map((user, idx) => (
              <div key={user.id || idx} className={`solver-podium-row ${user.isAdmin ? 'is-owner' : ''}`}>
                <div className="solver-rank-indicator">
                  <MedalIcon index={idx} />
                </div>

                <Link to={`/community/user/${user.id}`} className="solver-avatar-link">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="solver-avatar-img" />
                  ) : (
                    <span className="solver-avatar-initial">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>

                <div className="solver-details-col">
                  <Link to={`/community/user/${user.id}`} className="solver-full-name">
                    {user.name}
                  </Link>
                  <div className="solver-badge-line">
                    <UserRankBadge points={user.points || 0} size="small" />
                  </div>
                </div>

                <div className="solver-score-box">
                  <span className="score-number">{user.points || 0}</span>
                  <span className="score-unit">pts</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Weekly challenge */}
      <section className="sidebar-signature-card weekly-challenge-signature">
        <div className="challenge-top-meta">
          <span className="challenge-badge-chip">
            <Sparkles size={11} /> Thử thách tuần
          </span>
          <span className="challenge-bonus-chip">+50 pts</span>
        </div>

        <h4 className="challenge-problem-title">
          Tìm cực trị có điều kiện của hàm 3 biến:
        </h4>

        <div className="challenge-math-formula-box">
          <MathRenderer text="$$f(x,y,z) = x^2 + 2y^2 + 3z^2$$" />
          <span className="constraint-text">trên mặt cầu $x^2 + y^2 + z^2 = 1$</span>
        </div>

        <p className="challenge-reward-sub">
          Phần thưởng: <strong>+50 điểm cống hiến</strong> và huy hiệu <strong>First Solver</strong>.
        </p>

        <Link to="/community/post-1" className="challenge-cta-btn">
          <span>Tham gia giải ngay</span>
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* 3. Trending tags */}
      {trendingTags.length > 0 && (
        <section className="sidebar-signature-card">
          <div className="widget-top-bar">
            <div className="widget-heading-wrap">
              <span className="widget-icon-frame blue-glow">
                <TrendingUp size={14} />
              </span>
              <h3 className="widget-title-text">Chủ đề quan tâm</h3>
            </div>
          </div>

          <div className="trending-tags-flex">
            {trendingTags.slice(0, 12).map((item, idx) => (
              <Link
                key={idx}
                to={`/community?tag=${encodeURIComponent(item.tag)}`}
                className="trending-tag-capsule"
              >
                <span className="tag-hash-symbol">#</span>
                <span className="tag-name-text">{item.tag}</span>
                <span className="tag-count-bubble">{item.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. House rules */}
      <section className="sidebar-signature-card guidelines-signature-card">
        <div className="widget-top-bar">
          <div className="widget-heading-wrap">
            <span className="widget-icon-frame emerald-glow">
              <BookOpen size={14} />
            </span>
            <h3 className="widget-title-text">Quy ước thảo luận</h3>
          </div>
        </div>

        <ul className="guidelines-checklist">
          <li>
            <Check size={13} className="check-bullet" />
            <span>Nêu rõ đề bài, giả thiết và yêu cầu cần giải quyết.</span>
          </li>
          <li>
            <Check size={13} className="check-bullet" />
            <span>Dùng cú pháp <code>$..$</code> hoặc <code>$$..$$</code> để gõ công thức KaTeX.</span>
          </li>
          <li>
            <Check size={13} className="check-bullet" />
            <span>Tôn trọng bản quyền học thuật và trích dẫn nguồn đề thi.</span>
          </li>
        </ul>

        <button type="button" className="open-cheatsheet-full-btn" onClick={onOpenCheatsheet}>
          <BookOpen size={14} />
          <span>Mở sổ tay KaTeX đầy đủ</span>
          <ArrowRight size={13} />
        </button>
      </section>
    </aside>
  );
}
