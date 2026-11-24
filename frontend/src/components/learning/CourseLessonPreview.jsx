import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Maximize2, X } from 'lucide-react';
import { courseNotesPreviews } from '../../data/courseNotesPreviews';

function NotesPage({ page, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; queueMicrotask(()=>{ if(trigger?.isConnected) trigger.focus({preventScroll:true}); }); };
  }, []);
  return <dialog ref={dialogRef} className="course-notes-dialog" aria-labelledby="course-notes-title" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <header><div><span>GHI CHÉP VIẾT TAY · TRANG {page.page}</span><h2 id="course-notes-title">{page.title}</h2></div><button type="button" onClick={onClose} aria-label="Đóng trang ghi chép"><X size={21}/></button></header>
    <div className="course-notes-page"><img src={page.fullPage} alt={`Toàn bộ trang ${page.page}, ghi chép ${page.title}`} width="1516" height="2144"/></div>
  </dialog>;
}

export default function CourseLessonPreview() {
  const [selected, setSelected] = useState(0);
  const [showPage, setShowPage] = useState(false);
  const current = courseNotesPreviews[selected];
  // Change the preview and its original-page target together.
  const handleSelectPreview = index => setSelected(index);
  // Open the exact source page; no video or lesson is substituted for these notes.
  const handleOpenPage = () => setShowPage(true);
  const handleClosePage = () => setShowPage(false);

  return <>
    <figure className="courses-lesson-preview courses-notes-preview paper-surface" data-paper="lavender">
      <div className="courses-preview-label"><span>GHI CHÉP TRONG BÀI HỌC</span><span>{current.label.toUpperCase()}</span></div>
      <button type="button" className="courses-preview-frame" onClick={handleOpenPage} aria-label={`Xem trang viết tay: ${current.title}`}>
        <img src={current.image} alt={`Trích trang ghi chép viết tay về ${current.title}`} width="1100" height="800" fetchPriority="high"/>
        <span className="courses-preview-play courses-notes-expand" aria-hidden="true"><Maximize2 size={18}/></span>
      </button>
      <figcaption><span>{current.title}<small>Trang {current.page} · Ghi chép viết tay</small></span><button type="button" className="courses-preview-open" onClick={handleOpenPage}>Xem trang<ArrowUpRight size={16}/></button></figcaption>
      <div className="courses-preview-choices" role="group" aria-label="Chọn trang ghi chép để xem trước">
        {courseNotesPreviews.map((page,index)=><button type="button" key={page.id} onClick={()=>handleSelectPreview(index)} aria-pressed={selected===index} aria-label={`Xem ghi chép ${page.title}`}><img src={page.image} alt="" width="144" height="100" loading="lazy" decoding="async"/><span>{page.label}</span></button>)}
      </div>
    </figure>
    {showPage && <NotesPage page={current} onClose={handleClosePage}/>}
  </>;
}
