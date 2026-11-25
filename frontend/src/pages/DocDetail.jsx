import { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Download, FileText, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { documentsData, midtermExams, finalExams } from '../data/documentsData';
import { API_BASE_URL } from '../config';
import { formatResourceDate } from '../utils/resourceDate';
import { mergeResourceItems } from '../utils/resourceMerge';
import { incrementViewCount, formatViewCount } from '../utils/viewCounter';
import { resourceTitle } from '../utils/resourceTitle';
import { LanguageContext } from '../App';
import BrandLoader from '../components/ui/BrandLoader';
import NotFoundPage from './NotFoundPage';
import '../assets/styles/Document.css';

const PdfReader = lazy(() => import('../components/documents/PdfReader'));

export default function DocDetail() {
  const { language } = useContext(LanguageContext);
  const { id } = useParams();
  const [resource, setResource] = useState({ id: '', doc: null, related: [] });
  const [selection, setSelection] = useState({ resourceId: '', fileId: '' });
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let active = true;
    const loadResource = async () => {
      let items = [...documentsData, ...midtermExams, ...finalExams];
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources`, { signal: controller.signal });
        const data = await response.json();
        if (response.ok && data.success && data.resources) {
          items = [
            ...mergeResourceItems(data.resources.documentsData || [], documentsData),
            ...mergeResourceItems(data.resources.midtermExams || [], midtermExams),
            ...mergeResourceItems(data.resources.finalExams || [], finalExams)
          ];
        }
      } catch { /* Bundled publications remain readable while the API is unavailable. */ }
      finally { clearTimeout(timer); }
      if (active) {
        const doc = items.find(item => item.id === id);
        setResource({ id, doc, views: null, related: items.filter(item => item.id !== id && item.pdf && !item.externalUrl).slice(0, 4) });
        if (doc) void incrementViewCount(id).then(views => { if (active) setResource(current => current.id === id ? { ...current, views } : current); });
      }
    };
    void loadResource();
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [id]);

  if (resource.id !== id) return <BrandLoader label={language === 'vi' ? 'Đang mở tài liệu' : 'Opening document'} />;
  if (!resource.doc) return <NotFoundPage />;
  const { doc, related } = resource;
  const files = doc.attachments || [];
  const file = files.find(item => selection.resourceId === id && item.id === selection.fileId) || files[0] || doc;
  const hasFile = Boolean(file.pdf || file.externalUrl) && doc.sourceStatus !== 'pending';
  const url = file.externalUrl || encodeURI(`/docs/${file.pdf}`);
  const extension = (file.pdf || '').split('.').pop()?.toUpperCase() || 'PDF';
  const title = file.title || doc.title;
  const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(extension);

  return <div className="document-workspace">
    <header className="document-heading">
      <Link to={files.length?'/exams#midterm-exams':'/resources?category=all'} className="document-back"><ArrowLeft size={17} /> {files.length?'Đề giữa kỳ':language === 'vi' ? 'Thư viện' : 'Library'}</Link>
      <div className="document-title-row">
        <div><span className="document-eyebrow">α∫M4A / {extension}</span><h1 title={doc.title}>{resourceTitle(doc)}</h1></div>
        {hasFile && <a href={url} download className="document-download"><Download size={17} /> {language === 'vi' ? `Tải ${extension}` : 'Download'}</a>}
      </div>
      <div className="document-meta"><span><Calendar size={14} /> {formatResourceDate(doc)}</span>{doc.categoryLabel && <span>{doc.categoryLabel}</span>}{Number.isSafeInteger(resource.views) && <span>{formatViewCount(resource.views)} lượt mở</span>}</div>
    </header>
    {files.length>0 && <section className="document-collection" aria-label="Chọn đề và lời giải"><header><h2>{files.length} tài liệu trong bộ</h2><p>Chọn một đề hoặc lời giải để mở ngay bên dưới.</p></header><div className="document-file-list">{files.map((item,index)=><button type="button" key={item.id} aria-pressed={item.id===file.id} onClick={()=>setSelection({resourceId:id,fileId:item.id})}><span>{String(index+1).padStart(2,'0')}</span><span><strong>{item.title}</strong><small>{item.kind==='solution'?'Lời giải / đính chính':item.kind==='practice'?'Bài tập tham khảo':'Đề và tài liệu ôn tập'}{item.pages?` · ${item.pages} trang`:''}{item.cohort?` · ${item.cohort}`:''}</small></span><ArrowUpRight size={17}/></button>)}</div></section>}
    {files.length>0 && <div className="document-active-file"><h2>{title}</h2>{file.original && <a href={encodeURI(`/docs/${file.original}`)} download><Download size={15}/> Tải Word gốc</a>}</div>}
    {(file.note || doc.note) && <p className="document-source-note">{file.note || doc.note}</p>}
    {extension === 'PDF' && file.pdf ? <Suspense fallback={<div className="document-reader-loading" role="status">Đang mở trình đọc…</div>}><PdfReader key={`${id}:${file.id || 'main'}`} url={url} title={title} /></Suspense> : isImage && hasFile ? <figure className="document-source-image"><img src={url} alt={title} /><figcaption>{title}</figcaption></figure> : <div className="document-file"><FileText size={42} /><h2>{doc.sourceStatus === 'pending' ? 'Đang bổ sung bản gốc' : title}</h2><p>{doc.desc}</p>{hasFile && <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Mở tài liệu <ArrowUpRight size={18} /></a>}</div>}
    {related.length > 0 && <section className="document-related" aria-label="Tài liệu khác">
      <h2>{language === 'vi' ? 'Đọc tiếp' : 'More to read'}</h2>
      <div>{related.map(item => <Link key={item.id} to={`/document/${item.id}`} title={item.title}><FileText size={21} /><span>{resourceTitle(item)}</span><ArrowUpRight size={16} /></Link>)}</div>
    </section>}
  </div>;
}
