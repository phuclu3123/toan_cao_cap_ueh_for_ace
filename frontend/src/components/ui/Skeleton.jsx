import './Skeleton.css';

export default function Skeleton({
  variant = 'text', // text | card | circle | rect
  width,
  height,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`ui-skeleton variant-${variant} ${className}`}
      style={{
        width: width || (variant === 'circle' ? height : undefined),
        height: height || (variant === 'text' ? '1rem' : undefined),
        ...style
      }}
      aria-hidden="true"
    />
  );
}
