import { useEffect, useRef, useState } from 'react';
import CharacterDoodles from './CharacterDoodles';
import EverydayDoodles from './EverydayDoodles';
import CollectibleArtwork from './CollectibleArtwork';

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ring = (radius, y, count = 28) => Array.from({ length: count + 1 }, (_, i) => [radius * Math.cos(i / count * TAU), y, radius * Math.sin(i / count * TAU)]);
const cube = Array.from({ length: 8 }, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
const octa = [[1.35, 0, 0], [-1.35, 0, 0], [0, 1.35, 0], [0, -1.35, 0], [0, 0, 1.35], [0, 0, -1.35]];
const phi = (1 + Math.sqrt(5)) / 2;
const icosa = [[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[phi,0,-1],[-phi,0,1],[-phi,0,-1]].map(point => point.map(value => value * .75));
const edges = (points, length) => points.flatMap((a, i) => points.slice(i + 1).filter(b => Math.abs(Math.hypot(...a.map((v, axis) => v - b[axis])) - length) < .01).map(b => [a, b]));
const star = Array.from({ length: 10 }, (_, i) => [Math.cos(i/10*TAU-Math.PI/2)*(i%2 ? .58 : 1.4), Math.sin(i/10*TAU-Math.PI/2)*(i%2 ? .58 : 1.4), -.22]);
const planet = [ring(1,0), ...[0,.8,1.6].map(angle => ring(1,0).map(([x,,z]) => [x*Math.cos(angle),z,x*Math.sin(angle)])), ring(1.6,0).map(([x,,z]) => [x,z*.32,z*.94])];
const meshes = {
  prism: [ring(1,-.8,3),ring(1,.8,3),...ring(1,-.8,3).slice(0,3).map(([x,y,z])=>[[x,y,z],[x,.8,z]])],
  cube: edges(cube, 2),
  sphere: [ring(1.3, 0), ring(1.1, -.7), ring(1.1, .7), ...[0, .6, 1.2, 1.8, 2.4].map(angle => ring(1.3, 0).map(([x, , z]) => [x * Math.cos(angle), z, x * Math.sin(angle)]))],
  octa: edges(octa, Math.sqrt(2) * 1.35),
  tetra: edges([[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]], Math.sqrt(8)),
  icosa: edges(icosa, 1.5),
  cylinder: [ring(1,-.9),ring(1,.9), ...ring(1,-.9,8).slice(0,8).map(([x,y,z]) => [[x,y,z],[x,.9,z]])],
  cone: [ring(1.2,.9), ...ring(1.2,.9,9).slice(0,9).map(point => [point,[0,-1.4,0]])],
  helix: [Array.from({length:100},(_,i) => [Math.cos(i/99*TAU*3),i/99*2.8-1.4,Math.sin(i/99*TAU*3)])],
  planet,
  star: [[...star,star[0]], [...star.map(([x,y]) => [x,y,.22]),[star[0][0],star[0][1],.22]], ...star.map(([x,y,z]) => [[x,y,z],[x,y,.22]])],
  paperplane: [[[0,-1.3,0],[-1.4,1,.15],[0,.45,.7],[1.4,1,.15],[0,-1.3,0],[0,.45,.7],[0,1.35,0],[.5,.75,.3]]],
  diamond: [ring(1,0,6),ring(.65,-.65,6), ...ring(1,0,6).slice(0,6).flatMap((p,i) => [[p,[0,1.5,0]],[p,ring(.65,-.65,6)[i]]])],
  torus: Array.from({ length: 10 }, (_, i) => ring(1, 0).map(([x, , z]) => {
    const angle = i / 10 * TAU;
    return [(1 + .4 * x) * Math.cos(angle), .4 * z, (1 + .4 * x) * Math.sin(angle)];
  })).concat(Array.from({ length: 5 }, (_, i) => ring(1 + .4 * Math.cos(i / 5 * TAU), .4 * Math.sin(i / 5 * TAU)))),
};

function PlayfulDrawing({ kind }) {
  if (['ronaldo','faker','rambo','jupiter','lexus'].includes(kind)) return <CollectibleArtwork kind={kind}/>;
  if (['mcqueen','woody','buzz','lotso'].includes(kind)) return <CharacterDoodles kind={kind}/>;
  if (['bunbo','banhxeo'].includes(kind)) return <EverydayDoodles kind={kind}/>;
  if (kind === 'ufo') return <g><ellipse cx="90" cy="95" rx="64" ry="20" /><path d="M53 89Q57 32 90 35Q123 32 127 89M29 95Q90 146 151 95M54 124l-14 25M126 124l14 25M90 131v27" /><circle cx="66" cy="99" r="3" /><circle cx="90" cy="104" r="3" /><circle cx="114" cy="99" r="3" /><path d="M90 35V23m-6-6 6 6 6-6" /></g>;
  if (kind === 'heart') return <g><path d="M90 144C-13 79 40 13 90 56C140 13 193 79 90 144ZM90 144C58 92 48 68 61 47M90 144c32-52 42-76 29-97M38 81q52 24 104 0M51 110q39 16 78 0" /></g>;
  if (kind === 'vinyl') return <g><circle cx="90" cy="90" r="62" /><circle cx="90" cy="90" r="48" /><circle cx="90" cy="90" r="42" /><circle cx="90" cy="90" r="22" /><circle cx="90" cy="90" r="4" /><path d="M40 62a58 58 0 0 1 35-27M105 145a58 58 0 0 0 35-27M88 75l14-3v20q-9-6-10 3m-4-20v24q-9-6-10 3" /></g>;
  if (kind === 'rocket') return <g><path d="M90 22Q51 49 63 112l27 16 27-16Q129 49 90 22ZM63 81l-25 29v26l30-20M117 81l25 29v26l-30-20M80 132l-4 25m14-21v28m10-32 4 25M73 55h34" /><circle cx="90" cy="78" r="13" /></g>;
  if (kind === 'daisy') return <g><path d="M90 67C33 9 12 71 66 90C9 147 71 168 90 114C147 171 168 109 114 90C171 33 109 12 90 67ZM75 69C73 4 123 4 105 69M111 75c65-2 65 48 0 30M105 111c2 65-48 65-30 0M69 105c-65 2-65-48 0-30" /><circle cx="90" cy="90" r="19" /><path d="M82 87v3m16-3v3m-17 7q9 8 18 0" /></g>;
  if (kind === 'cassette') return <g><rect x="24" y="43" width="132" height="95" rx="14" /><rect x="37" y="57" width="106" height="43" rx="7" /><circle cx="62" cy="79" r="11" /><circle cx="118" cy="79" r="11" /><path d="M73 73h34M73 85h34M49 138l10-25h62l10 25M58 79h8m-4-4v8m52-4h8m-4-4v8M37 124h3m100 0h3" /></g>;
  if (kind === 'cursor') return <g><path d="M53 28l83 76-42 6-19 39-22-121ZM94 110l18 38 18-9-20-32M30 36l-10-7m18-5-4-13m22 0 5-9M34 54l-15 2" /></g>;
  return null;
}

function drawMesh(mesh, angle) {
  const project = ([x, y, z]) => {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = z * Math.cos(angle) - x * Math.sin(angle);
    const ry = y * Math.cos(.4) - rz * Math.sin(.4);
    const depth = 5 / (5 + y * Math.sin(.4) + rz * Math.cos(.4));
    return `${(90 + rx * 43 * depth).toFixed(2)},${(90 + ry * 43 * depth).toFixed(2)}`;
  };
  return mesh.map(line => line.map((point, index) => `${index ? 'L' : 'M'}${project(point)}`).join('')).join('');
}

/** A tiny projected wireframe, with bounded drag and damped release physics. */
export default function GeometryToy({ figure, field, reducedMotion }) {
  const buttonRef = useRef(null);
  const pathRef = useRef(null);
  const dragRef = useRef(null);
  const effects = useRef(new Set());
  const lastTrail = useRef(0);
  const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0, dx: 0, dy: 0, time: figure.row * 2.7 + (figure.side === 'right' ? 2 : 0), angle: .55 + figure.row * .5, collisionAt: -3000 });
  const [held, setHeld] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const mesh = meshes[figure.kind];

  const applyPosition = () => {
    const node = buttonRef.current;
    const state = motion.current;
    const width = node.parentElement.clientWidth;
    const limitX = Math.max(0, (width - node.offsetWidth) / 2 - 8);
    state.x = clamp(state.x, -limitX - state.dx, limitX - state.dx);
    state.y = clamp(state.y, -figure.row * 220 + 10 - state.dy, node.parentElement.clientHeight - node.offsetHeight - figure.row * 220 - 12 - state.dy);
    node.style.setProperty('--toy-x', `${state.x.toFixed(2)}px`);
    node.style.setProperty('--toy-y', `${state.y.toFixed(2)}px`);
  };

  const trackEffect = animation => {
    effects.current.add(animation);
    animation.finished.catch(() => {}).finally(() => effects.current.delete(animation));
  };
  const breakApart = () => {
    if (reducedMotion) return;
    const node = buttonRef.current;
    node.dataset.collision = String(performance.now());
    const parts = node.querySelectorAll('svg > g > *');
    parts.forEach((part, index) => {
      const angle = index * 2.4;
      trackEffect(part.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: `translate(${Math.cos(angle)*22}px,${Math.sin(angle)*22}px) rotate(${index%2 ? 22 : -22}deg)`, offset: .28 }, { transform: 'translate(0,0) rotate(0deg)' }], { duration: 950, easing: 'cubic-bezier(.22,1,.36,1)' }));
    });
    trackEffect(node.querySelector('.qa-geometry-halo').animate([{ transform:'scale(.7)',opacity:.5 },{ transform:'scale(1.8)',opacity:0 }],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'}));
  };
  const resolveCollisions = () => {
    const state = motion.current, now = performance.now();
    if (now - state.collisionAt < 1100) return;
    for (const other of field.values()) {
      if (other.motion === motion || other.figure.side !== figure.side || now - other.motion.current.collisionAt < 1100) continue;
      const next = other.motion.current;
      const dx = next.x + next.dx - state.x - state.dx;
      const dy = other.figure.row * 220 + next.y + next.dy - (figure.row * 220 + state.y + state.dy);
      const distance = Math.hypot(dx,dy);
      if (distance >= 90) continue;
      const nx = distance > 1 ? dx / distance : 0, ny = distance > 1 ? dy / distance : 1;
      const separation = (92-distance)/2 + 12;
      state.collisionAt = now; next.collisionAt = now;
      if (!dragRef.current) { state.x -= nx*separation; state.y -= ny*separation; state.vx -= nx*120; state.vy -= ny*120; }
      if (!other.drag.current && !other.frozen()) { next.x += nx*separation; next.y += ny*separation; next.vx += nx*150; next.vy += ny*150; other.place(); }
      breakApart(); other.breakApart(); applyPosition();
    }
  };
  const emitTrail = () => {
    const now = performance.now();
    if (reducedMotion || now-lastTrail.current < 55) return;
    lastTrail.current = now;
    const node = buttonRef.current, ghost = node.querySelector('svg').cloneNode(true);
    ghost.setAttribute('class','qa-geometry-trail'); ghost.setAttribute('aria-hidden','true');
    ghost.style.left = `${node.offsetLeft}px`; ghost.style.top = `${node.offsetTop}px`;
    const transform = getComputedStyle(node).transform;
    ghost.style.transform = transform;
    node.parentElement.appendChild(ghost);
    const animation = ghost.animate([{opacity:.23,transform},{opacity:0,transform}],{duration:480,easing:'cubic-bezier(.16,1,.3,1)'});
    trackEffect(animation); animation.finished.catch(() => {}).finally(() => ghost.remove());
  };

  useEffect(() => {
    const key = `${figure.side}:${figure.row}`;
    field.set(key,{figure,motion,drag:dragRef,place:applyPosition,breakApart,frozen:() => buttonRef.current?.matches(':hover,:focus-visible')});
    const animations = effects.current;
    return () => { field.delete(key); animations.forEach(animation => animation.cancel()); };
    // The field contains stable refs; motion is updated without React renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field,figure,reducedMotion]);

  useEffect(() => {
    const node = buttonRef.current;
    let frame = 0, last = 0, visible = false;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const tick = now => {
      if (node.matches(':hover,:focus-visible') || dragRef.current) { last = now; frame = requestAnimationFrame(tick); return; }
      if (!last) last = now;
      const delta = now - last;
      if (delta >= 32) {
        const dt = Math.min(delta, 64) / 1000;
        const state = motion.current;
        state.time += dt;
        state.angle += dt * .14;
        state.x += state.vx * dt; state.y += state.vy * dt;
        state.vx *= Math.exp(-dt * 2.8); state.vy *= Math.exp(-dt * 2.8);
        const available = Math.max(0,(node.parentElement.clientWidth-node.offsetWidth)/2-12);
        state.dx = Math.sin(state.time*.31)*Math.min(available,42) + Math.sin(state.time*.53)*Math.min(available*.3,12);
        state.dy = Math.cos(state.time*.27)*64 + Math.sin(state.time*.43)*24;
        applyPosition();
        resolveCollisions();
        node.style.setProperty('--toy-drift-x', `${state.dx.toFixed(2)}px`);
        node.style.setProperty('--toy-drift-y', `${state.dy.toFixed(2)}px`);
        if (mesh) [...pathRef.current.children].forEach((path,index) => path.setAttribute('d',drawMesh([mesh[index]],state.angle)));
        else node.style.setProperty('--toy-tilt', `${Math.sin(state.time * .2) * 5}deg`);
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      stop();
      if (visible && !document.hidden && !reducedMotion && !held && !hovered && !focused) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    observer.observe(node);
    document.addEventListener('visibilitychange', sync);
    return () => { stop(); observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
    // Geometry is static configuration. Positions are refs, never a per-frame React render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesh, reducedMotion, held, hovered, focused]);

  // Pointer capture keeps dragging reliable when the pointer leaves the shape.
  const handlePointerDown = event => {
    if (event.button !== 0) return;
    const state = motion.current;
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: state.x, startY: state.y, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now() };
    state.vx = 0; state.vy = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
  };
  const handlePointerMove = event => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const state = motion.current, now = performance.now(), dt = Math.max(16, now - drag.lastTime) / 1000;
    state.x = drag.startX + event.clientX - drag.x; state.y = drag.startY + event.clientY - drag.y;
    state.vx = clamp((event.clientX - drag.lastX) / dt, -180, 180);
    state.vy = clamp((event.clientY - drag.lastY) / dt, -180, 180);
    drag.lastX = event.clientX; drag.lastY = event.clientY; drag.lastTime = now;
    emitTrail(); applyPosition(); resolveCollisions();
  };
  const handlePointerEnd = event => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    if (event.type === 'pointercancel' || performance.now() - drag.lastTime > 100) { motion.current.vx = 0; motion.current.vy = 0; }
    dragRef.current = null; setHeld(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    // Pointer focus should not freeze the toy after release; keyboard focus still does.
    if (!event.currentTarget.matches(':focus-visible')) { event.currentTarget.blur(); setFocused(false); }
  };
  const handleKeyDown = event => {
    const directions = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
    if (directions[event.key]) { event.preventDefault(); const [x, y] = directions[event.key]; motion.current.x += x; motion.current.y += y; applyPosition(); }
    if (event.key === 'Home' || event.key === 'Escape') { event.preventDefault(); motion.current.x = 0; motion.current.y = 0; applyPosition(); }
  };
  return <button ref={buttonRef} type="button" data-toy-kind={figure.kind} className={`qa-geometry-toy tone-${figure.tone || 'green'}${held ? ' is-held' : ''}`} style={{ '--toy-row': figure.row }}
    aria-label={`${figure.name}: kéo để di chuyển; phím mũi tên để di chuyển, Home để đặt lại`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}
    onLostPointerCapture={() => { dragRef.current = null; setHeld(false); }} onKeyDown={handleKeyDown} onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocus={event => setFocused(event.currentTarget.matches(':focus-visible'))} onBlur={() => setFocused(false)}>
    <span className="qa-geometry-halo" aria-hidden="true" />
    <svg viewBox="0 0 180 180" fill="none" aria-hidden="true">
      {mesh ? <g ref={pathRef}>{mesh.map((line,index) => <path key={index} d={drawMesh([line], .55 + figure.row * .5)} />)}</g> : !['curve','triangle'].includes(figure.kind) ? <PlayfulDrawing kind={figure.kind} /> : figure.kind === 'curve' ? <g>
        <path d="M20 140H164M80 165V18M158 136l6 4-6 4M76 24l4-6 4 6M28 32Q80 236 136 32" />
        <path d="M38 143l95-73M108 106v34" strokeDasharray="3 5" /><circle cx="108" cy="106" r="3" />
        <text x="150" y="158">x</text><text x="91" y="27">y</text>
      </g> : <g>
        <circle cx="90" cy="90" r="67" strokeDasharray="3 5" /><path d="M39 133l27-108 88 88-115 20ZM66 25l24 65 64 23M39 133l51-43" />
        <circle cx="90" cy="90" r="2" /><text x="60" y="17">A</text><text x="24" y="150">B</text><text x="157" y="124">C</text>
      </g>}
    </svg>
    <span className="qa-geometry-caption">{figure.name}<small>{held ? 'Thả để đặt hình' : 'Kéo để khám phá'}</small></span>
  </button>;
}
