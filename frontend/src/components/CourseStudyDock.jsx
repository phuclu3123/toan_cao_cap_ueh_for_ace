import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock3, GripVertical, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useGlobalPlayer } from '../contexts/GlobalPlayerContext';
import '../assets/styles/CourseStudyDock.css';

const formatTime = (seconds) => {
  const value = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
};

export default function CourseStudyDock({ courseId, tone }) {
  const { isOpen, isMinimized } = useGlobalPlayer();
  const [collapsed, setCollapsed] = useState(true);
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const dockRef = useRef(null);
  const dragRef = useRef(null);

  // Tính giờ ngay khi mở trang; dừng khi tab ẩn hoặc rời trang khóa học.
  useEffect(() => {
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (!document.hidden) setSeconds((value) => value + Math.min((now - previous) / 1000, 1));
      previous = now;
    }, 1000);
    return () => window.clearInterval(timer);
  }, [courseId]);

  useEffect(() => {
    const handleSessionChanged = () => setSeconds(0);
    window.addEventListener('ueh-tcc-session-changed', handleSessionChanged);
    return () => window.removeEventListener('ueh-tcc-session-changed', handleSessionChanged);
  }, []);

  // Giữ cả thanh trong màn hình khi thu/mở, xoay điện thoại hoặc đổi kích thước.
  useLayoutEffect(() => {
    const handleResize = () => setPosition((current) => {
      if (!current || !dockRef.current) return current;
      const rect = dockRef.current.getBoundingClientRect();
      if (!rect.width) return current;
      const next = {
        x: Math.max(12, Math.min(current.x, window.innerWidth - rect.width - 12)),
        y: Math.max(12, Math.min(current.y, window.innerHeight - rect.height - 12))
      };
      return next.x === current.x && next.y === current.y ? current : next;
    });
    const observer = new ResizeObserver(handleResize);
    if (dockRef.current) observer.observe(dockRef.current);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [collapsed]);

  // Pointer capture kết thúc kéo an toàn, kể cả khi con trỏ rời nút kéo.
  const handleDragStart = (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    const rect = dockRef.current.getBoundingClientRect();
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handleDragMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const rect = dockRef.current.getBoundingClientRect();
    setPosition({
      x: Math.max(12, Math.min(drag.left + event.clientX - drag.x, window.innerWidth - rect.width - 12)),
      y: Math.max(12, Math.min(drag.top + event.clientY - drag.y, window.innerHeight - rect.height - 12))
    });
  };

  const handleDragEnd = () => {
    dragRef.current = null;
    setDragging(false);
  };

  // Phím mũi tên là cách di chuyển thay thế cho thao tác kéo.
  const handleDragKeyDown = (event) => {
    const moves = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
    if (!moves[event.key]) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = dockRef.current.getBoundingClientRect();
    const [x, y] = moves[event.key];
    setPosition({
      x: Math.max(12, Math.min(rect.left + x, window.innerWidth - rect.width - 12)),
      y: Math.max(12, Math.min(rect.top + y, window.innerHeight - rect.height - 12))
    });
  };

  // Khi mở video, thanh học nhường chỗ cho các điều khiển trong trình phát.
  return createPortal(
    <aside
      ref={dockRef}
      className={`course-study-dock cd-tone-${tone} ${collapsed ? 'is-collapsed' : ''} ${dragging ? 'is-dragging' : ''}`}
      aria-label="Phiên học hiện tại"
      hidden={isOpen && !isMinimized}
      style={position ? { left: position.x, top: position.y, bottom: 'auto' } : undefined}
    >
      <div className="course-study-dock__row">
        <button type="button" className="course-study-dock__drag" aria-label="Di chuyển thanh học bằng cách kéo hoặc phím mũi tên" title="Kéo để di chuyển · dùng phím mũi tên khi chọn nút này"
          onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd} onLostPointerCapture={handleDragEnd} onKeyDown={handleDragKeyDown}>
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <div className="course-study-dock__time">
          <Clock3 size={18} aria-hidden="true" />
          <div><span>Phiên học</span><strong>{formatTime(seconds)}</strong></div>
        </div>
        <div className="course-study-dock__actions">
          {!collapsed && position && <button type="button" onClick={() => setPosition(null)} aria-label="Đưa thanh học về góc trái" title="Về vị trí ban đầu"><RotateCcw size={16} /></button>}
          <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Mở rộng thanh học' : 'Thu gọn thanh học'} aria-expanded={!collapsed} aria-controls="course-study-dock-details" title={collapsed ? 'Mở rộng' : 'Thu gọn'}>
            {collapsed ? <Maximize2 size={17} /> : <Minimize2 size={17} />}
          </button>
        </div>
      </div>
      {!collapsed && <div className="course-study-dock__details" id="course-study-dock-details">
        <span>Thời gian bạn học trên trang này.</span>
      </div>}
    </aside>, document.body
  );
}
