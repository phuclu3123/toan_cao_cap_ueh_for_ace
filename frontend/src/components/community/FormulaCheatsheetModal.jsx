import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, X, Copy, Check, Search, Sparkles, PlusCircle, Layers, Grid } from 'lucide-react';
import MathRenderer from '../MathRenderer';
import '../../assets/styles/community.css';

/**
 * 24 Greek Letters (Lowercase) for Symbol Explorer Dialog
 */
const GREEK_LOWERCASE = [
  { name: 'Alpha', code: '\\alpha', display: '$\\alpha$' },
  { name: 'Beta', code: '\\beta', display: '$\\beta$' },
  { name: 'Gamma', code: '\\gamma', display: '$\\gamma$' },
  { name: 'Delta', code: '\\delta', display: '$\\delta$' },
  { name: 'Epsilon', code: '\\varepsilon', display: '$\\varepsilon$' },
  { name: 'Zeta', code: '\\zeta', display: '$\\zeta$' },
  { name: 'Eta', code: '\\eta', display: '$\\eta$' },
  { name: 'Theta', code: '\\theta', display: '$\\theta$' },
  { name: 'Iota', code: '\\iota', display: '$\\iota$' },
  { name: 'Kappa', code: '\\kappa', display: '$\\kappa$' },
  { name: 'Lambda', code: '\\lambda', display: '$\\lambda$' },
  { name: 'Mu', code: '\\mu', display: '$\\mu$' },
  { name: 'Nu', code: '\\nu', display: '$\\nu$' },
  { name: 'Xi', code: '\\xi', display: '$\\xi$' },
  { name: 'Pi', code: '\\pi', display: '$\\pi$' },
  { name: 'Rho', code: '\\rho', display: '$\\rho$' },
  { name: 'Sigma', code: '\\sigma', display: '$\\sigma$' },
  { name: 'Tau', code: '\\tau', display: '$\\tau$' },
  { name: 'Upsilon', code: '\\upsilon', display: '$\\upsilon$' },
  { name: 'Phi', code: '\\phi', display: '$\\phi$' },
  { name: 'Chi', code: '\\chi', display: '$\\chi$' },
  { name: 'Psi', code: '\\psi', display: '$\\psi$' },
  { name: 'Omega', code: '\\omega', display: '$\\omega$' }
];

/**
 * Greek Uppercase & Special Mathematical Operators
 */
const GREEK_UPPERCASE_OPERATORS = [
  { name: 'Gamma (Hoa)', code: '\\Gamma', display: '$\\Gamma$' },
  { name: 'Delta (Hoa)', code: '\\Delta', display: '$\\Delta$' },
  { name: 'Theta (Hoa)', code: '\\Theta', display: '$\\Theta$' },
  { name: 'Lambda (Hoa)', code: '\\Lambda', display: '$\\Lambda$' },
  { name: 'Xi (Hoa)', code: '\\Xi', display: '$\\Xi$' },
  { name: 'Pi (Hoa)', code: '\\Pi', display: '$\\Pi$' },
  { name: 'Sigma (Hoa)', code: '\\Sigma', display: '$\\Sigma$' },
  { name: 'Upsilon (Hoa)', code: '\\Upsilon', display: '$\\Upsilon$' },
  { name: 'Phi (Hoa)', code: '\\Phi', display: '$\\Phi$' },
  { name: 'Psi (Hoa)', code: '\\Psi', display: '$\\Psi$' },
  { name: 'Omega (Hoa)', code: '\\Omega', display: '$\\Omega$' },
  { name: 'Nabla / Gradient', code: '\\nabla', display: '$\\nabla$' },
  { name: 'Đạo hàm riêng', code: '\\partial', display: '$\\partial$' },
  { name: 'Vô cực', code: '\\infty', display: '$\\infty$' },
  { name: 'Tích phân', code: '\\int', display: '$\\int$' },
  { name: 'Tổng Sigma', code: '\\sum', display: '$\\sum$' }
];

/**
 * Standardized KaTeX Mathematical Building Blocks for Higher & Applied Mathematics UEH.
 * Fully decoupled single-concept cards + Interactive symbol chip sets.
 */
