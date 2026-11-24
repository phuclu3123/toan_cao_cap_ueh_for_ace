import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/** Optional community tools stay off the reading canvas until requested. */
export default function CommunityPanel({ title, label = title, icon: Icon, children }) {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <>
    <button type="button" className="qa-tools-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>{Icon && <Icon size={17} />}<span>{label}</span></button>
    <dialog ref={dialogRef} className="qa-tools-panel" aria-label={title} onCancel={handleClose} onClick={event => { if (event.target === event.currentTarget) handleClose(); }}>
      <div className="qa-tools-panel-inner">
        <header><h2>{title}</h2><button type="button" onClick={handleClose} aria-label={'Đóng ' + title}><X size={20} /></button></header>
        {typeof children === 'function' ? children({ close: handleClose }) : children}
      </div>
    </dialog>
  </>;
}
