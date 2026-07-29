import { Search, X } from 'lucide-react';

export default function SearchModal({ showSearch, setShowSearch, searchQuery, setSearchQuery, handleGlobalSearch }) {
  if (!showSearch) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" onClick={() => setShowSearch(false)}>
      <form className="search-modal glass-panel" onSubmit={handleGlobalSearch} onClick={(event) => event.stopPropagation()}>
        <div className="search-modal-head">
          <span>Tìm nhanh học liệu</span>
          <button type="button" onClick={() => setShowSearch(false)} aria-label="Đóng tìm kiếm">
            <X size={20} />
          </button>
        </div>
        <div className="search-modal-input">
          <Search size={22} />
          <input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Nhập tên tài liệu, đề thi, chủ đề cần ôn..."
          />
        </div>
        <div className="search-suggestions">
          {['Giới hạn', 'Ma trận', 'Đề cuối kỳ', 'Tài liệu giữa kỳ'].map((item) => (
            <button type="button" key={item} onClick={() => setSearchQuery(item)}>
              {item}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
