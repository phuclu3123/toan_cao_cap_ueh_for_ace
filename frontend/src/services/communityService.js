import { safeLocalStorage } from '../utils/safeStorage';
import { matchPost } from './searchEngine';
import { applyAdminIdentity } from './adminService';
import { apiFetch, readApiJson } from '../utils/apiClient';

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
 * Lightweight publish preflight for questions.
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
 * Shape a stored post for the UI: derive `isSolved` and credit the owner's byline.
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

const STORAGE_KEY = 'ueh_tcc_community_posts_v15';
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

// Authentic Accounts of Lữ Võ Hoàng Phúc
const AUTH_ADMIN = {
  id: 'user-phuc',
  name: 'Lữ Võ Hoàng Phúc',
  email: 'luphuc321@gmail.com',
  cohort: 'K50 UEH · Quản trị viên',
  avatar: '',
  points: 9999,
  isAdmin: true,
  isInstructor: true
};

const AUTH_USER_519 = {
  id: 'user-phuc-519',
  name: 'Lữ Võ Hoàng Phúc',
  email: 'luphuc519@gmail.com',
  cohort: 'K50 UEH · Biên soạn đề',
  avatar: '',
  points: 3450,
  isAdmin: true,
  isInstructor: true
};

const AUTH_USER_0809 = {
  id: 'user-phuc-0809',
  name: 'Hoàng Phúc',
  email: 'luphuc08092006@gmail.com',
  cohort: 'K50 UEH · Thủ khoa giải đề',
  avatar: '',
  points: 2180,
  isAdmin: false,
  isInstructor: true
};

/**
 * 12 Official Questions directly from UEH Higher Mathematics Curriculum & Weekly Challenge
 * Strictly authored by authentic user accounts: luphuc321@gmail.com, luphuc519@gmail.com, luphuc08092006@gmail.com
 */
