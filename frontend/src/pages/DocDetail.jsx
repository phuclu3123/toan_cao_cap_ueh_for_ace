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
  const hasFile = Boolean(doc.pdf || doc.externalUrl) && doc.sourceStatus !== 'pending';
  const url = doc.externalUrl || encodeURI(`/docs/${doc.pdf}`);
  const extension = (doc.pdf || '').split('.').pop()?.toUpperCase() || 'PDF';

  return <div className="document-workspace">
    <header className="document-heading">
      <Link to="/resources?category=all" className="document-back"><ArrowLeft size={17} /> {language === 'vi' ? 'Thư viện' : 'Library'}</Link>
      <div className="document-title-row">
        <div><span className="document-eyebrow">α∫M4A / {extension}</span><h1 title={doc.title}>{resourceTitle(doc)}</h1></div>
        {hasFile && <a href={url} download className="document-download"><Download size={17} /> {language === 'vi' ? 'Tải bản gốc' : 'Download'}</a>}
      </div>
      <div className="document-meta"><span><Calendar size={14} /> {formatResourceDate(doc)}</span>{doc.categoryLabel && <span>{doc.categoryLabel}</span>}{Number.isSafeInteger(resource.views) && <span>{formatViewCount(resource.views)} lượt mở</span>}</div>
    </header>
    {extension === 'PDF' && doc.pdf ? <Suspense fallback={<div className="document-reader-loading" role="status">Đang mở trình đọc…</div>}><PdfReader key={id} url={url} title={doc.title} /></Suspense> : <div className="document-file"><FileText size={42} /><h2>{doc.sourceStatus === 'pending' ? 'Đang bổ sung bản gốc' : doc.title}</h2><p>{doc.desc}</p>{hasFile && <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Mở tài liệu <ArrowUpRight size={18} /></a>}</div>}
    {related.length > 0 && <section className="document-related" aria-label="Tài liệu khác">
      <h2>{language === 'vi' ? 'Đọc tiếp' : 'More to read'}</h2>
      <div>{related.map(item => <Link key={item.id} to={`/document/${item.id}`} title={item.title}><FileText size={21} /><span>{resourceTitle(item)}</span><ArrowUpRight size={16} /></Link>)}</div>
    </section>}
  </div>;
}
