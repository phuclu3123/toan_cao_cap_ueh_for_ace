import { listActiveEnrollments } from '../services/enrollmentService.js';
import { revokeSession } from '../services/sessionService.js';

export const getCurrentSession = async (req, res) => {
  try {
    const enrollments = await listActiveEnrollments(req.authUser);
    return res.json({
      success: true,
      user: req.authUser,
      enrollments
    });
  } catch (error) {
    console.error('Could not load current session:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'SESSION_LOAD_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống tài khoản đang tạm bảo trì.'
        : 'Không thể tải phiên đăng nhập.'
    });
  }
};

export const logoutSession = async (req, res) => {
  try {
    await revokeSession(req, res);
    return res.json({ success: true });
  } catch (error) {
    console.error('Could not revoke session:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'SESSION_LOGOUT_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống tài khoản đang tạm bảo trì.'
        : 'Không thể đăng xuất phiên hiện tại.'
    });
  }
};
