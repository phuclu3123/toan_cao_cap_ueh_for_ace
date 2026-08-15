import { safeLocalStorage } from '../utils/safeStorage';
import { matchPost } from './searchEngine';
import { REPUTATION_POINTS } from './reputationService';
import { applyAdminIdentity } from './adminService';

/** A post counts as solved when it is flagged, or has an accepted answer. */
export function isPostSolved(post) {
  if (!post) return false;
  return Boolean(
    post.isSolved ||
    post.isAccepted ||
    post.status === 'solved' ||
    (post.answers || []).some(a => a.isAccepted || a.instructorVerified)
  );
}

/**
 * Lightweight publish preflight for questions. Answers and comments are
 * intentionally not pre-moderated; they are published immediately and can be
 * reported afterwards. This check only catches clear policy/quality problems.
 */
export function reviewCommunityPost({ type = 'question', title = '', content = '' } = {}) {
  if (type !== 'question') {
    return { passes: true, violations: [], checks: { clarity: true, safeMarkup: true, noSpam: true, respectful: true } };
  }

  const combined = `${title}\n${content}`.trim();
  const links = combined.match(/https?:\/\/\S+/gi) || [];
  const unsafeMarkup = /<\s*(script|iframe|object|embed)|javascript\s*:/i.test(combined);
  const spamPattern = /(.)\1{11,}|\b(?:casino|nhà cái|cá cược|kiếm tiền nhanh)\b/i.test(combined) || links.length > 3;
  const abusivePattern = /\b(?:địt|đụ|lồn|cặc|đéo|fuck|bitch)\b/i.test(combined);
  const clarity = title.trim().length >= 8 && content.trim().length >= 20;

  const violations = [];
  if (!clarity) violations.push('Câu hỏi chưa đủ tiêu đề hoặc mô tả để cộng đồng hiểu vấn đề.');
  if (unsafeMarkup) violations.push('Nội dung chứa mã nhúng hoặc liên kết thực thi không an toàn.');
  if (spamPattern) violations.push('Nội dung có dấu hiệu spam hoặc quảng cáo không liên quan.');
  if (abusivePattern) violations.push('Nội dung chứa ngôn từ công kích không phù hợp với thảo luận học thuật.');

  return {
    passes: violations.length === 0,
    violations,
    checks: {
      clarity,
      safeMarkup: !unsafeMarkup,
      noSpam: !spamPattern,
      respectful: !abusivePattern
    }
  };
}

/**
 * Shape a stored post for the UI: derive `isSolved` (the storage records only
 * `status`/`isAccepted`) and credit the owner's byline with owner standing.
 */
function normalizePost(post) {
  if (!post) return post;
  return {
    ...post,
    isSolved: isPostSolved(post),
    answersCount: post.answersCount ?? (post.answers || []).length,
    author: applyAdminIdentity(post.author),
    answers: (post.answers || []).map(answer => ({
      ...answer,
      author: applyAdminIdentity(answer.author)
    }))
  };
}

const STORAGE_KEY = 'ueh_tcc_community_posts_v5';
const SAVED_POSTS_KEY = 'ueh_tcc_saved_posts';
const VISITED_POSTS_KEY = 'ueh_tcc_visited_posts';
const HIDDEN_POSTS_KEY = 'ueh_tcc_hidden_posts';
const REPORTS_KEY = 'ueh_tcc_content_reports';

/**
 * 7 Core Subjects of UEH Higher & Applied Mathematics Curriculum
 */
export const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'Tất cả chuyên mục', iconKey: 'Globe' },
  { id: 'algebra', label: 'Đại số Tuyến tính & Ma trận', iconKey: 'Grid' },
  { id: 'calc1', label: 'Vi tích phân 1 (Hàm 1 biến)', iconKey: 'TrendingUp' },
  { id: 'calc2', label: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)', iconKey: 'Maximize2' },
  { id: 'econ_models', label: 'Mô hình Toán Kinh tế & Leontief', iconKey: 'BarChart3' },
  { id: 'prob_stats', label: 'Xác suất & Thống kê ứng dụng', iconKey: 'PieChart' },
  { id: 'exam_prep', label: 'Đề thi & Ôn luyện UEH', iconKey: 'GraduationCap' },
  { id: 'method_tips', label: 'Mẹo Casio & Công cụ hỗ trợ', iconKey: 'Cpu' }
];

