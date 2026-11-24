import express from 'express';
import mongoose from 'mongoose';
import UserNotification from '../persistence/UserNotification.js';
import { requireAuth, findPublicAccountsByAliases } from '../../identity/index.js';
import { createRateLimit } from '../../../platform/http/rateLimit.js';

const router = express.Router();
const limit = createRateLimit({ namespace: 'notification-inbox', windowMs: 15 * 60 * 1000, max: 180, keyGenerator: req => req.authUser?.id || req.ip });
router.use('/notifications', requireAuth, limit, (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Chưa kết nối được hộp thông báo.' });
  next();
});
const ownerFilter = req => ({ recipientId: req.authUser.id || req.authUser.uid, dismissedAt: null });
const checkAccount = (req, res) => {
  if (req.body?.accountId !== (req.authUser.id || req.authUser.uid)) {
    res.status(409).json({ success: false, code: 'AUTH_SESSION_CHANGED', message: 'Tài khoản đã thay đổi. Vui lòng tải lại thông báo.' });
    return false;
  }
  return true;
};
const beforeDate = req => {
  const date = new Date(req.body?.before);
  return Number.isFinite(date.getTime()) ? new Date(Math.min(Date.now(), date.getTime())) : null;
};

router.get('/notifications', async (req, res, next) => {
  try {
    const asOf = new Date();
    const filter = ownerFilter(req);
    const [items, unreadCount] = await Promise.all([
      UserNotification.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
      UserNotification.countDocuments({ ...filter, isRead: false })
    ]);
    const actorIds = [...new Set(items.map(item => item.actor?.id).filter(Boolean))];
    const accounts = actorIds.length ? await findPublicAccountsByAliases(actorIds) : [];
    const byId = new Map(accounts.map(account => [account.id, account]));
    res.json({ success: true, asOf, unreadCount, notifications: items.map(item => {
      const account = byId.get(item.actor?.id);
      return { id: item.id, type: item.type, title: item.title, message: item.message, link: item.link,
        postId: item.postId, targetId: item.targetId, isRead: item.isRead, createdAt: item.createdAt,
        actor: account ? { id: account.id, name: account.name, avatar: account.avatar || '' } : item.actor };
    }) });
  } catch (error) { next(error); }
});
router.post('/notifications/read-all', async (req, res, next) => {
  if (!checkAccount(req, res)) return;
  const before = beforeDate(req);
  if (!before) return res.status(400).json({ success: false, message: 'Mốc thời gian không hợp lệ.' });
  try {
    await UserNotification.updateMany({ ...ownerFilter(req), createdAt: { $lte: before }, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) { next(error); }
});
router.post('/notifications/clear', async (req, res, next) => {
  if (!checkAccount(req, res)) return;
  const before = beforeDate(req);
  if (!before) return res.status(400).json({ success: false, message: 'Mốc thời gian không hợp lệ.' });
  try {
    await UserNotification.updateMany({ ...ownerFilter(req), createdAt: { $lte: before } }, { $set: { dismissedAt: new Date() } });
    res.json({ success: true });
  } catch (error) { next(error); }
});
router.post('/notifications/:id/read', async (req, res, next) => {
  if (!checkAccount(req, res)) return;
  try {
    await UserNotification.updateOne({ ...ownerFilter(req), id: req.params.id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) { next(error); }
});
export default router;
