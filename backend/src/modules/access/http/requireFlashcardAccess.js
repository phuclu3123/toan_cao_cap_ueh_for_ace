import { getFlashcardAccess } from '../application/flashcardAccess.js';

export const requireFlashcardAccess = async (req, res, next) => {
  try {
    const access = await getFlashcardAccess(req.authUser);
    if (!access.allowed) return res.status(403).json({ success: false, code: 'FLASHCARD_LOCKED', access,
      message: access.status === 'REVOKED' ? 'Quyền Flashcard đã bị thu hồi. Vui lòng liên hệ quản trị viên.' : 'Bạn chưa có quyền sử dụng Flashcard.' });
    next();
  } catch (error) {
    res.status(error.status || 503).json({ success: false, code: 'ACCESS_UNAVAILABLE', message: 'Chưa kiểm tra được quyền Flashcard. Vui lòng thử lại.' });
  }
};
