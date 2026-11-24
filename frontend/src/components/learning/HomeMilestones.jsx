import { useEffect, useId, useRef } from 'react';
import '../../assets/styles/HomeMilestones.css';

// These are the owner's original photographs. The polygons trim only their outer surroundings.
// No document text, seal or photograph is redrawn.
const mementos = [
  { id: 'provincial-2022', ratio: 1928 / 2560, angle: -6, offset: 13, color: '#bec9ed', tape: '#f8e6a4', year: '2022', points: '23,32 958,22 982,918 15,940', alt: 'Chứng nhận giải Nhì môn Toán cấp tỉnh Cà Mau, năm học 2021–2022' },
  { id: 'commendation-2023', ratio: 1928 / 2560, angle: 4, offset: -15, color: '#edc4b0', tape: '#b9deeb', year: '2023', points: '4,5 994,2 998,970 3,992', alt: 'Giấy khen năm 2023: giải Nhì học sinh giỏi cấp tỉnh và Huy chương Đồng Olympic 30.4' },
  { id: 'exam-card-2024', ratio: 916 / 1280, angle: -4, offset: 20, color: '#acd6af', tape: '#edc4b0', year: '2024', points: '48,25 947,25 948,955 48,955', alt: 'Thẻ dự thi học sinh giỏi quốc gia môn Toán năm 2024, Lữ Võ Hoàng Phúc' },
  { id: 'commendation-2022', ratio: 1928 / 2560, angle: 5, offset: -12, color: '#f8e6a4', tape: '#bec9ed', year: '2022', points: '20,38 933,40 955,908 16,912', alt: 'Giấy khen của huyện Đầm Dơi cho thành tích giải Nhì học sinh giỏi cấp tỉnh năm học 2021–2022' }
];

function PhotoSticker({ item }) {
  const clipId = useId();
  const height = 1000 * item.ratio;
  const points = item.points.split(' ').map(pair => {
    const [x, y] = pair.split(',').map(Number);
    return `${x},${y * item.ratio}`;
  }).join(' ');

  return <svg className="hp-memento-art" viewBox={`-32 -32 1064 ${height + 64}`} role="img" aria-label={item.alt}>
    <defs><clipPath id={clipId}><polygon points={points}/></clipPath></defs>
    <polygon points={points} fill={item.color} stroke={item.color} strokeWidth="56" strokeLinejoin="round"/>
    <polygon points={points} fill="#fffefd" stroke="#fffefd" strokeWidth="28" strokeLinejoin="round"/>
    <image data-sticker-src={`/images/home/milestones/${item.id}.webp`} width="1000" height={height} preserveAspectRatio="none" clipPath={`url(#${clipId})`}/>
  </svg>;
}

export default function HomeMilestones() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const group = root.querySelector('.hp-mementos-group');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => {
      root.dataset.running = String(visible && !preference.matches && document.visibilityState === 'visible');
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      root.querySelectorAll('[data-sticker-src]').forEach(image => image.setAttribute('href', image.dataset.stickerSrc));
      preload.disconnect();
    }, { rootMargin: '400px 0px' });
    const resize = new ResizeObserver(() => {
      // Keep the same gentle speed at every width; group width is one seamless cycle.
      root.style.setProperty('--mementos-duration', `${group.getBoundingClientRect().width / 24}s`);
    });
    observer.observe(root);
    preload.observe(root);
    resize.observe(group);
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      preload.disconnect();
      resize.disconnect();
      preference.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <section className="hp-mementos" ref={rootRef} data-running="false" aria-labelledby="hp-mementos-title">
    <header className="container hp-mementos-heading">
      <div><span className="hp-kicker">NHỮNG DẤU MỐC</span><h2 id="hp-mementos-title">Một hành trình <em>cùng Toán.</em></h2></div>
      <div className="hp-mementos-sidenote" aria-hidden="true"><span>Một góc kỷ niệm</span><svg viewBox="0 0 90 60" fill="none"><path d="M8 7C62-5 88 18 54 32C32 42 21 15 40 16C66 17 61 40 76 52m-12-2 12 3 2-12"/></svg></div>
    </header>
    <div className="hp-mementos-body">
      <div className="hp-mementos-watermark" aria-hidden="true">DẤU MỐC</div>
      <svg className="hp-mementos-doodles" viewBox="0 0 1600 360" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 245C250 375 380 280 590 288S900 110 1180 232S1470 330 1640 190" stroke="#b9deeb" strokeWidth="16" opacity=".55"/>
        <path d="M-40 276C250 406 380 311 590 319S900 141 1180 263S1470 361 1640 221" stroke="#edc4b0" strokeWidth="8" opacity=".55"/>
        <g stroke="#8b967a" strokeWidth="2" strokeLinecap="round"><path d="m362 44 5-14m8 21 15-5m-34 9-9 7"/><path d="M1091 301c-18-13-29-1-16 8s26-9 15-12"/></g>
        <path d="m741 40 6 15 16 4-15 7-4 16-7-15-16-4 15-7Z" fill="#f8e6a4" stroke="#c7ae6e" strokeWidth="1.2"/>
        <path d="m1374 64 4 10 11 3-10 5-3 11-5-10-11-3 10-5Z" fill="#bec9ed"/>
      </svg>
    <div className="hp-mementos-window" tabIndex={0} role="region" aria-label="Ảnh giấy khen và kỷ niệm học Toán; giữ con trỏ hoặc focus tại đây để tạm dừng">
      <div className="hp-mementos-track" id="hp-mementos-track">
        {[0,1].map(copy => <div className="hp-mementos-group" key={copy} role={copy ? undefined : 'list'} aria-hidden={copy ? 'true' : undefined}>
          {mementos.map(item => <div className="hp-memento" role={copy ? undefined : 'listitem'} key={item.id} style={{'--sticker-angle': `${item.angle}deg`, '--sticker-offset': `${item.offset}px`, '--sticker-tape': item.tape}}><PhotoSticker item={item}/><span className="hp-memento-year" aria-hidden="true">{item.year}</span></div>)}
        </div>)}
      </div>
    </div>
    </div>
  </section>;
}