const CHEATSHEET_CATEGORIES = [
  {
    id: 'relations',
    category: '1. Dấu quan hệ & Phép so sánh',
    badge: 'So sánh & Quan hệ',
    items: [
      { name: 'Lớn hơn', code: 'a > b', display: '$$a > b$$', desc: 'Dấu lớn hơn' },
      { name: 'Lớn hơn hoặc bằng', code: 'a \\ge b', display: '$$a \\ge b$$', desc: 'Dấu lớn hơn hoặc bằng \\ge' },
      { name: 'Nhỏ hơn', code: 'a < b', display: '$$a < b$$', desc: 'Dấu nhỏ hơn' },
      { name: 'Nhỏ hơn hoặc bằng', code: 'a \\le b', display: '$$a \\le b$$', desc: 'Dấu nhỏ hơn hoặc bằng \\le' },
      { name: 'Bằng nhau', code: 'a = b', display: '$$a = b$$', desc: 'Dấu bằng chuẩn' },
      { name: 'Khác nhau', code: 'a \\neq b', display: '$$a \\neq b$$', desc: 'Dấu khác \\neq' },
      { name: 'Xấp xỉ / Gần bằng', code: 'a \\approx b', display: '$$a \\approx b$$', desc: 'Dấu xấp xỉ \\approx' },
      { name: 'Đồng dư / Tương đương', code: 'a \\equiv b', display: '$$a \\equiv b$$', desc: 'Dấu ba gạch \\equiv' },
      { name: 'Tương quan / Cùng bậc', code: 'a \\sim b', display: '$$a \\sim b$$', desc: 'Dấu sóng tương đương \\sim' },
      { name: 'Rất nhỏ hơn', code: 'a \\ll b', display: '$$a \\ll b$$', desc: 'Dấu rất nhỏ hơn \\ll' },
      { name: 'Rất lớn hơn', code: 'a \\gg b', display: '$$a \\gg b$$', desc: 'Dấu rất lớn hơn \\gg' }
    ]
  },
  {
    id: 'logic_sets',
    category: '2. Logic Mệnh đề & Lý thuyết Tập hợp',
    badge: 'Logic & Tập hợp',
    items: [
      { name: 'Với mọi', code: '\\forall x', display: '$$\\forall x$$', desc: 'Lượng từ với mọi \\forall' },
      { name: 'Tồn tại', code: '\\exists x', display: '$$\\exists x$$', desc: 'Lượng từ tồn tại \\exists' },
      { name: 'Không tồn tại', code: '\\nexists x', display: '$$\\nexists x$$', desc: 'Lượng từ không tồn tại \\nexists' },
      { name: 'Phủ định với mọi (Không với mọi)', code: '\\neg(\\forall x)', display: '$$\\neg(\\forall x)$$', desc: 'Phủ định lượng từ với mọi' },
      { name: 'Thuộc tập hợp', code: 'x \\in A', display: '$$x \\in A$$', desc: 'Phần tử thuộc tập hợp \\in' },
      { name: 'Không thuộc tập hợp', code: 'x \\notin A', display: '$$x \\notin A$$', desc: 'Phần tử không thuộc \\notin' },
      { name: 'Tập con (Bao hàm)', code: 'A \\subset B', display: '$$A \\subset B$$', desc: 'A là tập con của B \\subset' },
      { name: 'Hợp hai tập hợp', code: 'A \\cup B', display: '$$A \\cup B$$', desc: 'Phép hợp \\cup' },
      { name: 'Giao hai tập hợp', code: 'A \\cap B', display: '$$A \\cap B$$', desc: 'Phép giao \\cap' },
      { name: 'Hiệu hai tập hợp', code: 'A \\setminus B', display: '$$A \\setminus B$$', desc: 'Phép trừ tập hợp \\setminus' },
      { name: 'Mệnh đề kéo theo (Suy ra)', code: 'A \\implies B', display: '$$A \\implies B$$', desc: 'Dấu suy ra \\implies' },
      { name: 'Mệnh đề tương đương', code: 'A \\iff B', display: '$$A \\iff B$$', desc: 'Dấu khi và chỉ khi \\iff' },
      { name: 'Tập số thực', code: '\\mathbb{R}', display: '$$\\mathbb{R}$$', desc: 'Không gian số thực \\mathbb{R}' },
      { name: 'Tập hợp rỗng', code: '\\emptyset', display: '$$\\emptyset$$', desc: 'Ký hiệu tập rỗng \\emptyset' },
      { name: 'Dương vô cực & Âm vô cực', code: '+\\infty, \\; -\\infty', display: '$$+\\infty, \\; -\\infty$$', desc: 'Ký hiệu vô cùng \\infty' }
    ]
  },
  {
    id: 'greek',
    category: '3. Bảng Ký hiệu Hy Lạp & Toán tử',
    badge: 'Ký hiệu Hy Lạp',
    items: [
      {
        name: 'Bảng Hy Lạp thường (Bấm chọn từng ký hiệu)',
        isChipGrid: true,
        desc: 'Nhấp trực tiếp vào ký hiệu bất kỳ để chép ngay ký hiệu đó',
        chips: [
          { name: 'alpha', code: '\\alpha', label: 'α' },
          { name: 'beta', code: '\\beta', label: 'β' },
          { name: 'gamma', code: '\\gamma', label: 'γ' },
          { name: 'delta', code: '\\delta', label: 'δ' },
          { name: 'epsilon', code: '\\varepsilon', label: 'ε' },
          { name: 'lambda', code: '\\lambda', label: 'λ' },
          { name: 'mu', code: '\\mu', label: 'μ' },
          { name: 'pi', code: '\\pi', label: 'π' },
          { name: 'rho', code: '\\rho', label: 'ρ' },
          { name: 'sigma', code: '\\sigma', label: 'σ' },
          { name: 'theta', code: '\\theta', label: 'θ' },
          { name: 'omega', code: '\\omega', label: 'ω' },
          { name: 'phi', code: '\\phi', label: 'φ' },
          { name: 'psi', code: '\\psi', label: 'ψ' },
          { name: 'tau', code: '\\tau', label: 'τ' }
        ],
        code: '\\alpha, \\beta, \\lambda, \\mu, \\sigma, \\theta, \\omega',
        display: '$$\\alpha, \\; \\beta, \\; \\lambda, \\; \\mu, \\; \\sigma, \\; \\theta, \\; \\omega$$'
      },
      {
        name: 'Bảng Hy Lạp chữ hoa & Gradient',
        isChipGrid: true,
        desc: 'Nhấp trực tiếp vào ký hiệu để sao chép 1 chạm',
        chips: [
          { name: 'Delta', code: '\\Delta', label: 'Δ' },
          { name: 'Gradient/Nabla', code: '\\nabla', label: '∇' },
          { name: 'Sigma', code: '\\Sigma', label: 'Σ' },
          { name: 'Omega', code: '\\Omega', label: 'Ω' },
          { name: 'Phi', code: '\\Phi', label: 'Φ' },
          { name: 'Psi', code: '\\Psi', label: 'Ψ' },
          { name: 'Lambda hoa', code: '\\Lambda', label: 'Λ' },
          { name: 'Gamma hoa', code: '\\Gamma', label: 'Γ' },
          { name: 'Theta hoa', code: '\\Theta', label: 'Θ' }
        ],
        code: '\\Delta, \\nabla, \\Sigma, \\Omega, \\Phi, \\Psi',
        display: '$$\\Delta, \\; \\nabla, \\; \\Sigma, \\; \\Omega, \\; \\Phi, \\; \\Psi$$'
      },
      { name: 'Alpha', code: '\\alpha', display: '$$\\alpha$$', desc: 'Chữ cái Hy Lạp Alpha' },
      { name: 'Beta', code: '\\beta', display: '$$\\beta$$', desc: 'Chữ cái Hy Lạp Beta' },
      { name: 'Gamma', code: '\\gamma', display: '$$\\gamma$$', desc: 'Chữ cái Hy Lạp Gamma' },
      { name: 'Delta', code: '\\delta', display: '$$\\delta$$', desc: 'Chữ cái Hy Lạp Delta' },
      { name: 'Nhân tử Lagrange (Lambda)', code: '\\lambda', display: '$$\\lambda$$', desc: 'Nhân tử Lagrange \\lambda' },
      { name: 'Mu (Kỳ vọng / Giá trị trung bình)', code: '\\mu', display: '$$\\mu$$', desc: 'Ký hiệu Mu' },
      { name: 'Sigma (Độ lệch chuẩn)', code: '\\sigma', display: '$$\\sigma$$', desc: 'Ký hiệu Sigma' },
      { name: 'Theta (Góc / Tham số)', code: '\\theta', display: '$$\\theta$$', desc: 'Ký hiệu Theta' },
      { name: 'Omega', code: '\\omega', display: '$$\\omega$$', desc: 'Ký hiệu Omega' },
      { name: 'Vector Gradient (Nabla)', code: '\\nabla', display: '$$\\nabla$$', desc: 'Toán tử Nabla / Gradient' },
      { name: 'Delta lớn (Biệt thức / Độ biến thiên)', code: '\\Delta', display: '$$\\Delta$$', desc: 'Ký hiệu Delta hoa' },
      { name: 'Sigma lớn', code: '\\Sigma', display: '$$\\Sigma$$', desc: 'Ký hiệu Sigma hoa' },
      { name: 'Omega lớn', code: '\\Omega', display: '$$\\Omega$$', desc: 'Ký hiệu Omega hoa' }
    ]
  },
  {
    id: 'calculus',
    category: '4. Giải tích & Vi tích phân (Calculus)',
    badge: 'Giải tích',
    items: [
      { name: 'Lũy thừa bậc n', code: 'x^n', display: '$$x^n$$', desc: 'Số mũ tổng quát' },
      { name: 'Chỉ số dưới', code: 'x_i', display: '$$x_i$$', desc: 'Chỉ số phần tử' },
      { name: 'Lũy thừa & Chỉ số kết hợp', code: 'x_i^n', display: '$$x_i^n$$', desc: 'Chỉ số trên và dưới' },
      { name: 'Phân số chuẩn (Inline)', code: '\\frac{a}{b}', display: '$$\\frac{a}{b}$$', desc: 'Phân số \\frac{tử}{mẫu}' },
      { name: 'Phân số lớn (Display)', code: '\\dfrac{a}{b}', display: '$$\\dfrac{a}{b}$$', desc: 'Phân số kích thước hiển thị lớn' },
      { name: 'Căn bậc hai', code: '\\sqrt{x}', display: '$$\\sqrt{x}$$', desc: 'Căn bậc 2' },
      { name: 'Căn bậc n tổng quát', code: '\\sqrt[n]{x}', display: '$$\\sqrt[n]{x}$$', desc: 'Căn thức bậc n' },
      { name: 'Dấu cộng trừ', code: 'x \\pm y', display: '$$x \\pm y$$', desc: 'Dấu cộng hoặc trừ \\pm' },
      { name: 'Dấu trừ cộng', code: 'x \\mp y', display: '$$x \\mp y$$', desc: 'Dấu trừ hoặc cộng \\mp' },
      { name: 'Giới hạn tại điểm (Limit)', code: '\\lim_{x \\to x_0} f(x)', display: '$$\\lim_{x \\to x_0} f(x)$$', desc: 'Giới hạn khi x tiến tới x0' },
      { name: 'Giới hạn tại vô cực', code: '\\lim_{x \\to +\\infty} f(x)', display: '$$\\lim_{x \\to +\\infty} f(x)$$', desc: 'Giới hạn khi x tiến tới dương vô cực' },
      { name: 'Đạo hàm cấp 1 hàm 1 biến', code: 'f\'(x) = \\frac{df}{dx}', display: '$$f\'(x) = \\frac{df}{dx}$$', desc: 'Đạo hàm bậc 1' },
      { name: 'Đạo hàm cấp 2 hàm 1 biến', code: 'f\'\'(x) = \\frac{d^2f}{dx^2}', display: '$$f\'\'(x) = \\frac{d^2f}{dx^2}$$', desc: 'Đạo hàm bậc 2' },
      { name: 'Đạo hàm riêng cấp 1 theo x', code: '\\frac{\\partial f}{\\partial x}', display: '$$\\frac{\\partial f}{\\partial x}$$', desc: 'Đạo hàm riêng theo biến x' },
      { name: 'Đạo hàm riêng cấp 1 theo y', code: '\\frac{\\partial f}{\\partial y}', display: '$$\\frac{\\partial f}{\\partial y}$$', desc: 'Đạo hàm riêng theo biến y' },
      { name: 'Đạo hàm riêng cấp 2 thuần f\'\'xx', code: '\\frac{\\partial^2 f}{\\partial x^2}', display: '$$\\frac{\\partial^2 f}{\\partial x^2}$$', desc: 'Đạo hàm riêng cấp 2 thuần theo x' },
      { name: 'Đạo hàm riêng cấp 2 thuần f\'\'yy', code: '\\frac{\\partial^2 f}{\\partial y^2}', display: '$$\\frac{\\partial^2 f}{\\partial y^2}$$', desc: 'Đạo hàm riêng cấp 2 thuần theo y' },
      { name: 'Đạo hàm riêng cấp 2 hỗn tạp f\'\'xy', code: '\\frac{\\partial^2 f}{\\partial x \\partial y}', display: '$$\\frac{\\partial^2 f}{\\partial x \\partial y}$$', desc: 'Đạo hàm riêng cấp 2 hỗn tạp xy' },
      { name: 'Vector Gradient', code: '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)', display: '$$\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)$$', desc: 'Vector Gradient hàm 2 biến' },
      { name: 'Vi phân toàn phần cấp 1', code: 'df = \\frac{\\partial f}{\\partial x} dx + \\frac{\\partial f}{\\partial y} dy', display: '$$df = \\frac{\\partial f}{\\partial x} dx + \\frac{\\partial f}{\\partial y} dy$$', desc: 'Vi phân toàn phần cấp 1' },
      { name: 'Vi phân toàn phần cấp 2', code: 'd^2f = f\'\'_{xx} dx^2 + 2f\'\'_{xy} dxdy + f\'\'_{yy} dy^2', display: '$$d^2f = f\'\'_{xx} dx^2 + 2f\'\'_{xy} dxdy + f\'\'_{yy} dy^2$$', desc: 'Vi phân toàn phần cấp 2' },
      { name: 'Tích phân bất định (Nguyên hàm)', code: '\\int f(x)\\,dx', display: '$$\\int f(x)\\,dx$$', desc: 'Tích phân nguyên hàm' },
      { name: 'Tích phân xác định', code: '\\int_{a}^{b} f(x)\\,dx', display: '$$\\int_{a}^{b} f(x)\\,dx$$', desc: 'Tích phân từ a đến b' },
      { name: 'Tích phân suy rộng loại 1', code: '\\int_{a}^{+\\infty} f(x)\\,dx', display: '$$\\int_{a}^{+\\infty} f(x)\\,dx$$', desc: 'Tích phân đến dương vô cùng' },
      { name: 'Tích phân kép (2 lớp)', code: '\\iint_{D} f(x, y)\\,dxdy', display: '$$\\iint_{D} f(x, y)\\,dxdy$$', desc: 'Tích phân 2 lớp trên miền D' },
      { name: 'Tổng Sigma', code: '\\sum_{i=1}^{n} x_i', display: '$$\\sum_{i=1}^{n} x_i$$', desc: 'Tổng chuỗi từ 1 đến n' },
      { name: 'Tổng chuỗi số vô hạn', code: '\\sum_{n=1}^{\\infty} a_n', display: '$$\\sum_{n=1}^{\\infty} a_n$$', desc: 'Chuỗi số vô hạn' },
      { name: 'Tích Pi lớn', code: '\\prod_{i=1}^{n} a_i', display: '$$\\prod_{i=1}^{n} a_i$$', desc: 'Tích các phần tử' }
    ]
  },
  {
    id: 'algebra',
    category: '5. Đại số Tuyến tính & Ma trận (Linear Algebra)',
    badge: 'Đại số & Ma trận',
    items: [
      { name: 'Ma trận vuông 2x2', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', desc: 'Ma trận ngoặc tròn cấp 2' },
      { name: 'Ma trận vuông 3x3', code: '\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}', display: '$$\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}$$', desc: 'Ma trận vuông cấp 3' },
      { name: 'Ma trận ngoặc vuông', code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', display: '$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$', desc: 'Ma trận ngoặc vuông bmatrix' },
      { name: 'Vector cột 3 chiều', code: '\\begin{pmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{pmatrix}', display: '$$\\begin{pmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{pmatrix}$$', desc: 'Vector cột 3 phần tử' },
      { name: 'Định thức ma trận cấp 2 (Determinant)', code: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', display: '$$\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$$', desc: 'Định thức ma trận 2x2' },
      { name: 'Định thức ma trận cấp 3', code: '\\det(A) = \\begin{vmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{vmatrix}', display: '$$\\det(A) = \\begin{vmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{vmatrix}$$', desc: 'Định thức ma trận 3x3' },
      { name: 'Ma trận chuyển vị', code: 'A^T', display: '$$A^T$$', desc: 'Chuyển vị hàng thành cột' },
      { name: 'Ma trận nghịch đảo', code: 'A^{-1} = \\frac{1}{\\det(A)} P_A^T', display: '$$A^{-1} = \\frac{1}{\\det(A)} P_A^T$$', desc: 'Công thức ma trận nghịch đảo' },
      { name: 'Ma trận phụ hợp', code: 'P_A^T', display: '$$P_A^T$$', desc: 'Ma trận chuyển vị của các phần bù đại số' },
      { name: 'Hệ phương trình tuyến tính 2 ẩn', code: '\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}', display: '$$\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$$', desc: 'Hệ phương trình bậc nhất 2 ẩn' },
      { name: 'Hệ phương trình tuyến tính 3 ẩn', code: '\\begin{cases} a_1 x + b_1 y + c_1 z = d_1 \\\\ a_2 x + b_2 y + c_2 z = d_2 \\\\ a_3 x + b_3 y + c_3 z = d_3 \\end{cases}', display: '$$\\begin{cases} a_1 x + b_1 y + c_1 z = d_1 \\\\ a_2 x + b_2 y + c_2 z = d_2 \\\\ a_3 x + b_3 y + c_3 z = d_3 \\end{cases}$$', desc: 'Hệ phương trình 3 ẩn 3 phương trình' },
      { name: 'Phương trình đặc trưng (Trị riêng)', code: '\\det(A - \\lambda I) = 0', display: '$$\\det(A - \\lambda I) = 0$$', desc: 'Tìm giá trị riêng Lambda' },
      { name: 'Ma trận Hessian 2 biến', code: 'H = \\begin{pmatrix} f\'\'_{xx} & f\'\'_{xy} \\\\ f\'\'_{yx} & f\'\'_{yy} \\end{pmatrix}', display: '$$H = \\begin{pmatrix} f\'\'_{xx} & f\'\'_{xy} \\\\ f\'\'_{yx} & f\'\'_{yy} \\end{pmatrix}$$', desc: 'Ma trận đạo hàm riêng cấp 2 Hessian' },
      { name: 'Hạng của ma trận', code: '\\text{rank}(A) = r', display: '$$\\text{rank}(A) = r$$', desc: 'Hạng ma trận rank' }
    ]
  },
  {
    id: 'applied',
    category: '6. Mô hình Toán Kinh tế & Xác suất UEH',
    badge: 'Toán Kinh tế & Xác suất',
    items: [
      { name: 'Hàm sản xuất Cobb-Douglas', code: 'Q = A \\cdot K^\\alpha L^\\beta', display: '$$Q = A \\cdot K^\\alpha L^\\beta$$', desc: 'Sản lượng theo Vốn K và Lao động L' },
      { name: 'Hàm lợi ích tiêu dùng Cobb-Douglas', code: 'U(x, y) = x^\\alpha y^\\beta', display: '$$U(x, y) = x^\\alpha y^\\beta$$', desc: 'Lợi ích tiêu dùng 2 loại hàng hóa' },
      { name: 'Hệ số co giãn của cầu theo giá', code: '\\varepsilon_{Q/P} = \\frac{dQ}{dP} \\cdot \\frac{P}{Q}', display: '$$\\varepsilon_{Q/P} = \\frac{dQ}{dP} \\cdot \\frac{P}{Q}$$', desc: 'Độ co giãn của lượng cầu theo mức giá' },
      { name: 'Hệ số co giãn của doanh thu', code: '\\varepsilon_{TR/P} = 1 + \\varepsilon_{Q/P}', display: '$$\\varepsilon_{TR/P} = 1 + \\varepsilon_{Q/P}$$', desc: 'Độ co giãn của tổng doanh thu theo giá' },
      { name: 'Hàm nhân tử Lagrange', code: '\\mathcal{L}(x, y, \\lambda) = f(x, y) + \\lambda [b - g(x, y)]', display: '$$\\mathcal{L}(x, y, \\lambda) = f(x, y) + \\lambda [b - g(x, y)]$$', desc: 'Hàm mục tiêu bài toán cực trị có điều kiện' },
      { name: 'Hệ điều kiện điểm dừng Lagrange', code: '\\begin{cases} \\mathcal{L}\'_x = 0 \\\\ \\mathcal{L}\'_y = 0 \\\\ g(x, y) = b \\end{cases}', display: '$$\\begin{cases} \\mathcal{L}\'_x = 0 \\\\ \\mathcal{L}\'_y = 0 \\\\ g(x, y) = b \\end{cases}$$', desc: 'Hệ phương trình tìm điểm dừng' },
      { name: 'Mô hình cân bằng Leontief', code: 'X = (I - A)^{-1} D', display: '$$X = (I - A)^{-1} D$$', desc: 'Ma trận tổng sản lượng Input-Output' },
      { name: 'Ma trận Leontief', code: 'I - A', display: '$$I - A$$', desc: 'Ma trận đơn vị trừ ma trận kỹ thuật A' },
      { name: 'Xác suất có điều kiện', code: 'P(A|B) = \\frac{P(AB)}{P(B)}', display: '$$P(A|B) = \\frac{P(AB)}{P(B)}$$', desc: 'Công thức xác suất có điều kiện' },
      { name: 'Công thức xác suất toàn phần', code: 'P(A) = \\sum_{i=1}^{n} P(H_i) P(A|H_i)', display: '$$P(A) = \\sum_{i=1}^{n} P(H_i) P(A|H_i)$$', desc: 'Công thức xác suất toàn phần hệ đầy đủ' },
      { name: 'Công thức Bayes', code: 'P(H_k|A) = \\frac{P(H_k) P(A|H_k)}{\\sum_{i=1}^{n} P(H_i) P(A|H_i)}', display: '$$P(H_k|A) = \\frac{P(H_k) P(A|H_k)}{\\sum_{i=1}^{n} P(H_i) P(A|H_i)}$$', desc: 'Công thức xác suất hậu nghiệm Bayes' },
      { name: 'Tổ hợp chập k của n', code: 'C_n^k = \\frac{n!}{k!(n-k)!}', display: '$$C_n^k = \\frac{n!}{k!(n-k)!}$$', desc: 'Công thức số tổ hợp' },
      { name: 'Chỉnh hợp chập k của n', code: 'A_n^k = \\frac{n!}{(n-k)!}', display: '$$A_n^k = \\frac{n!}{(n-k)!}$$', desc: 'Công thức số chỉnh hợp' },
      { name: 'Kỳ vọng toán học', code: 'E(X) = \\sum_{i=1}^{n} x_i p_i', display: '$$E(X) = \\sum_{i=1}^{n} x_i p_i$$', desc: 'Giá trị trung bình biến ngẫu nhiên rời rạc' },
      { name: 'Phương sai', code: 'V(X) = E(X^2) - [E(X)]^2', display: '$$V(X) = E(X^2) - [E(X)]^2$$', desc: 'Độ phân tán của biến ngẫu nhiên' },
      { name: 'Độ lệch chuẩn', code: '\\sigma(X) = \\sqrt{V(X)}', display: '$$\\sigma(X) = \\sqrt{V(X)}$$', desc: 'Căn bậc hai của phương sai' }
    ]
  }
];

export default function FormulaCheatsheetModal({ isOpen, onClose, onSelectFormula }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState('');
  const [activeQuickToast, setActiveQuickToast] = useState({ id: null, message: '' });
  const [showGreekExplorer, setShowGreekExplorer] = useState(false);
  const [greekTab, setGreekTab] = useState('all');

  const filteredCategories = useMemo(() => {
    return CHEATSHEET_CATEGORIES.map(cat => {
      if (activeCategory !== 'all' && cat.id !== activeCategory) {
        return null;
      }
      if (!search.trim()) return cat;

      const q = search.toLowerCase();
      const filteredItems = cat.items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        (item.chips && item.chips.some(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
      );

      if (filteredItems.length === 0) return null;
      return { ...cat, items: filteredItems };
    }).filter(Boolean);
  }, [search, activeCategory]);

  if (!isOpen) return null;

  const handleCopy = (code, label = '') => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    const toastMsg = label ? `Đã chép: ${label}` : 'Đã chép công thức!';
    setActiveQuickToast({ id: code, message: toastMsg });
    setTimeout(() => {
      setCopiedCode('');
      setActiveQuickToast({ id: null, message: '' });
    }, 1800);
  };

  const handleInsert = (code) => {
    if (onSelectFormula) {
      onSelectFormula(code);
      onClose();
    } else {
      handleCopy(code);
    }
  };

  const totalCount = CHEATSHEET_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

  return createPortal(
    <div
      className="modal-backdrop-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheatsheet-title"
    >
      <div className="cheatsheet-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="cheatsheet-header">
          <div className="cheatsheet-title-wrap">
            <span className="q-eyebrow qa-modal-eyebrow">
              <BookOpen size={13} /> Sổ tay học thuật UEH
            </span>
            <h2 id="cheatsheet-title" className="qa-modal-title">Sổ tay công thức toán của Phúc</h2>
            <p className="qa-modal-sub">
              {totalCount} khối công thức chuẩn mực cho Toán Cao Cấp UEH của Hoàng Phúc — tra cứu, sao chép hoặc chèn thẳng vào bài.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Đóng sổ tay">
            <X size={17} />
          </button>
        </header>

        {/* Search + category tabs */}
        <div className="cheatsheet-controls-bar">
          <div className="qa-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Tìm công thức (alpha, partial, pmatrix, le, ge, forall, exists, Lagrange, Bayes)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm công thức"
              autoFocus
            />
            {search && (
              <button type="button" className="qa-search-clear" onClick={() => setSearch('')} aria-label="Xóa tìm kiếm">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="cheatsheet-category-tabs">
            <button
              type="button"
              className={`cs-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Tất cả <span className="q-num">{totalCount}</span>
            </button>
            {CHEATSHEET_CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat.id}
                className={`cs-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Formula grid */}
        <div className="cheatsheet-modal-body custom-scrollbar">
          {filteredCategories.length === 0 ? (
            <div className="cheatsheet-empty">
              <Sparkles size={28} />
              <p>Không tìm thấy công thức nào cho &ldquo;{search}&rdquo;</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setActiveCategory('all'); }}>
                Xem tất cả công thức
              </button>
            </div>
          ) : (
            filteredCategories.map((section, sIdx) => (
              <section key={sIdx} className="cheatsheet-section">
                <div className="cheatsheet-section-header">
                  <h3 className="cheatsheet-cat-title">{section.category}</h3>
                  <span className="cheatsheet-item-count q-num">{section.items.length} mục</span>
                </div>

                <div className="cheatsheet-grid">
                  {section.items.map((item, idx) => {
                    const isCopied = copiedCode === item.code;

                    // Multi-symbol chip picker card
                    if (item.isChipGrid && item.chips) {
                      return (
                        <article key={idx} className="cheatsheet-card" style={{ gridColumn: 'span 2' }}>
                          <div className="cs-symbols-container">
                            <div className="cheatsheet-formula" style={{ minHeight: 'auto', padding: '12px' }}>
                              <div className="cs-symbol-chips-grid">
                                {item.chips.map((chip, cIdx) => {
                                  const isChipCopied = copiedCode === chip.code;
                                  return (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      className={`cs-symbol-chip ${isChipCopied ? 'copied' : ''}`}
                                      onClick={() => handleCopy(chip.code, chip.code)}
                                      title={`Bấm để chép riêng: ${chip.code}`}
                                    >
                                      {chip.label}
                                      {activeQuickToast.id === chip.code && (
                                        <span className="cs-quick-toast">{activeQuickToast.message}</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="cs-explorer-trigger-btn"
                              onClick={() => setShowGreekExplorer(true)}
                              title="Mở rộng tra cứu đầy đủ 24 chữ cái Hy Lạp"
                            >
                              <Layers size={13} />
                              <span>Mở rộng bộ ký hiệu chi tiết</span>
                            </button>
                          </div>

                          <div className="cheatsheet-card-foot">
                            <div className="cheatsheet-meta">
                              <span className="cheatsheet-item-name">{item.name}</span>
                              <span className="cheatsheet-item-desc">{item.desc}</span>
                            </div>

                            <div className="cheatsheet-card-actions">
                              <button
                                type="button"
                                className={`cs-action-btn ${isCopied ? 'copied' : ''}`}
                                onClick={() => handleCopy(item.code, 'Toàn bộ')}
                                title="Sao chép toàn bộ chuỗi"
                              >
                                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                <span>{isCopied ? 'Đã chép' : 'Chép tất cả'}</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    // Standard single formula card
                    return (
                      <article key={idx} className="cheatsheet-card">
                        <div className="cheatsheet-formula">
                          <MathRenderer text={item.display} />
                        </div>

                        <div className="cheatsheet-card-foot">
                          <div className="cheatsheet-meta">
                            <span className="cheatsheet-item-name">{item.name}</span>
                            {item.desc && <span className="cheatsheet-item-desc">{item.desc}</span>}
                          </div>

                          <div className="cheatsheet-card-actions">
                            {onSelectFormula && (
                              <button
                                type="button"
                                className="cs-action-btn primary"
                                onClick={() => handleInsert(item.code)}
                                title="Chèn công thức vào khung soạn thảo"
                              >
                                <PlusCircle size={13} />
                                <span>Chèn</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className={`cs-action-btn ${isCopied ? 'copied' : ''}`}
                              onClick={() => handleCopy(item.code, item.code)}
                              title="Sao chép công thức"
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                              <span>{isCopied ? 'Đã chép' : 'Chép'}</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="modal-footer cheatsheet-footer">
          <span className="cheatsheet-footer-hint">
            Chọn ký hiệu hoặc nút <strong>Chép</strong> để sao chép công thức.
          </span>
          <div className="cheatsheet-footer-actions">
            <button
              type="button"
              className="btn btn-greek-all"
              onClick={() => setShowGreekExplorer(true)}
            >
              <Grid size={13} /> Bảng Hy Lạp đầy đủ
            </button>
            <button type="button" className="btn btn-close" onClick={onClose}>
              Đóng sổ tay
            </button>
          </div>
        </footer>
      </div>

      {/* Sub-Dialog: Full Greek Symbol Explorer */}
      {showGreekExplorer && (
        <div
          className="modal-backdrop-overlay"
          style={{ zIndex: 10001 }}
          onClick={() => setShowGreekExplorer(false)}
        >
          <div className="symbol-explorer-card" onClick={(e) => e.stopPropagation()}>
            <header className="cheatsheet-header">
              <div className="cheatsheet-title-wrap">
                <span className="q-eyebrow qa-modal-eyebrow">
                  <Layers size={13} /> Tra cứu 1 chạm
                </span>
                <h3 className="qa-modal-title">Bảng 24 Ký Hiệu Hy Lạp Đầy Đủ</h3>
                <p className="qa-modal-sub">
                  Chọn một ký hiệu để sao chép công thức.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowGreekExplorer(false)}
                aria-label="Đóng bảng ký hiệu"
              >
                <X size={17} />
              </button>
            </header>

            {/* Filter Tabs for Greek Explorer */}
            <div className="symbol-explorer-tabs-bar">
              <button
                type="button"
                className={`symbol-tab-btn ${greekTab === 'all' ? 'active' : ''}`}
                onClick={() => setGreekTab('all')}
              >
                Tất cả ký hiệu ({GREEK_LOWERCASE.length + GREEK_UPPERCASE_OPERATORS.length})
              </button>
              <button
                type="button"
                className={`symbol-tab-btn ${greekTab === 'lower' ? 'active' : ''}`}
                onClick={() => setGreekTab('lower')}
              >
                Chữ thường ({GREEK_LOWERCASE.length})
              </button>
              <button
                type="button"
                className={`symbol-tab-btn ${greekTab === 'upper' ? 'active' : ''}`}
                onClick={() => setGreekTab('upper')}
              >
                Chữ hoa & Toán tử ({GREEK_UPPERCASE_OPERATORS.length})
              </button>
            </div>

            <div className="symbol-explorer-body custom-scrollbar">
              <div className="symbol-explorer-grid">
                {(greekTab === 'lower'
                  ? GREEK_LOWERCASE
                  : greekTab === 'upper'
                  ? GREEK_UPPERCASE_OPERATORS
                  : [...GREEK_LOWERCASE, ...GREEK_UPPERCASE_OPERATORS]
                ).map((sym, gIdx) => {
                  const isCopied = copiedCode === sym.code;
                  return (
                    <div
                      key={gIdx}
                      className={`symbol-explorer-item ${isCopied ? 'copied' : ''}`}
                      onClick={() => handleCopy(sym.code, sym.name)}
                      title={`Bấm để sao chép: ${sym.code}`}
                    >
                      <div className="symbol-explorer-preview">
                        <MathRenderer text={sym.display} inline />
                      </div>
                      <span className="symbol-explorer-name">{sym.name}</span>
                      <code className="symbol-explorer-code">{sym.code}</code>
                      {isCopied && (
                        <span className="cs-quick-toast">
                          <Check size={11} /> Đã chép
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <footer className="modal-footer" style={{ padding: '12px 24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowGreekExplorer(false)}
              >
                Quay lại sổ tay
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
