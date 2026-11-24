import { useEffect, useMemo, useRef, useState } from 'react';
import GeometryToy from './GeometryToy';
import '../../assets/styles/MathMarginArtwork.css';

const catalog = [
  ['ronaldo', 'Cristiano Ronaldo · CR7', 'gold'], ['mcqueen', 'Lightning McQueen · 95', 'rose'],
  ['cube', 'Lập phương'], ['planet', 'Hành tinh vành đai'],
  ['woody', 'Woody · Cao bồi', 'gold'], ['buzz', 'Buzz Lightyear · Vô cực và xa hơn', 'blue'],
  ['lotso', 'Lotso · Gấu dâu', 'rose'], ['sphere', 'Hình cầu'],
  ['rambo', 'Rambo · Tui Tên Bô', 'gold'], ['faker', 'Faker', 'rose'],
  ['bunbo', 'Bún bò · món khoái khẩu', 'rose'], ['banhxeo', 'Bánh xèo giòn rụm', 'gold'],
  ['jupiter', 'Yamaha Jupiter V', 'blue'], ['lexus', 'Lexus LS 500', 'blue'],
  ['star', 'Ngôi sao nổi', 'gold'], ['ufo', 'Chuyến ghé thăm', 'blue'],
  ['vinyl', 'Một chút nhạc', 'rose'], ['daisy', 'Hoa trong quỹ đạo'],
  ['paperplane', 'Máy bay giấy', 'blue'], ['torus', 'Mặt xuyến'],
  ['heart', 'Một chiếc tim', 'rose'], ['octa', 'Bát diện'],
  ['rocket', 'Đi xa hơn', 'gold'], ['tetra', 'Tứ diện'],
  ['cassette', 'Mixtape của bạn', 'blue'], ['prism', 'Lăng kính nhỏ', 'blue'],
  ['icosa', 'Hai mươi mặt'], ['cursor', 'Con trỏ lạc đường', 'rose'],
  ['curve', 'Đồ thị parabol'], ['diamond', 'Viên đá nhỏ', 'blue'],
  ['helix', 'Đường xoắn ốc'], ['triangle', 'Tam giác nội tiếp'],
  ['cone', 'Hình nón'], ['cylinder', 'Hình trụ'],
];

/** Resize with the real reading canvas, including filters, replies and pagination. */
export default function MathMarginArtwork() {
  const artRef = useRef(null);
  const [field] = useState(() => new Map());
  const [rowCount, setRowCount] = useState(6);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);
  useEffect(() => {
    const canvas = artRef.current.parentElement;
    const observer = new ResizeObserver(entries => {
      const height = entries[0].contentRect.height;
      setRowCount(Math.max(2, Math.floor((height - 280) / 220) + 1));
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  const figures = useMemo(() => Array.from({ length: rowCount * 2 }, (_, index) => {
    const [kind, name, tone = 'green'] = catalog[index % catalog.length];
    return { kind, name, tone, side: index % 2 ? 'right' : 'left', row: Math.floor(index / 2) };
  }), [rowCount]);
  return <aside ref={artRef} className="qa-margin-art" aria-label="Vũ trụ sáng tạo tương tác">
    {['left', 'right'].map(side => <div key={side} className={`qa-geometry-band is-${side}`}>
      <svg className="qa-geometry-orbits" viewBox="0 0 200 1500" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M120 0C-80 170 260 240 100 420S-60 650 120 800S240 1030 60 1200S150 1430 100 1500" /><path d="M40 0C250 240-60 300 90 540S260 790 100 1000S-50 1260 160 1500" strokeDasharray="2 14" /></svg>
      {figures.filter(figure => figure.side === side).map(figure => <GeometryToy key={figure.row} figure={figure} field={field} reducedMotion={reducedMotion} />)}
    </div>)}
  </aside>;
}
