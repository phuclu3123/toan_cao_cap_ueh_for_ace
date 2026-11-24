import { coursePreviewLessons } from './coursePreviewData';

const frames = [
  { lessonId: 'preview-ut-WxyDjtPQ', image: '/images/home/lesson-matrix-video.webp', label: 'Đại số', title: 'Định thức & ma trận nghịch đảo', seconds: 240 },
  { lessonId: 'preview-DTcEh5Vl8-M', image: '/images/courses/lesson-partial-derivatives.webp', label: 'Đạo hàm', title: 'Đạo hàm riêng & hệ số co giãn', seconds: 900 },
  { lessonId: 'preview-K7EF4KAL2Wg', image: '/images/courses/lesson-lagrange.webp', label: 'Cực trị', title: 'Điểm dừng & cực trị hàm nhiều biến', seconds: 1800 },
  { lessonId: 'preview-3y3kTI6gazQ', image: '/images/courses/lesson-differential-equations.webp', label: 'Vi phân', title: 'Phương trình vi phân cấp một', seconds: 1200 }
];

export const courseFramePreviews = frames.map(frame => ({
  ...frame,
  lesson: coursePreviewLessons.find(lesson => lesson.id === frame.lessonId)
})).filter(frame => frame.lesson?.preview && !frame.lesson.isLocked);
