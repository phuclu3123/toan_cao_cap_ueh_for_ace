import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, X, Copy, Check, Search, Sparkles, PlusCircle } from 'lucide-react';
import MathRenderer from '../MathRenderer';
import '../../assets/styles/community.css';

/**
 * Concise, Standardized KaTeX Mathematical Building Blocks Cheatsheet.
 * Focused on general building blocks (x^n, \sqrt[n]{x}, \frac{a}{b}, \partial, matrices, calculus).
 */
const CHEATSHEET_CATEGORIES = [
  {
    id: 'basic',
    category: '1. Ký hiệu & Công thức Cơ Bản',
    badge: 'Cơ bản',
    items: [
      { name: 'Lũy thừa bậc n', code: 'x^n', display: '$$x^n$$', desc: 'Số mũ tổng quát' },
      { name: 'Chỉ số dưới', code: 'x_i', display: '$$x_i$$', desc: 'Chỉ số phần tử' },
      { name: 'Lũy thừa & Chỉ số kết hợp', code: 'x_i^n', display: '$$x_i^n$$', desc: 'Chỉ số trên và dưới' },
      { name: 'Căn bậc hai', code: '\\sqrt{x}', display: '$$\\sqrt{x}$$', desc: 'Căn bậc 2' },
      { name: 'Căn bậc n', code: '\\sqrt[n]{x}', display: '$$\\sqrt[n]{x}$$', desc: 'Căn thức bậc n tổng quát' },
      { name: 'Phân số chuẩn', code: '\\frac{a}{b}', display: '$$\\frac{a}{b}$$', desc: 'Phân số \\frac{tử}{mẫu}' },
      { name: 'Phân số lớn (Display)', code: '\\dfrac{a}{b}', display: '$$\\dfrac{a}{b}$$', desc: 'Phân số kích thước lớn' },
      { name: 'Cộng trừ / Trừ cộng', code: 'x \\pm y, \\quad x \\mp y', display: '$$x \\pm y, \\quad x \\mp y$$', desc: 'Dấu cộng trừ' },
      { name: 'Dấu quan hệ & So sánh', code: 'a \\le b, \\quad a \\ge b, \\quad a \\neq b, \\quad a \\approx b', display: '$$a \\le b, \\quad a \\ge b, \\quad a \\neq b, \\quad a \\approx b$$', desc: 'Nhỏ hơn, lớn hơn, khác, xấp xỉ' },
      { name: 'Ký hiệu logic & Tập hợp', code: '\\forall x \\in \\mathbb{R}, \\; \\exists y > 0, \\; A \\implies B, \\; A \\iff B', display: '$$\\forall x \\in \\mathbb{R}, \\; \\exists y > 0, \\; A \\implies B$$', desc: 'Với mọi, tồn tại, suy ra, tương đương' }
    ]
  },
  {
    id: 'greek',
    category: '2. Bảng Ký hiệu Hy Lạp (Greek Symbols)',
    badge: 'Ký hiệu Hy Lạp',
    items: [
      { name: 'Ký hiệu Hy Lạp chữ thường', code: '\\alpha, \\; \\beta, \\; \\gamma, \\; \\delta, \\; \\lambda, \\; \\mu, \\; \\sigma, \\; \\theta, \\; \\omega', display: '$$\\alpha, \\; \\beta, \\; \\gamma, \\; \\delta, \\; \\lambda, \\; \\mu, \\; \\sigma, \\; \\theta, \\; \\omega$$', desc: 'Alpha, Beta, Gamma, Delta, Lambda, Mu, Sigma, Theta, Omega' },
      { name: 'Ký hiệu Hy Lạp chữ hoa & Gradient', code: '\\Delta, \\; \\nabla, \\; \\Sigma, \\; \\Omega, \\; \\Phi, \\; \\Psi', display: '$$\\Delta, \\; \\nabla, \\; \\Sigma, \\; \\Omega, \\; \\Phi, \\; \\Psi$$', desc: 'Delta, Gradient (Nabla), Sigma hoa, Omega hoa' },
      { name: 'Nhân tử Lagrange', code: '\\lambda', display: '$$\\lambda$$', desc: 'Ký hiệu nhân tử Lambda' }
    ]
  },
  {
    id: 'calculus',
    category: '3. Giải tích & Vi tích phân (Calculus)',
    badge: 'Giải tích',
    items: [
      { name: 'Giới hạn (Limit)', code: '\\lim_{x \\to x_0} f(x)', display: '$$\\lim_{x \\to x_0} f(x)$$', desc: 'Giới hạn khi x tiến tới x0' },
      { name: 'Đạo hàm cấp 1 hàm 1 biến', code: 'f\'(x) = \\frac{df}{dx}', display: '$$f\'(x) = \\frac{df}{dx}$$', desc: 'Đạo hàm bậc 1' },
      { name: 'Đạo hàm riêng cấp 1', code: '\\frac{\\partial f}{\\partial x}', display: '$$\\frac{\\partial f}{\\partial x}$$', desc: 'Đạo hàm riêng theo x' },
      { name: 'Đạo hàm riêng cấp 2', code: '\\frac{\\partial^2 f}{\\partial x^2}, \\quad \\frac{\\partial^2 f}{\\partial x \\partial y}', display: '$$\\frac{\\partial^2 f}{\\partial x^2}, \\quad \\frac{\\partial^2 f}{\\partial x \\partial y}$$', desc: 'Đạo hàm riêng cấp 2 thuần và hỗn tạp' },
      { name: 'Vector Gradient', code: '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)', display: '$$\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)$$', desc: 'Gradient hàm 2 biến' },
      { name: 'Vi phân toàn phần', code: 'df = \\frac{\\partial f}{\\partial x} dx + \\frac{\\partial f}{\\partial y} dy', display: '$$df = \\frac{\\partial f}{\\partial x} dx + \\frac{\\partial f}{\\partial y} dy$$', desc: 'Vi phân cấp 1' },
      { name: 'Tích phân bất định', code: '\\int f(x)\\,dx', display: '$$\\int f(x)\\,dx$$', desc: 'Tích phân nguyên hàm' },
      { name: 'Tích phân xác định', code: '\\int_{a}^{b} f(x)\\,dx', display: '$$\\int_{a}^{b} f(x)\\,dx$$', desc: 'Tích phân từ a đến b' },
      { name: 'Tích phân kép', code: '\\iint_{D} f(x, y)\\,dxdy', display: '$$\\iint_{D} f(x, y)\\,dxdy$$', desc: 'Tích phân 2 lớp trên miền D' },
      { name: 'Tổng Sigma', code: '\\sum_{i=1}^{n} x_i', display: '$$\\sum_{i=1}^{n} x_i$$', desc: 'Tổng chuỗi từ 1 đến n' },
      { name: 'Tích Pi lớn', code: '\\prod_{i=1}^{n} a_i', display: '$$\\prod_{i=1}^{n} a_i$$', desc: 'Tích các phần tử' }
    ]
  },
  {
    id: 'algebra',
    category: '4. Đại số Tuyến tính & Ma trận (Linear Algebra)',
    badge: 'Đại số & Ma trận',
    items: [
      { name: 'Ma trận vuông 2x2', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', desc: 'Ma trận ngoặc tròn' },
      { name: 'Ma trận vuông 3x3', code: '\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}', display: '$$\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}$$', desc: 'Ma trận cấp 3' },
      { name: 'Định thức ma trận (Determinant)', code: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', display: '$$\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$$', desc: 'Định thức ma trận' },
      { name: 'Ma trận nghịch đảo', code: 'A^{-1} = \\frac{1}{\\det(A)} P_A^T', display: '$$A^{-1} = \\frac{1}{\\det(A)} P_A^T$$', desc: 'Ma trận nghịch đảo' },
      { name: 'Hệ phương trình tuyến tính', code: '\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}', display: '$$\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$$', desc: 'Hệ phương trình 2 ẩn' },
      { name: 'Phương trình đặc trưng (Trị riêng)', code: '\\det(A - \\lambda I) = 0', display: '$$\\det(A - \\lambda I) = 0$$', desc: 'Tìm giá trị riêng Lambda' },
      { name: 'Ma trận Hessian 2 biến', code: 'H = \\begin{pmatrix} f\'\'_{xx} & f\'\'_{xy} \\\\ f\'\'_{yx} & f\'\'_{yy} \\end{pmatrix}', display: '$$H = \\begin{pmatrix} f\'\'_{xx} & f\'\'_{xy} \\\\ f\'\'_{yx} & f\'\'_{yy} \\end{pmatrix}$$', desc: 'Ma trận đạo hàm cấp 2' }
    ]
  },
  {
    id: 'applied',
    category: '5. Mô hình Toán Kinh tế & Xác suất UEH',
    badge: 'Toán Kinh tế & Xác suất',
    items: [
      { name: 'Hàm sản xuất Cobb-Douglas', code: 'Q = A \\cdot K^\\alpha L^\\beta', display: '$$Q = A \\cdot K^\\alpha L^\\beta$$', desc: 'Hàm sản xuất 2 yếu tố Vốn & Lao động' },
      { name: 'Hệ số co giãn (Elasticity)', code: '\\varepsilon_p = \\frac{dQ}{dp} \\cdot \\frac{p}{Q}', display: '$$\\varepsilon_p = \\frac{dQ}{dp} \\cdot \\frac{p}{Q}$$', desc: 'Độ co giãn của cầu theo giá' },
      { name: 'Hàm nhân tử Lagrange', code: '\\mathcal{L}(x, y, \\lambda) = f(x, y) + \\lambda [b - g(x, y)]', display: '$$\\mathcal{L}(x, y, \\lambda) = f(x, y) + \\lambda [b - g(x, y)]$$', desc: 'Hàm mục tiêu cực trị ràng buộc' },
      { name: 'Mô hình cân bằng Leontief', code: 'X = (I - A)^{-1} D', display: '$$X = (I - A)^{-1} D$$', desc: 'Ma trận nghịch đảo Leontief' },
      { name: 'Công thức Bayes', code: 'P(A|B) = \\frac{P(A) \\cdot P(B|A)}{P(B)}', display: '$$P(A|B) = \\frac{P(A) \\cdot P(B|A)}{P(B)}$$', desc: 'Xác suất có điều kiện Bayes' },
      { name: 'Tổ hợp & Chỉnh hợp', code: 'C_n^k = \\frac{n!}{k!(n-k)!}, \\quad A_n^k = \\frac{n!}{(n-k)!}', display: '$$C_n^k = \\frac{n!}{k!(n-k)!}, \\quad A_n^k = \\frac{n!}{(n-k)!}$$', desc: 'Công thức đếm tổ hợp chỉnh hợp' }
    ]
  }
];

export default function FormulaCheatsheetModal({ isOpen, onClose, onSelectFormula }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState('');

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
        (item.desc && item.desc.toLowerCase().includes(q))
      );

      if (filteredItems.length === 0) return null;
      return { ...cat, items: filteredItems };
    }).filter(Boolean);
  }, [search, activeCategory]);

  if (!isOpen) return null;

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
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
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="cheatsheet-title">
      <div className="cheatsheet-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="cheatsheet-header">
          <div className="cheatsheet-title-wrap">
            <span className="q-eyebrow qa-modal-eyebrow">
              <BookOpen size={12} /> Tài liệu tra cứu
            </span>
            <h2 id="cheatsheet-title" className="qa-modal-title">Sổ tay công thức KaTeX</h2>
            <p className="qa-modal-sub">
              {totalCount} khối công thức chuẩn mực cho Toán Cao Cấp — chèn thẳng vào bài hoặc sao chép mã.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Đóng sổ tay">
            <X size={17} />
          </button>
        </header>

        {/* Search + category rail */}
        <div className="cheatsheet-controls-bar">
          <div className="qa-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Tìm công thức (x^n, dfrac, partial, pmatrix, Lagrange, Bayes)..."
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
                    return (
                      <article key={idx} className="cheatsheet-card">
                        {/* The formula itself is the hero — set like a printed page */}
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
                                title="Chèn công thức vào bài viết"
                              >
                                <PlusCircle size={13} />
                                <span>Chèn</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className={`cs-action-btn ${isCopied ? 'copied' : ''}`}
                              onClick={() => handleCopy(item.code)}
                              title="Sao chép mã LaTeX"
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

        <footer className="modal-footer cheatsheet-footer">
          <span className="cheatsheet-footer-hint">
            Nhấp <strong>Chèn</strong> để đưa mã vào khung soạn thảo, hoặc <strong>Chép</strong> để dán ở bất kỳ đâu.
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Đóng sổ tay
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