export const UEH_CURRICULUM_POSTS = [
  {
    id: 'hinh-hoc-olympic-tam-ngoai-tiep-doi-xung-oi',
    type: 'question',
    title: 'Chứng minh tâm $(J_aIU)$ đối xứng với tâm $(HIU)$ qua trục Euler $OI$ (Hình học Olympic)',
    content: "<p>Cho tam giác $ABC$ có tâm nội tiếp $I$, tâm ngoại tiếp $O$ và tâm đường tròn bàng tiếp góc $A$ là $J_a$. Gọi $H$ là trực tâm tam giác $BIC$, lấy $S$ đối xứng với $A$ qua $OI$, gọi $T$ là trung điểm cung $BAC$ của $(O)$, đường thẳng $TH$ cắt $OI$ tại $U$. Chứng minh rằng tâm đường tròn ngoại tiếp tam giác $J_aIU$ đối xứng với tâm đường tròn ngoại tiếp tam giác $HIU$ qua trục $OI$.</p>",
    subject: 'exam_prep',
    subjectLabel: 'Đề thi & Ôn luyện UEH',
    difficulty: 'olympiad',
    difficultyLabel: 'Thử thách Olympic UEH',
    tags: ['#HinhHocPhang', '#OlympicToan', '#DoiXungTruc', '#TamNgoaiTiep', '#BoDePascal'],
    author: AUTH_ADMIN,
    createdAt: new Date().toISOString(),
    views: 320,
    upvotes: 56,
    upvotedBy: ['user-phuc-519', 'user-phuc-0809'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-olympiad-geo-1',
    instructorVerified: true,
    answers: [
      {
        id: 'ans-olympiad-geo-1',
        content: "<div class=\"math-figure-center\">\n  <svg viewBox=\"-248 -348 726 739\" width=\"100%\" height=\"auto\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#ffffff; max-width:760px; margin:0 auto; display:block;\">\n  <g fill=\"none\" stroke=\"#17201c\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <circle cx=\"-59.9\" cy=\"-16.3\" r=\"159.7\" stroke-width=\"0.95\" />\n    <circle cx=\"-113.4\" cy=\"52\" r=\"74.2\" stroke-width=\"0.8\" />\n    <circle cx=\"44\" cy=\"141.9\" r=\"220.8\" stroke-width=\"0.75\" stroke-dasharray=\"4,3\" />\n    <circle cx=\"75.5\" cy=\"-116.6\" r=\"203.4\" stroke-width=\"0.75\" stroke-dasharray=\"4,3\" />\n    <circle cx=\"47.4\" cy=\"113.6\" r=\"203.4\" stroke-width=\"0.75\" stroke-dasharray=\"4,3\" />\n\n    <polygon points=\"-141.7,-153.4 -203.6,53.3 85.8,49.1\" stroke-width=\"1.6\" />\n\n    <line x1=\"-203.6\" y1=\"53.3\" x2=\"433.9\" y2=\"44\" stroke-width=\"0.9\" />\n    <line x1=\"-141.7\" y1=\"-153.4\" x2=\"88.9\" y2=\"-74.3\" stroke-width=\"0.7\" />\n    <line x1=\"88.9\" y1=\"-74.3\" x2=\"433.9\" y2=\"44\" stroke-width=\"0.7\" />\n    <line x1=\"-172.3\" y1=\"97.1\" x2=\"-102.2\" y2=\"125.4\" stroke-width=\"0.7\" />\n    <line x1=\"-172.3\" y1=\"97.1\" x2=\"-57.5\" y2=\"143.4\" stroke-width=\"0.7\" />\n    <line x1=\"-172.3\" y1=\"97.1\" x2=\"88.9\" y2=\"-74.3\" stroke-width=\"0.7\" />\n    <line x1=\"-141.7\" y1=\"-153.4\" x2=\"-10.7\" y2=\"308.5\" stroke-width=\"0.7\" />\n    <line x1=\"-107\" y1=\"-206.1\" x2=\"-99.5\" y2=\"309.8\" stroke-width=\"0.7\" />\n    <line x1=\"75.5\" y1=\"-116.6\" x2=\"47.4\" y2=\"113.6\" stroke-width=\"0.7\" />\n    <line x1=\"-107\" y1=\"-206.1\" x2=\"227.3\" y2=\"18.8\" stroke-width=\"0.7\" />\n    <line x1=\"-104.4\" y1=\"-21.7\" x2=\"433.9\" y2=\"44\" stroke-width=\"0.7\" />\n    <line x1=\"-59.9\" y1=\"-16.3\" x2=\"44\" y2=\"141.9\" stroke-width=\"0.7\" />\n    <line x1=\"47.4\" y1=\"113.6\" x2=\"-57.5\" y2=\"143.4\" stroke-width=\"0.7\" />\n    <line x1=\"44\" y1=\"141.9\" x2=\"75.5\" y2=\"-116.6\" stroke-width=\"0.7\" />\n    <line x1=\"44\" y1=\"141.9\" x2=\"-57.5\" y2=\"143.4\" stroke-width=\"0.7\" />\n    <line x1=\"-10.7\" y1=\"308.5\" x2=\"227.3\" y2=\"18.8\" stroke-width=\"0.7\" />\n    <line x1=\"-62.2\" y1=\"-175.9\" x2=\"-57.5\" y2=\"143.4\" stroke-width=\"0.7\" />\n    <line x1=\"-62.2\" y1=\"-175.9\" x2=\"-117.8\" y2=\"132.5\" stroke-width=\"0.7\" />\n    <line x1=\"-186.1\" y1=\"-114\" x2=\"-103.3\" y2=\"51.8\" stroke-width=\"1.0\" />\n    <line x1=\"-103.3\" y1=\"51.8\" x2=\"-57.5\" y2=\"143.4\" stroke-width=\"1.0\" />\n  </g>\n\n  <g fill=\"#ffffff\" stroke=\"#17201c\" stroke-width=\"1.1\">\n    <circle cx=\"-141.7\" cy=\"-153.4\" r=\"2.2\" />\n    <circle cx=\"-203.6\" cy=\"53.3\" r=\"2.2\" />\n    <circle cx=\"85.8\" cy=\"49.1\" r=\"2.2\" />\n    <circle cx=\"-59.9\" cy=\"-16.3\" r=\"2.2\" />\n    <circle cx=\"-104.4\" cy=\"-21.7\" r=\"2.2\" />\n    <circle cx=\"-10.7\" cy=\"308.5\" r=\"2.2\" />\n    <circle cx=\"-107\" cy=\"-206.1\" r=\"2.2\" />\n    <circle cx=\"-99.5\" cy=\"309.8\" r=\"2.2\" />\n    <circle cx=\"-172.3\" cy=\"97.1\" r=\"2.2\" />\n    <circle cx=\"-113.4\" cy=\"52\" r=\"2.2\" />\n    <circle cx=\"-62.2\" cy=\"-175.9\" r=\"2.2\" />\n    <circle cx=\"227.3\" cy=\"18.8\" r=\"2.2\" />\n    <circle cx=\"88.9\" cy=\"-74.3\" r=\"2.2\" />\n    <circle cx=\"433.9\" cy=\"44\" r=\"2.2\" />\n    <circle cx=\"-57.5\" cy=\"143.4\" r=\"2.2\" />\n    <circle cx=\"-102.2\" cy=\"125.4\" r=\"2.2\" />\n    <circle cx=\"-103.3\" cy=\"51.8\" r=\"2.2\" />\n    <circle cx=\"-186.1\" cy=\"-114\" r=\"2.2\" />\n    <circle cx=\"-117.8\" cy=\"132.5\" r=\"2.2\" />\n    <circle cx=\"75.5\" cy=\"-116.6\" r=\"2.2\" />\n    <circle cx=\"47.4\" cy=\"113.6\" r=\"2.2\" />\n    <circle cx=\"61.5\" cy=\"-1.5\" r=\"2.2\" />\n    <circle cx=\"44\" cy=\"141.9\" r=\"2.2\" />\n  </g>\n\n  <g font-family=\"'Times New Roman', 'KaTeX_Main', serif\" font-size=\"12.5\" fill=\"#17201c\">\n    <text x=\"-153.7\" y=\"-158.4\">A</text>\n    <text x=\"-217.6\" y=\"64.3\">B</text>\n    <text x=\"90.8\" y=\"61.1\">C</text>\n    <text x=\"-69.9\" y=\"-2.3000000000000007\">O</text>\n    <text x=\"-116.4\" y=\"-24.7\">I</text>\n    <text x=\"-24.7\" y=\"322.5\">J<tspan font-size=\"9\" dy=\"2\">a</tspan></text>\n    <text x=\"-119\" y=\"-211.1\">H</text>\n    <text x=\"-115.5\" y=\"321.8\">H'</text>\n    <text x=\"-186.3\" y=\"108.1\">S</text>\n    <text x=\"-127.4\" y=\"47\">S'</text>\n    <text x=\"-59.2\" y=\"-181.9\">T</text>\n    <text x=\"213.3\" y=\"32.8\">U</text>\n    <text x=\"93.9\" y=\"-77.3\">J</text>\n    <text x=\"438.9\" y=\"48\">G</text>\n    <text x=\"-69.5\" y=\"157.4\">R</text>\n    <text x=\"-114.2\" y=\"137.4\">P</text>\n    <text x=\"-98.3\" y=\"63.8\">D</text>\n    <text x=\"-200.1\" y=\"-117\">Z</text>\n    <text x=\"-129.8\" y=\"144.5\">Q</text>\n    <text x=\"80.5\" y=\"-121.6\">Y</text>\n    <text x=\"52.4\" y=\"124.6\">Y'</text>\n    <text x=\"66.5\" y=\"-4.5\">M</text>\n    <text x=\"49\" y=\"153.9\">O'</text>\n  </g>\n</svg>\n</div>\n\n<p><strong>Lời giải.</strong></p>\n\n<p>Gọi $D$ là hình chiếu vuông góc của $I$ trên $BC$. Đường thẳng $AI$ cắt lại $(O)$ tại $R$. Gọi $P$ và $H'$ lần lượt là các điểm đối xứng của $I$ và $H$ qua $BC$. Đặt $G=OI\\cap BC$, gọi $J$ là giao điểm thứ hai của $AG$ với $(O)$, và gọi $Q$ là giao điểm thứ hai của $TD$ với $(O)$. Gọi $M$ là trung điểm của $IU$.</p>\n\n<p>Ký hiệu $Y'$, $Y$, $O'$ và $S'$ lần lượt là tâm các đường tròn ngoại tiếp tam giác $IJ_aU$, $HIU$, $ISJ$ và $ISP$.</p>\n\n<div class=\"math-lemma-box\">\n  <strong>Bổ đề 1.</strong> Cho tam giác $ABC$ nội tiếp đường tròn $(O)$ và ngoại tiếp đường tròn $(I)$. Đường tròn $(I)$ tiếp xúc với $BC$ tại $D$. Đặt $V=OI\\cap BC$, gọi $P$ là giao điểm thứ hai của $AV$ với $(O)$, và gọi $A_1$ là điểm đối xứng của $A$ qua $OI$. Khi đó ba điểm $A_1,D,P$ thẳng hàng.\n</div>\n\n<div class=\"math-figure-center\">\n  <svg viewBox=\"-190 -217 454 393\" width=\"100%\" height=\"auto\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#ffffff; max-width:540px; margin:0 auto; display:block;\">\n  <g fill=\"none\" stroke=\"#17201c\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <circle cx=\"0\" cy=\"-25.6\" r=\"161.8\" stroke-width=\"0.95\" />\n    <circle cx=\"-32.3\" cy=\"-35.4\" r=\"77.4\" stroke-width=\"0.8\" />\n\n    <polygon points=\"-58.8,-176.4 -147,42 147,42\" stroke-width=\"1.6\" />\n\n    <line x1=\"-147\" y1=\"42\" x2=\"223.9\" y2=\"42\" stroke-width=\"0.8\" />\n    <line x1=\"-58.8\" y1=\"-176.4\" x2=\"0\" y2=\"136.2\" stroke-width=\"0.8\" />\n    <line x1=\"-147\" y1=\"42\" x2=\"117.8\" y2=\"-136.6\" stroke-width=\"0.8\" />\n    <line x1=\"147\" y1=\"42\" x2=\"-150\" y2=\"-86.2\" stroke-width=\"0.8\" />\n    <line x1=\"-32.3\" y1=\"-35.4\" x2=\"223.9\" y2=\"42\" stroke-width=\"0.8\" />\n    <line x1=\"-32.3\" y1=\"-35.4\" x2=\"-32.3\" y2=\"42\" stroke-width=\"0.8\" />\n    <line x1=\"-58.8\" y1=\"-176.4\" x2=\"223.9\" y2=\"42\" stroke-width=\"0.8\" />\n    <line x1=\"-132.4\" y1=\"67.3\" x2=\"89.6\" y2=\"-160.4\" stroke-width=\"0.8\" />\n\n    <line x1=\"-158.9\" y1=\"74\" x2=\"187.2\" y2=\"-13.5\" stroke=\"#1a56b0\" stroke-width=\"1.3\" stroke-dasharray=\"5,4\" />\n  </g>\n\n  <g fill=\"#ffffff\" stroke=\"#17201c\" stroke-width=\"1.1\">\n    <circle cx=\"-58.8\" cy=\"-176.4\" r=\"2.2\" />\n    <circle cx=\"-147\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"147\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"0\" cy=\"-25.6\" r=\"2.2\" />\n    <circle cx=\"-32.3\" cy=\"-35.4\" r=\"2.2\" />\n    <circle cx=\"-32.3\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"223.9\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"160.7\" cy=\"-6.8\" r=\"2.2\" />\n    <circle cx=\"-132.4\" cy=\"67.3\" r=\"2.2\" />\n    <circle cx=\"0\" cy=\"136.2\" r=\"2.2\" />\n    <circle cx=\"117.8\" cy=\"-136.6\" r=\"2.2\" />\n    <circle cx=\"-150\" cy=\"-86.2\" r=\"2.2\" />\n    <circle cx=\"89.6\" cy=\"-160.4\" r=\"2.2\" />\n  </g>\n\n  <g font-family=\"'Times New Roman', 'KaTeX_Main', serif\" font-size=\"12.5\" fill=\"#17201c\">\n    <text x=\"-63.8\" y=\"-182.4\">A</text>\n    <text x=\"-161\" y=\"54\">B</text>\n    <text x=\"152\" y=\"54\">C</text>\n    <text x=\"5\" y=\"-28.6\">O</text>\n    <text x=\"-27.299999999999997\" y=\"-38.4\">I</text>\n    <text x=\"-44.3\" y=\"54\">D</text>\n    <text x=\"218.9\" y=\"56\">V</text>\n    <text x=\"166.7\" y=\"3.2\">P</text>\n    <text x=\"-150.4\" y=\"64.3\">A<tspan font-size=\"9\" dy=\"2\">1</tspan></text>\n    <text x=\"-5\" y=\"150.2\">A'</text>\n    <text x=\"123.8\" y=\"-139.6\">B'</text>\n    <text x=\"-164\" y=\"-89.2\">C'</text>\n    <text x=\"95.6\" y=\"-157.4\">A<tspan font-size=\"9\" dy=\"2\">2</tspan></text>\n  </g>\n</svg>\n</div>\n\n<p><em>Chứng minh.</em> Gọi $A'$, $B'$, $C'$ lần lượt là giao điểm thứ hai của các tia $AI$, $BI$, $CI$ với $(O)$. Gọi $A_2$ là giao điểm thứ hai của $A_1I$ với $(O)$. Dễ thấy hai điểm $A_2$ và $A'$ đối xứng với nhau qua đường thẳng $OI$. Thực hiện các phép chiếu xuyên tâm giữa những chùm điều hòa và sử dụng các chùm trực giao, ta thu được:</p>\n$$\\begin{aligned}\nP(VD,BC) &= I(VD,BC) \\\\\n         &= A'(A_2A',C'B') \\\\\n         &= I(A_2A',C'B') \\\\\n         &= (A_1A,CB) \\\\\n         &= P(DA_1,CB).\n\\end{aligned}$$\n<p>Suy ra ba điểm $P,D,A_1$ thẳng hàng. $\\square$</p>\n\n<p>Áp dụng <strong>Bổ đề 1</strong> với $G$, $S$ và $J$, ta được $S, D, J$ thẳng hàng.</p>\n\n<div class=\"math-lemma-box\">\n  <strong>Bổ đề 2.</strong> Cho tam giác $ABC$ nội tiếp đường tròn $(O)$ và ngoại tiếp đường tròn $(I)$. Điểm $S$ đối xứng với $A$ qua $OI$. Gọi $P$ là điểm đối xứng của $I$ qua $BC$, và gọi $R$ là giao điểm thứ hai của $AI$ với $(O)$. Khi đó ba điểm $S,R,P$ thẳng hàng.\n</div>\n\n<div class=\"math-figure-center\">\n  <svg viewBox=\"-174 -217 347 371\" width=\"100%\" height=\"auto\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#ffffff; max-width:540px; margin:0 auto; display:block;\">\n  <polygon points=\"-54.6,-176.4 -26.8,-29.9 0,-37.7\" fill=\"rgba(140, 184, 242, 0.45)\" />\n  <polygon points=\"-26.8,-29.9 -26.8,113.9 0,111.4\" fill=\"rgba(140, 184, 242, 0.45)\" />\n\n  <g fill=\"none\" stroke=\"#17201c\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <circle cx=\"0\" cy=\"-37.7\" r=\"149.1\" stroke-width=\"0.95\" />\n    <circle cx=\"-26.8\" cy=\"-29.9\" r=\"71.9\" stroke-width=\"0.8\" />\n    <circle cx=\"-6\" cy=\"42\" r=\"74.9\" stroke=\"#d03030\" stroke-width=\"1.0\" stroke-dasharray=\"5,4\" />\n\n    <polygon points=\"-54.6,-176.4 -126,42 126,42\" stroke-width=\"1.6\" />\n\n    <line x1=\"-54.6\" y1=\"-176.4\" x2=\"-54.6\" y2=\"42\" stroke-width=\"0.8\" />\n    <line x1=\"-26.8\" y1=\"-29.9\" x2=\"-26.8\" y2=\"113.9\" stroke-width=\"0.8\" />\n    <line x1=\"-54.6\" y1=\"-176.4\" x2=\"0\" y2=\"111.4\" stroke-width=\"0.8\" />\n    <line x1=\"0\" y1=\"-37.7\" x2=\"-26.8\" y2=\"-29.9\" stroke-width=\"0.8\" />\n    <line x1=\"-31.2\" y1=\"-45.3\" x2=\"-0.2\" y2=\"62.2\" stroke-width=\"0.8\" />\n\n    <line x1=\"-70.7\" y1=\"118.1\" x2=\"71.8\" y2=\"104.6\" stroke=\"#cc3333\" stroke-width=\"1.2\" stroke-dasharray=\"5,4\" />\n\n    <polygon points=\"-54.6,-176.4 -26.8,-29.9 0,-37.7\" stroke-width=\"0.8\" />\n    <polygon points=\"-26.8,-29.9 -26.8,113.9 0,111.4\" stroke-width=\"0.8\" />\n  </g>\n\n  <g fill=\"#ffffff\" stroke=\"#17201c\" stroke-width=\"1.1\">\n    <circle cx=\"-54.6\" cy=\"-176.4\" r=\"2.2\" />\n    <circle cx=\"-126\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"126\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"0\" cy=\"-37.7\" r=\"2.2\" />\n    <circle cx=\"-26.8\" cy=\"-29.9\" r=\"2.2\" />\n    <circle cx=\"-54.6\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"-26.8\" cy=\"42\" r=\"2.2\" />\n    <circle cx=\"-26.8\" cy=\"113.9\" r=\"2.2\" />\n    <circle cx=\"0\" cy=\"111.4\" r=\"2.2\" />\n    <circle cx=\"27.8\" cy=\"108.8\" r=\"2.2\" />\n    <circle cx=\"-6\" cy=\"42\" r=\"2.2\" />\n  </g>\n\n  <g font-family=\"'Times New Roman', 'KaTeX_Main', serif\" font-size=\"12.5\" fill=\"#17201c\">\n    <text x=\"-59.6\" y=\"-182.4\">A</text>\n    <text x=\"-140\" y=\"54\">B</text>\n    <text x=\"131\" y=\"54\">C</text>\n    <text x=\"6\" y=\"-40.7\">O</text>\n    <text x=\"-38.8\" y=\"-32.9\">I</text>\n    <text x=\"-66.6\" y=\"54\">H</text>\n    <text x=\"-31.8\" y=\"54\">D</text>\n    <text x=\"-38.8\" y=\"125.9\">P</text>\n    <text x=\"5\" y=\"123.4\">R</text>\n    <text x=\"33.8\" y=\"118.8\">S</text>\n    <text x=\"0\" y=\"54\">S'</text>\n  </g>\n</svg>\n</div>\n\n<p><em>Chứng minh.</em> Gọi $H$ và $D$ lần lượt là hình chiếu vuông góc của $A$ và $I$ trên $BC$. Khi đó:</p>\n$$\\angle PIR=\\angle HAI=\\angle IAO.$$\n<p>Mặt khác, theo hệ thức Euler ta có:</p>\n$$\\begin{aligned}\n& OI^2=\\mathcal R^2-2\\mathcal Rr \\\\[0.3em]\n& \\Leftrightarrow \\mathcal P_{I/(O)}=-2\\mathcal Rr \\\\[0.3em]\n& \\Leftrightarrow IA\\cdot IR=2\\cdot OA\\cdot ID \\\\[0.3em]\n& \\Leftrightarrow \\frac{IP}{IR}=\\frac{AI}{AO}.\n\\end{aligned}$$\n<p>Ở đây $\\mathcal R$ và $r$ lần lượt là bán kính đường tròn ngoại tiếp và đường tròn nội tiếp tam giác $ABC$. Từ hai kết quả trên ta thu được:</p>\n$$\\triangle IPR\\sim\\triangle AIO\\qquad(\\text{c.g.c}).$$\n<p>Dẫn đến các góc tương ứng bằng nhau, hay có phép biến đổi biểu thức sau:</p>\n$$\\angle IRP=\\angle AOI=180^\\circ-\\angle ARS.$$\n<p>Vậy ba điểm $S,R,P$ thẳng hàng. $\\square$</p>\n\n<div class=\"math-lemma-box\">\n  <strong>Nhận xét.</strong> Qua $I$ dựng đường thẳng $d$ vuông góc với $OI$, cắt $BC$ tại $S'$. Khi đó $OI$ là tiếp tuyến tại $I$ của đường tròn ngoại tiếp tam giác $ISP$.\n</div>\n\n<p><em>Chứng minh.</em> Do $A$ và $S$ đối xứng nhau qua $OI$, ta có $\\angle OIS=\\angle AIO=\\angle IPS$. Theo định lí góc tạo bởi tiếp tuyến và dây cung, $OI$ là tiếp tuyến tại $I$ của đường tròn ngoại tiếp tam giác $ISP$. $\\square$</p>\n\n<p>Theo <strong>Bổ đề 2</strong>, ta được $S, R, P$ thẳng hàng. <strong>Trở lại bài toán</strong>, ta có phép biến đổi sau:</p>\n$$\\angle SQD =\\angle SQT =\\angle SRT =\\angle SPD.$$\n<p>Do đó bốn điểm $S,Q,P,D$ đồng viên. Xét phép nghịch đảo tâm $D$ có phương tích $DB\\cdot DC$. Ta có các cặp điểm tương ứng qua phép nghịch đảo là:</p>\n<ul>\n  <li>$T\\leftrightarrow Q$;</li>\n  <li>$J\\leftrightarrow S$;</li>\n  <li>$H\\leftrightarrow P$.</li>\n</ul>\n<p>Đường tròn qua $D, S, Q, P$ được biến thành một đường thẳng. Ảnh của $S,Q,P$ lần lượt là $J, T, H$, vì thế ba điểm $H, T, J$ thẳng hàng. Do $U$ thuộc đường thẳng $HT$ nên suy ra bốn điểm $H,T,J,U$ thẳng hàng.</p>\n\n<p>Vì $P$ là điểm đối xứng của $I$ qua $BC$, ta có $DP=DI$. Tương tự vì $H'$ là điểm đối xứng của $H$ qua $BC$, ta có $DH'=DH$. Vì các điểm $S, J, B, C$ cùng thuộc đường tròn $(O)$ nên ta có:</p>\n$$DS\\cdot DJ = DB\\cdot DC \\tag{1}$$\n<p>Mặt khác do $I$ là trực tâm tam giác $HBC$ và $H'$ đối xứng với $H$ qua $BC$ nên ta được:</p>\n$$DB\\cdot DC = DI\\cdot DH = DI \\cdot DH' \\tag{2}$$\n<p>Từ $(1)$ và $(2)$ ta suy ra được đẳng thức sau: $DS \\cdot DJ = DI\\cdot DH'$. Do đó, bốn điểm $I, S, H', J$ cùng thuộc đường tròn $(O')$. Mặt khác, vì $S,D,J$ thẳng hàng và $H, U, J, T$ thẳng hàng và kết hợp với $OI$ là tiếp tuyến của $(S')$ nên ta có phép biến đổi góc sau:</p>\n$$\\begin{aligned}\n\\angle ISJ &= \\angle ISD \\\\\n            &= \\angle ISR-\\angle DSR \\\\\n            &= \\angle DIO-\\angle JTR \\\\\n            &= \\angle DIO-\\angle UHI \\\\\n            &= \\angle HUI \\\\\n            &= \\angle JUI.\n\\end{aligned}$$\n<p>Suy ra bốn điểm $I,S,U,J$ đồng viên. Kết hợp với kết quả trên, năm điểm $I,S,H',U,J$ cùng thuộc đường tròn $(O').$</p>\n\n<p>Ta có $RI=RH'$, nên hai điểm $I$ và $H'$ cùng thuộc đường tròn $\\omega_R$ tâm $R$. Mặt khác, $I$ và $H'$ cũng thuộc đường tròn tâm $O'$. Do đó, $IH'$ là trục đẳng phương của hai đường tròn này, suy ra đường nối hai tâm $R$ và $O'$ vuông góc với $IH'$. Vì hai đường thẳng $OR$ và $IH'$ song song với nhau nên $RO'$ vuông góc với $OR$.</p>\n\n<p>Vì $M$ là trung điểm của $IU$ và $O'I=O'U$, nên $O'M$ là đường trung trực của $IU$. Kết hợp với $O,I,U,M$ thẳng hàng và $RO'$ vuông góc với $OR$, ta được:</p>\n$$\\angle OMO'=\\angle ORO'=90^\\circ.$$\n<p>Do đó, bốn điểm $O,M,O',R$ cùng thuộc đường tròn đường kính $OO'$.</p>\n\n<p>Hai đường tròn tâm $O$ và $O'$ cùng đi qua $S$ và $J$, nên $SJ$ là trục đẳng phương của chúng. Bởi vậy, đường nối hai tâm $OO'$ vuông góc với $SJ$. Kết hợp với việc $S,D,J$ thẳng hàng và $OR$ song song với $DP$, ta thu được:</p>\n$$(MI,MR) \\equiv (O'O,O'R) \\equiv (SJ,OR) \\equiv (DS,DP) \\pmod{\\pi},$$\n<p>mặt khác, từ kết quả chứng minh của <strong>Bổ đề 2</strong>, ta thu được $\\angle MIR=\\angle DPS$. Nên từ hai kết quả trên ta được:</p>\n$$\\triangle IMR\\sim\\triangle PDS\\qquad(\\text{g.g}),$$\n<p>dẫn đến hai góc tương ứng bằng nhau: $(RM,RI) \\equiv (SP,SD) \\pmod{\\pi}$.</p>\n\n<p>Vì $Y'$ là tâm đường tròn ngoại tiếp tam giác $IJ_aU$, ta có $\\frac12\\angle IY'U=\\angle IJ_aU$. Mặt khác, ta có biến đổi góc định hướng sau:</p>\n$$(J_aU,J_aI) \\equiv (RM,RI) \\equiv (SP,SD) \\equiv (TR,TJ) \\equiv (HI,HJ) \\pmod{\\pi}.$$\n<p>Vì $Y$ là tâm đường tròn ngoại tiếp tam giác $HIU$, nên $\\angle JHI=\\frac12\\angle IYU$. Dẫn đến ta được: $\\angle IY'U=\\angle IYU$.</p>\n\n<p>Hai điểm $Y$ và $Y'$ đều nằm trên đường trung trực của $IU$. Vì hai điểm $I, U$ cùng thuộc $OI$ nên đường trung trực ấy là đường thẳng qua $M$ và vuông góc với $OI$. Mặt khác, hai góc ở tâm chắn cùng dây $IU$ bằng nhau, nên hai đường tròn ngoại tiếp tam giác $HIU$ và $IJ_aU$ có cùng bán kính. Do đó:</p>\n$$MY=MY'.$$\n<p>Suy ra $M$ là trung điểm của $YY'$. Vì $YY'$ vuông góc với $OI$ mà đường thẳng $OI$ là đường trung trực của $YY'$. Nên suy ra $Y$ và $Y'$ đối xứng với nhau qua trục $OI$. $\\square$</p>\n\n<hr style=\"border: none; border-top: 1px solid #dfe5e1; margin: 24px 0;\" />\n\n<p style=\"font-size: 1.08rem; font-weight: 800; color: #17201c;\">Lời giải khác (Tham khảo ý tưởng từ Phạm Nguyên Khang).</p>\n\n<div class=\"math-lemma-box\">\n  <strong>Bổ đề 3.</strong> Cho tam giác $ABC$ nội tiếp đường tròn $(O)$, tâm đường tròn $Euler$ $I$ và trực tâm $H$. Trong tam giác $ABC$ dựng các đường cao $AD, BE, CF$. Gọi $M, N$ lần lượt là trung điểm của $AB$ và $AC$. Khi này ta có $ME, NF, OH$ đồng quy tại một điểm $J$ và ta có $\\dfrac{AH^2}{AO^2}=\\dfrac{JH}{JI}$.\n</div>\n\n<div class=\"math-figure-center\">\n  <svg viewBox=\"-259 -253 430 388\" width=\"100%\" height=\"auto\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#ffffff; max-width:540px; margin:0 auto; display:block;\">\n  <g fill=\"none\" stroke=\"#17201c\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <circle cx=\"-4.2\" cy=\"-39.3\" r=\"150.9\" stroke-width=\"0.95\" />\n    <circle cx=\"-35.7\" cy=\"-39.2\" r=\"75.5\" stroke-width=\"0.85\" />\n\n    <polygon points=\"-67.2,-176.4 -138.6,29.4 130.2,29.4\" stroke-width=\"1.6\" />\n\n    <line x1=\"-67.2\" y1=\"-176.4\" x2=\"-67.2\" y2=\"-39.1\" stroke-width=\"0.75\" />\n    <line x1=\"-138.6\" y1=\"29.4\" x2=\"1.4\" y2=\"-104.9\" stroke-width=\"0.9\" />\n    <line x1=\"130.2\" y1=\"29.4\" x2=\"-109.7\" y2=\"-53.8\" stroke-width=\"0.9\" />\n    <line x1=\"-138.6\" y1=\"29.4\" x2=\"-67.2\" y2=\"-39.1\" stroke-width=\"0.75\" />\n    <line x1=\"130.2\" y1=\"29.4\" x2=\"-67.2\" y2=\"-39.1\" stroke-width=\"0.75\" />\n    <line x1=\"-218.6\" y1=\"-38.7\" x2=\"-35.7\" y2=\"-205\" stroke-width=\"0.75\" />\n    <line x1=\"-35.7\" y1=\"-228.1\" x2=\"-35.7\" y2=\"7\" stroke-width=\"0.75\" />\n    <line x1=\"-109.7\" y1=\"-53.8\" x2=\"1.4\" y2=\"-104.9\" stroke-width=\"0.75\" />\n    <line x1=\"-102.9\" y1=\"-73.5\" x2=\"31.5\" y2=\"-73.5\" stroke-width=\"0.75\" />\n    <line x1=\"-21.6\" y1=\"-23.6\" x2=\"-126.3\" y2=\"-138.8\" stroke-width=\"0.75\" />\n\n    <line x1=\"-230.7\" y1=\"-35\" x2=\"49.7\" y2=\"-119.4\" stroke=\"#3370e6\" stroke-width=\"1.1\" stroke-dasharray=\"5,4\" />\n    <line x1=\"-231.1\" y1=\"-36.9\" x2=\"91.8\" y2=\"-81.9\" stroke=\"#3370e6\" stroke-width=\"1.1\" stroke-dasharray=\"5,4\" />\n    <line x1=\"-227\" y1=\"-38.7\" x2=\"60.9\" y2=\"-39.4\" stroke=\"#3370e6\" stroke-width=\"1.1\" stroke-dasharray=\"5,4\" />\n  </g>\n\n  <g fill=\"#ffffff\" stroke=\"#17201c\" stroke-width=\"1.1\">\n    <circle cx=\"-67.2\" cy=\"-176.4\" r=\"2.2\" />\n    <circle cx=\"-138.6\" cy=\"29.4\" r=\"2.2\" />\n    <circle cx=\"130.2\" cy=\"29.4\" r=\"2.2\" />\n    <circle cx=\"1.4\" cy=\"-104.9\" r=\"2.2\" />\n    <circle cx=\"-109.7\" cy=\"-53.8\" r=\"2.2\" />\n    <circle cx=\"-102.9\" cy=\"-73.5\" r=\"2.2\" />\n    <circle cx=\"31.5\" cy=\"-73.5\" r=\"2.2\" />\n    <circle cx=\"-67.2\" cy=\"-39.1\" r=\"2.2\" />\n    <circle cx=\"-35.7\" cy=\"-39.2\" r=\"2.2\" />\n    <circle cx=\"-4.2\" cy=\"-39.3\" r=\"2.2\" />\n    <circle cx=\"-102.9\" cy=\"-4.8\" r=\"2.2\" />\n    <circle cx=\"31.5\" cy=\"-4.8\" r=\"2.2\" />\n    <circle cx=\"-67.2\" cy=\"29.4\" r=\"2.2\" />\n    <circle cx=\"-218.6\" cy=\"-38.7\" r=\"2.2\" />\n    <circle cx=\"-66.9\" cy=\"-73.5\" r=\"2.2\" />\n    <circle cx=\"-35.7\" cy=\"-205\" r=\"2.2\" />\n  </g>\n\n  <g font-family=\"'Times New Roman', 'KaTeX_Main', serif\" font-size=\"12.5\" fill=\"#17201c\">\n    <text x=\"-73.2\" y=\"-182.4\">A</text>\n    <text x=\"-152.6\" y=\"41.4\">B</text>\n    <text x=\"135.2\" y=\"41.4\">C</text>\n    <text x=\"7.4\" y=\"-107.9\">E</text>\n    <text x=\"-123.7\" y=\"-56.8\">F</text>\n    <text x=\"-116.9\" y=\"-76.5\">M</text>\n    <text x=\"37.5\" y=\"-76.5\">N</text>\n    <text x=\"-81.2\" y=\"-42.1\">H</text>\n    <text x=\"-47.7\" y=\"-25.200000000000003\">I</text>\n    <text x=\"1.7999999999999998\" y=\"-27.299999999999997\">O</text>\n    <text x=\"-116.9\" y=\"7.2\">X</text>\n    <text x=\"36.5\" y=\"7.2\">Y</text>\n    <text x=\"-72.2\" y=\"43.4\">D</text>\n    <text x=\"-232.6\" y=\"-26.700000000000003\">J</text>\n    <text x=\"-71.9\" y=\"-79.5\">S</text>\n    <text x=\"-29.700000000000003\" y=\"-208\">Z</text>\n  </g>\n</svg>\n</div>\n\n<p><em>Lời giải.</em> Gọi $S$ là giao điểm của $MN$ và $EF$; hai điểm $X, Y$ lần lượt là trung điểm của $BH$ và $CH$. Áp dụng định lý Pascal cho bộ 6 điểm:</p>\n$$\\begin{pmatrix} E & N & Y \\\\[0.3em] F & M & X \\end{pmatrix}$$\n<p>suy ra $J, H, I$ thẳng hàng, hay $ME, NF, OH$ đồng quy tại một điểm $J$. Xét tam giác $ABC$ và gọi $\\mathcal R$ và $r$ lần lượt là bán kính đường tròn ngoại tiếp và đường tròn $Euler$ của tam giác $ABC$. Ta có:</p>\n$$AH = 2\\mathcal R\\cos ABC ,\\qquad \\mathcal R = 2r$$\n<p>Theo định lý Brocard ta có $S$ là trực tâm tam giác $AJI$ hay $IS$ vuông góc $AJ$. Xét cực và đối cực với đường tròn $I$ do $AZ$ là đối cực của $S$ nên $S$ thuộc đường đối cực của $Z$, mà $IZ$ vuông góc với $SN$ suy ra $MN$ là đường đối cực của $Z$. Do $AH$ song song $ZI$ nên ta có:</p>\n$$\\dfrac{JI}{JH}=\\dfrac{AH}{IZ}=\\dfrac{AH\\cos MIZ}{IM}$$\n<p>mặt khác do $A$ và $D$ đối xứng với nhau qua $MN$ nên ta có $\\angle BAC = \\angle MAN = \\angle MDN = \\angle MIZ$, nên từ đây ta được:</p>\n$$\\dfrac{JI}{JH}=\\dfrac{AH}{IM}\\cdot \\cos BAC=\\dfrac{2AH}{R}\\cdot \\dfrac{AH}{2R}=\\dfrac{AH^2}{R^2}$$\n<p>Hay ta có điều phải chứng minh. $\\square$</p>\n\n<div class=\"math-lemma-box\">\n  <strong>Bổ đề 4.</strong> Cho tam giác $ABC$ nội tiếp đường tròn $(O)$, tâm đường tròn $Euler$ $I$ và trực tâm $H$. Trong tam giác $ABC$ dựng các đường cao $AD, BE, CF$. Gọi $M, N, P$ lần lượt là trung điểm của $AB$, $AC$ và $BC$. Gọi $U$ là giao điểm của $PM$, $FD$; $V$ là giao điểm của $PN$, $DE$ và $W$ giao điểm của $ME$, $FN$. Khi này ta có $U, V, W, A$ thẳng hàng.\n</div>\n\n<div class=\"math-figure-center\">\n  <svg viewBox=\"-323 -337 499 483\" width=\"100%\" height=\"auto\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#ffffff; max-width:540px; margin:0 auto; display:block;\">\n  <g fill=\"none\" stroke=\"#17201c\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <circle cx=\"0\" cy=\"-29.2\" r=\"151.1\" stroke-width=\"0.95\" />\n    <circle cx=\"-39.9\" cy=\"-24.3\" r=\"75.6\" stroke-width=\"0.85\" />\n\n    <polygon points=\"-79.8,-157.5 -134.4,39.9 134.4,39.9\" stroke-width=\"1.6\" />\n\n    <line x1=\"-79.8\" y1=\"-157.5\" x2=\"-79.8\" y2=\"39.9\" stroke-width=\"0.9\" />\n    <line x1=\"-134.4\" y1=\"39.9\" x2=\"-11\" y2=\"-94.1\" stroke-width=\"0.9\" />\n    <line x1=\"134.4\" y1=\"39.9\" x2=\"-115.3\" y2=\"-29.2\" stroke-width=\"0.9\" />\n\n    <line x1=\"-151.6\" y1=\"-99.8\" x2=\"0\" y2=\"39.9\" stroke-width=\"0.75\" />\n    <line x1=\"-151.6\" y1=\"-99.8\" x2=\"-79.8\" y2=\"39.9\" stroke-width=\"0.75\" />\n\n    <line x1=\"93\" y1=\"-296.3\" x2=\"0\" y2=\"39.9\" stroke-width=\"0.75\" />\n    <line x1=\"93\" y1=\"-296.3\" x2=\"-79.8\" y2=\"39.9\" stroke-width=\"0.75\" />\n\n    <line x1=\"-283\" y1=\"5.7\" x2=\"-11\" y2=\"-94.1\" stroke-width=\"0.75\" />\n    <line x1=\"-283\" y1=\"5.7\" x2=\"27.3\" y2=\"-58.8\" stroke-width=\"0.75\" />\n    <line x1=\"-226.4\" y1=\"39.9\" x2=\"-11\" y2=\"-94.1\" stroke-width=\"0.75\" />\n    <line x1=\"-226.4\" y1=\"39.9\" x2=\"134.4\" y2=\"39.9\" stroke-width=\"0.75\" />\n\n    <line x1=\"-292.1\" y1=\"13\" x2=\"100.2\" y2=\"-302.1\" stroke=\"#3370e6\" stroke-width=\"1.2\" stroke-dasharray=\"5,4\" />\n  </g>\n\n  <g fill=\"#ffffff\" stroke=\"#17201c\" stroke-width=\"1.1\">\n    <circle cx=\"-79.8\" cy=\"-157.5\" r=\"2.2\" />\n    <circle cx=\"-134.4\" cy=\"39.9\" r=\"2.2\" />\n    <circle cx=\"134.4\" cy=\"39.9\" r=\"2.2\" />\n    <circle cx=\"-226.4\" cy=\"39.9\" r=\"2.2\" />\n    <circle cx=\"-79.8\" cy=\"39.9\" r=\"2.2\" />\n    <circle cx=\"-11\" cy=\"-94.1\" r=\"2.2\" />\n    <circle cx=\"-115.3\" cy=\"-29.2\" r=\"2.2\" />\n    <circle cx=\"-107.1\" cy=\"-58.8\" r=\"2.2\" />\n    <circle cx=\"27.3\" cy=\"-58.8\" r=\"2.2\" />\n    <circle cx=\"0\" cy=\"39.9\" r=\"2.2\" />\n    <circle cx=\"-79.8\" cy=\"-19.3\" r=\"2.2\" />\n    <circle cx=\"-39.9\" cy=\"-24.3\" r=\"2.2\" />\n    <circle cx=\"0\" cy=\"-29.2\" r=\"2.2\" />\n    <circle cx=\"-151.6\" cy=\"-99.8\" r=\"2.2\" />\n    <circle cx=\"93\" cy=\"-296.3\" r=\"2.2\" />\n    <circle cx=\"-283\" cy=\"5.7\" r=\"2.2\" />\n  </g>\n\n  <g font-family=\"'Times New Roman', 'KaTeX_Main', serif\" font-size=\"12.5\" fill=\"#17201c\">\n    <text x=\"-84.8\" y=\"-163.5\">A</text>\n    <text x=\"-148.4\" y=\"51.9\">B</text>\n    <text x=\"139.4\" y=\"51.9\">C</text>\n    <text x=\"-240.4\" y=\"51.9\">S</text>\n    <text x=\"-84.8\" y=\"53.9\">D</text>\n    <text x=\"-5\" y=\"-97.1\">E</text>\n    <text x=\"-129.3\" y=\"-32.2\">F</text>\n    <text x=\"-121.1\" y=\"-61.8\">M</text>\n    <text x=\"33.3\" y=\"-61.8\">N</text>\n    <text x=\"-5\" y=\"53.9\">P</text>\n    <text x=\"-93.8\" y=\"-22.3\">H</text>\n    <text x=\"-34.9\" y=\"-12.3\">I</text>\n    <text x=\"6\" y=\"-32.2\">O</text>\n    <text x=\"-165.6\" y=\"-104.8\">U</text>\n    <text x=\"99\" y=\"-299.3\">V</text>\n    <text x=\"-299\" y=\"2.7\">W</text>\n  </g>\n</svg>\n</div>\n\n<p><em>Lời giải.</em> Áp dụng định lý Pascal cho bộ 6 điểm sau:</p>\n$$\\begin{pmatrix} M & N & D \\\\ F & E & P \\end{pmatrix}$$\n<p>ta được $W, U, V$ thẳng hàng. Gọi $S$ là giao điểm của $EF$ và $BC$, khi này ta có:</p>\n$$D(PA,UV)=(SH,FE) = -1 \\tag{3}$$\n<p>mặt khác do $DP$ song song với $MN$ và $PA$ đi qua trung điểm $MN$ nên:</p>\n$$P(DA,UV) = P(DA, MN)=-1 \\tag{4}$$\n<p>Từ $(3), (4)$ suy ra $D(PA,UV)=P(DA,UV)$, dẫn đến ta có $A, U, V$ thẳng hàng hay $A, U, V, W$ cùng thuộc một đường thẳng. $\\square$</p>\n\n<p style=\"margin-top: 16px;\"><strong>Trở lại bài toán:</strong></p>\n\n<div class=\"math-figure-center\">\n  <svg viewBox=\"-307 -267 676 483\" width=\"100%\" height=\"auto\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#ffffff; max-width:620px; margin:0 auto; display:block;\">\n  <g fill=\"none\" stroke=\"#17201c\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <circle cx=\"24\" cy=\"-61.8\" r=\"94.2\" stroke=\"#3366cc\" stroke-width=\"1.1\" />\n    <circle cx=\"-12.5\" cy=\"-48.1\" r=\"39.1\" stroke-width=\"0.85\" />\n\n    <polygon points=\"-46.1,-124.8 -54.4,-9.6 101.1,-7.7\" stroke-width=\"1.6\" />\n\n    <line x1=\"-127.5\" y1=\"-89.1\" x2=\"177.8\" y2=\"-223\" stroke-width=\"0.75\" />\n    <line x1=\"58.2\" y1=\"112.9\" x2=\"-54.4\" y2=\"-9.6\" stroke-width=\"0.75\" />\n    <line x1=\"58.2\" y1=\"112.9\" x2=\"101.1\" y2=\"-7.7\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"-61.4\" y2=\"86.9\" stroke-width=\"0.75\" />\n    <line x1=\"58.2\" y1=\"112.9\" x2=\"-127.5\" y2=\"-89.1\" stroke-width=\"0.75\" />\n    <line x1=\"58.2\" y1=\"112.9\" x2=\"177.8\" y2=\"-223\" stroke-width=\"0.75\" />\n    <line x1=\"-11.4\" y1=\"-130.2\" x2=\"-12.5\" y2=\"-48.1\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"58.2\" y2=\"112.9\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"325.8\" y2=\"171.1\" stroke-width=\"0.75\" />\n    <line x1=\"25.2\" y1=\"-156.1\" x2=\"-61.4\" y2=\"86.9\" stroke-width=\"0.75\" />\n    <line x1=\"25.2\" y1=\"-156.1\" x2=\"325.8\" y2=\"171.1\" stroke-width=\"0.75\" />\n    <line x1=\"-54.4\" y1=\"-9.6\" x2=\"118\" y2=\"-55\" stroke-width=\"0.75\" />\n    <line x1=\"101.1\" y1=\"-7.7\" x2=\"-34.6\" y2=\"11.9\" stroke-width=\"0.75\" />\n    <line x1=\"25.2\" y1=\"-156.1\" x2=\"24\" y2=\"-61.8\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"-157.9\" y2=\"65.9\" stroke-width=\"0.75\" />\n    <line x1=\"118\" y1=\"-55\" x2=\"-34.6\" y2=\"11.9\" stroke-width=\"0.75\" />\n    <line x1=\"-157.9\" y1=\"65.9\" x2=\"118\" y2=\"-55\" stroke-width=\"0.75\" />\n    <line x1=\"-258.2\" y1=\"44.1\" x2=\"24\" y2=\"-61.8\" stroke-width=\"0.75\" />\n    <line x1=\"-258.2\" y1=\"44.1\" x2=\"118\" y2=\"-55\" stroke-width=\"0.75\" />\n    <line x1=\"-258.2\" y1=\"44.1\" x2=\"-34.6\" y2=\"11.9\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"-34.6\" y2=\"11.9\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"118\" y2=\"-55\" stroke-width=\"0.75\" />\n    <line x1=\"-46.1\" y1=\"-124.8\" x2=\"22.9\" y2=\"32.4\" stroke-width=\"0.75\" />\n\n    <line x1=\"-267.6\" y1=\"50.8\" x2=\"33.5\" y2=\"-162\" stroke=\"#d03030\" stroke-width=\"1.1\" stroke-dasharray=\"5,4\" />\n    <line x1=\"-278.2\" y1=\"39.8\" x2=\"339.6\" y2=\"174.1\" stroke=\"#d03030\" stroke-width=\"1.1\" stroke-dasharray=\"5,4\" />\n  </g>\n\n  <g fill=\"#ffffff\" stroke=\"#17201c\" stroke-width=\"1.1\">\n    <circle cx=\"-46.1\" cy=\"-124.8\" r=\"2.2\" />\n    <circle cx=\"-54.4\" cy=\"-9.6\" r=\"2.2\" />\n    <circle cx=\"101.1\" cy=\"-7.7\" r=\"2.2\" />\n    <circle cx=\"24\" cy=\"-61.8\" r=\"2.2\" />\n    <circle cx=\"-12.5\" cy=\"-48.1\" r=\"2.2\" />\n    <circle cx=\"58.2\" cy=\"112.9\" r=\"2.2\" />\n    <circle cx=\"-11.4\" cy=\"-130.2\" r=\"2.2\" />\n    <circle cx=\"25.2\" cy=\"-156.1\" r=\"2.2\" />\n    <circle cx=\"-65.2\" cy=\"-92.2\" r=\"2.2\" />\n    <circle cx=\"-34.6\" cy=\"11.9\" r=\"2.2\" />\n    <circle cx=\"118\" cy=\"-55\" r=\"2.2\" />\n    <circle cx=\"-127.5\" cy=\"-89.1\" r=\"2.2\" />\n    <circle cx=\"177.8\" cy=\"-223\" r=\"2.2\" />\n    <circle cx=\"-61.4\" cy=\"86.9\" r=\"2.2\" />\n    <circle cx=\"325.8\" cy=\"171.1\" r=\"2.2\" />\n    <circle cx=\"-157.9\" cy=\"65.9\" r=\"2.2\" />\n    <circle cx=\"-258.2\" cy=\"44.1\" r=\"2.2\" />\n    <circle cx=\"22.9\" cy=\"32.4\" r=\"2.2\" />\n    <circle cx=\"23.4\" cy=\"-8.6\" r=\"2.2\" />\n  </g>\n\n  <g font-family=\"'Times New Roman', 'KaTeX_Main', serif\" font-size=\"12.5\" fill=\"#17201c\">\n    <text x=\"-58.1\" y=\"-128.8\">A</text>\n    <text x=\"-68.4\" y=\"2.4000000000000004\">B</text>\n    <text x=\"106.1\" y=\"4.3\">C</text>\n    <text x=\"30\" y=\"-64.8\">O</text>\n    <text x=\"-6.5\" y=\"-38.1\">I</text>\n    <text x=\"44.2\" y=\"126.9\">J<tspan font-size=\"9\" dy=\"2\">a</tspan></text>\n    <text x=\"-25.4\" y=\"-133.2\">H</text>\n    <text x=\"20.2\" y=\"-162.1\">T</text>\n    <text x=\"-79.2\" y=\"-95.2\">J</text>\n    <text x=\"-39.6\" y=\"25.9\">N</text>\n    <text x=\"124\" y=\"-52\">M</text>\n    <text x=\"-141.5\" y=\"-92.1\">X</text>\n    <text x=\"172.8\" y=\"-229\">Y</text>\n    <text x=\"-66.4\" y=\"100.9\">V</text>\n    <text x=\"331.8\" y=\"181.1\">Q</text>\n    <text x=\"-171.9\" y=\"77.9\">W</text>\n    <text x=\"-272.2\" y=\"41.1\">U</text>\n    <text x=\"28.9\" y=\"42.4\">R</text>\n    <text x=\"18.4\" y=\"5.4\">Z</text>\n  </g>\n</svg>\n</div>\n\n<p>Gọi $N, M$ lần lượt là giao điểm của $J_{a}B$, $J_{a}C$ với $(O)$; Gọi $X, Y$ lần lượt là giao điểm của $J_{a}X$ và $J_{a}Y$ với $AT$, đường thẳng $HT$ cắt $(O)$ tại $J$. Ở đây ta giả sử $BM$ cắt $CN$ tại $U$. Ta sẽ chứng minh $H, T, U$ thẳng hàng.</p>\n\n<p>Xét tam giác $J_{a}XY$ với $I$ là trực tâm và $(O)$ là tâm $Euler$. Áp dụng <strong>Bổ đề 3</strong> suy ra $OI, BM, CN$ đồng quy tại $U$. Ta thực hiện biến đổi tỉ số sau:</p>\n$$\\dfrac{IH}{OT}=\\dfrac{2RZ}{OT}=2\\cdot\\dfrac{RC^2}{RT\\cdot OT}=\\dfrac{IJ_a^2}{2\\cdot RT\\cdot OT}=\\dfrac{IJ_{a}^2}{(2R)^2}=\\dfrac{IJ_{a}^2}{R_{J_{a}XY}^2} \\tag{5}$$\n<p>Mà áp dụng <strong>Bổ đề 3</strong> ta cũng có được:</p>\n$$\\dfrac{IJ_{a}^2}{R_{J_{a}XY}^2}=\\dfrac{UI}{UO} \\tag{6}$$\n<p>Từ $(1), (2)$ ta suy ra $\\dfrac{IH}{OT}=\\dfrac{UI}{UO}$. Áp dụng định lý Thalet đảo ta được $U, H, T$ thẳng hàng. Áp dụng định lý Pascal cho bộ 6 điểm sau:</p>\n$$\\begin{pmatrix} A & T & M \\\\ N & B & J \\end{pmatrix}$$\n<p>ta được $W, U, V$ thẳng hàng, tương tự ta xét bộ 6 điểm sau:</p>\n$$\\begin{pmatrix} B & C & T \\\\ N & M & A \\end{pmatrix}$$\n<p>ta được $Q, V, U$ thẳng hàng, từ hai kết quả này suy ra $W, U, V, Q$ thẳng hàng. Áp dụng <strong>Bổ đề 4</strong> cho tam giác $J_{a}XY$ suy ra năm điểm $U, W, V, J_a, Q$ cùng thuộc một đường thẳng. Do $MN$ là trung trực của $AJ_a$, nên suy ra:</p>\n$$\\angle UJ_{a}I=\\angle JAR = \\angle JTR =\\angle UHI$$\n<p>hay ta có điều phải chứng minh. $\\square$</p>",
        author: AUTH_ADMIN,
        createdAt: new Date().toISOString(),
        upvotes: 52,
        isAccepted: true,
        instructorVerified: true
      }
    ]
  },
  {
    id: 'ueh-weekly-challenge-lagrange-sphere',
    type: 'question',
    title: 'Thử thách tuần: Tìm cực trị của hàm 3 biến $f(x, y, z) = x^2 + 2y^2 + 3z^2$ trên mặt cầu $x^2 + y^2 + z^2 = 1$?',
    content: `<p style="font-size: 1.02rem; line-height: 1.85;">Tìm giá trị lớn nhất $f_{\\max}$ và nhỏ nhất $f_{\\min}$ của hàm 3 biến:</p>
$$f(x, y, z) = x^2 + 2y^2 + 3z^2 \\quad \\text{với điều kiện} \\quad x^2 + y^2 + z^2 = 1$$
<p style="font-size: 1.02rem; line-height: 1.85;">Yêu cầu xác định toàn bộ tọa độ các điểm cực trị tương ứng bằng phương pháp nhân tử Lagrange $\\mathcal{L}(x,y,z,\\lambda)$.</p>`,
    subject: 'calc2',
    subjectLabel: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)',
    difficulty: 'olympiad',
    difficultyLabel: 'Thử thách Olympic UEH',
    tags: ['#ThuThachTuan', '#Lagrange', '#CucTri3Bien', '#ViTichPhan2', '#OlympicUEH'],
    author: AUTH_ADMIN,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    views: 128,
    upvotes: 18,
    upvotedBy: ['user-phuc-519', 'user-phuc-0809'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-challenge-1',
    instructorVerified: true,
    answers: [
      {
        id: 'ans-challenge-1',
        content: `<div class="math-insight-card">
  <div class="math-insight-icon">💡</div>
  <div>
    <h3 class="math-insight-title">Tư duy giải toán & Bản chất hình học</h3>
    <div class="math-insight-content">
      Bản chất bài toán là tìm giao điểm tiếp xúc giữa <strong>mặt cầu đơn vị</strong> $x^2 + y^2 + z^2 = 1$ và các <strong>mặt elipsoid đồng mức</strong> $x^2 + 2y^2 + 3z^2 = c$. 
      Vì tập ràng buộc $S$ là tập đóng và bị chặn (compact) trong $\\mathbb{R}^3$, theo định lý Weierstrass hàm liên tục $f$ chắc chắn đạt cả GTLN và GTNN trên $S$.
    </div>
  </div>
</div>

<div class="math-step-card">
  <div class="math-step-header">
    <span class="math-step-badge">Bước 1</span>
    <span class="math-step-title">Thiết lập hàm Lagrange</span>
  </div>
  <div class="math-step-body">
    Điều kiện ràng buộc: $g(x, y, z) = x^2 + y^2 + z^2 - 1 = 0$.<br/>
    Hàm Lagrange 4 biến với nhân tử $\\lambda$:
    $$\\mathcal{L}(x, y, z, \\lambda) = x^2 + 2y^2 + 3z^2 + \\lambda(1 - x^2 - y^2 - z^2)$$
  </div>
</div>

<div class="math-step-card">
  <div class="math-step-header">
    <span class="math-step-badge">Bước 2</span>
    <span class="math-step-title">Hệ phương trình điểm dừng đạo hàm riêng</span>
  </div>
  <div class="math-step-body">
    Lấy đạo hàm riêng theo từng biến và cho triệt tiêu:
    $$\\begin{cases} 
      \\mathcal{L}_x' = 2x(1 - \\lambda) = 0 \\\\ 
      \\mathcal{L}_y' = 2y(2 - \\lambda) = 0 \\\\ 
      \\mathcal{L}_z' = 2z(3 - \\lambda) = 0 \\\\ 
      x^2 + y^2 + z^2 = 1 
    \\end{cases}$$
  </div>
</div>

<div class="math-step-card">
  <div class="math-step-header">
    <span class="math-step-badge">Bước 3</span>
    <span class="math-step-title">Biện luận 3 trường hợp nhân tử Lagrange</span>
  </div>
  <div class="math-step-body">
    <div class="editorial-table-wrap">
      <table class="editorial-table">
        <thead>
          <tr>
            <th>Trường hợp</th>
            <th>Tọa độ điểm dừng</th>
            <th>Giá trị $f(x,y,z)$</th>
            <th>Phân loại cực trị</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>$\\lambda = 1$</strong> $\\implies y=0, z=0$</td>
            <td>$M_{1,2}(\\pm 1, 0, 0)$</td>
            <td>$f(\\pm 1, 0, 0) = 1$</td>
            <td><span style="color:#059669; font-weight:700;">Giá trị nhỏ nhất ($f_{\\min}$)</span></td>
          </tr>
          <tr>
            <td><strong>$\\lambda = 2$</strong> $\\implies x=0, z=0$</td>
            <td>$M_{3,4}(0, \\pm 1, 0)$</td>
            <td>$f(0, \\pm 1, 0) = 2$</td>
            <td>Điểm dừng yên ngựa</td>
          </tr>
          <tr>
            <td><strong>$\\lambda = 3$</strong> $\\implies x=0, y=0$</td>
            <td>$M_{5,6}(0, 0, \\pm 1)$</td>
            <td>$f(0, 0, \\pm 1) = 3$</td>
            <td><span style="color:#2563eb; font-weight:700;">Giá trị lớn nhất ($f_{\\max}$)</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div class="math-result-card">
  <div class="math-result-title">
    <span class="math-result-title-icon">✓</span>
    <span>KẾT LUẬN & ĐÁP SỐ CHUẨN XÁC</span>
  </div>
  <div class="math-result-body">
    • <strong>Giá trị nhỏ nhất:</strong> $f_{\\min} = 1$, đạt tại hai điểm đối xứng trên trục $Ox$: $(\\pm 1, 0, 0)$.<br/>
    • <strong>Giá trị lớn nhất:</strong> $f_{\\max} = 3$, đạt tại hai điểm đối xứng trên trục $Oz$: $(0, 0, \\pm 1)$.
  </div>
</div>

<div class="math-warning-card">
  <div class="math-warning-icon">⚠️</div>
  <div>
    <h3 class="math-warning-title">Bẫy điểm số sinh viên UEH hay mắc phải</h3>
    <div class="math-warning-content">
      Nhiều bạn quên lập luận <strong>tính compact của mặt cầu</strong> $x^2+y^2+z^2=1$. Nếu không có tính compact, việc chỉ so sánh giá trị tại các điểm dừng chưa đủ để khẳng định đó là GTLN/GTNN toàn cục!
    </div>
  </div>
</div>`,
        author: AUTH_USER_519,
        upvotes: 24,
        upvotedBy: ['user-phuc'],
        isAccepted: true,
        instructorVerified: true,
        isFirstSolver: true,
        comments: [
          {
            id: 'cmt-challenge-1',
            content: 'Phân tích chặt chẽ, biện luận đầy đủ 3 trường hợp nhân tử Lagrange và chứng minh tập compact chuẩn mực!',
            author: AUTH_ADMIN,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString()
      }
    ]
  },
  {
    id: 'ueh-pnta-lagrange-cobb-douglas',
    type: 'question',
    title: 'Tìm cực trị có điều kiện của hàm lợi ích $U(x, y) = x^{0.6} y^{0.4}$ với ngân sách 120 triệu?',
    content: 'Chào mọi người, mình đang làm đề ôn tập Vi tích phân 2 của Thầy Phan Ngô Tuấn Anh. Đề bài yêu cầu: Một người tiêu dùng có hàm lợi ích $U(x, y) = x^{0.6} y^{0.4}$. Giá của hai loại hàng hóa lần lượt là $P_x = 3$ triệu đồng và $P_y = 4$ triệu đồng. Ngân sách tiêu dùng tối đa là $I = 120$ triệu đồng.\n\nHãy tìm gói hàng hóa $(x, y)$ tối ưu hóa lợi ích bằng phương pháp nhân tử Lagrange và tính giá trị lợi ích cực đại $U_{\\max}$?',
    subject: 'calc2',
    subjectLabel: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)',
    difficulty: 'hard',
    difficultyLabel: 'Nâng cao A+ (9 - 10đ)',
    tags: ['#Lagrange', '#CobbDouglas', '#CucTriCoDieuKien', '#ViTichPhan2'],
    author: AUTH_ADMIN,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    views: 680,
    upvotes: 42,
    upvotedBy: ['user-phuc-519', 'user-phuc-0809'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-1-1',
    instructorVerified: true,
    answers: [
      {
        id: 'ans-1-1',
        content: 'Chào các bạn, đây là bài toán tối ưu hóa tiêu dùng kinh điển dạng hàm Cobb-Douglas trong kinh tế học.\n\n**Bước 1: Lập hàm Lagrange**\nPhương trình điều kiện ngân sách: $3x + 4y = 120$.\nHàm số Lagrange tương ứng:\n$$\\mathcal{L}(x, y, \\lambda) = x^{0.6} y^{0.4} + \\lambda(120 - 3x - 4y)$$\n\n**Bước 2: Hệ phương trình điểm dừng**\nLấy đạo hàm riêng cấp 1 và cho bằng 0:\n$$\\begin{cases} \\mathcal{L}_x\' = 0.6 x^{-0.4} y^{0.4} - 3\\lambda = 0 \\\\ \\mathcal{L}_y\' = 0.4 x^{0.6} y^{-0.6} - 4\\lambda = 0 \\\\ 120 - 3x - 4y = 0 \\end{cases}$$\n\nChia phương trình (1) cho phương trình (2):\n$$\\frac{0.6 y}{0.4 x} = \\frac{3}{4} \\iff \\frac{3y}{2x} = \\frac{3}{4} \\iff y = \\frac{1}{2}x$$\n\n**Bước 3: Thay vào phương trình ngân sách**\n$$3x + 4\\left(\\frac{1}{2}x\\right) = 120 \\iff 5x = 120 \\implies x^* = 24$$\nSuy ra $y^* = 12$.\n\n**Kết luận:**\nGói hàng hóa tối ưu là $(x^*, y^*) = (24, 12)$ và lợi ích cực đại đạt được là:\n$$U_{\\max} = 24^{0.6} \\cdot 12^{0.4} \\approx 18.18$$',
        author: AUTH_USER_519,
        upvotes: 45,
        upvotedBy: ['user-phuc'],
        isAccepted: true,
        instructorVerified: true,
        isFirstSolver: true,
        comments: [
          {
            id: 'cmt-1-1',
            content: 'Lời giải chi tiết và biến đổi rất chuẩn mực. Đã chấp nhận lời giải chính xác!',
            author: AUTH_ADMIN,
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    ]
  },
  {
    id: 'ueh-algebra-matrix-inverse-cramer',
    type: 'question',
    title: 'Tìm ma trận nghịch đảo $A^{-1}$ cấp 3 bằng ma trận phụ hợp và giải phương trình ma trận $AX = B$?',
    content: 'Cho ma trận $A = \\begin{pmatrix} 1 & 2 & -1 \\\\ 2 & 5 & -1 \\\\ 1 & 3 & 1 \\end{pmatrix}$ và ma trận $B = \\begin{pmatrix} 2 \\\\ 5 \\\\ 6 \\end{pmatrix}$.\n\nHãy tính $\\det(A)$, tìm ma trận phần bù đại số $P_A$, ma trận phụ hợp $P_A^T$, từ đó suy ra $A^{-1}$ và tìm nghiệm $X = A^{-1}B$.',
    subject: 'algebra',
    subjectLabel: 'Đại số Tuyến tính & Ma trận',
    difficulty: 'medium',
    difficultyLabel: 'Khá (7 - 8.5đ)',
    tags: ['#MaTranNghichDao', '#PhanBuDaiSo', '#DinhThuc', '#DaiSoTuyenTinh'],
    author: AUTH_USER_0809,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    views: 450,
    upvotes: 25,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-2-1',
    answers: [
      {
        id: 'ans-2-1',
        content: '**1. Tính định thức $\\det(A)$:**\n$$\\det(A) = 1(5\\cdot 1 - (-1)\\cdot 3) - 2(2\\cdot 1 - (-1)\\cdot 1) + (-1)(2\\cdot 3 - 5\\cdot 1) = 8 - 6 - 1 = 1 \\ne 0$$\nDo $\\det(A) = 1 \\ne 0$ nên $A$ khả nghịch.\n\n**2. Tính ma trận phụ hợp $P_A^T$:**\n$$P_A^T = \\begin{pmatrix} 8 & -5 & 3 \\\\ -3 & 2 & -1 \\\\ 1 & -1 & 1 \\end{pmatrix}$$\nSuy ra $A^{-1} = \\frac{1}{\\det(A)} P_A^T = \\begin{pmatrix} 8 & -5 & 3 \\\\ -3 & 2 & -1 \\\\ 1 & -1 & 1 \\end{pmatrix}$.\n\n**3. Tìm nghiệm $X = A^{-1}B$:**\n$$X = \\begin{pmatrix} 8 & -5 & 3 \\\\ -3 & 2 & -1 \\\\ 1 & -1 & 1 \\end{pmatrix} \\begin{pmatrix} 2 \\\\ 5 \\\\ 6 \\end{pmatrix} = \\begin{pmatrix} 16 - 25 + 18 \\\\ -6 + 10 - 6 \\\\ 2 - 5 + 6 \\end{pmatrix} = \\begin{pmatrix} 9 \\\\ -2 \\\\ 3 \\end{pmatrix}$$',
        author: AUTH_ADMIN,
        upvotes: 38,
        upvotedBy: ['user-phuc-0809'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  },
  {
    id: 'ueh-leontief-input-output-3sec',
    type: 'question',
    title: 'Tính tổng sản lượng $X = (I-A)^{-1}D$ trong mô hình Input-Output Leontief mở 3 ngành?',
    content: 'Một nền kinh tế gồm 3 ngành với ma trận hệ số kỹ thuật đầu vào:\n$$A = \\begin{pmatrix} 0.2 & 0.3 & 0.2 \\\\ 0.4 & 0.1 & 0.2 \\\\ 0.1 & 0.3 & 0.2 \\end{pmatrix}$$\nvà vector cầu cuối của thị trường là $D = \\begin{pmatrix} 100 \\\\ 200 \\\\ 150 \\end{pmatrix}$.\n\nHãy tìm ma trận Leontief $I - A$, ma trận nghịch đảo $(I - A)^{-1}$ và tính vector tổng sản lượng $X$?',
    subject: 'econ_models',
    subjectLabel: 'Mô hình Toán Kinh tế & Leontief',
    difficulty: 'hard',
    difficultyLabel: 'Nâng cao A+ (9 - 10đ)',
    tags: ['#Leontief', '#InputOutput', '#MaTranHeSoKyThuat', '#ToanKinhTe'],
    author: AUTH_USER_519,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    views: 520,
    upvotes: 31,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-3-1',
    answers: [
      {
        id: 'ans-3-1',
        content: '**1. Ma trận Leontief $I - A$:**\n$$I - A = \\begin{pmatrix} 0.8 & -0.3 & -0.2 \\\\ -0.4 & 0.9 & -0.2 \\\\ -0.1 & -0.3 & 0.8 \\end{pmatrix}$$\nTính được $\\det(I - A) = 0.384 > 0$.\n\n**2. Ma trận Leontief nghịch đảo:**\n$$(I - A)^{-1} = \\frac{1}{0.384} \\begin{pmatrix} 0.66 & 0.30 & 0.24 \\\\ 0.34 & 0.62 & 0.24 \\\\ 0.21 & 0.27 & 0.60 \\end{pmatrix}$$\n\n**3. Vector tổng sản lượng $X$:**\n$$X = (I - A)^{-1} D = \\begin{pmatrix} 625 \\\\ 625 \\\\ 500 \\end{pmatrix}$$',
        author: AUTH_ADMIN,
        upvotes: 29,
        upvotedBy: ['user-phuc-519'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
      }
    ]
  },
  {
    id: 'ueh-elasticity-demand-revenue',
    type: 'question',
    title: 'Hệ số co giãn của hàm cầu theo giá $\\varepsilon_{Q/P}$ và bài toán tối đa hóa doanh thu $TR$?',
    content: 'Hàm cầu đối với một loại sản phẩm của doanh nghiệp có dạng: $Q = 200 - 4P$ (với $0 < P < 50$).\n\n1. Tính hệ số co giãn của cầu theo giá $\\varepsilon_{Q/P}$ tại mức giá $P = 20$ và $P = 30$, nêu ý nghĩa kinh tế.\n2. Tìm mức giá $P$ để tổng doanh thu $TR = P \\cdot Q$ đạt cực đại.',
    subject: 'calc1',
    subjectLabel: 'Vi tích phân 1 (Hàm 1 biến)',
    difficulty: 'standard',
    difficultyLabel: 'Căn bản (5 - 6.5đ)',
    tags: ['#HeSoCoGian', '#Elasticity', '#DoanhThuTR', '#ViTichPhan1'],
    author: AUTH_USER_0809,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    views: 410,
    upvotes: 28,
    upvotedBy: ['user-phuc-519'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-4-1',
    answers: [
      {
        id: 'ans-4-1',
        content: '**1. Công thức hệ số co giãn:**\n$$\\varepsilon_{Q/P} = Q\'(P) \\cdot \\frac{P}{Q} = -4 \\cdot \\frac{P}{200 - 4P} = \\frac{-P}{50 - P}$$\n- Tại $P = 20$: $\\varepsilon = \\frac{-20}{30} = -0.67$. Vì $|\\varepsilon| < 1$ (cầu kém co giãn), nếu tăng giá 1% thì lượng cầu giảm 0.67%, làm tổng doanh thu $TR$ tăng.\n- Tại $P = 30$: $\\varepsilon = \\frac{-30}{20} = -1.5$. Vì $|\\varepsilon| > 1$ (cầu co giãn nhiều), tăng giá sẽ làm giảm doanh thu.\n\n**2. Tối đa hóa tổng doanh thu $TR(P)$:**\n$$TR(P) = P(200 - 4P) = 200P - 4P^2$$\n$$TR\'(P) = 200 - 8P = 0 \\implies P^* = 25$$\nVì $TR\'\'(P) = -8 < 0$ nên tại $P^* = 25$, tổng doanh thu đạt cực đại $TR_{\\max} = 2500$ (khi đó $\\varepsilon = -1$).',
        author: AUTH_ADMIN,
        upvotes: 35,
        upvotedBy: ['user-phuc-0809'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  },
  {
    id: 'ueh-improper-integral-lnx-x2',
    type: 'question',
    title: 'Tính tích phân suy rộng loại 1 $I = \\int_{1}^{+\\infty} \\frac{\\ln x}{x^2}\\,dx$ và xét sự hội tụ?',
    content: 'Trong đề thi kết thúc học phần Toán Cao Cấp UEH có câu hỏi:\n\nXét sự hội tụ và tính giá trị của tích phân suy rộng: $I = \\int_{1}^{+\\infty} \\frac{\\ln x}{x^2}\\,dx$.\n\nMọi người hướng dẫn giúp mình cách dùng phương pháp tích phân từng phần và khử giới hạn $\\lim_{b \\to +\\infty}$ với ạ!',
    subject: 'calc1',
    subjectLabel: 'Vi tích phân 1 (Hàm 1 biến)',
    difficulty: 'medium',
    difficultyLabel: 'Khá (7 - 8.5đ)',
    tags: ['#TichPhanSuyRong', '#TichPhanTungPhan', '#GioiHanLim', '#DeThiUEH'],
    author: AUTH_USER_519,
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    views: 390,
    upvotes: 21,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-5-1',
    answers: [
      {
        id: 'ans-5-1',
        content: '**1. Tìm nguyên hàm bằng tích phân từng phần:**\nĐặt $\\begin{cases} u = \\ln x \\\\ dv = \\frac{dx}{x^2} \\end{cases} \\implies \\begin{cases} du = \\frac{dx}{x} \\\\ v = -\\frac{1}{x} \\end{cases}$\n$$\\int \\frac{\\ln x}{x^2}\\,dx = -\\frac{\\ln x}{x} - \\int \\left(-\\frac{1}{x}\\right) \\frac{dx}{x} = -\\frac{\\ln x}{x} - \\frac{1}{x} + C$$\n\n**2. Tính giới hạn tích phân suy rộng:**\n$$I = \\lim_{b \\to +\\infty} \\int_{1}^{b} \\frac{\\ln x}{x^2}\\,dx = \\lim_{b \\to +\\infty} \\left[ -\\frac{\\ln b}{b} - \\frac{1}{b} - \\left(-\\frac{\\ln 1}{1} - \\frac{1}{1}\\right) \\right]$$\nTheo quy tắc L\'Hôpital: $\\lim_{b \\to +\\infty} \\frac{\\ln b}{b} = \\lim_{b \\to +\\infty} \\frac{1/b}{1} = 0$.\n\nDo đó:\n$$I = 0 - 0 - (-1) = 1$$\n**Kết luận:** Tích phân suy rộng **hội tụ** và có giá trị $I = 1$.',
        author: AUTH_ADMIN,
        upvotes: 30,
        upvotedBy: ['user-phuc-519'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
      }
    ]
  },
  {
    id: 'ueh-system-kronecker-capelli',
    type: 'question',
    title: 'Biện luận số nghiệm của hệ phương trình tuyến tính theo tham số $m$ bằng định lý Kronecker-Capelli?',
    content: 'Cho hệ phương trình tuyến tính phụ thuộc tham số $m$:\n$$\\begin{cases} x_1 + 2x_2 - x_3 + 3x_4 = 1 \\\\ 2x_1 + 5x_2 + x_3 + 5x_4 = 4 \\\\ x_1 + 3x_2 + 2x_3 + 2x_4 = 3 \\\\ 3x_1 + 7x_2 + (m-1)x_3 + 8x_4 = m+4 \\end{cases}$$\n\nTìm điều kiện của $m$ để hệ: a) Vô nghiệm, b) Có vô số nghiệm phụ thuộc ẩn tự do.',
    subject: 'algebra',
    subjectLabel: 'Đại số Tuyến tính & Ma trận',
    difficulty: 'hard',
    difficultyLabel: 'Nâng cao A+ (9 - 10đ)',
    tags: ['#KroneckerCapelli', '#HangMaTran', '#HePhuongTrinh', '#BienLuanNghiem'],
    author: AUTH_USER_0809,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    views: 480,
    upvotes: 27,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-6-1',
    answers: [
      {
        id: 'ans-6-1',
        content: 'Lập ma trận bổ sung $\\overline{A} = (A|B)$ và biến đổi hàng sơ cấp:\n$$\\overline{A} = \\begin{pmatrix} 1 & 2 & -1 & 3 & 1 \\\\ 2 & 5 & 1 & 5 & 4 \\\\ 1 & 3 & 2 & 2 & 3 \\\\ 3 & 7 & m-1 & 8 & m+4 \\end{pmatrix} \\to \\begin{pmatrix} 1 & 2 & -1 & 3 & 1 \\\\ 0 & 1 & 3 & -1 & 2 \\\\ 0 & 0 & 0 & 0 & 0 \\\\ 0 & 0 & m-1 & 0 & m-1 \\end{pmatrix}$$\n\n**Biện luận theo $m$:**\n- Nếu $m = 1$: Hàng cuối cùng triệt tiêu hoàn toàn $\\implies r(A) = r(\\overline{A}) = 2 < 4$ (số ẩn). Hệ có vô số nghiệm phụ thuộc $4 - 2 = 2$ ẩn tự do.\n- Nếu $m \\ne 1$: Chia hàng cuối cho $m-1 \\implies r(A) = r(\\overline{A}) = 3 < 4$. Hệ có vô số nghiệm phụ thuộc $4 - 3 = 1$ ẩn tự do.\n- Hệ **không bao giờ vô nghiệm** với mọi $m \\in \\mathbb{R}$.',
        author: AUTH_ADMIN,
        upvotes: 32,
        upvotedBy: ['user-phuc-0809'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ]
  },
  {
    id: 'ueh-multivariable-unconstrained-extrema',
    type: 'question',
    title: 'Tìm cực trị tự do của hàm lợi nhuận 2 sản phẩm $\\pi(x, y) = -2x^2 - y^2 + 2xy + 40x + 20y - 50$?',
    content: 'Một công ty độc quyền sản xuất 2 loại sản phẩm với sản lượng lần lượt là $x$ và $y$. Hàm tổng lợi nhuận thu được là: $\\pi(x, y) = -2x^2 - y^2 + 2xy + 40x + 20y - 50$.\n\nHãy tìm mức sản lượng $(x, y)$ để tối đa hóa lợi nhuận và tính mức lợi nhuận cực đại đó.',
    subject: 'calc2',
    subjectLabel: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)',
    difficulty: 'standard',
    difficultyLabel: 'Căn bản (5 - 6.5đ)',
    tags: ['#CucTriTuDo', '#HessianMatrix', '#ToiUuLoiNhuan', '#ViTichPhan2'],
    author: AUTH_USER_519,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    views: 340,
    upvotes: 18,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-7-1',
    answers: [
      {
        id: 'ans-7-1',
        content: '**1. Tìm điểm dừng:**\n$$\\begin{cases} \\pi\'_x = -4x + 2y + 40 = 0 \\\\ \\pi\'_y = 2x - 2y + 20 = 0 \\end{cases} \\iff \\begin{cases} -2x + y = -20 \\\\ x - y = -10 \\end{cases} \\implies \\begin{cases} x^* = 30 \\\\ y^* = 40 \\end{cases}$$\n\n**2. Điều kiện cấp 2 (Ma trận Hessian):**\n- $A = \\pi\'\'_{xx} = -4$\n- $B = \\pi\'\'_{xy} = 2$\n- $C = \\pi\'\'_{yy} = -2$\n$$\\Delta = AC - B^2 = (-4)(-2) - 2^2 = 8 - 4 = 4 > 0$$\nVì $\\Delta > 0$ và $A = -4 < 0$ nên hàm đạt **cực đại** tại $(x^*, y^*) = (30, 40)$.\n\n**Lợi nhuận cực đại:**\n$$\\pi_{\\max} = -2(30)^2 - (40)^2 + 2(30)(40) + 40(30) + 20(40) - 50 = 950$$',
        author: AUTH_ADMIN,
        upvotes: 24,
        upvotedBy: ['user-phuc-519'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
      }
    ]
  },
  {
    id: 'ueh-differential-equations-capital',
    type: 'question',
    title: 'Giải phương trình vi phân tuyến tính cấp 1 mô hình tích lũy vốn $\\frac{dK}{dt} + 0.05K = 20$?',
    content: 'Trong mô hình tăng trưởng kinh tế, sự biến thiên của trữ lượng vốn $K(t)$ theo thời gian $t$ thỏa mãn phương trình vi phân: $\\frac{dK}{dt} + 0.05K = 20$ với điều kiện ban đầu $K(0) = 100$.\n\nHãy tìm nghiệm $K(t)$ và tính trữ lượng vốn cân bằng trong dài hạn khi $t \\to +\\infty$.',
    subject: 'calc2',
    subjectLabel: 'Vi tích phân 2 (Hàm nhiều biến & Tối ưu)',
    difficulty: 'medium',
    difficultyLabel: 'Khá (7 - 8.5đ)',
    tags: ['#PhuongTrinhViPhan', '#TichLuyVon', '#Cap1TuyenTinh', '#ToanKinhTe'],
    author: AUTH_USER_0809,
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    views: 375,
    upvotes: 23,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-8-1',
    answers: [
      {
        id: 'ans-8-1',
        content: '**1. Thừa số tích phân:**\n$$\\mu(t) = e^{\\int 0.05\\,dt} = e^{0.05t}$$\nNhân cả hai vế với $\\mu(t)$:\n$$\\frac{d}{dt}\\left[ K(t) e^{0.05t} \\right] = 20 e^{0.05t} \\implies K(t) e^{0.05t} = \\frac{20}{0.05} e^{0.05t} + C = 400 e^{0.05t} + C$$\n$$K(t) = 400 + C e^{-0.05t}$$\n\n**2. Xác định hằng số $C$ với $K(0) = 100$:**\n$$100 = 400 + C \\implies C = -300$$\nNghiệm bài toán: $K(t) = 400 - 300 e^{-0.05t}$.\n\n**3. Trữ lượng vốn dài hạn:**\n$$\\lim_{t \\to +\\infty} K(t) = 400 - 300(0) = 400$$',
        author: AUTH_ADMIN,
        upvotes: 27,
        upvotedBy: ['user-phuc-0809'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ]
  },
  {
    id: 'ueh-probability-joint-distribution',
    type: 'question',
    title: 'Lập bảng phân phối xác suất đồng thời, tính hiệp phương sai $\\text{Cov}(X, Y)$ và xét tính độc lập?',
    content: 'Cho bảng phân phối xác suất đồng thời của cặp biến ngẫu nhiên $(X, Y)$:\n\n| X \\ Y | 1 | 2 | 3 |\n|---|---|---|---|\n| 0 | 0.1 | 0.2 | 0.1 |\n| 1 | 0.15 | 0.3 | 0.15 |\n\n1. Tính các phân phối biên $P(X)$ và $P(Y)$.\n2. Tính $E(X), E(Y), E(XY)$ và $\\text{Cov}(X, Y)$.\n3. Hai biến ngẫu nhiên $X$ và $Y$ có độc lập với nhau không? Vì sao?',
    subject: 'prob_stats',
    subjectLabel: 'Xác suất & Thống kê ứng dụng',
    difficulty: 'medium',
    difficultyLabel: 'Khá (7 - 8.5đ)',
    tags: ['#XacSuat', '#BienNgauNhien2Chieu', '#HiepPhuongSai', '#DocLapTuyenTinh'],
    author: AUTH_USER_519,
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    views: 460,
    upvotes: 26,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-9-1',
    answers: [
      {
        id: 'ans-9-1',
        content: '**1. Phân phối xác suất biên:**\n- $P(X=0) = 0.1+0.2+0.1 = 0.4$, $P(X=1) = 0.15+0.3+0.15 = 0.6 \\implies E(X) = 0(0.4) + 1(0.6) = 0.6$.\n- $P(Y=1) = 0.25$, $P(Y=2) = 0.5$, $P(Y=3) = 0.25 \\implies E(Y) = 1(0.25) + 2(0.5) + 3(0.25) = 2$.\n\n**2. Tính $E(XY)$ và Hiệp phương sai:**\n$$E(XY) = (1)(1)(0.15) + (1)(2)(0.30) + (1)(3)(0.15) = 0.15 + 0.60 + 0.45 = 1.20$$\n$$\\text{Cov}(X, Y) = E(XY) - E(X)E(Y) = 1.20 - (0.6)(2) = 0$$\n\n**3. Xét tính độc lập:**\nKiểm tra $P(X=x_i, Y=y_j) = P(X=x_i) \\cdot P(Y=y_j)$ với mọi $i, j$ (ví dụ: $0.1 = 0.4 \\cdot 0.25$, $0.2 = 0.4 \\cdot 0.5$, v.v. đều thỏa mãn).\nDo đó, hai biến ngẫu nhiên $X$ và $Y$ **độc lập thống kê**.',
        author: AUTH_ADMIN,
        upvotes: 31,
        upvotedBy: ['user-phuc-519'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 38).toISOString()
      }
    ]
  },
  {
    id: 'ueh-vector-space-basis-coordinates',
    type: 'question',
    title: 'Chứng minh hệ vector $S = \\{u_1, u_2, u_3\\}$ là cơ sở của $\\mathbb{R}^3$ và tìm tọa độ vector $x$?',
    content: 'Trong không gian $\\mathbb{R}^3$, cho hệ vector $S = \\{u_1 = (1, 2, 1), u_2 = (2, 5, 3), u_3 = (1, 1, 2)\\}$ và vector $x = (3, 7, 4)$.\n\n1. Chứng minh hệ vector $S$ độc lập tuyến tính và là một cơ sở của không gian $\\mathbb{R}^3$.\n2. Tìm tọa độ của vector $x$ đối với cơ sở $S$, ký hiệu $[x]_S$.',
    subject: 'algebra',
    subjectLabel: 'Đại số Tuyến tính & Ma trận',
    difficulty: 'standard',
    difficultyLabel: 'Căn bản (5 - 6.5đ)',
    tags: ['#KhongGianVector', '#HeCoSo', '#DocLapTuyenTinh', '#ToaDoVector'],
    author: AUTH_USER_0809,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    views: 310,
    upvotes: 19,
    upvotedBy: ['user-phuc'],
    status: 'solved',
    isAccepted: true,
    acceptedAnswerId: 'ans-10-1',
    answers: [
      {
        id: 'ans-10-1',
        content: '**1. Chứng minh $S$ là cơ sở:**\nLập ma trận các vector cột $A = (u_1 | u_2 | u_3) = \\begin{pmatrix} 1 & 2 & 1 \\\\ 2 & 5 & 1 \\\\ 1 & 3 & 2 \\end{pmatrix}$.\nTính định thức: $\\det(A) = 1(10-3) - 2(4-1) + 1(6-5) = 7 - 6 + 1 = 2 \\ne 0$.\nVì $\\det(A) \\ne 0$ nên hệ $S$ gồm 3 vector độc lập tuyến tính trong không gian 3 chiều $\\mathbb{R}^3$, suy ra $S$ là **một cơ sở của $\\mathbb{R}^3$**.\n\n**2. Tìm tọa độ $[x]_S = (c_1, c_2, c_3)^T$:**\nGiải hệ phương trình $c_1 u_1 + c_2 u_2 + c_3 u_3 = x$:\n$$\\begin{cases} c_1 + 2c_2 + c_3 = 3 \\\\ 2c_1 + 5c_2 + c_3 = 7 \\\\ c_1 + 3c_2 + 2c_3 = 4 \\end{cases} \\implies \\begin{cases} c_1 = 1 \\\\ c_2 = 1 \\\\ c_3 = 0 \\end{cases}$$\nVậy tọa độ của vector $x$ đối với cơ sở $S$ là: $[x]_S = (1, 1, 0)^T$.',
        author: AUTH_ADMIN,
        upvotes: 28,
        upvotedBy: ['user-phuc-0809'],
        isAccepted: true,
        instructorVerified: true,
        comments: [],
        createdAt: new Date(Date.now() - 3600000 * 44).toISOString()
      }
    ]
  }
];

export const UEH_LEADERBOARD_USERS = [
  AUTH_ADMIN,
  AUTH_USER_519,
  AUTH_USER_0809
];

class CommunityService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    const existing = safeLocalStorage.getItem(STORAGE_KEY);
    if (!existing) {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(UEH_CURRICULUM_POSTS));
    }
  }

  getPostsFromStorage() {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : UEH_CURRICULUM_POSTS;
    } catch {
      return UEH_CURRICULUM_POSTS;
    }
  }

  savePostsToStorage(posts) {
    try {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Lỗi khi lưu trữ bài viết community:', error);
    }
  }

  upsertCachedPost(post) {
    const normalized = normalizePost(post);
    const posts = this.getPostsFromStorage();
    const index = posts.findIndex((item) => item.id === normalized.id);
    if (index >= 0) posts[index] = normalized;
    else posts.unshift(normalized);
    this.savePostsToStorage(posts);
    return normalized;
  }

  removeCachedPost(postId) {
    this.savePostsToStorage(this.getPostsFromStorage().filter((post) => post.id !== postId));
  }

  async getPosts(options = {}) {
    if (options.status === 'saved') return this.getLocalPosts(options);

    const params = new URLSearchParams();
    const search = options.search || options.query || '';
    for (const [key, value] of Object.entries({
      subject: options.subject,
      difficulty: options.difficulty,
      status: options.status,
      sort: options.sort,
      tag: options.tag,
      search,
      page: options.page,
      limit: options.limit
    })) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }

    try {
      const data = await readApiJson(await apiFetch(`/api/community/posts?${params.toString()}`));
      const hiddenIds = new Set(this.getHiddenPostIds());
      const posts = (data.posts || [])
        .map(normalizePost)
        .filter((post) => !hiddenIds.has(post.id));

      const stored = this.getPostsFromStorage();
      const receivedIds = new Set(posts.map((post) => post.id));
      this.savePostsToStorage([
        ...posts,
        ...stored.filter((post) => !receivedIds.has(post.id))
      ]);

      return {
        posts,
        total: Number(data.total) || 0,
        totalPages: Number(data.totalPages) || 1,
        currentPage: Number(data.currentPage) || 1
      };
    } catch (error) {
      console.warn('Không thể tải diễn đàn từ backend, dùng bộ nhớ cục bộ:', error.message);
      return this.getLocalPosts(options);
    }
  }

  getLocalPosts(options = {}) {
    const {
      subject = 'all',
      difficulty = 'all',
      status = 'all',
      sort = 'newest',
      query = '',
      tag = '',
      search = '',
      page = 1,
      limit = 6,
      savedIds = []
    } = options;

    let posts = this.getPostsFromStorage();
    const hiddenIds = this.getHiddenPostIds();
    posts = posts.filter(p => !hiddenIds.includes(p.id));

    if (subject && subject !== 'all') {
      posts = posts.filter(p => p.subject === subject);
    }
    if (difficulty && difficulty !== 'all') {
      posts = posts.filter(p => p.difficulty === difficulty);
    }
    if (status === 'solved') {
      posts = posts.filter(p => p.isAccepted || p.status === 'solved');
    } else if (status === 'unsolved') {
      posts = posts.filter(p => !p.isAccepted && p.status !== 'solved');
    } else if (status === 'saved') {
      posts = posts.filter(p => savedIds.includes(p.id));
    }
    if (tag) {
      const clean = tag.replace('#', '').toLowerCase();
      posts = posts.filter(p =>
        (p.tags || []).some(t => t.replace('#', '').toLowerCase().includes(clean))
      );
    }
    const term = search || query;
    if (term && term.trim()) {
      posts = posts.filter(p => matchPost(p, term));
    }

    if (sort === 'popular') {
      posts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sort === 'mostViewed') {
      posts.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === 'unanswered') {
      posts = posts.filter(p => (p.answers || []).length === 0);
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = posts.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = posts.slice(startIndex, startIndex + limit).map(normalizePost);

    return {
      posts: paginated,
      total,
      totalPages,
      currentPage: page
    };
  }

  async getPostById(id) {
    // Try backend API first
    try {
      const response = await apiFetch(`/api/community/posts/${id}`);
      const data = await readApiJson(response);
      if (data && data.post) {
        const normalized = normalizePost(data.post);
        try {
          const posts = this.getPostsFromStorage();
          const idx = posts.findIndex(p => p.id === normalized.id);
          if (idx !== -1) {
            posts[idx] = normalized;
          } else {
            posts.unshift(normalized);
          }
          this.savePostsToStorage(posts);
        } catch {
          // Ignore
        }
        return normalized;
      }
    } catch {
      // Backend unavailable, fall through to storage
    }

    // Fallback to storage
    const posts = this.getPostsFromStorage();
    const cleanId = String(id || '').trim().toLowerCase();
    const postIndex = posts.findIndex(p =>
      String(p.id).toLowerCase() === cleanId ||
      String(p.slug || '').toLowerCase() === cleanId
    );

    if (postIndex !== -1) {
      posts[postIndex].views = (posts[postIndex].views || 0) + 1;
      this.savePostsToStorage(posts);
      return normalizePost(posts[postIndex]);
    }

    // Check predefined curriculum posts
    const curPost = UEH_CURRICULUM_POSTS.find(p =>
      String(p.id).toLowerCase() === cleanId ||
      String(p.slug || '').toLowerCase() === cleanId
    );

    if (curPost) {
      return normalizePost(curPost);
    }

    throw new Error('Không tìm thấy bài viết');
  }

  async createPost(postData) {
    const review = reviewCommunityPost(postData);
    if (!review.passes) {
      throw new Error(review.violations.join(' '));
    }

    const payload = await readApiJson(await apiFetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: postData.type || 'question',
        title: postData.title,
        content: postData.content,
        subject: postData.subject || 'calc2',
        difficulty: postData.difficulty || 'standard',
        tags: postData.tags || [],
        image: postData.image || null,
        altText: postData.altText || null
      })
    }));
    const newPost = normalizePost(payload.post);
    const posts = this.getPostsFromStorage();
    posts.unshift(newPost);
    this.savePostsToStorage(posts);
    return newPost;
  }

  async updatePost(postId, updateData) {
    const data = await readApiJson(await apiFetch(`/api/community/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    }));
    return this.upsertCachedPost(data.post);
  }

  async deletePost(postId) {
    await readApiJson(await apiFetch(`/api/community/posts/${postId}`, {
      method: 'DELETE'
    }));
    this.removeCachedPost(postId);
    return true;
  }

  toggleUpvote(postId, userId = 'current-user') {
    return this.votePost(postId, userId, 'up');
  }

  async addAnswer(postId, answerData) {
    const content = typeof answerData === 'string' ? answerData : answerData?.content;
    if (!content || !content.trim()) throw new Error('Nội dung không được để trống');

    const payload = await readApiJson(await apiFetch(`/api/community/posts/${postId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim() })
    }));
    const post = this.upsertCachedPost(payload.post);
    return {
      answer: payload.answer,
      post,
      isFirstAnswer: Boolean(payload.answer?.isFirstSolver)
    };
  }

  async editAnswer(postId, answerId, updatedContent) {
    const payload = await readApiJson(await apiFetch(`/api/community/posts/${postId}/answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: updatedContent })
    }));
    return { answer: payload.answer, post: this.upsertCachedPost(payload.post) };
  }

  async deleteAnswer(postId, answerId) {
    const payload = await readApiJson(await apiFetch(`/api/community/posts/${postId}/answers/${answerId}`, {
      method: 'DELETE'
    }));
    return { post: this.upsertCachedPost(payload.post) };
  }

  async voteAnswer(postId, answerId, userId = 'guest', voteType = 'up') {
    void userId;
    const payload = await readApiJson(await apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/vote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      }
    ));
    if (payload.post) this.upsertCachedPost(payload.post);
    return payload;
  }

  toggleUpvoteAnswer(postId, answerId, userId = 'guest') {
    return this.voteAnswer(postId, answerId, userId, 'up');
  }

  toggleDownvoteAnswer(postId, answerId, userId = 'guest') {
    return this.voteAnswer(postId, answerId, userId, 'down');
  }

  async acceptAnswer(postId, answerId, isInstructor = false) {
    void isInstructor;
    const payload = await readApiJson(await apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/accept`,
      { method: 'POST' }
    ));
    const post = this.upsertCachedPost(payload.post);
    const answer = (post.answers || []).find((item) => item.id === answerId);
    return {
      post,
      isAccepted: Boolean(answer?.isAccepted),
      answerAuthorId: answer?.author?.id || null
    };
  }

  toggleAcceptAnswer(postId, answerId, isInstructor = false) {
    return this.acceptAnswer(postId, answerId, isInstructor);
  }

  async addCommentToAnswer(postId, answerId, commentData) {
    const data = await readApiJson(await apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentData.content })
      }
    ));
    if (data.post) this.upsertCachedPost(data.post);
    return { comment: data.comment, post: data.post ? normalizePost(data.post) : undefined };
  }

  async editComment(postId, answerId, commentId, updatedContent) {
    const data = await readApiJson(await apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/comments/${commentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
      }
    ));
    if (data.post) this.upsertCachedPost(data.post);
    return { comment: data.comment, post: data.post ? normalizePost(data.post) : undefined };
  }

  async deleteComment(postId, answerId, commentId) {
    const data = await readApiJson(await apiFetch(
      `/api/community/posts/${postId}/answers/${answerId}/comments/${commentId}`,
      { method: 'DELETE' }
    ));
    if (data.post) this.upsertCachedPost(data.post);
    return true;
  }

  getCommunityStats() {
    const posts = this.getPostsFromStorage();
    const totalPosts = posts.length;
    const solvedCount = posts.filter(p => isPostSolved(p)).length;
    const openCount = totalPosts - solvedCount;
    const totalAnswers = posts.reduce((sum, p) => sum + (p.answers || []).length, 0);
    const solvedPercentage = totalPosts > 0 ? Math.round((solvedCount / totalPosts) * 100) : 0;

    return {
      totalPosts,
      solvedCount,
      openCount,
      totalAnswers,
      solvedPercentage
    };
  }

  getStats() {
    return this.getCommunityStats();
  }

  async votePost(postId, userId = 'guest', voteType = 'up') {
    void userId;
    const payload = await readApiJson(await apiFetch(`/api/community/posts/${postId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType })
    }));
    if (payload.post) this.upsertCachedPost(payload.post);
    return payload;
  }

  toggleUpvotePost(postId, userId = 'guest') {
    return this.votePost(postId, userId, 'up');
  }

  toggleDownvotePost(postId, userId = 'guest') {
    return this.votePost(postId, userId, 'down');
  }

  getTrendingTags() {
    const posts = this.getPostsFromStorage();
    const tagCountMap = {};

    posts.forEach(p => {
      (p.tags || []).forEach(t => {
        const clean = t.replace('#', '');
        tagCountMap[clean] = (tagCountMap[clean] || 0) + 1;
      });
    });

    return Object.entries(tagCountMap)
      .map(([name, count]) => ({ tag: `#${name}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }

  getLeaderboard() {
    return UEH_LEADERBOARD_USERS.map(applyAdminIdentity);
  }

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
    let nextSaved;
    let isSaved;

    if (saved.includes(postId)) {
      nextSaved = saved.filter(id => id !== postId);
      isSaved = false;
    } else {
      nextSaved = [...saved, postId];
      isSaved = true;
    }

    try {
      safeLocalStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(nextSaved));
    } catch (e) {
      console.warn('Lỗi khi lưu bài viết:', e);
    }

    return { savedPostIds: nextSaved, isSaved };
  }

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

  reportPost(reportData) {
    try {
      const existing = safeLocalStorage.getItem(REPORTS_KEY);
      const reports = existing ? JSON.parse(existing) : [];
      reports.push({
        id: `rep-${Date.now()}`,
        ...reportData,
        createdAt: new Date().toISOString()
      });
      safeLocalStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (err) {
      console.warn('Lỗi khi ghi nhận báo cáo:', err);
    }
    return true;
  }

  reportContent(reportData) {
    return this.reportPost(reportData);
  }

  getUserProfile(userId) {
    const posts = this.getPostsFromStorage();
    const cleanId = String(userId || '').trim().toLowerCase();

    // Check authentic accounts first
    const knownUsers = [AUTH_ADMIN, AUTH_USER_519, AUTH_USER_0809];
    let matchedUser = knownUsers.find(u =>
      String(u.id).toLowerCase() === cleanId ||
      String(u.email).toLowerCase() === cleanId ||
      (u.name && String(u.name).toLowerCase() === cleanId)
    );

    // Calculate real stats across all posts in community
    const userPosts = posts.filter(p =>
      String(p.author?.id).toLowerCase() === cleanId ||
      String(p.author?.name).toLowerCase() === cleanId ||
      (matchedUser && String(p.author?.id) === String(matchedUser.id))
    );

    const userAnswers = [];
    let upvotesReceived = userPosts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    let solvedCount = 0;

    posts.forEach(p => {
      (p.answers || []).forEach(a => {
        const isUserAns = String(a.author?.id).toLowerCase() === cleanId ||
          String(a.author?.name).toLowerCase() === cleanId ||
          (matchedUser && String(a.author?.id) === String(matchedUser.id));
        if (isUserAns) {
          userAnswers.push(a);
          upvotesReceived += (a.upvotes || 0);
          if (a.isAccepted || a.instructorVerified) solvedCount++;
        }
      });
    });

    if (!matchedUser) {
      if (userPosts.length > 0 && userPosts[0].author) {
        matchedUser = { ...userPosts[0].author };
      } else if (userAnswers.length > 0 && userAnswers[0].author) {
        matchedUser = { ...userAnswers[0].author };
      } else if (!userId || cleanId === 'user-phuc' || cleanId === 'user-phuc-admin' || cleanId === 'me') {
        matchedUser = {
          id: 'user-phuc',
          name: 'Lữ Võ Hoàng Phúc',
          cohort: 'K50 UEH · Quản trị viên',
          avatar: '',
          points: 9999,
          isAdmin: true,
          isInstructor: true
        };
      } else {
        matchedUser = {
          id: userId,
          name: userId.startsWith('user-') ? `Thành viên UEH #${userId.slice(5, 9)}` : userId,
          cohort: 'Thành viên UEH',
          avatar: null,
          points: 0,
          isAdmin: false,
          isInstructor: false
        };
      }
    }

    const totalCalculatedPoints = matchedUser.points || (userPosts.length * 5 + userAnswers.length * 10 + solvedCount * 25 + upvotesReceived * 10);

    const isUserAdmin = Boolean(matchedUser.isAdmin || cleanId === 'user-phuc' || cleanId === 'user-phuc-admin');

    return applyAdminIdentity({
      ...matchedUser,
      postsCount: userPosts.length,
      answersCount: userAnswers.length,
      solvedCount: solvedCount,
      upvotesReceived: upvotesReceived,
      points: isUserAdmin ? 9999 : (matchedUser.points || totalCalculatedPoints || 0)
    });
  }

  getPostsByUser(userId) {
    const posts = this.getPostsFromStorage();
    const cleanId = String(userId || '').trim().toLowerCase();
    return posts.filter(p =>
      String(p.author?.id).toLowerCase() === cleanId ||
      String(p.author?.name).toLowerCase() === cleanId ||
      (cleanId === 'user-phuc' && (p.author?.id === 'user-phuc' || p.author?.id === 'user-phuc-admin'))
    ).map(normalizePost);
  }
}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'Gần đây';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export const communityService = new CommunityService();
