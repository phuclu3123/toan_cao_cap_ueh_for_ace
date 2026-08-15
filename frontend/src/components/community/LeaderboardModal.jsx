import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Trophy, X, Crown, Medal, ShieldCheck } from 'lucide-react';
import UserRankBadge from './UserRankBadge';
import '../../assets/styles/community.css';

const PERIODS = [
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'all', label: 'Mọi thời đại' }
];

const PODIUM_META = [
  { key: 'gold', label: 'Quán quân', Icon: Crown },
  { key: 'silver', label: 'Á quân', Icon: Medal },
  { key: 'bronze', label: 'Hạng ba', Icon: Medal }
];

function Avatar({ member, className = '' }) {
  if (member?.avatar) {
    return <img src={member.avatar} alt={member.name} className={className} />;
  }
  return <span className={className}>{(member?.name || 'U').charAt(0).toUpperCase()}</span>;
}

/**
 * Full ranking of community contributors.
 */
export default function LeaderboardModal({ isOpen, onClose, leaderboard = [] }) {
  const [period, setPeriod] = useState('all');

  if (!isOpen) return null;

  // Podium order: 2nd, 1st, 3rd — the champion sits in the middle and taller
  const podium = leaderboard.slice(0, 3);
  const podiumLayout = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);

  // Scale the bars against the runner-up: the owner's ceiling score would
  // otherwise flatten every other member to an invisible sliver.
  const barBaseline = leaderboard[1]?.points || leaderboard[0]?.points || 1;
  const barWidth = (points) =>
    Math.min(100, Math.max(4, ((points || 0) / barBaseline) * 100));

  return createPortal(
    <div
      className="modal-backdrop-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="leaderboard-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="leaderboard-modal-header">
          <div>
            <span className="q-eyebrow qa-modal-eyebrow">
              <Trophy size={12} /> Vinh danh đóng góp
            </span>
            <h2 id="leaderboard-modal-title" className="qa-modal-title">Bảng vàng UEH TCC</h2>
            <p className="qa-modal-sub">
              Xếp hạng theo điểm cống hiến tích lũy từ lời giải, bài toán và lượt ghi nhận hữu ích.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Đóng bảng vàng">
            <X size={17} />
          </button>
        </header>

        <div className="leaderboard-period-tabs">
          <div className="qa-segment">
            {PERIODS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={period === t.id ? 'is-active' : ''}
                onClick={() => setPeriod(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {podium.length === 3 && (
          <div className="leaderboard-podium">
            {podiumLayout.map((memberIdx) => {
              const member = podium[memberIdx];
              const { key, label, Icon } = PODIUM_META[memberIdx];
              return (
                <Link
                  key={member.id || memberIdx}
                  to={`/community/user/${member.id}`}
                  onClick={onClose}
                  className={`podium-card is-${key} ${memberIdx === 0 ? 'is-champion' : ''}`}
                >
                  <span className={`podium-medal ${key}`}>
                    <Icon size={13} /> {label}
                  </span>

                  <span className="podium-avatar">
                    <Avatar member={member} className="podium-avatar-img" />
                  </span>

                  <span className="podium-name">{member.name}</span>
                  <UserRankBadge points={member.points} size="small" />
                  <span className="podium-points q-num">
                    {(member.points || 0).toLocaleString('vi-VN')}
                    <small>điểm</small>
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="leaderboard-table-wrap custom-scrollbar">
          <ol className="qa-rank-list">
            {leaderboard.map((member, index) => (
              <li key={member.id || index} className={`qa-rank-row ${member.isAdmin ? 'is-owner' : ''}`}>
                <span className={`qa-rank-num ${index < 3 ? 'is-top' : ''} q-num`}>{index + 1}</span>

                <Link to={`/community/user/${member.id}`} className="qa-rank-member" onClick={onClose}>
                  <Avatar member={member} className="qa-rank-avatar" />
                  <span className="qa-rank-meta">
                    <span className="qa-rank-name">
                      {member.name}
                      {member.isAdmin && (
                        <span className="qa-owner-tag is-inline"><ShieldCheck size={10} /> Quản trị</span>
                      )}
                    </span>
                    <span className="qa-rank-sub">{member.cohort || 'UEH Member'}</span>
                  </span>
                </Link>

                <span className="qa-rank-tier">
                  <UserRankBadge points={member.points} size="small" />
                </span>

                {/* Score bar makes the gap between ranks readable at a glance */}
                <span className="qa-rank-score">
                  <span className="qa-rank-bar">
                    <i style={{ width: `${barWidth(member.points)}%` }} />
                  </span>
                  <b className="q-num">{(member.points || 0).toLocaleString('vi-VN')}</b>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <footer className="leaderboard-footer">
          <span className="points-rule-hint">
            +10 lời giải · +25 lời giải chuẩn xác · +15 First Solver · +5 mỗi lượt hữu ích
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Đóng bảng vàng
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
