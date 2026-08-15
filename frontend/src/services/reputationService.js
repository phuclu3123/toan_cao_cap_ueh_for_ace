/**
 * Art of Problem Solving (AoPS) Style Reputation & Ranking Service
 * Tailored for UEH Higher & Applied Mathematics curriculum.
 * Zero emojis, clean metadata.
 */

export const REPUTATION_POINTS = {
  POST_QUESTION: 5,          // Đăng bài toán / câu hỏi mới
  POST_ANSWER: 10,           // Gửi 1 lời giải chi tiết
  UPVOTE_ANSWER_RECEIVED: 10, // Nhận 1 upvote cho câu trả lời
  UPVOTE_QUESTION_RECEIVED: 5, // Nhận 1 upvote cho câu hỏi
  ACCEPTED_SOLUTION: 25,     // Lời giải được chọn là "Lời giải chuẩn xác"
  INSTRUCTOR_VERIFIED: 35,   // Lời giải được Giảng viên/Cố vấn xác minh
  FIRST_SOLVER_BONUS: 15     // Người đầu tiên giải được bài toán khó
};

export const MEMBER_TIERS = [
  {
    id: 'owner',
    name: 'Quản trị viên UEH TCC',
    nameEn: 'UEH TCC Administrator',
    minPoints: 9999,
    color: '#a1731f',
    bgColor: 'rgba(161, 115, 31, 0.12)',
    borderColor: '#c9a24d',
    glowClass: 'rank-glow-owner'
  },
  {
    id: 'legend',
    name: 'Huyền thoại UEH',
    nameEn: 'UEH Math Legend',
    minPoints: 1000,
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.12)',
    borderColor: '#f59e0b',
    glowClass: 'rank-glow-gold'
  },
  {
    id: 'grandmaster',
    name: 'Đại kiện tướng TCC',
    nameEn: 'TCC Grandmaster',
    minPoints: 500,
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.12)',
    borderColor: '#a78bfa',
    glowClass: 'rank-glow-purple'
  },
  {
    id: 'solver',
    name: 'Chiến thần Giải tích',
    nameEn: 'Calculus & Algebra Solver',
    minPoints: 200,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.12)',
    borderColor: '#34d399',
    glowClass: 'rank-glow-emerald'
  },
  {
    id: 'explorer',
    name: 'Học viên Nỗ lực',
    nameEn: 'Applied Math Explorer',
    minPoints: 50,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#60a5fa',
    glowClass: 'rank-glow-blue'
  },
  {
    id: 'novice',
    name: 'Tân sinh viên',
    nameEn: 'Freshman Math Explorer',
    minPoints: 0,
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.12)',
    borderColor: '#cbd5e1',
    glowClass: 'rank-glow-gray'
  }
];

export const SPECIALTY_BADGES = [
  {
    id: 'first-solver',
    title: 'First Solver',
    desc: 'Người đầu tiên giải chính xác một bài toán chưa có lời giải.'
  },
  {
    id: 'algebra-master',
    title: 'Bậc thầy Ma trận',
    desc: 'Đóng góp 5 lời giải xuất sắc về Đại số Tuyến tính & Ma trận.'
  },
  {
    id: 'lagrange-pro',
    title: 'Chuyên gia Cực trị',
    desc: 'Giải quyết chính xác các bài toán tối ưu có điều kiện Lagrange.'
  },
  {
    id: 'top-contributor',
    title: 'Cống hiến Học thuật',
    desc: 'Đạt trên 500 điểm cống hiến hỗ trợ sinh viên trong cộng đồng.'
  }
];

/**
 * Get tier object corresponding to point score
 */
export function getTierByPoints(points = 0) {
  for (const tier of MEMBER_TIERS) {
    if (points >= tier.minPoints) {
      return tier;
    }
  }
  return MEMBER_TIERS[MEMBER_TIERS.length - 1];
}

/**
 * Calculate progress to next rank tier
 */
export function getTierProgress(points = 0) {
  const currentTier = getTierByPoints(points);
  const currentIdx = MEMBER_TIERS.findIndex(t => t.id === currentTier.id);

  if (currentIdx === 0) {
    return {
      currentTier,
      nextTier: null,
      percentage: 100,
      remaining: 0,
      current: points,
      target: currentTier.minPoints
    };
  }

  const nextTier = MEMBER_TIERS[currentIdx - 1];
  const pointsInCurrentTier = points - currentTier.minPoints;
  const pointsNeeded = nextTier.minPoints - currentTier.minPoints;
  const percentage = Math.min(100, Math.max(0, Math.round((pointsInCurrentTier / pointsNeeded) * 100)));

  return {
    currentTier,
    nextTier,
    percentage,
    remaining: Math.max(0, nextTier.minPoints - points),
    current: points,
    target: nextTier.minPoints
  };
}
