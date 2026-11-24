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

export const BADGE_CATEGORIES = [
  { id: 'all', label: 'Tất cả danh hiệu' },
  { id: 'algebra', label: 'Đại số Tuyến tính' },
  { id: 'calculus', label: 'Giải tích & Tối ưu' },
  { id: 'community', label: 'Cấp bậc cộng đồng' },
  { id: 'contribution', label: 'Cống hiến học thuật' }
];

export const SPECIALTY_BADGES = [
  // 2.1. Đại số Tuyến tính
  {
    id: 'algebra-hpt-matrix',
    category: 'algebra',
    title: 'Chuyên gia Hệ phương trình & Ma trận',
    desc: 'Giải quyết chính xác các bài toán ma trận nghịch đảo, định thức det(A) và hệ phương trình Crammer.',
    icon: 'Grid',
    pointsReq: 100
  },
  {
    id: 'algebra-leontief-io',
    category: 'algebra',
    title: 'Bậc thầy Input-Output Leontief',
    desc: 'Mô hình hóa và tính toán ma trận tổng sản lượng X = (I-A)^(-1)D trong mô hình kinh tế mở Leontief.',
    icon: 'BarChart3',
    pointsReq: 200
  },
  {
    id: 'algebra-vector-eigen',
    category: 'algebra',
    title: 'Không gian Vector & Trị riêng',
    desc: 'Thành thạo tìm cơ sở, tọa độ vector và giải phương trình đặc trưng det(A - λI) = 0.',
    icon: 'Maximize2',
    pointsReq: 300
  },

  // 2.2. Giải tích
  {
    id: 'calc-marginal-elasticity',
    category: 'calculus',
    title: 'Bậc thầy Hàm biên & Độ co giãn',
    desc: 'Phân tích cận biên và hệ số co giãn của cầu/doanh thu theo giá ε(Q/P) chuẩn mực trong kinh tế.',
    icon: 'TrendingUp',
    pointsReq: 100
  },
  {
    id: 'calc-limit-improper',
    category: 'calculus',
    title: 'Chuyên gia Giới hạn & Tích phân suy rộng',
    desc: 'Khử thành công các dạng vô định và xét sự hội tụ của tích phân suy rộng loại 1, loại 2.',
    icon: 'Sparkles',
    pointsReq: 150
  },
  {
    id: 'calc-diff-equation',
    category: 'calculus',
    title: 'Bậc thầy Phương trình vi phân',
    desc: 'Tìm nghiệm tổng quát và nghiệm riêng bài toán Cauchy cho phương trình vi phân cấp 1 & Bernoulli.',
    icon: 'Cpu',
    pointsReq: 250
  },
  {
    id: 'calc-econ-applications',
    category: 'calculus',
    title: 'Ứng dụng Vi phân trong Kinh tế',
    desc: 'Ứng dụng đạo hàm riêng và vi phân toàn phần vào bài toán cân bằng thị trường & tối ưu chi phí.',
    icon: 'PieChart',
    pointsReq: 200
  },
  {
    id: 'calc-lagrange-multivar',
    category: 'calculus',
    title: 'Bậc thầy Nhân tử Lagrange',
    desc: 'Tối ưu hóa đa biến có ràng buộc ngân sách và hàm sản xuất Cobb-Douglas bằng phương pháp Lagrange.',
    icon: 'Award',
    pointsReq: 350
  },
  {
    id: 'calc-unconstrained-extrema',
    category: 'calculus',
    title: 'Cực trị tự do & Ma trận Hessian',
    desc: 'Tìm điểm dừng và xét dấu ma trận đạo hàm cấp 2 Hessian để phân loại cực đại, cực tiểu.',
    icon: 'CheckCircle2',
    pointsReq: 200
  },

  // 2.3. Cấp bậc cộng đồng
  {
    id: 'community-rising-star',
    category: 'community',
    title: 'Thành viên đang nổi lên (Rising Star)',
    desc: 'Có chuỗi lời giải liên tiếp nhận được nhiều upvotes và lời khen từ sinh viên trong tuần.',
    icon: 'Sparkles',
    pointsReq: 50
  },
  {
    id: 'community-active-contributor',
    category: 'community',
    title: 'Thành viên đóng góp tích cực',
    desc: 'Đóng góp trên 10 bài giải chi tiết, giúp đỡ nhiều sinh viên K50 vượt qua bài tập khó.',
    icon: 'HelpCircle',
    pointsReq: 150
  },
  {
    id: 'community-core-member',
    category: 'community',
    title: 'Thành viên cốt cán UEH',
    desc: 'Trụ cột học thuật uy tín của diễn đàn Toán Cao Cấp UEH với điểm số trên 500.',
    icon: 'ShieldCheck',
    pointsReq: 500
  },
  {
    id: 'community-veteran',
    category: 'community',
    title: 'Thành viên kỳ cựu / Lâu năm',
    desc: 'Gắn bó bền bỉ, xây dựng kho tàng bài tập và tài liệu chất lượng cho toàn trường.',
    icon: 'Trophy',
    pointsReq: 1000
  },

  // 2.4. Danh hiệu cống hiến
  {
    id: 'community-enthusiast',
    category: 'contribution',
    title: 'Thành viên nhiệt tình giải bài',
    desc: 'Luôn sẵn sàng phản hồi và giải đáp câu hỏi của bạn bè trong thời gian sớm nhất.',
    icon: 'Heart',
    pointsReq: 80
  },
  {
    id: 'community-problem-setter',
    category: 'contribution',
    title: 'Cây bút vàng Đề bài & Bài toán hay',
    desc: 'Đóng góp các bài toán hay, đề thi thử thực chiến và thảo luận học thuật chuyên sâu.',
    icon: 'BookOpen',
    pointsReq: 120
  },
  {
    id: 'community-first-solver',
    category: 'contribution',
    title: 'Chiến thần First Solver',
    desc: 'Là người đầu tiên giải thành công một bài toán hóc búa chưa có lời giải.',
    icon: 'Zap',
    pointsReq: 150
  },
  {
    id: 'community-weekly-champ',
    category: 'contribution',
    title: 'Quán quân Thử thách tuần',
    desc: 'Gửi lời giải xuất sắc nhất và được bình chọn cho bài toán Thử thách tuần UEH.',
    icon: 'Crown',
    pointsReq: 300
  }
];

/**
 * Get tier object corresponding to point score
 */
export function getTierByPoints(points = 0) {
  for (const tier of MEMBER_TIERS) {
    if (tier.id === 'owner') continue;
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
  const earnedTiers = MEMBER_TIERS.filter(tier => tier.id !== 'owner');
  const currentIdx = earnedTiers.findIndex(t => t.id === currentTier.id);

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

  const nextTier = earnedTiers[currentIdx - 1];
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
