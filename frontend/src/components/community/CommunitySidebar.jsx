import { Link } from 'react-router-dom';
import {
  Flame,
  Trophy,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Crown,
  Medal,
  Check,
  ShieldCheck
} from 'lucide-react';
import MathRenderer from '../MathRenderer';
import '../../assets/styles/community.css';

function MedalIcon({ index }) {
  if (index === 0) return <Crown size={14} className="medal-crown-gold" />;
  if (index === 1) return <Medal size={14} className="medal-silver" />;
  if (index === 2) return <Medal size={14} className="medal-bronze" />;
  return <span className="rank-plain-number">{index + 1}</span>;
}

/**
 * Right sidebar with Hot Network Questions, Trending Tags, Leaderboard & Guidelines
 */
export default function CommunitySidebar({
  leaderboard = [],
  topUsers,
  hotQuestions = [],
  trendingTags = [],
  onOpenLeaderboard,
  onOpenCheatsheet
}) {
  const solvers = (topUsers || leaderboard || []).slice(0, 5);

  return (
    <aside className="se-right-sidebar" aria-label="Tiện ích cộng đồng">
      {/* 1. Hot Network Questions (Signature StackExchange widget) */}
      <section className="se-sidebar-card hot-questions-card">
        <div className="se-card-header">
          <div className="se-header-title-wrap">
            <Flame size={16} className="hot-flame-icon" />
            <h3 className="se-widget-title">Hot Network Questions</h3>
          </div>
        </div>

        <ul className="hot-questions-list">
          {hotQuestions.map((item) => (
            <li key={item.id} className="hot-question-item">
              <span className="hot-bullet-icon">
                {item.isAccepted || item.status === 'solved' ? (
                  <span className="hot-dot-solved" title="Đã có lời giải">●</span>
                ) : (
                  <span className="hot-dot-open" title="Đang chờ giải">○</span>
                )}
              </span>
              <Link to={`/community/${item.id}`} className="hot-question-link">
                <MathRenderer text={item.title} inline />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Top Solvers / Leaderboard widget */}
      {solvers.length > 0 && (
        <section className="se-sidebar-card top-solvers-card">
          <div className="se-card-header">
            <div className="se-header-title-wrap">
              <Trophy size={15} className="trophy-gold-icon" />
              <h3 className="se-widget-title">Bảng vàng cống hiến</h3>
            </div>
            <button
              type="button"
              className="se-header-action-link"
              onClick={onOpenLeaderboard}
            >
              Xem tất cả
            </button>
          </div>

          <div className="se-solvers-list">
            {solvers.map((user, idx) => (
              <div
                key={user.id || idx}
                className={`se-solver-row ${idx === 0 ? 'is-first-place' : ''}`}
              >
                <div className="se-solver-rank">
                  <MedalIcon index={idx} />
                </div>

                <Link to={`/community/user/${user.id}`} className="se-solver-avatar-wrap">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="se-solver-avatar" />
                  ) : (
                    <span className="se-solver-avatar-fallback">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>

                <div className="se-solver-info">
                  <Link to={`/community/user/${user.id}`} className="se-solver-name">
                    {user.name}
                  </Link>
                  <span className="se-solver-cohort">{user.cohort || 'K50 UEH'}</span>
                </div>

                <div className="se-solver-points">
                  <span className="points-val">{user.points || 0}</span>
                  <span className="points-unit">pts</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Weekly Math Challenge */}
      <section className="se-sidebar-card challenge-card">
        <div className="challenge-card-badge">
          <Sparkles size={12} />
          <span>Thử thách tuần · +50 pts</span>
        </div>

        <h4 className="challenge-math-title">
          Tìm cực trị có điều kiện của hàm 3 biến:
        </h4>

        <div className="challenge-equation-box">
          <MathRenderer text="$$f(x,y,z) = x^2 + 2y^2 + 3z^2$$" />
          <div className="challenge-subconstraint">
            <MathRenderer text="thỏa mãn điều kiện mặt cầu: $x^2 + y^2 + z^2 = 1$" inline />
          </div>
        </div>

        <Link to="/community/ueh-weekly-challenge-lagrange-sphere" className="challenge-action-cta">
          <span>Gửi lời giải ngay</span>
          <ArrowRight size={13} />
        </Link>
      </section>

      {/* 4. Trending Tags */}
      {trendingTags.length > 0 && (
        <section className="se-sidebar-card trending-tags-card">
          <div className="se-card-header">
            <div className="se-header-title-wrap">
              <TrendingUp size={15} className="trending-icon" />
              <h3 className="se-widget-title">Chủ đề thịnh hành</h3>
            </div>
          </div>

          <div className="se-tags-cloud">
            {trendingTags.slice(0, 10).map((item, idx) => (
              <Link
                key={idx}
                to={`/community?tag=${encodeURIComponent(item.tag)}`}
                className="se-trending-tag-pill"
              >
                <span className="tag-name">{item.tag}</span>
                <span className="tag-multiplier">× {item.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Guidelines & Quick KaTeX Reference */}
      <section className="se-sidebar-card guidelines-card">
        <div className="se-card-header">
          <div className="se-header-title-wrap">
            <ShieldCheck size={15} className="guidelines-icon" />
            <h3 className="se-widget-title">Quy ước hỏi đáp Toán học</h3>
          </div>
        </div>

        <ul className="guidelines-list">
          <li>
            <Check size={12} className="guideline-check" />
            <span>Trình bày đề bài rõ ràng kèm dữ kiện & giả thiết.</span>
          </li>
          <li>
            <Check size={12} className="guideline-check" />
            <span>Kẹp công thức Toán trong <code>$...$</code> hoặc <code>$$...$$</code>.</span>
          </li>
          <li>
            <Check size={12} className="guideline-check" />
            <span>Chấp nhận lời giải đúng để khích lệ người giải.</span>
          </li>
        </ul>

        <button
          type="button"
          className="se-open-cheatsheet-btn"
          onClick={onOpenCheatsheet}
        >
          <BookOpen size={14} />
          <span>Mở sổ tay công thức của Phúc</span>
        </button>
      </section>
    </aside>
  );
}
