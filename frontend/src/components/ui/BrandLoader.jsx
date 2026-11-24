import { useState } from 'react';
import './BrandLoader.css';

export default function BrandLoader({
  label = 'Đang đồng bộ nội dung',
  compact = false,
  phase = 'page'
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={`brand-loader brand-loader--cards${compact ? ' brand-loader--compact' : ''}${paused ? ' is-paused' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
      data-loading-phase={phase}
    >
      <div className="brand-loader-inner">
        <div className="brand-loader-mark" aria-hidden="true">
          <span className="brand-wordmark"><span className="brand-math">α∫</span>M4A</span>
        </div>
        <div className="brand-loader-deck" aria-hidden="true">
          <div className="brand-loader-paper brand-loader-paper--left"><span>TÍCH PHÂN</span><strong>∫ f(x) dx</strong><i /></div>
          <div className="brand-loader-paper brand-loader-paper--right"><span>ĐẠI SỐ</span><strong>Ax = b</strong><i /></div>
          <div className="brand-loader-turn">
            <div className="brand-loader-paper brand-loader-paper--front"><span>THỬ NHỚ MỘT CHÚT</span><strong>f(x) = x²</strong><div>f′(x) = ?</div><i /></div>
            <div className="brand-loader-paper brand-loader-paper--back"><span>THÊM MỘT ĐIỀU ĐÃ NHỚ</span><strong>f′(x) = 2x</strong><div>Hiểu rồi. Nhớ lâu hơn.</div><i /></div>
          </div>
        </div>
        <h2>Mở ra kiến thức.<br /><em>Giữ lại điều hay.</em></h2>
        <p>{label}</p>
        <div className="brand-loader-progress" aria-hidden="true"><i /></div>
        <button type="button" className="brand-loader-pause" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}</button>
      </div>
    </div>
  );
}
