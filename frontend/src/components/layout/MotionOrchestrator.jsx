import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const REVEAL_SELECTOR = [
  '.section > .container',
  '.product-card',
  '.flow-step',
  '.news-feature',
  '.news-item',
  '.course-catalog-card',
  '.exam-room-card',
  '.midterm-room-card',
  '.article-row-vertical',
  '.headline-story-vertical',
  '.doc-card',
  '.list-item-card',
  '.api-doc-card'
].join(',');

export default function MotionOrchestrator() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.querySelector('.route-stage-content');
    if (!root) return undefined;

    // Helper to reveal all items immediately so nothing is ever stuck invisible
    const revealAll = () => {
      const items = Array.from(root.querySelectorAll(REVEAL_SELECTOR));
      items.forEach((item) => {
        item.classList.add('is-revealed');
      });
    };

    const frame = window.requestAnimationFrame(() => {
      const items = Array.from(root.querySelectorAll(REVEAL_SELECTOR));

      items.forEach((item, index) => {
        item.classList.add('reveal-item');
        item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 40}ms`);
      });

      // Immediately reveal top elements or elements if IntersectionObserver is slow
      if (!('IntersectionObserver' in window)) {
        revealAll();
        return;
      }

      document.documentElement.classList.add('motion-enhanced');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px 0px 100px 0px', threshold: 0.01 }
      );

      items.forEach((item) => observer.observe(item));
      root.__uehRevealObserver = observer;
    });

    // Safety Fallback Timers: Guarantee 100% visibility after 150ms and 400ms for lazy mounted routes
    const safetyTimer1 = setTimeout(revealAll, 150);
    const safetyTimer2 = setTimeout(revealAll, 400);

    return () => {
      window.cancelAnimationFrame(frame);
      clearTimeout(safetyTimer1);
      clearTimeout(safetyTimer2);
      const rootNow = document.querySelector('.route-stage-content');
      rootNow?.__uehRevealObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
