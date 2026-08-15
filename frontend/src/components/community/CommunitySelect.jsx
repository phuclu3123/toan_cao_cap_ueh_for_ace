import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/** A branded, keyboard-friendly replacement for the operating system select. */
export default function CommunitySelect({
  value,
  options,
  onChange,
  ariaLabel,
  id,
  className = '',
  compact = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selected = options[selectedIndex] || options[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        rootRef.current?.querySelector('.q-custom-select-trigger')?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const selectOption = (nextValue) => {
    onChange?.(nextValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = selectedIndex;
    if (event.key === 'ArrowDown') nextIndex = Math.min(options.length - 1, selectedIndex + 1);
    if (event.key === 'ArrowUp') nextIndex = Math.max(0, selectedIndex - 1);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;

    onChange?.(options[nextIndex].value);
    setIsOpen(true);
  };

  return (
    <div
      ref={rootRef}
      className={`q-custom-select ${compact ? 'is-compact' : ''} ${isOpen ? 'is-open' : ''} ${className}`.trim()}
    >
      <button
        id={id}
        type="button"
        className="q-custom-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleKeyDown}
      >
        <span>{selected?.label}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {isOpen && (
        <div id={listboxId} className="q-custom-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`q-custom-select-option ${isSelected ? 'is-selected' : ''}`}
                onClick={() => selectOption(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
