import { resolveSessionUser } from '../services/sessionService.js';

const disableSharedCaching = (res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  // Preserve values already added by CORS (notably `Vary: Origin`).
  res.vary('Cookie');
  res.vary('Authorization');
};

export const optionalAuth = async (req, res, next) => {
  disableSharedCaching(res);
  try {
    req.authUser = await resolveSessionUser(req);
    return next();
  } catch (error) {
    console.error('Optional session authentication failed:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'AUTH_CHECK_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống tài khoản đang tạm bảo trì. Vui lòng thử lại sau.'
        : 'Không thể xác thực phiên đăng nhập.'
    });
  }
};

export const requireAuth = async (req, res, next) => {
  disableSharedCaching(res);
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
