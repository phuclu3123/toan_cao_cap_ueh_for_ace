import { useEffect } from 'react';

const MINIMUM_DISPLAY_MS = 520;
const EXIT_DURATION_MS = 620;

export default function AppBootLifecycle() {
  useEffect(() => {
    const overlay = document.getElementById('app-boot');
    if (!overlay) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startedAt = Number(window.__UEH_TCC_BOOT_STARTED__) || performance.now();
    let exitTimer;
    let removeTimer;
    let firstFrame;
    let secondFrame;

    const finishBoot = () => {
      const elapsed = performance.now() - startedAt;
      const remaining = reducedMotion ? 0 : Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

      exitTimer = window.setTimeout(() => {
        document.documentElement.classList.add('app-hydrated');
        overlay.classList.add('is-leaving');

        removeTimer = window.setTimeout(() => {
          overlay.remove();
          document.documentElement.classList.add('app-boot-complete');
        }, reducedMotion ? 30 : EXIT_DURATION_MS);
      }, remaining);
    };

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(finishBoot);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return null;
}
