import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ArrowDownToLine, ArrowUpRight, ChevronLeft, ChevronRight, Expand, Maximize, Minimize, Minus, Plus, RotateCw } from 'lucide-react';
import 'pdfjs-dist/web/pdf_viewer.css';

GlobalWorkerOptions.workerSrc = workerUrl;

function PdfSheet({ pdf, number, width, zoom, rotation, onReadPage, onNavigate }) {
  const canvasRef = useRef(null), textRef = useRef(null), hostRef = useRef(null);
  const [state, setState] = useState({ ready: false, error: '' });
  const [links, setLinks] = useState([]);
  useEffect(() => {
    let active = true, rendering, layer;
    const render = async () => {
      try {
        const page = await pdf.getPage(number);
        if (!active) return;
        const unit = page.getViewport({ scale: 1, rotation });
        const scale = width * zoom / unit.width;
        const viewport = page.getViewport({ scale, rotation });
        // Bound bitmap memory even on large displays or at high zoom.
        const density = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(5_000_000 / (viewport.width * viewport.height)));
        const canvas = canvasRef.current, text = textRef.current;
        canvas.width = Math.floor(viewport.width * density); canvas.height = Math.floor(viewport.height * density);
        canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
        hostRef.current.style.setProperty('--scale-factor', scale);
        hostRef.current.style.setProperty('--total-scale-factor', scale);
        text.replaceChildren();
        rendering = page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: [density, 0, 0, density, 0, 0] });
        await rendering.promise;
        if (!active) return;
        layer = new TextLayer({ textContentSource: page.streamTextContent(), container: text, viewport });
        await layer.render();
        if (active) { hostRef.current.dataset.renderedPage = String(number); setState({ ready: true, error: '' }); }
        // Retain links and contents-page destinations from the original PDF.
        // Annotation actions and scripts are deliberately not executed.
        const annotations = await page.getAnnotations({ intent: 'display' }).catch(() => []);
        if (active) setLinks(annotations.filter(item => item.subtype === 'Link' && item.rect && (item.dest || /^(https?:|mailto:)/i.test(item.url || ''))).map(item => {
          const [x1, y1] = viewport.convertToViewportPoint(item.rect[0], item.rect[1]);
          const [x2, y2] = viewport.convertToViewportPoint(item.rect[2], item.rect[3]);
          return { id: item.id, url: item.url, dest: item.dest, label: item.overlaidText, style: { left: Math.min(x1,x2), top: Math.min(y1,y2), width: Math.abs(x2-x1), height: Math.abs(y2-y1) } };
        }));
      } catch (failure) {
        if (active && !['RenderingCancelledException', 'AbortException'].includes(failure.name)) setState({ ready: false, error: 'Trang này chưa tải được. Hãy thử lại tài liệu.' });
      }
    };
    void render();
    return () => { active = false; rendering?.cancel(); layer?.cancel(); };
  }, [pdf, number, width, zoom, rotation]);
  return <article className="pdf-page-tile" style={{ width: width * zoom }}>
    <div className="pdf-sheet" ref={hostRef}>
      {!state.ready && !state.error && <div className="pdf-page-loading" role="status">Đang mở trang {number}…</div>}
      {state.error && <div className="pdf-page-error" role="alert">{state.error}</div>}
      <canvas ref={canvasRef} aria-label={`Trang ${number}`} />
      <div ref={textRef} className="textLayer" />
      <div className="pdf-link-layer">{links.map(link => link.dest
        ? <button key={link.id} type="button" style={link.style} aria-label={link.label ? `Đến ${link.label}` : 'Đến vị trí trong PDF'} onClick={() => onNavigate(link.dest)} />
        : <a key={link.id} href={link.url} style={link.style} target="_blank" rel="noopener noreferrer" aria-label={`Mở liên kết: ${link.url}`} title={link.url} />)}</div>
    </div>
    <div className="pdf-page-caption"><span>Trang {number}</span><button type="button" onClick={() => onReadPage(number)} aria-label={`Đọc riêng trang ${number}`} title="Đọc riêng trang này"><Expand size={13} /> Đọc riêng</button></div>
  </article>;
}

