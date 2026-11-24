import { ChevronLeft, ChevronRight } from 'lucide-react';
import { paginationPages } from '../../utils/pagination';
import '../../assets/styles/community.css';

/**
 * Pagination component with accessible keyboard navigation.
 */
export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = paginationPages(currentPage, totalPages);

  return (
    <nav className="pagination-container" aria-label="Điều hướng phân trang bài viết">
      <button
        type="button"
        className="pagination-btn pagination-nav-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
        <span className="pagination-text">Trước</span>
      </button>

      <div className="pagination-pages-list">
        {pages.map((p, index) => p === '…' ? <span key={`gap-${index}`} className="pagination-gap" aria-hidden="true">…</span> : (
          <button
            key={p}
            type="button"
            className={`pagination-btn pagination-num-btn ${p === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Trang ${p}`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="pagination-btn pagination-nav-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang sau"
      >
        <span className="pagination-text">Sau</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