export const DIFFICULTY_LEVELS = [
  { id: 'all', label: 'Tất cả mức độ', color: '#64748b', badgeBg: 'rgba(100, 116, 139, 0.12)' },
  { id: 'standard', label: 'Căn bản (5 - 6.5đ)', color: '#059669', badgeBg: 'rgba(5, 150, 105, 0.12)' },
  { id: 'medium', label: 'Khá Giỏi (7 - 8.5đ)', color: '#2563eb', badgeBg: 'rgba(37, 99, 235, 0.12)' },
  { id: 'hard', label: 'Nâng cao A+ (9 - 10đ)', color: '#d97706', badgeBg: 'rgba(217, 119, 6, 0.12)' },
  { id: 'olympiad', label: 'Thử thách Olympic UEH', color: '#7c3aed', badgeBg: 'rgba(124, 58, 237, 0.12)' }
];

/**
 * Format relative time in Vietnamese
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Vừa xong';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return past.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  if (diffDay > 0) return `${diffDay} ngày trước`;
  if (diffHour > 0) return `${diffHour} giờ trước`;
  if (diffMin > 0) return `${diffMin} phút trước`;
  return 'Vừa xong';
}

/**
 * Seed data with realistic UEH Applied Math problems & detailed LaTeX solutions
 */
