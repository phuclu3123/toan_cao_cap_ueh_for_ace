// Compact labels for existing publications; new editorial titles remain untouched.
const labels = new Map([
  ['Bộ Đề Thi Toán Cao Cấp K51 (Cả 2 Đợt Mới Nhất)', 'Toán cao cấp K51 · Hai đợt thi'],
  ['Tuyển Tập Đề Thi Và Lời Giải Toán Cao Cấp Qua Các Năm', 'Tuyển tập đề thi & lời giải'],
  ['Bài Tập Toán Cao Cấp Các Chương - Thầy Nguyễn Thanh Vân', 'Bài tập theo chương · Nguyễn Thanh Vân'],
  ['Slide Lê Xuân Trường - Công Thức Biến Đổi Và Tích Phân Từng Phần', 'Biến đổi & tích phân từng phần · Lê Xuân Trường'],
  ['PDF Sách Giáo Trình Toán Cao Cấp UEH', 'Giáo trình Toán cao cấp UEH'],
  ['Slide Các Chương Bài Giảng Thầy Lê Xuân Trường', 'Bài giảng · Lê Xuân Trường']
]);
export const resourceTitle = resource => {
  if (resource.shortTitle) return resource.shortTitle;
  if (labels.has(resource.title)) return labels.get(resource.title);
  const lecture = resource.title?.match(/^Slide Thầy Phan Ngô Tuấn Anh - Chương (\d+): (.+)$/);
  return lecture ? `Chương ${lecture[1]} · ${lecture[2]}` : resource.title;
};
