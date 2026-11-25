import express from 'express';
import { requireAuth } from '../../identity/index.js';
import { createRateLimit } from '../../../platform/http/rateLimit.js';
import { hasOwnerRole } from '../../identity/index.js';
import { disableCourseKey, grantCourseEmail, issueCourseKeys, listCourseAccess, redeemCourseKey, revokeCourseMember } from '../application/courseAccessService.js';

const router = express.Router();
router.use('/course-access', requireAuth, (_req, res, next) => { res.set('Cache-Control', 'private, no-store'); res.vary('Cookie'); next(); });
const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (error) {
    const status = error.status || error.statusCode || 503;
    if (!error.status && !error.statusCode) console.error('[Course access]', error.code || error.name);
    res.status(status).json({ success: false, code: error.status || error.statusCode ? error.code : 'COURSE_ACCESS_UNAVAILABLE', message: error.status ? error.message : 'Hệ thống quyền khóa học tạm gián đoạn. Vui lòng thử lại.' });
  }
};
router.post('/course-access/:courseId/redeem', createRateLimit({ namespace: 'course-key-redeem', windowMs: 60000, max: 10, keyGenerator: (req) => req.authUser.id }), handle(async (req, res) => {
  res.json({ success: true, ...await redeemCourseKey(req.params.courseId, req.body?.key, req.authUser) });
}));
router.use('/course-access/admin', (req, res, next) => {
  if (!hasOwnerRole(req.authUser)) return res.status(403).json({ success: false, code: 'ADMIN_REQUIRED', message: 'Chỉ quản trị viên chính được quản lý khóa học.' });
  next();
}, createRateLimit({ namespace: 'course-admin', windowMs: 60000, max: 90, keyGenerator: (req) => req.authUser.id }));
router.get('/course-access/admin/:courseId', handle(async (req, res) => res.json({ success: true, ...await listCourseAccess(req.params.courseId, req.query) })));
router.post('/course-access/admin/:courseId/keys', handle(async (req, res) => res.status(201).json({ success: true, codes: await issueCourseKeys(req.params.courseId, req.body || {}, req.authUser) })));
router.post('/course-access/admin/:courseId/grants', handle(async (req, res) => res.json({ success: true, ...await grantCourseEmail(req.params.courseId, req.body?.email, req.body?.restore, req.authUser) })));
router.post('/course-access/admin/:courseId/members/:userId/revoke', handle(async (req, res) => { await revokeCourseMember(req.params.courseId, req.params.userId, req.authUser,req.body?.reason); res.json({ success: true }); }));
router.post('/course-access/admin/:courseId/keys/:id/disable', handle(async (req, res) => { await disableCourseKey(req.params.courseId, req.params.id, req.authUser); res.json({ success: true }); }));
export default router;
