import { findCourseLessonContent } from '../config/courseContentCatalog.js';
import { getCourseOffering } from '../config/courseCatalog.js';
import { getCourseAccess } from '../services/enrollmentService.js';
import { resolveSessionUser } from '../services/sessionService.js';

const setPrivateResponseHeaders = (res) => {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Cookie');
};

const serializeContent = (courseId, lessonId, content) => ({
  courseId,
  lessonId,
  type: content.type,
  preview: content.preview,
  ...(content.media ? { media: content.media } : {}),
  ...(content.type === 'text' ? { content: content.content } : {})
});

export const getCourseLessonContent = async (req, res) => {
  setPrivateResponseHeaders(res);

  const { courseId, lessonId } = req.params;
  const course = getCourseOffering(courseId);
  const content = course ? findCourseLessonContent(courseId, lessonId) : null;

  if (!course || !content) {
    return res.status(404).json({
      success: false,
      code: 'LESSON_NOT_FOUND',
      message: 'Bài học không tồn tại.'
    });
  }

  try {
    if (!content.preview) {
      const user = await resolveSessionUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          code: 'AUTH_REQUIRED',
          message: 'Vui lòng đăng nhập để mở bài học này.'
        });
      }

      const access = await getCourseAccess(user, courseId);
      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          code: 'ENROLLMENT_REQUIRED',
          message: 'Bạn cần kích hoạt khóa học trước khi mở bài học này.'
        });
      }
    }

    return res.json({
      success: true,
      data: serializeContent(courseId, lessonId, content)
    });
  } catch (error) {
    console.error('Could not authorize course content:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      code: error.code || 'CONTENT_ACCESS_FAILED',
      message: status === 503
        ? 'Hệ thống quyền học đang tạm gián đoạn. Vui lòng thử lại sau.'
        : 'Không thể mở nội dung bài học lúc này.'
    });
  }
};
