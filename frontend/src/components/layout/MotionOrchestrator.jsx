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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.querySelector('.route-stage-content');
    if (!root) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const items = Array.from(root.querySelectorAll(REVEAL_SELECTOR));

      items.forEach((item, index) => {
        item.classList.add('reveal-item');
        item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
      });

      if (reducedMotion || !('IntersectionObserver' in window)) {
        items.forEach((item) => item.classList.add('is-revealed'));
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
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );

      items.forEach((item) => observer.observe(item));
      root.__uehRevealObserver = observer;
    });

    return () => {
      window.cancelAnimationFrame(frame);
      const rootNow = document.querySelector('.route-stage-content');
      rootNow?.__uehRevealObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
