// Bounded scroll work: observe off-screen, animate only while arriving, re-arm at top.
export function createScrollArrival(node, property, { travel = .38, end = .25, smoothing = 240 } = {}) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, lastTime = 0, listening = false, visible = false, settled = false;
  let position = innerWidth * travel, target = position, measureNext = true, reachedEnd = false;

  const paint = () => node.style.setProperty(property, `${position.toFixed(2)}px`);
  const detach = () => {
    window.removeEventListener('scroll', scheduleMeasure);
    window.removeEventListener('resize', scheduleMeasure);
    listening = false;
  };
  const stopFrame = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
  const settle = () => {
    position = target = 0; settled = true; paint(); detach(); stopFrame();
    node.dataset.arrivalState = 'settled'; observer.unobserve(node);
  };
  const tick = time => {
    frame = 0;
    if (settled || !visible || document.visibilityState !== 'visible') return;
    if (measureNext) {
      const progress = Math.max(0, Math.min(1, (innerHeight * .98 - node.getBoundingClientRect().top) / (innerHeight * (.98 - end))));
      reachedEnd ||= progress === 1;
      target = reachedEnd ? 0 : innerWidth * travel * (1 - progress);
      measureNext = false;
    }
    const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;
    position += (target - position) * (1 - Math.exp(-elapsed / smoothing));
    paint();
    if (reachedEnd && position < .25) { settle(); return; }
    if (Math.abs(target - position) > .15) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  };
  function scheduleMeasure() {
    measureNext = true;
    if (!frame && visible && !settled && document.visibilityState === 'visible') frame = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (settled) return;
    if (visible) {
      if (!listening) { window.addEventListener('scroll', scheduleMeasure, { passive: true }); window.addEventListener('resize', scheduleMeasure); listening = true; }
      node.dataset.arrivalState = 'entering'; scheduleMeasure();
    } else { detach(); stopFrame(); }
  }, { rootMargin: '100px 0px' });
  const arm = () => {
    const bounds=node.getBoundingClientRect();
    const focusedInView=node.contains(document.activeElement) && bounds.bottom>0 && bounds.top<innerHeight;
    if (preference.matches || focusedInView) { settle(); return; }
    stopFrame(); detach(); settled = false; reachedEnd = false; measureNext = true;
    position = target = innerWidth * travel; paint(); node.dataset.arrivalState = 'armed';
    observer.unobserve(node); observer.observe(node);
  };
  const handleVisibility = () => { if (document.visibilityState === 'visible') scheduleMeasure(); else stopFrame(); };
  preference.addEventListener('change', arm);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('ueh-scroll-replay', arm);
  arm();
  return {
    settle,
    dispose() { stopFrame(); detach(); observer.disconnect(); preference.removeEventListener('change', arm); document.removeEventListener('visibilitychange', handleVisibility); window.removeEventListener('ueh-scroll-replay', arm); }
  };
}
