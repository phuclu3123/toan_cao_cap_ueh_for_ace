// Page and crop provenance: public/images/courses/notes/sources.json.
export const courseNotesPreviews = [
  { id:'input-output', label:'Input–Output', title:'Mô hình Input–Output', page:3 },
  { id:'elasticity', label:'Co giãn', title:'Đạo hàm & hệ số co giãn', page:2 },
  { id:'stationary-points', label:'Cực trị', title:'Cực trị hàm hai biến', page:2 },
  { id:'lagrange', label:'Lagrange', title:'Phương pháp nhân tử Lagrange', page:5 }
].map(item=>({...item,image:`/images/courses/notes/${item.id}-preview.webp`,fullPage:`/images/courses/notes/${item.id}-page.webp`}));
