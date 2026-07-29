import { getCourseOffering } from '../config/courseCatalog.js';
import {
  getCourseAccess,
  grantEnrollment,
  listActiveEnrollments
} from '../services/enrollmentService.js';

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await listActiveEnrollments(req.authUser);
    return res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Could not list enrollments:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'ENROLLMENTS_LOAD_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống khóa học đang tạm bảo trì.'
        : 'Không thể tải danh sách khóa học của bạn.'
    });
  }
};

export const getMyCourseAccess = async (req, res) => {
  const course = getCourseOffering(req.params.courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
  }

  try {
    const access = await getCourseAccess(req.authUser, course.id);
    return res.json({ success: true, data: { courseId: course.id, ...access } });
  } catch (error) {
    console.error('Could not check course access:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'COURSE_ACCESS_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống khóa học đang tạm bảo trì.'
        : 'Không thể kiểm tra quyền truy cập khóa học.'
    });
  }
};

export const enrollFreeCourse = async (user, course) => {
  if (course.amount !== 0) {
    throw new Error('Only free courses can be enrolled without payment');
  }

  return grantEnrollment({
    userId: user.id,
    username: user.username,
    courseId: course.id,
    source: 'FREE'
  });
};
