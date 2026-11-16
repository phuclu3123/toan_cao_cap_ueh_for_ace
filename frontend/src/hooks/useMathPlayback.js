import { useEffect, useState } from 'react';

// Playback runs only for visible demonstrations and pauses in background tabs.
// Reduced motion starts in manual mode, with the same mathematical end states.
export default function useMathPlayback(steps, interval = 2800, { loop = true } = {}) {
  const [element, attach] = useState(null);
  const [mode, setMode] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'manual' : 'auto');
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [activeDocument, setActiveDocument] = useState(() => !document.hidden);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: .15 });
    if (element) observer.observe(element);
    const handleVisibility = () => setActiveDocument(!document.hidden);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotion = event => { setReduced(event.matches); if (event.matches) setMode('manual'); };
    document.addEventListener('visibilitychange', handleVisibility);
    media.addEventListener('change', handleMotion);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', handleVisibility); media.removeEventListener('change', handleMotion); };
  }, [element]);
  useEffect(() => {
    if (mode !== 'auto' || !playing || !visible || !activeDocument || reduced || (!loop && step === steps - 1)) return;
    const timer = setInterval(() => setStep(value => loop ? (value + 1) % steps : Math.min(value + 1, steps - 1)), interval);
    return () => clearInterval(timer);
  }, [mode, playing, visible, activeDocument, reduced, steps, interval, loop, step]);
  const seek = value => { setMode('manual'); setStep(Math.max(0, Math.min(steps - 1, value))); };
  return { attach, mode, setMode, playing, setPlaying, step, setStep, seek, reduced, running: mode === 'auto' && playing && visible && activeDocument && !reduced && (loop || step < steps - 1) };
}
