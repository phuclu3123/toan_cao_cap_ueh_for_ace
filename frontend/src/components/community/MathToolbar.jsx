import { BookOpen } from 'lucide-react';
import '../../assets/styles/community.css';

/**
 * MathToolbar component provides quick 1-touch insertion of LaTeX formulas.
 */
export default function MathToolbar({ onInsert, onOpenCheatsheet }) {
  const mathButtons = [
    { label: 'x/y', latex: '\\frac{a}{b}', title: 'Phân số \\frac{a}{b}' },
    { label: '√x', latex: '\\sqrt{x}', title: 'Căn bậc hai \\sqrt{x}' },
    { label: 'x²', latex: 'x^{2}', title: 'Lũy thừa / Số mũ x^{n}' },
    { label: '∫', latex: '\\int_{a}^{b} f(x)\\,dx', title: 'Tích phân xác định' },
    { label: 'lim', latex: '\\lim_{x \\to 0}', title: 'Giới hạn' },
    { label: '∂f/∂x', latex: '\\frac{\\partial f}{\\partial x}', title: 'Đạo hàm riêng cấp 1' },
    { label: '∇f', latex: '\\nabla f', title: 'Vector Gradient' },
    { label: 'λ', latex: '\\lambda', title: 'Nhân tử Lagrange \\lambda' },
    { label: '∑', latex: '\\sum_{i=1}^{n}', title: 'Tổng sigma' },
    { label: '[Matrix]', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', title: 'Ma trận 2x2' },
    { label: 'det(A)', latex: '\\det(A)', title: 'Định thức ma trận' },
    { label: 'A⁻¹', latex: 'A^{-1}', title: 'Ma trận nghịch đảo' },
    { label: 'α', latex: '\\alpha', title: 'Alpha' },
    { label: 'β', latex: '\\beta', title: 'Beta' },
    { label: '∞', latex: '\\infty', title: 'Vô cực' },
    { label: 'ℝⁿ', latex: '\\mathbb{R}^n', title: 'Không gian Rn' },
    { label: '≤', latex: '\\le', title: 'Nhỏ hơn hoặc bằng' },
    { label: '≥', latex: '\\ge', title: 'Lớn hơn hoặc bằng' },
    { label: '≈', latex: '\\approx', title: 'Xấp xỉ' }
  ];

  return (
    <div className="math-toolbar-wrap" role="toolbar" aria-label="Bàn phím ký hiệu Toán học">
      <div className="math-toolbar-buttons">
        <span className="math-toolbar-label">Chèn nhanh:</span>
        {mathButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            className="math-quick-btn"
            title={btn.title}
            onClick={() => onInsert && onInsert(btn.latex)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {onOpenCheatsheet && (
        <button
          type="button"
          className="math-cheatsheet-trigger-btn"
          onClick={onOpenCheatsheet}
          title="Tra cứu bảng công thức Toán học"
        >
          <BookOpen size={14} />
          <span>Sổ tay LaTeX</span>
        </button>
      )}
    </div>
  );
}
