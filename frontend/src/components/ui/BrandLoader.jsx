import './BrandLoader.css';

export default function BrandLoader({
  label = 'Đang đồng bộ nội dung',
  compact = false
}) {
  return (
    <div
      className={`brand-loader${compact ? ' brand-loader--compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="brand-loader-grid" aria-hidden="true" />
      <div className="brand-loader-inner">
        <div className="brand-loader-mark" aria-hidden="true">
          <span>UEH</span>
          <span>TCC</span>
        </div>
        <div className="brand-loader-meta">
          <span>Learning intelligence</span>
          <span>Secure content stream</span>
        </div>
        <div className="brand-loader-progress" aria-hidden="true">
          <i />
        </div>
        <p>{label}<span className="brand-loader-dots" aria-hidden="true">•••</span></p>
      </div>
    </div>
  );
}
