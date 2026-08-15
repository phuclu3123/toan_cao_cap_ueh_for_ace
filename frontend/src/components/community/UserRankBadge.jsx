import {
  Crown,
  Trophy,
  Award,
  Sparkles,
  User,
  ShieldCheck
} from 'lucide-react';
import { getTierByPoints } from '../../services/reputationService';
import '../../assets/styles/community.css';

const TIER_ICONS = {
  owner: ShieldCheck,
  legend: Crown,
  grandmaster: Trophy,
  solver: Award,
  explorer: Sparkles,
  novice: User
};

/**
 * UserRankBadge component displays AoPS style tier badges and instructor badges with clean Lucide SVG icons.
 */
export default function UserRankBadge({ points = 0, isInstructor = false, size = 'normal', showPoints = false }) {
  const tier = getTierByPoints(points);
  const IconComponent = TIER_ICONS[tier.id] || Sparkles;

  return (
    <div className={`user-rank-badge-wrap size-${size}`} title={`${tier.name} (${points} điểm cống hiến)`}>
      {isInstructor && (
        <span className="instructor-badge" title="Cố vấn học thuật UEH TCC">
          <ShieldCheck size={11} />
          <span>Cố vấn TCC</span>
        </span>
      )}

      <span
        className="user-rank-badge"
        style={{
          color: tier.color,
          backgroundColor: tier.bgColor,
          borderColor: tier.borderColor
        }}
      >
        <IconComponent size={11} className="rank-icon-svg" />
        <span className="rank-name-text">{tier.name}</span>
        {showPoints && <span className="rank-points-text">({points}đ)</span>}
      </span>
    </div>
  );
}
