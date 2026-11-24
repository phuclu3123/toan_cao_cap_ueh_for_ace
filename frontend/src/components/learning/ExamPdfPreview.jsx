import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { examPreviewData } from '../../data/examPreviewData';
import '../../assets/styles/Document.css';

const PdfReader = lazy(() => import('../documents/PdfReader'));

export default function ExamPdfPreview({ exam, onClose }) {
  const dialogRef = useRef(null);
  const source = examPreviewData[exam.id];
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; queueMicrotask(() => { if (trigger?.isConnected) trigger.focus({preventScroll:true}); }); };
  }, []);
  return <dialog className="exam-pdf-dialog" ref={dialogRef} aria-labelledby="exam-preview-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><div><span>ĐỌC ĐỀ GỐC · PDF</span><h2 id="exam-preview-title">{exam.title}</h2></div><button type="button" onClick={onClose} aria-label="Đóng bản xem trước"><X size={21}/></button></header>
    <div className="exam-pdf-dialog-body"><Suspense fallback={<p className="exam-preview-loading" role="status">Đang mở đề gốc…</p>}><PdfReader url={source.pdf} title={exam.title} initialPage={source.page} initialLayout="1"/></Suspense></div>
    <footer><span>Xem trước nội dung, rồi bắt đầu lượt luyện của bạn.</span><Link to={`/exam/${exam.id}`} onClick={onClose}>Làm đề này <ArrowRight size={17}/></Link></footer>
  </dialog>;
}