const SEED_POSTS = [
  {
    id: 'post-1',
    type: 'question',
    title: 'Tìm cực trị có điều kiện của hàm lợi ích $U(x, y) = x^{0.6} y^{0.4}$ với ngân sách 120 triệu?',
    content: 'Chào mọi người, mình đang làm đề ôn tập Vi tích phân 2 của Thầy Phan Ngô Tuấn Anh. Đề bài yêu cầu: Một người tiêu dùng có hàm lợi ích $U(x, y) = x^{0.6} y^{0.4}$. Giá của hai loại hàng hóa lần lượt là $P_x = 3$ triệu đồng và $P_y = 4$ triệu đồng. Ngân sách tiêu dùng tối đa là $I = 120$ triệu đồng.\n\nHãy tìm gói hàng hóa $(x, y)$ tối ưu hóa lợi ích bằng phương pháp nhân tử Lagrange và tính giá trị lợi ích cực đại $U_{\\max}$?',
    subject: 'calc2',
    subjectLabel: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)',
    difficulty: 'hard',
    difficultyLabel: 'Nâng cao A+ (9 - 10đ)',
    tags: ['#Lagrange', '#CobbDouglas', '#CucTriCoDieuKien', '#ViTichPhan2'],
    author: {
      id: 'user-phuc',
      name: 'Lữ Võ Hoàng Phúc',
      cohort: 'K50 UEH',
      avatar: '',
      points: 1250,
      isInstructor: true
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    updatedAt: null,
    views: 452,
    upvotes: 28,
    upvotedBy: ['user-sample-1', 'user-sample-2'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-1-1',
    instructorVerified: true,
    answers: [
      {
        id: 'ans-1-1',
        postId: 'post-1',
        author: {
          id: 'user-hoang',
          name: 'Trần Minh Hoàng',
          cohort: 'K49 UEH',
          avatar: '',
          points: 620,
          isInstructor: false
        },
        content: 'Chào bạn, đây là bài toán tối ưu hóa tiêu dùng kinh điển dạng hàm Cobb-Douglas. Lời giải chi tiết từng bước như sau:\n\n**Bước 1: Lập hàm Lagrange**\nPhương trình điều kiện ngân sách: $3x + 4y = 120$.\nHàm số Lagrange tương ứng:\n$$\\mathcal{L}(x, y, \\lambda) = x^{0.6} y^{0.4} + \\lambda(120 - 3x - 4y)$$\n\n**Bước 2: Hệ phương trình điểm dừng**\nLấy đạo hàm riêng cấp 1 và cho bằng 0:\n$$\\begin{cases} \\mathcal{L}_x\' = 0.6 x^{-0.4} y^{0.4} - 3\\lambda = 0 \\\\ \\mathcal{L}_y\' = 0.4 x^{0.6} y^{-0.6} - 4\\lambda = 0 \\\\ 120 - 3x - 4y = 0 \\end{cases}$$\n\nChia phương trình (1) cho phương trình (2):\n$$\\frac{0.6 y}{0.4 x} = \\frac{3}{4} \\iff \\frac{3y}{2x} = \\frac{3}{4} \\iff y = \\frac{1}{2}x$$\n\n**Bước 3: Thay vào phương trình ngân sách**\n$$3x + 4\\left(\\frac{1}{2}x\\right) = 120 \\iff 5x = 120 \\implies x^* = 24$$\nSuy ra $y^* = 12$.\n\n**Kết luận:**\nGói hàng hóa tối ưu là $(x^*, y^*) = (24, 12)$ và lợi ích cực đại đạt được là:\n$$U_{\\max} = 24^{0.6} \\cdot 12^{0.4} \\approx 18.18$$',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        upvotes: 34,
        upvotedBy: ['user-phuc', 'user-sample-1'],
        isAccepted: true,
        instructorVerified: true,
        comments: [
          {
            id: 'cmt-1-1-1',
            author: { id: 'user-phuc', name: 'Lữ Võ Hoàng Phúc', cohort: 'K50 UEH' },
            content: 'Lời giải quá chuẩn xác và trình bày rất rõ ràng! Cảm ơn Hoàng nhé.',
            createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'post-2',
    type: 'question',
    title: 'Giải hệ phương trình tuyến tính 4 ẩn bằng phương pháp khử Gauss-Jordan?',
    content: 'Cho hệ phương trình tuyến tính sau:\n$$\\begin{cases} x_1 + 2x_2 - 3x_3 + 2x_4 = 4 \\\\ 2x_1 + 5x_2 - 5x_3 + 5x_4 = 9 \\\\ -x_1 - 3x_2 + 2x_3 - 3x_4 = -5 \\\\ 3x_1 + 8x_2 - 7x_3 + 9x_4 = 15 \\end{cases}$$\n\nCó bạn nào giúp mình biến đổi ma trận bổ sung $\\overline{A} = (A|B)$ về dạng bậc thang thu gọn để kết luận nghiệm không ạ?',
    subject: 'algebra',
    subjectLabel: 'Đại số Tuyến tính & Ma trận',
    difficulty: 'medium',
    difficultyLabel: 'Khá (7 - 8.5đ)',
    tags: ['#GaussJordan', '#HePhuongTrinh', '#MaTranBoSung', '#K51UEH'],
    author: {
      id: 'user-ngoc',
      name: 'Nguyễn Bích Ngọc',
      cohort: 'K51 UEH',
      avatar: '',
      points: 120
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    views: 310,
    upvotes: 14,
    upvotedBy: [],
    status: 'unanswered',
    isAccepted: false,
    answers: []
  },
  {
    id: 'post-3',
    type: 'article',
    title: 'Tổng hợp công thức tính Độ co giãn của cầu theo giá (Elasticity) và Ứng dụng doanh thu',
    content: 'Chào các bạn sinh viên UEH, trong chương trình Vi tích phân 1, dạng bài toán về **Hệ số co giãn (Elasticity)** của hàm cầu $Q = f(P)$ là một câu hỏi thường xuyên xuất hiện trong đề thi giữa kỳ và cuối kỳ.\n\n### 1. Công thức tính hệ số co giãn\n$$\\varepsilon_{Q/P} = \\frac{dQ}{dP} \\cdot \\frac{P}{Q}$$\n\n### 2. Ý nghĩa kinh tế và Mối liên hệ với Doanh thu $TR$\n- Khi $|\\varepsilon| > 1$ (Cầu co giãn): Giảm giá $P \\downarrow$ sẽ làm tăng Tổng doanh thu $TR \\uparrow$.\n- Khi $|\\varepsilon| < 1$ (Cầu kém co giãn): Tăng giá $P \\uparrow$ sẽ làm tăng Tổng doanh thu $TR \\uparrow$.\n- Khi $|\\varepsilon| = 1$ (Co giãn đơn vị): Doanh thu $TR$ đạt giá trị cực đại!',
    subject: 'calc1',
    subjectLabel: 'Vi tích phân 1 (Hàm 1 biến)',
    difficulty: 'easy',
    difficultyLabel: 'Cơ bản (5 - 7đ)',
    tags: ['#Elasticity', '#DoanhThuTR', '#ViTichPhan1', '#MeoHocUEH'],
    author: {
      id: 'user-phuc',
      name: 'Lữ Võ Hoàng Phúc',
      cohort: 'K50 UEH',
      avatar: '',
      points: 1250,
      isInstructor: true
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    views: 890,
    upvotes: 56,
    upvotedBy: [],
    status: 'solved',
    isAccepted: false,
    answers: []
  },
  {
    id: 'post-4',
    type: 'question',
    title: 'Tính tổng sản lượng trong mô hình Input-Output Leontief mở với ma trận hệ số kỹ thuật $A$?',
    content: 'Cho ma trận hệ số kỹ thuật của 3 ngành kinh tế:\n$$A = \\begin{pmatrix} 0.2 & 0.3 & 0.2 \\\\ 0.4 & 0.1 & 0.2 \\\\ 0.1 & 0.3 & 0.2 \\end{pmatrix}$$\nvà vector cầu cuối của thị trường là $D = (100, 200, 150)^T$.\n\nHãy tìm ma trận Leontief nghịch đảo $(I - A)^{-1}$ và tính vector tổng sản lượng $X$ đáp ứng nhu cầu nền kinh tế?',
    subject: 'econ_models',
    subjectLabel: 'Mô hình Toán Kinh tế & Leontief',
    difficulty: 'hard',
    difficultyLabel: 'Nâng cao A+ (9 - 10đ)',
    tags: ['#Leontief', '#InputOutput', '#MaTranHeSoKyThuat', '#ToanKinhTe'],
    author: {
      id: 'user-thanh',
      name: 'Vũ Đức Thành',
      cohort: 'K50 UEH',
      avatar: '',
      points: 210
    },
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    views: 412,
    upvotes: 19,
    upvotedBy: [],
    status: 'unanswered',
    isAccepted: false,
    answers: []
  },
  {
    id: 'post-5',
    type: 'question',
    title: 'Tìm phân phối xác suất đồng thời và hệ số tương quan $\\text{Cov}(X, Y)$ của hai biến ngẫu nhiên?',
    content: 'Cho bảng phân phối xác suất đồng thời của cặp biến ngẫu nhiên rời rạc $(X, Y)$ như sau:\n\n| X \\ Y | -1 | 0 | 1 |\n|---|---|---|---|\n| 0 | 0.1 | 0.2 | 0.1 |\n| 1 | 0.2 | 0.1 | 0.3 |\n\n1. Tính kỳ vọng $E(X), E(Y)$ và $E(XY)$.\n2. Tính hiệp phương sai $\\text{Cov}(X, Y)$ và cho biết $X, Y$ có độc lập với nhau không?',
    subject: 'prob_stats',
    subjectLabel: 'Xác suất & Thống kê ứng dụng',
    difficulty: 'medium',
    difficultyLabel: 'Khá (7 - 8.5đ)',
    tags: ['#XacSuat', '#BienNgauNhien', '#HiepPhuongSai', '#Covariance'],
    author: {
      id: 'user-mai',
      name: 'Đặng Tuyết Mai',
      cohort: 'K51 UEH',
      avatar: '',
      points: 175
    },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    views: 520,
    upvotes: 22,
    upvotedBy: [],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-5-1',
    answers: [
      {
        id: 'ans-5-1',
        postId: 'post-5',
        author: {
          id: 'user-phuc',
          name: 'Lữ Võ Hoàng Phúc',
          cohort: 'K50 UEH',
          avatar: '',
          points: 1250,
          isInstructor: true
        },
        content: 'Chào Mai, đây là lời giải chi tiết:\n\n**1. Bảng phân phối xác suất biên:**\n- Biến $X$ nhận giá trị $\\{0, 1\\}$ với $P(X=0) = 0.4$, $P(X=1) = 0.6$.\n$$\\implies E(X) = 0(0.4) + 1(0.6) = 0.6$$\n- Biến $Y$ nhận giá trị $\\{-1, 0, 1\\}$ với $P(Y=-1) = 0.3$, $P(Y=0) = 0.3$, $P(Y=1) = 0.4$.\n$$\\implies E(Y) = -1(0.3) + 0(0.3) + 1(0.4) = 0.1$$\n\n**2. Tính $E(XY)$ và Hiệp phương sai:**\n$$E(XY) = (1)(-1)(0.2) + (1)(1)(0.3) = 0.1$$\n$$\\text{Cov}(X,Y) = E(XY) - E(X)E(Y) = 0.1 - (0.6)(0.1) = 0.04$$\n\nVì $\\text{Cov}(X, Y) = 0.04 \\ne 0$ nên $X$ và $Y$ **không độc lập** (có tương quan tuyến tính dương nhẹ).',
        createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
        upvotes: 18,
        upvotedBy: ['user-mai'],
        isAccepted: true,
        comments: []
      }
    ]
  }
];

/*
 * Production starts with one real owner-authored discussion. The v5 storage
 * key intentionally retires the previous mock feed for existing browsers too.
 */
const INITIAL_ADMIN_POSTS = [
  {
    ...SEED_POSTS[0],
    id: 'admin-lagrange-question',
    author: {
      id: 'user-phuc',
      email: 'luphuc321@gmail.com',
      name: 'Lữ Võ Hoàng Phúc',
      cohort: 'K50 UEH',
      avatar: '',
      points: 9999,
      isAdmin: true,
      isInstructor: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: null,
    views: 1,
    upvotes: 0,
    upvotedBy: [],
    status: 'unanswered',
    isAccepted: false,
    acceptedAnswerId: null,
    instructorVerified: false,
    answers: []
  }
];

class CommunityService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    const existing = safeLocalStorage.getItem(STORAGE_KEY);
    if (!existing) {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_POSTS));
    }
  }

  getPostsFromStorage() {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_ADMIN_POSTS;
    } catch {
      return INITIAL_ADMIN_POSTS;
    }
  }

  savePostsToStorage(posts) {
    try {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Lỗi khi lưu trữ bài viết community:', error);
    }
  }

  // Saved Posts (Bookmarks)
  getSavedPostIds() {
    try {
      const data = safeLocalStorage.getItem(SAVED_POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleSavePost(postId) {
    const saved = this.getSavedPostIds();
    const index = saved.indexOf(postId);
    const isSavedNow = index === -1;
    if (isSavedNow) {
      saved.unshift(postId);
    } else {
      saved.splice(index, 1);
    }
    safeLocalStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(saved));
    return { isSaved: isSavedNow, savedPostIds: saved };
  }

  // Visited / Seen Posts
  getVisitedPostIds() {
    try {
      const data = safeLocalStorage.getItem(VISITED_POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  markPostVisited(postId) {
    const visited = this.getVisitedPostIds();
    if (!visited.includes(postId)) {
      visited.push(postId);
      safeLocalStorage.setItem(VISITED_POSTS_KEY, JSON.stringify(visited));
    }
    return visited;
  }

  // Hidden Posts
  getHiddenPostIds() {
    try {
      const data = safeLocalStorage.getItem(HIDDEN_POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  hidePost(postId) {
    const hidden = this.getHiddenPostIds();
    if (!hidden.includes(postId)) {
      hidden.push(postId);
      safeLocalStorage.setItem(HIDDEN_POSTS_KEY, JSON.stringify(hidden));
    }
    return hidden;
  }

  // Reports
  reportContent(reportData) {
    try {
      const reports = JSON.parse(safeLocalStorage.getItem(REPORTS_KEY) || '[]');
      const newReport = {
        id: `report-${Date.now()}`,
        ...reportData,
        createdAt: new Date().toISOString()
      };
      reports.push(newReport);
      safeLocalStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      return { success: true, report: newReport };
    } catch {
      return { success: false };
    }
  }

  /**
   * Fetch posts with flexible filtering, search and sorting
   */
  async getPosts({
    subject = 'all',
    difficulty = 'all',
    status = 'all', // 'all' | 'unanswered' | 'solved' | 'saved'
    sort = 'newest', // 'newest' | 'views' | 'upvotes' | 'comments'
    query = '',
    tag = '',
    page = 1,
    limit = 10,
    authorId = null
  } = {}) {
    // Artificial delay for realistic UI skeleton state
    await new Promise(r => setTimeout(r, 80));

    let allPosts = this.getPostsFromStorage();
    const hiddenIds = this.getHiddenPostIds();
    const savedIds = this.getSavedPostIds();

    // Exclude hidden posts
    let filtered = allPosts.filter(p => !hiddenIds.includes(p.id));

    // Filter by Subject
    if (subject && subject !== 'all') {
      filtered = filtered.filter(p => p.subject === subject);
    }

    // Filter by Difficulty
    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === difficulty);
    }

    // Filter by Status ('unsolved' and 'unanswered' are both accepted)
    const isSolved = (p) => p.status === 'solved' || p.isAccepted || p.isSolved;
    if (status === 'unanswered') {
      filtered = filtered.filter(p => (p.answers || []).length === 0);
    } else if (status === 'unsolved') {
      filtered = filtered.filter(p => !isSolved(p));
    } else if (status === 'solved') {
      filtered = filtered.filter(isSolved);
    } else if (status === 'saved') {
      filtered = filtered.filter(p => savedIds.includes(p.id));
    }

    // Filter by Author (Profile page)
    if (authorId) {
      filtered = filtered.filter(p => p.author?.id === authorId);
    }

    // Filter by Specific Tag
    if (tag) {
      const cleanTag = tag.toLowerCase().replace('#', '');
      filtered = filtered.filter(p =>
        (p.tags || []).some(t => t.toLowerCase().replace('#', '').includes(cleanTag))
      );
    }

    // Search filter (Hybrid text + LaTeX)
    if (query && query.trim()) {
      filtered = filtered.filter(p => matchPost(p, query));
    }

    // Sorting — accepts both the UI ids and the legacy short ids
    filtered.sort((a, b) => {
      if (sort === 'mostViewed' || sort === 'views') return (b.views || 0) - (a.views || 0);
      if (sort === 'popular' || sort === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0);
      if (sort === 'comments') return (b.answers?.length || 0) - (a.answers?.length || 0);
      if (sort === 'unanswered') {
        const gap = (a.answers?.length || 0) - (b.answers?.length || 0);
        if (gap !== 0) return gap;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // 'newest' default
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit).map(normalizePost);

    return {
      posts: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  /**
   * Get single post by ID and increment view count
   */
  async getPostById(id) {
    await new Promise(r => setTimeout(r, 60));
    const allPosts = this.getPostsFromStorage();
    const postIndex = allPosts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      throw new Error('Bài toán không tồn tại hoặc đã bị xóa.');
    }

    // Increment view count
    allPosts[postIndex].views = (allPosts[postIndex].views || 0) + 1;
    this.savePostsToStorage(allPosts);
    this.markPostVisited(id);

    return normalizePost(allPosts[postIndex]);
  }

  /**
   * Create a new post
   */
  async createPost({ title, content, subject, difficulty, tags, type = 'question', author, image = null, altText = '' }) {
    await new Promise(r => setTimeout(r, 120));
    const review = reviewCommunityPost({ type, title, content });
    if (!review.passes) throw new Error(review.violations[0]);
    const allPosts = this.getPostsFromStorage();

    const subjectObj = SUBJECT_CATEGORIES.find(s => s.id === subject);
    const diffObj = DIFFICULTY_LEVELS.find(d => d.id === difficulty);

    const newPost = {
      id: `post-${Date.now()}`,
      type,
      title: title.trim(),
      content: content.trim(),
      subject: subject || 'algebra',
      subjectLabel: subjectObj?.label || 'Đại số Tuyến tính & Ma trận',
      difficulty: difficulty || 'medium',
      difficultyLabel: diffObj?.label || 'Khá (7 - 8.5đ)',
      tags: Array.isArray(tags) ? tags : [],
      image,
      altText,
      author: {
        id: author?.uid || author?.id || 'guest',
        email: author?.email || '',
        name: author?.name || author?.displayName || 'Sinh viên UEH',
        cohort: author?.cohort || 'UEH Member',
        avatar: author?.avatar || author?.photoURL || '',
        points: (author?.points || 0) + REPUTATION_POINTS.POST_QUESTION,
        isInstructor: Boolean(author?.isInstructor)
      },
      createdAt: new Date().toISOString(),
      updatedAt: null,
      views: 1,
      upvotes: 1,
      upvotedBy: [author?.uid || author?.id || 'guest'],
      status: 'unanswered',
      isAccepted: false,
      answers: []
    };

    allPosts.unshift(newPost);
    this.savePostsToStorage(allPosts);
    this.markPostVisited(newPost.id);

    return newPost;
  }

  /**
   * Update existing post
   */
  async updatePost(postId, updateData) {
    await new Promise(r => setTimeout(r, 100));
    const review = reviewCommunityPost(updateData);
    if (!review.passes) throw new Error(review.violations[0]);
    const allPosts = this.getPostsFromStorage();
    const index = allPosts.findIndex(p => p.id === postId);

    if (index === -1) throw new Error('Không tìm thấy bài viết để cập nhật.');

    const subjectObj = updateData.subject ? SUBJECT_CATEGORIES.find(s => s.id === updateData.subject) : null;
    const diffObj = updateData.difficulty ? DIFFICULTY_LEVELS.find(d => d.id === updateData.difficulty) : null;

    allPosts[index] = {
      ...allPosts[index],
      ...updateData,
      ...(subjectObj ? { subjectLabel: subjectObj.label } : {}),
      ...(diffObj ? { difficultyLabel: diffObj.label } : {}),
      updatedAt: new Date().toISOString()
    };

    this.savePostsToStorage(allPosts);
    return allPosts[index];
  }

  /**
   * Delete post
   */
  async deletePost(postId) {
    await new Promise(r => setTimeout(r, 80));
    let allPosts = this.getPostsFromStorage();
    allPosts = allPosts.filter(p => p.id !== postId);
    this.savePostsToStorage(allPosts);
    return { success: true };
  }

  /**
   * Toggle Upvote on post
   */
  async toggleUpvotePost(postId, userId) {
    const allPosts = this.getPostsFromStorage();
    const index = allPosts.findIndex(p => p.id === postId);
    if (index === -1) throw new Error('Bài viết không tồn tại');

    const post = allPosts[index];
    post.upvotedBy = post.upvotedBy || [];
    const userIdx = post.upvotedBy.indexOf(userId);
    const hasUpvoted = userIdx === -1;

    if (hasUpvoted) {
      post.upvotedBy.push(userId);
      post.upvotes = (post.upvotes || 0) + 1;
    } else {
      post.upvotedBy.splice(userIdx, 1);
      post.upvotes = Math.max(0, (post.upvotes || 1) - 1);
    }

    this.savePostsToStorage(allPosts);
    return { upvotes: post.upvotes, hasUpvoted };
  }

  /**
   * Add an answer to a post
   */
  async addAnswer(postId, { content, author }) {
    await new Promise(r => setTimeout(r, 100));
    const allPosts = this.getPostsFromStorage();
    const index = allPosts.findIndex(p => p.id === postId);
    if (index === -1) throw new Error('Bài viết không tồn tại');

    const isFirstAnswer = (allPosts[index].answers || []).length === 0;

    const newAnswer = {
      id: `ans-${Date.now()}`,
      postId,
      author: {
        id: author?.uid || author?.id || 'guest',
        email: author?.email || '',
        name: author?.name || author?.displayName || 'Sinh viên UEH',
        cohort: author?.cohort || 'UEH Member',
        avatar: author?.avatar || author?.photoURL || '',
        points: (author?.points || 0) + REPUTATION_POINTS.POST_ANSWER + (isFirstAnswer ? REPUTATION_POINTS.FIRST_SOLVER_BONUS : 0),
        isInstructor: Boolean(author?.isInstructor)
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      isAccepted: false,
      instructorVerified: false,
      comments: []
    };

    allPosts[index].answers = allPosts[index].answers || [];
    allPosts[index].answers.push(newAnswer);

    // If it was unanswered, change status to 'discussing'
    if (allPosts[index].status === 'unanswered') {
      allPosts[index].status = 'discussing';
    }

    this.savePostsToStorage(allPosts);
    return { answer: newAnswer, post: allPosts[index], isFirstAnswer };
  }

  /**
   * Toggle Upvote on an answer
   */
  async toggleUpvoteAnswer(postId, answerId, userId) {
    const allPosts = this.getPostsFromStorage();
    const pIndex = allPosts.findIndex(p => p.id === postId);
    if (pIndex === -1) throw new Error('Bài viết không tồn tại');

    const answer = (allPosts[pIndex].answers || []).find(a => a.id === answerId);
    if (!answer) throw new Error('Câu trả lời không tồn tại');

    answer.upvotedBy = answer.upvotedBy || [];
    const uIdx = answer.upvotedBy.indexOf(userId);
    const hasUpvoted = uIdx === -1;

    if (hasUpvoted) {
      answer.upvotedBy.push(userId);
      answer.upvotes = (answer.upvotes || 0) + 1;
    } else {
      answer.upvotedBy.splice(uIdx, 1);
      answer.upvotes = Math.max(0, (answer.upvotes || 1) - 1);
    }

    this.savePostsToStorage(allPosts);
    return { upvotes: answer.upvotes, hasUpvoted, answerAuthorId: answer.author?.id };
  }

  /**
   * Mark / Unmark Accepted Solution (By author or instructor)
   */
  async toggleAcceptAnswer(postId, answerId, isInstructor = false) {
    const allPosts = this.getPostsFromStorage();
    const pIndex = allPosts.findIndex(p => p.id === postId);
    if (pIndex === -1) throw new Error('Bài viết không tồn tại');

    const post = allPosts[pIndex];
    post.answers = post.answers || [];

    const answer = post.answers.find(a => a.id === answerId);
    if (!answer) throw new Error('Câu trả lời không tồn tại');

    const currentlyAccepted = isInstructor ? answer.instructorVerified : answer.isAccepted;
    const nextState = !currentlyAccepted;

    if (isInstructor) {
      answer.instructorVerified = nextState;
    } else {
      // Clear previously accepted answers on this post
      post.answers.forEach(a => { a.isAccepted = false; });
      answer.isAccepted = nextState;
      post.isAccepted = nextState;
      post.acceptedAnswerId = nextState ? answerId : null;
      post.status = nextState ? 'solved' : (post.answers.length > 0 ? 'discussing' : 'unanswered');
    }

    this.savePostsToStorage(allPosts);
    return {
      post,
      answer,
      isAccepted: answer.isAccepted,
      instructorVerified: answer.instructorVerified,
      answerAuthorId: answer.author?.id
    };
  }

  /**
   * Add a nested comment to an answer (1-level nesting)
   */
  async addCommentToAnswer(postId, answerId, { content, author }) {
    const allPosts = this.getPostsFromStorage();
    const pIndex = allPosts.findIndex(p => p.id === postId);
    if (pIndex === -1) throw new Error('Bài viết không tồn tại');

    const answer = (allPosts[pIndex].answers || []).find(a => a.id === answerId);
    if (!answer) throw new Error('Câu trả lời không tồn tại');

    const newComment = {
      id: `cmt-${Date.now()}`,
      author: {
        id: author?.uid || author?.id || 'guest',
        email: author?.email || '',
        name: author?.name || author?.displayName || 'Sinh viên UEH',
        cohort: author?.cohort || 'UEH Member',
        avatar: author?.avatar || author?.photoURL || ''
      },
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    answer.comments = answer.comments || [];
    answer.comments.push(newComment);

    this.savePostsToStorage(allPosts);
    return { comment: newComment, answerAuthorId: answer.author?.id };
  }

  /**
   * Delete an answer
   */
  async deleteAnswer(postId, answerId) {
    const allPosts = this.getPostsFromStorage();
    const pIndex = allPosts.findIndex(p => p.id === postId);
    if (pIndex === -1) throw new Error('Bài viết không tồn tại');

    allPosts[pIndex].answers = (allPosts[pIndex].answers || []).filter(a => a.id !== answerId);
    if (allPosts[pIndex].acceptedAnswerId === answerId) {
      allPosts[pIndex].acceptedAnswerId = null;
      allPosts[pIndex].isAccepted = false;
      allPosts[pIndex].status = allPosts[pIndex].answers.length > 0 ? 'discussing' : 'unanswered';
    }

    this.savePostsToStorage(allPosts);
    return { success: true };
  }

  /**
   * Calculate top solvers leaderboard
   */
  getLeaderboard() {
    const allPosts = this.getPostsFromStorage();
    const userMap = new Map();

    allPosts.forEach(post => {
      // Post author
      if (post.author?.id && post.author.id !== 'guest') {
        const u = userMap.get(post.author.id) || {
          id: post.author.id,
          name: post.author.name,
          cohort: post.author.cohort || 'UEH Member',
          avatar: post.author.avatar,
          points: post.author.points || 0,
          postsCount: 0,
          solvedCount: 0,
          answersCount: 0
        };
        u.postsCount += 1;
        userMap.set(post.author.id, u);
      }

      // Answer authors
      (post.answers || []).forEach(ans => {
        if (ans.author?.id && ans.author.id !== 'guest') {
          const u = userMap.get(ans.author.id) || {
            id: ans.author.id,
            name: ans.author.name,
            cohort: ans.author.cohort || 'UEH Member',
            avatar: ans.author.avatar,
            points: ans.author.points || 0,
            postsCount: 0,
            solvedCount: 0,
            answersCount: 0
          };
          u.answersCount += 1;
          if (ans.isAccepted || ans.instructorVerified) {
            u.solvedCount += 1;
          }
          userMap.set(ans.author.id, u);
        }
      });
    });

    const list = Array.from(userMap.values());

    return list
      .map(applyAdminIdentity)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10);
  }

  /**
   * Build a member profile from everything they have posted and answered.
   * Works for any member id, not just the signed-in user.
   */
  getUserProfile(userId) {
    if (!userId) return null;

    const allPosts = this.getPostsFromStorage();

    const profile = {
      id: userId,
      name: '',
      cohort: '',
      avatar: '',
      points: 0,
      postsCount: 0,
      answersCount: 0,
      solvedCount: 0,
      upvotesReceived: 0,
      joinedAt: null
    };

    const absorb = (author) => {
      if (!author || author.id !== userId) return false;
      if (!profile.name && author.name) profile.name = author.name;
      if (!profile.cohort && author.cohort) profile.cohort = author.cohort;
      if (!profile.avatar && author.avatar) profile.avatar = author.avatar;
      if (author.points > profile.points) profile.points = author.points;
      return true;
    };

    allPosts.forEach(post => {
      if (absorb(post.author)) {
        profile.postsCount += 1;
        profile.upvotesReceived += post.upvotes || 0;
        if (!profile.joinedAt || new Date(post.createdAt) < new Date(profile.joinedAt)) {
          profile.joinedAt = post.createdAt;
        }
      }

      (post.answers || []).forEach(answer => {
        if (absorb(answer.author)) {
          profile.answersCount += 1;
          profile.upvotesReceived += answer.upvotes || 0;
          if (answer.isAccepted || answer.instructorVerified) profile.solvedCount += 1;
        }
      });
    });

    // Unknown member: still return a usable shell rather than nothing
    if (!profile.name) profile.name = 'Thành viên UEH';
    if (!profile.cohort) profile.cohort = 'UEH Member';

    return applyAdminIdentity(profile);
  }

  /**
   * Posts authored by a member, newest first.
   */
  getPostsByUser(userId) {
    if (!userId) return [];
    return this.getPostsFromStorage()
      .filter(post => post.author?.id === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(normalizePost);
  }

  /**
   * Get community stats overview
   */
  getCommunityStats() {
    const allPosts = this.getPostsFromStorage();
    const totalDiscussions = allPosts.length;
    const solvedCount = allPosts.filter(p => p.status === 'solved' || p.isAccepted).length;
    const openCount = allPosts.filter(p => (p.answers || []).length === 0).length;
    const totalAnswers = allPosts.reduce((acc, p) => acc + (p.answers?.length || 0), 0);

    return {
      totalDiscussions,
      solvedCount,
      openCount,
      totalAnswers,
      solvedRate: totalDiscussions ? Math.round((solvedCount / totalDiscussions) * 100) : 0
    };
  }

  /**
   * Most used tags across all posts, for the sidebar's trending widget
   */
  getTrendingTags(limit = 10) {
    const counts = new Map();

    this.getPostsFromStorage().forEach(post => {
      (post.tags || []).forEach(raw => {
        const tag = String(raw).replace(/^#/, '').trim();
        if (!tag) return;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    return Array.from(counts, ([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const communityService = new CommunityService();
