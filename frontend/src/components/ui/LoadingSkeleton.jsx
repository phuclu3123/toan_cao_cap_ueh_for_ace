import '../../assets/styles/community.css';

/**
 * Universal Loading Skeleton component to prevent layout shifts (CLS).
 * Supports variants: 'feed-card', 'post-detail', 'answer-card', 'sidebar', 'table-row'
 */
export default function LoadingSkeleton({ variant = 'feed-card', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'feed-card') {
    return (
      <div className="skeleton-list" role="status" aria-label="Đang tải danh sách bài toán...">
        {items.map((key) => (
          <div key={key} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-avatar skeleton-shimmer" />
              <div className="skeleton-meta">
                <div className="skeleton-line skeleton-line-title skeleton-shimmer" style={{ width: '40%' }} />
                <div className="skeleton-line skeleton-line-subtitle skeleton-shimmer" style={{ width: '25%' }} />
              </div>
              <div className="skeleton-badge skeleton-shimmer" style={{ width: '80px', height: '26px' }} />
            </div>

            <div className="skeleton-body">
              <div className="skeleton-line skeleton-line-title skeleton-shimmer" style={{ width: '85%', height: '22px' }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: '100%' }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: '92%' }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: '60%' }} />
            </div>

            <div className="skeleton-footer">
              <div className="skeleton-tags">
                <div className="skeleton-pill skeleton-shimmer" style={{ width: '70px' }} />
                <div className="skeleton-pill skeleton-shimmer" style={{ width: '85px' }} />
                <div className="skeleton-pill skeleton-shimmer" style={{ width: '65px' }} />
              </div>
              <div className="skeleton-actions">
                <div className="skeleton-pill skeleton-shimmer" style={{ width: '60px' }} />
                <div className="skeleton-pill skeleton-shimmer" style={{ width: '60px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'post-detail') {
    return (
      <div className="skeleton-detail-container" role="status" aria-label="Đang tải chi tiết bài toán...">
        <div className="skeleton-card detail-hero-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar skeleton-shimmer" style={{ width: '48px', height: '48px' }} />
            <div className="skeleton-meta">
              <div className="skeleton-line skeleton-shimmer" style={{ width: '180px', height: '18px' }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
            </div>
            <div className="skeleton-pill skeleton-shimmer" style={{ width: '100px', height: '30px' }} />
          </div>

          <div className="skeleton-body" style={{ marginTop: '20px' }}>
            <div className="skeleton-line skeleton-shimmer" style={{ width: '90%', height: '28px', marginBottom: '16px' }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '100%', height: '16px' }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '98%', height: '16px' }} />
            <div className="skeleton-math-box skeleton-shimmer" style={{ height: '90px', margin: '18px 0', borderRadius: '8px' }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '95%', height: '16px' }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'answer-card') {
    return (
      <div className="skeleton-list" role="status" aria-label="Đang tải câu trả lời...">
        {items.map((key) => (
          <div key={key} className="skeleton-card" style={{ padding: '20px' }}>
            <div className="skeleton-header">
              <div className="skeleton-avatar skeleton-shimmer" style={{ width: '38px', height: '38px' }} />
              <div className="skeleton-meta">
                <div className="skeleton-line skeleton-shimmer" style={{ width: '140px', height: '15px' }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: '90px', height: '12px' }} />
              </div>
            </div>
            <div className="skeleton-body" style={{ marginTop: '14px' }}>
              <div className="skeleton-line skeleton-shimmer" style={{ width: '100%' }} />
              <div className="skeleton-line skeleton-shimmer" style={{ width: '85%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="skeleton-sidebar" role="status" aria-label="Đang tải sidebar...">
        <div className="skeleton-card" style={{ padding: '20px' }}>
          <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '20px', marginBottom: '16px' }} />
          {items.map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div className="skeleton-avatar skeleton-shimmer" style={{ width: '32px', height: '32px' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-line skeleton-shimmer" style={{ width: '80%', height: '14px' }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: '50%', height: '10px', marginTop: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div className="skeleton-line skeleton-shimmer" style={{ width: '100%', height: '24px' }} />;
}
