import './Button.css';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const isIconOnly = !children && Icon;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`ui-button variant-${variant} size-${size} ${isIconOnly ? 'icon-only' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="ui-button-spinner" aria-hidden="true" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
        </>
      )}
    </button>
  );
}
