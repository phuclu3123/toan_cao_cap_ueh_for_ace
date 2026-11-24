import { useEffect, useRef, useState } from 'react';

const captions = { faker: 'FAKER', rambo: 'TUI TÊN BÔ', ronaldo: 'RONALDO · GOAT', lexus: 'LEXUS · LS 500', jupiter: 'YAMAHA · JUPITER V' };

/** Load detailed artwork only near the visible wide-screen margin. */
export default function CollectibleArtwork({ kind }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, {rootMargin:'240px'});
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <g ref={ref}>
    {ready && <image href={`/images/community/collectibles/${kind}-v2.webp`} x="2" y="0" width="176" height="160" preserveAspectRatio="xMidYMid meet"/>}
    <text x="90" y="177" textAnchor="middle" style={{font:'600 9px sans-serif',letterSpacing:'.06em'}}>{captions[kind]}</text>
  </g>;
}
