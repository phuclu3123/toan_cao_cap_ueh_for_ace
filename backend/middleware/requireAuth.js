import { resolveSessionUser } from '../services/sessionService.js';

export const requireAuth = async (req, res, next) => {
  try {
    const user = await resolveSessionUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Vui lòng đăng nhập để tiếp tục.'
      });
    }

    req.authUser = user;
    return next();
  } catch (error) {
    console.error('Session authentication failed:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'AUTH_CHECK_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống tài khoản đang tạm bảo trì. Vui lòng thử lại sau.'
        : 'Không thể xác thực phiên đăng nhập.'
    });
  }
};
