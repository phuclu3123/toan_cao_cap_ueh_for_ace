import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { blogPosts } from '../../data/blogPosts';
import { formatResourceDate, sortResourcesByNewest } from '../../utils/resourceDate';
import { createScrollArrival } from '../../utils/scrollArrival';
import '../../assets/styles/HomeArticleDeck.css';

const posts = sortResourcesByNewest(blogPosts);

export default function HomeArticleDeck() {
  const [active, setActive] = useState(0);
  const drag = useRef(null);
  const stageRef = useRef(null);
  const watermarkRef = useRef(null);
  const suppressClick = useRef(false);
  const releaseEntry = useRef(null);
  const count = posts.length;
  const settleEntry = () => { stageRef.current?.style.setProperty('--deck-entry','0px');releaseEntry.current?.(); };
  const select = index => { settleEntry();setActive((index + count) % count); };

  // Cards and watermark arrive separately, smoothly following the native scroll.
  useEffect(() => {
    const cards=createScrollArrival(stageRef.current,'--deck-entry',{travel:.38,end:.25,smoothing:260});
    const watermark=createScrollArrival(watermarkRef.current,'--watermark-entry',{travel:.22,end:.5,smoothing:300});
    releaseEntry.current=cards.settle;
    return ()=>{cards.dispose();watermark.dispose();releaseEntry.current=null;};
  },[]);

  // Keep vertical touch scrolling native; horizontal intent changes the card.
  const handlePointerDown = event => {
    settleEntry();
    if (event.button !== 0 || event.target.closest('a')) return;
    drag.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
    suppressClick.current = false;
  };
  const handlePointerMove = event => {
    if (!drag.current || drag.current.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
    suppressClick.current = true;
    stageRef.current?.setPointerCapture(event.pointerId);
    stageRef.current?.style.setProperty('--deck-drag', `${Math.max(-100,Math.min(100,dx))*.45}px`);
  };
  const handlePointerEnd = event => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    if (event.type !== 'pointercancel' && suppressClick.current && Math.abs(dx) > 45) select(active + (dx < 0 ? 1 : -1));
    if (stageRef.current?.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId);
    stageRef.current?.style.setProperty('--deck-drag','0px');
    drag.current = null;
  };
  const handleKeyDown = event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? count-1 : active + (event.key === 'ArrowRight' ? 1 : -1));
  };

  return <section className="home-article-deck" aria-labelledby="hp-journal-title">
    <div className="container">
      <header className="hp-section-heading hp-reveal"><div><span className="hp-kicker">GÓC ĐỌC α∫M4A</span><h2 id="hp-journal-title">Lật mở một góc nhìn mới.</h2></div><Link className="hp-text-link" to="/blog">Tất cả bài viết <ArrowUpRight size={18}/></Link></header>
    </div>
    <div className="article-deck-stage" ref={stageRef} role="region" aria-roledescription="carousel" aria-label="Bài viết α∫M4A, dùng phím mũi tên để chọn" tabIndex={0} onFocusCapture={settleEntry} onKeyDown={handleKeyDown} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
      <div className="article-deck-backdrop paper-surface" data-paper="sky" aria-hidden="true"/>
      <div className="article-deck-cards">{posts.map((post,index)=>{
        let offset = (index-active+count)%count;
        if (offset > count/2) offset -= count;
        const distance = Math.abs(offset), current = index === active;
        return <article className={`article-deck-card${current ? ' is-current' : ''}`} key={post.slug} style={{'--offset':offset,'--distance':distance,'--side':Math.sign(offset),zIndex:count-distance}} aria-label={`${index+1} / ${count}`}>
          <div className="article-deck-card-content" inert={!current} aria-hidden={!current}>
            <div className="article-deck-meta"><span>{post.category}</span><time>{formatResourceDate(post)}</time></div>
            <div className="article-deck-image"><img src={post.image} alt="" loading="lazy" draggable="false"/></div>
            <h3><Link to={`/blog/${post.slug}`}>{post.shortTitle || post.title}</Link></h3>
            <p>{post.excerpt || post.description}</p>
            <Link className="article-deck-read" to={`/blog/${post.slug}`}>Đọc bài viết <ArrowUpRight size={18}/></Link>
          </div>
          {!current && <button type="button" className="article-deck-select" aria-label={`Chọn bài: ${post.shortTitle || post.title}`} tabIndex={-1} onClick={()=>{if (!suppressClick.current) select(index); suppressClick.current=false;}}/>}
        </article>;
      })}</div>
    </div>
    <div className="article-deck-watermark" ref={watermarkRef} aria-hidden="true">GÓC ĐỌC</div>
    <div className="container article-deck-controls"><span className="article-deck-status" aria-live="polite" aria-atomic="true"><strong>{String(active+1).padStart(2,'0')}</strong> / {String(count).padStart(2,'0')}<span className="article-deck-sr-only"> — {posts[active]?.shortTitle || posts[active]?.title}</span></span><div className="article-deck-dots" aria-label="Chọn bài viết">{posts.map((post,index)=><button key={post.slug} type="button" aria-label={`Bài ${index+1}: ${post.shortTitle || post.title}`} aria-current={index===active ? 'true' : undefined} onClick={()=>select(index)}/>)}</div><div className="article-deck-arrows"><button type="button" aria-label="Bài viết trước" onClick={()=>select(active-1)}><ArrowLeft size={19}/></button><button type="button" aria-label="Bài viết tiếp theo" onClick={()=>select(active+1)}><ArrowRight size={19}/></button></div></div>
  </section>;
}
