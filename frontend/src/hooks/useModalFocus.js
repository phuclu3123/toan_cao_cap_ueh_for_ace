import { useEffect, useRef } from 'react';

const controls = 'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[contenteditable="true"],[tabindex="0"]';

/** Keep keyboard navigation in the topmost dialog and return to its opener. */
export default function useModalFocus(isOpen, onClose) {
  const ref = useRef(null), closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const frame = requestAnimationFrame(() => {
      (ref.current?.querySelector('input:not([disabled]),textarea:not([disabled])') || ref.current)?.focus({ preventScroll: true });
    });
    const handleKey = event => {
      const dialogs = document.querySelectorAll('[aria-modal="true"]');
      const top = dialogs[dialogs.length - 1];
      if (!ref.current || (top && ref.current.closest('[aria-modal="true"]') !== top)) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeRef.current(); return; }
      if (event.key !== 'Tab') return;
      const items = Array.from(ref.current.querySelectorAll(controls)).filter(item => item.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); ref.current.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !ref.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      cancelAnimationFrame(frame); document.removeEventListener('keydown', handleKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [isOpen]);
  return ref;
}
