import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { hasOwnerRole } from '../utils/roles.js';
import { accessError, requireAccessDatabase, getFlashcardAccess, grantEmail, revokeAccess,
  issueKeys, redeemKey, disableKey, consumeAccessLimit, listAccessData } from '../services/flashcardAccess.js';

const router = express.Router();
router.use('/flashcard-access', requireAuth, (_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});
const handle = fn => async (req, res) => {
  try {
    requireAccessDatabase();
    await fn(req, res);
  } catch (error) {
    const status = error.status || 503;
    if (status === 429) res.set('Retry-After', '60');
    if (!error.status) console.error('[Flashcard access]', error.code || error.name);
    res.status(status).json({ success: false, code: error.code && error.status ? error.code : 'ACCESS_UNAVAILABLE',
      message: error.status ? error.message : 'Hệ thống phân quyền tạm thời chưa sẵn sàng. Vui lòng thử lại.' });
  }
};
const owner = (req, res, next) => {
  if (!hasOwnerRole(req.authUser)) return res.status(403).json({ success: false, code: 'ADMIN_REQUIRED', message: 'Chỉ quản trị viên chính được quản lý quyền Flashcard.' });
  next();
};
router.get('/flashcard-access/me', handle(async (req, res) => {
  res.json({ success: true, access: await getFlashcardAccess(req.authUser) });
}));
router.post('/flashcard-access/redeem', handle(async (req, res) => {
  await consumeAccessLimit('redeem-user', req.authUser.id, 10);
  await consumeAccessLimit('redeem-ip', req.ip, 40);
  const result = await redeemKey(req.body?.key, req.authUser);
  res.json({ success: true, ...result, access: await getFlashcardAccess(req.authUser) });
}));
router.use('/flashcard-access/admin', owner);
router.get('/flashcard-access/admin/:kind', handle(async (req, res) => {
  res.json({ success: true, ...await listAccessData(req.params.kind, req.query) });
}));
router.post('/flashcard-access/admin/grants', handle(async (req, res) => {
  await consumeAccessLimit('admin-grant', req.authUser.id, 30);
  const { emails, expiresAt, reason, restore } = req.body || {};
  if (!Array.isArray(emails) || !emails.length || emails.length > 100 || emails.some(email => typeof email !== 'string')) {
    throw accessError(422, 'INVALID_EMAILS', 'Cung cấp từ 1 đến 100 email mỗi lần.');
  }
  if (restore !== undefined && typeof restore !== 'boolean') throw accessError(422, 'INVALID_RESTORE', 'Thao tác khôi phục không hợp lệ.');
  const results = [];
  // Per-email transactions allow the admin to see and correct individual failures.
  for (const email of [...new Set(emails.map(value => value.trim().toLowerCase()))]) {
    try {
      const access = await grantEmail({ email, expiresAt, reason, restore }, req.authUser);
      results.push({ email, success: true, userId: access.userId });
    } catch (error) {
      if (!error.status || error.status >= 500) throw error;
      results.push({ email, success: false, code: error.code, message: error.message });
    }
  }
  res.json({ success: true, results });
}));
router.post('/flashcard-access/admin/members/:userId/revoke', handle(async (req, res) => {
  await consumeAccessLimit('admin-write', req.authUser.id, 60);
  const member = await revokeAccess(req.params.userId, req.body?.reason, req.authUser);
  res.json({ success: true, member });
}));
router.post('/flashcard-access/admin/keys', handle(async (req, res) => {
  await consumeAccessLimit('issue-keys', req.authUser.id, 10);
  const codes = await issueKeys(req.body || {}, req.authUser);
  res.status(201).json({ success: true, codes });
}));
router.post('/flashcard-access/admin/keys/:id/disable', handle(async (req, res) => {
  await consumeAccessLimit('admin-write', req.authUser.id, 60);
  await disableKey(req.params.id, req.authUser);
  res.json({ success: true });
}));
export default router;
