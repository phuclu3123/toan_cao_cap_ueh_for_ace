import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const REVEAL_SELECTOR = [
  '.hp-reveal',
  '.section-title',
  '.operating-panel',
  '.product-card',
  '.flow-step',
  '.news-feature',
  '.news-item',
  '.course-catalog-card',
  '.elearning-card',
  '.concept-card',
  '.se-question-item',
  '.exam-room-card',
  '.midterm-room-card',
  '.article-row-vertical',
  '.headline-story-vertical',
  '.doc-card',
  '.list-item-card',
  '.api-doc-card',
  '.exam-ticket',
  '.exam-teacher-note'
].join(',');

export default function MotionOrchestrator() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.querySelector('.route-stage-content');
    if (!root || !('IntersectionObserver' in window)) return undefined;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tracked = new Set();
    let frame = 0;
    document.documentElement.classList.add('motion-enhanced');
    const revealEntries = (entries, observing) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observing.unobserve(entry.target);
      });
    };
    const observer = new IntersectionObserver(revealEntries, { rootMargin: '0px 0px -24px 0px', threshold: 0.04 });
    // Student stories enter once enough of the composition is in view.
    const storyObserver = new IntersectionObserver(revealEntries, { rootMargin: '0px 0px -64px 0px', threshold: 0.15 });
    const observeItem = item => (item.hasAttribute('data-reveal-direction') ? storyObserver : observer).observe(item);

    const scan = () => {
      frame = 0;
      root.querySelectorAll(REVEAL_SELECTOR).forEach(item => {
        if (tracked.has(item)) return;
        tracked.add(item);
        // Never hide a focused item, the initial viewport, or a nested reveal.
        const visible = preference.matches || item.getBoundingClientRect().top < window.innerHeight
          || item.contains(document.activeElement) || item.parentElement?.closest('.reveal-item');
        item.classList.add('reveal-item');
        if (visible) item.classList.add('is-revealed');
        else observeItem(item);
      });
    };
    const scheduleScan = () => { if (!frame) frame = window.requestAnimationFrame(scan); };
    const mutations = new MutationObserver(scheduleScan);
    // Lazy routes and fetched lists are discovered without a scroll listener.
    mutations.observe(root, { childList: true, subtree: true });
    const handlePreference = () => {
      if (preference.matches) {
        tracked.forEach(item => item.classList.add('is-revealed'));
        observer.disconnect();
        storyObserver.disconnect();
      }
    };
    const handleFocus = event => event.target.closest('.reveal-item')?.classList.add('is-revealed');
    const topSentinel=document.querySelector('[data-scroll-replay-top]');
    const topObserver=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting || window.scrollY>100 || preference.matches) return;
      tracked.forEach(item=>{
        if(!item.isConnected) {tracked.delete(item);return;}
        if(item.getBoundingClientRect().top>=innerHeight && !item.parentElement?.closest('.reveal-item')) {
          item.classList.remove('is-revealed');observeItem(item);
        }
      });
      window.dispatchEvent(new Event('ueh-scroll-replay'));
    },{threshold:0});
    if(topSentinel) topObserver.observe(topSentinel);
    preference.addEventListener('change', handlePreference);
    root.addEventListener('focusin', handleFocus);
    scheduleScan();

    return () => {
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      storyObserver.disconnect();
      topObserver.disconnect();
      preference.removeEventListener('change', handlePreference);
      root.removeEventListener('focusin', handleFocus);
      tracked.forEach(item => item.classList.add('is-revealed'));
    };
  }, [pathname]);

  return null;
}
