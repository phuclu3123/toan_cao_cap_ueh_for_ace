import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import KnowledgeSketch from './KnowledgeSketch';
import '../../assets/styles/KnowledgeArtwork.css';

const subjects = [
  { kind: 'curve', title: 'Đạo hàm', hint: 'Độ dốc của một đường cong', to: '/courses' },
  { kind: 'matrix', title: 'Ma trận', hint: 'Viết gọn một hệ phương trình', to: '/courses' },
  { kind: 'integral', title: 'Tích phân', hint: 'Từ tổng Riemann đến tích phân', to: '/courses' },
  { kind: 'vector', title: 'Véc tơ', hint: 'Hướng đi và độ lớn', to: '/flashcards' },
  { kind: 'optimize', title: 'Tối ưu', hint: 'Tìm lời giải trong ràng buộc', to: '/community' },
  { kind: 'sql', title: 'Dữ liệu', hint: 'Kết nối để tìm câu trả lời', to: '/course/lop-tu-hoc-sql' }
];

export default function KnowledgeStrip() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current, preference = matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new Set();
    const sketches = Array.from(node.querySelectorAll('[data-sketch-kind]')).map(svg => ({
      svg, kind: svg.dataset.sketchKind, runner: svg.querySelector('.concept-runner'), tangent: svg.querySelector('.concept-tangent'), cell: svg.querySelector('.concept-cell'), flow: svg.querySelector('.concept-flow-path'), riemannLevels: Array.from(svg.querySelectorAll('[data-riemann-level]')), riemannCount: svg.querySelector('.concept-riemann-count')
    }));
    let frame = 0, last = 0, elapsed = 0;
    const point = (entry, x, y) => { entry.runner?.setAttribute('cx', x.toFixed(2)); entry.runner?.setAttribute('cy', y.toFixed(2)); };
    const tick = time => {
      frame = 0;
      if (last && time - last >= 33) {
        elapsed += Math.min(time - last, 60); last = time;
        const t = elapsed / 1000;
        sketches.forEach((entry, index) => {
          if (!visible.has(entry.svg)) return;
          const phase = t * .42 + index * .7;
          if (entry.kind === 'integral') {
            const level = Math.floor(t/2.4)%3;
            if (entry.riemannLevel !== level) {
              entry.riemannLevels.forEach((group,index)=>group.setAttribute('opacity',index===level?'1':'0'));
              entry.riemannCount.textContent = `n = ${[4,8,16][level]}`;
              entry.riemannLevel = level;
            }
          } else if (entry.kind === 'curve') {
            const x = 1.8 * Math.sin(phase), y = 175 - .8 * x * x * 35, px = 150 + x * 57;
            point(entry, px, y);
            const slope = -2 * .8 * x * 35 / 57;
            entry.tangent?.setAttribute('d', `M${px-30} ${y-slope*30}L${px+30} ${y+slope*30}`);
          } else if (entry.kind === 'vector') {
            const progress = (1 + Math.sin(phase)) / 2;
            point(entry, 65 + 125 * progress, 183 - 104 * progress);
          } else if (entry.kind === 'matrix') {
            entry.cell.setAttribute('transform', `translate(${25*(1+Math.sin(phase))} ${25*(1+Math.cos(phase))})`);
          } else if (entry.kind === 'sql') {
            const position = entry.flow.getPointAtLength(((Math.sin(phase)+1)/2)*entry.flow.getTotalLength());
            point(entry, position.x, position.y);
          } else if (entry.kind === 'optimize') {
            const angle = -25*Math.PI/180, x = 81*Math.cos(phase), y = 54*Math.sin(phase);
            const px = 150+x*Math.cos(angle)-y*Math.sin(angle), py = 119+x*Math.sin(angle)+y*Math.cos(angle);
            const dx = -81*Math.sin(phase)*Math.cos(angle)-54*Math.cos(phase)*Math.sin(angle), dy = -81*Math.sin(phase)*Math.sin(angle)+54*Math.cos(phase)*Math.cos(angle);
            const factor = 75/Math.hypot(dx,dy);
            point(entry, px, py); entry.tangent.setAttribute('d', `M${px-dx*factor} ${py-dy*factor}L${px+dx*factor} ${py+dy*factor}`);
          }
        });
      } else if (!last) last = time;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const active = visible.size > 0 && !preference.matches && document.visibilityState === 'visible';
      if (active && !frame) { last = 0; frame = requestAnimationFrame(tick); }
      if (!active) { cancelAnimationFrame(frame); frame = 0; last = 0; }
    };
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); }); sync(); });
    sketches.forEach(entry => observer.observe(entry.svg));
    preference.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, []);

  return <section className="knowledge-strip" ref={ref} aria-labelledby="knowledge-title">
    <div className="container">
      <header><div><span className="knowledge-kicker">TOÁN HỌC ĐANG CHUYỂN ĐỘNG</span><h2 id="knowledge-title">Từ công thức đến hình dung.</h2></div><span className="knowledge-caption">Một góc nhìn khác về những điều bạn học.</span></header>
      <div className="knowledge-track">{subjects.map((item, index) => <article className="concept-card" key={item.kind}>
        <span className="concept-number">0{index+1}</span><KnowledgeSketch kind={item.kind} step={1} />
        <Link to={item.to}><h3>{item.title}</h3><ArrowUpRight size={18} /></Link><p>{item.hint}</p>
      </article>)}</div>
    </div>
  </section>;
}