export default function PdfReader({ url, title, initialPage = 1, initialLayout = 'auto' }) {
  const firstPage = Math.max(1, Math.floor(Number(initialPage)) || 1);
  const hostRef = useRef(null), stageRef = useRef(null);
  const [pdf, setPdf] = useState(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const [width, setWidth] = useState(0), [page, setPage] = useState(firstPage), [pageInput, setPageInput] = useState(String(firstPage));
  const [layout, setLayout] = useState(initialLayout), [zoom, setZoom] = useState(1), [rotation, setRotation] = useState(0), [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const autoColumns = Math.max(1, Math.min(5, Math.floor((width - 40) / 350)));
  const maxColumns = width < 700 ? 1 : 5;
  const columns = Math.min(maxColumns, layout === 'auto' ? autoColumns : Number(layout));
  const pageWidth = Math.max(180, (width - 48 - (columns-1)*20) / columns);
  const end = pdf ? Math.min(pdf.numPages, page + columns - 1) : page;
  const pages = pdf ? Array.from({ length: end-page+1 }, (_, i) => page+i) : [];

  useEffect(() => {
    let resizeTimer, initialized = false;
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.floor(entry.contentRect.width);
      clearTimeout(resizeTimer);
      if (!initialized) { setWidth(nextWidth); initialized = true; }
      else resizeTimer = setTimeout(() => setWidth(nextWidth), 100);
    });
    observer.observe(stageRef.current);
    const handleFullscreen = () => setFullscreen(document.fullscreenElement === hostRef.current);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => { clearTimeout(resizeTimer); observer.disconnect(); document.removeEventListener('fullscreenchange', handleFullscreen); };
  }, []);
  useEffect(() => {
    let active = true;
    const task = getDocument({ url });
    const timeout = setTimeout(() => {
      if (active) { setError('Tài liệu tải lâu hơn bình thường. Bạn có thể thử lại hoặc mở bản gốc.'); void task.destroy(); }
    }, 25000);
    task.promise.then(document => { if (active) { setPdf(document); setPage(value=>Math.min(document.numPages,value)); setPageInput(value=>String(Math.min(document.numPages,Number(value)||1))); } }).catch(failure => {
      if (active) setError(failure.name === 'PasswordException' ? 'Tài liệu cần mật khẩu. Hãy mở bản gốc.' : 'Chưa mở được PDF. Hãy thử lại hoặc tải bản gốc.');
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); void task.destroy(); };
  }, [url, retry]);

  const handlePage = value => {
    if (!pdf) return;
    const next = Math.min(pdf.numPages, Math.max(1, Math.floor(Number(value)) || 1));
    setPage(next); setPageInput(String(next)); stageRef.current.scrollTo({ top: 0, left: 0 });
  };
  const handleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await hostRef.current.requestFullscreen(); }
    catch { setNotice('Chưa bật được toàn màn hình. Bạn vẫn có thể đọc tại đây.'); }
  };
  const handleDestination = async destination => {
    try {
      const target = typeof destination === 'string' ? await pdf.getDestination(destination) : destination;
      if (!Array.isArray(target) || !target.length) return;
      const index = typeof target[0] === 'number' ? target[0] : await pdf.getPageIndex(target[0]);
      handlePage(index + 1);
    } catch { setNotice('Chưa tìm được trang liên kết. Bạn có thể nhập số trang để tiếp tục.'); }
  };
  return <section className="pdf-reader" ref={hostRef} aria-label={`Đọc ${title}`}>
    <div className="pdf-toolbar">
      <div className="pdf-page-controls">
        <button type="button" title="Nhóm trang trước" aria-label="Nhóm trang trước" disabled={!pdf || page <= 1} onClick={() => handlePage(page-columns)}><ChevronLeft size={18} /></button>
        <form onSubmit={event => { event.preventDefault(); handlePage(pageInput); }}><label className="sr-only" htmlFor="pdf-page-number">Đến trang</label><input id="pdf-page-number" type="number" min="1" max={pdf?.numPages || 1} value={pageInput} onChange={event => setPageInput(event.target.value)} onBlur={() => handlePage(pageInput)} disabled={!pdf} /><span>{end > page ? `– ${end}` : ''} / {pdf?.numPages || '—'}</span></form>
        <button type="button" title="Nhóm trang sau" aria-label="Nhóm trang sau" disabled={!pdf || end >= pdf.numPages} onClick={() => handlePage(page+columns)}><ChevronRight size={18} /></button>
      </div>
      <div className="pdf-display-controls"><label htmlFor="pdf-layout">Hiển thị</label><select id="pdf-layout" value={layout} onChange={event => { setLayout(event.target.value); setZoom(1); }}><option value="auto">Tự động · {autoColumns} trang</option>{Array.from({length:maxColumns},(_,i) => <option value={String(i+1)} key={i}>{i+1} trang</option>)}</select></div>
      <div className="pdf-zoom-controls"><button type="button" title="Thu nhỏ" aria-label="Thu nhỏ" disabled={zoom <= .5} onClick={() => setZoom(value => Math.max(.5,value-.25))}><Minus size={17} /></button><button type="button" className="pdf-zoom-reset" title="Vừa khung" aria-label="Vừa khung" onClick={() => setZoom(1)}>{Math.round(zoom*100)}%</button><button type="button" title="Phóng to" aria-label="Phóng to" disabled={zoom >= 2.5} onClick={() => setZoom(value => Math.min(2.5,value+.25))}><Plus size={17} /></button><button type="button" title="Xoay trang" aria-label="Xoay trang" onClick={() => setRotation(value => (value+90)%360)}><RotateCw size={17} /></button></div>
      <div className="pdf-file-controls"><a href={url} target="_blank" rel="noopener noreferrer" aria-label="Mở bản gốc" title="Mở bản gốc"><ArrowUpRight size={18} /></a><a href={url} download aria-label="Tải tài liệu" title="Tải tài liệu"><ArrowDownToLine size={18} /></a>{document.fullscreenEnabled && <button type="button" title="Toàn màn hình" aria-label="Toàn màn hình" onClick={handleFullscreen}>{fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}</button>}</div>
    </div>
    <div className="pdf-stage" ref={stageRef} tabIndex={0} aria-label="Các trang PDF. Dùng phím trái hoặc phải để chuyển nhóm trang." onKeyDown={event => { if (event.target === event.currentTarget && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); handlePage(page+(event.key === 'ArrowRight' ? columns : -columns)); } }}>
      {!pdf && !error && <div className="pdf-load-desk" role="status"><FilePlaceholder /><strong>Đang mở tài liệu…</strong></div>}
      {error && <div className="pdf-load-desk pdf-error" role="alert"><p>{error}</p><div><button type="button" onClick={() => { setPdf(null); setError(''); setRetry(value => value+1); }}>Thử lại</button><a href={url} target="_blank" rel="noopener noreferrer">Mở bản gốc</a></div></div>}
      {pdf && !error && width > 0 && <div className="pdf-pages" style={{ gridTemplateColumns: `repeat(${columns}, ${pageWidth*zoom}px)`, width: columns*pageWidth*zoom+(columns-1)*20 }}>
        {pages.map(number => <PdfSheet key={`${number}:${zoom}:${rotation}:${pageWidth}`} pdf={pdf} number={number} width={pageWidth} zoom={zoom} rotation={rotation} onNavigate={handleDestination} onReadPage={value => { setLayout('1'); setZoom(1); handlePage(value); }} />)}
      </div>}
    </div>
    {notice && <p className="pdf-reader-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>Đóng</button></p>}
    <div className="pdf-reader-footnote"><span>{pdf ? `Trang ${page}${end > page ? `–${end}` : ''} trên ${pdf.numPages}` : 'PDF'} · Chọn chữ để sao chép</span><span>Dùng ← → để chuyển trang</span></div>
  </section>;
}

function FilePlaceholder() {
  return <svg viewBox="0 0 100 120" width="62" height="74" aria-hidden="true"><path d="M16 4H66L86 24V114H16Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M66 4V24H86M30 47H72M30 63H72M30 79H58" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
}
