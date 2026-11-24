import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../../identity/index.js';
import { createRateLimit } from '../../../platform/http/rateLimit.js';
import { hasOwnerRole, normalizeIdentifier } from '../../identity/index.js';
import { PURCHASE_TERMS } from '../config/purchaseTerms.js';
import { publicCourseCatalog, quoteCheckout, updateOffering, createPromotion, togglePromotion, listCommerce, commerceOverview, getCheckoutView, clearCheckoutOrder, saveCheckoutDraft } from '../application/courseCommerceService.js';
import Payment from '../payments/persistence/Payment.js';
import { CommerceAudit } from '../persistence/CourseCommerce.js';
import { reconcileManagedOrder, cancelManagedOrder, normalizePaymentResponse } from '../payments/application/paymentService.js';
import { getCourseOffering, listCourseOfferings } from '../../learning/index.js';

const router = express.Router();
const handle = fn => async (req, res) => { try { await fn(req, res); } catch (error) {
  const status = error.statusCode || (error.code === 11000 ? 409 : 503);
  if (status >= 500) console.error('[Course commerce]', error.code || error.name);
  res.status(status).json({ success: false, code: error.code === 11000 ? 'PROMOTION_CODE_EXISTS' : error.statusCode ? error.code : 'COMMERCE_UNAVAILABLE', message: error.code === 11000 ? 'Mã đã tồn tại. Hãy chọn mã khác.' : error.statusCode ? error.message : 'Hệ thống khóa học tạm gián đoạn. Vui lòng thử lại.' });
} };
router.use('/course-commerce', (_req, res, next) => { res.set('Cache-Control', 'private, no-store'); res.vary('Cookie'); next(); });
router.get('/course-commerce/terms', (_req, res) => res.json({ success: true, data: PURCHASE_TERMS }));
router.get('/course-commerce/catalog', handle(async (_req, res) => res.json({ success: true, data: await publicCourseCatalog() })));
router.post('/course-commerce/quote', requireAuth, createRateLimit({ namespace: 'course-quote', windowMs: 60000, max: 40 }), handle(async (req, res) => res.json({ success: true, data: await quoteCheckout(req.body?.courseId, req.authUser, req.body?.promotionCode || '') })));
const serializeCheckout = view => ({ ...view, order: view.order ? normalizePaymentResponse(view.order) : null });
router.get('/course-commerce/checkout-sessions', requireAuth, handle(async (req, res) => {
  const views = await Promise.all(listCourseOfferings().map(course => getCheckoutView(req.authUser, course.id)));
  res.json({ success: true, data: views.map(serializeCheckout) });
}));
router.get('/course-commerce/checkout/:courseId', requireAuth, handle(async (req, res) => res.json({ success: true, data: serializeCheckout(await getCheckoutView(req.authUser, req.params.courseId)) })));
router.post('/course-commerce/checkout/:courseId/draft', requireAuth, createRateLimit({ namespace: 'checkout-draft', windowMs: 60000, max: 30, keyGenerator: req => req.authUser.id }), handle(async (req, res) => res.json({ success: true, data: await saveCheckoutDraft(req.authUser, req.params.courseId, req.body?.promotionCode || '') })));
router.post('/course-commerce/checkout/:courseId/dismiss', requireAuth, handle(async (req, res) => {
  const view = await getCheckoutView(req.authUser, req.params.courseId);
  if (view.order && ['CREATING', 'PENDING'].includes(view.order.status)) return res.status(409).json({ success: false, message: 'Đơn vẫn đang chờ thanh toán.' });
  if (view.order) await clearCheckoutOrder(req.authUser.id, req.params.courseId, view.order.orderCode);
  res.json({ success: true });
}));
router.get('/course-commerce/pending/:courseId', requireAuth, handle(async (req, res) => {
  if (!getCourseOffering(req.params.courseId)) return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
  if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
  const { order } = await getCheckoutView(req.authUser, req.params.courseId);
  res.json({ success: true, data: order ? normalizePaymentResponse(order) : null });
}));
router.post('/course-commerce/orders/:orderCode/cancel', requireAuth, createRateLimit({ namespace: 'course-cancel-own-order', windowMs: 60000, max: 8, keyGenerator: req => req.authUser.id }), handle(async (req, res) => {
  if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
  const orderCode = Number(req.params.orderCode);
  if (!Number.isSafeInteger(orderCode) || orderCode <= 0) return res.status(400).json({ success: false, message: 'Mã đơn không hợp lệ.' });
  const order = await Payment.findOne({ orderCode }).select('userId courseId').lean();
  if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
  if (order.userId !== req.authUser.id) return res.status(403).json({ success: false, code: 'ORDER_FORBIDDEN', message: 'Bạn chỉ có thể hủy đơn do chính tài khoản này tạo.' });
  // The same provider verification as the owner flow: never locally rewrite a
  // paid order or release promotion quota before cancellation is confirmed.
  const result = await cancelManagedOrder(orderCode);
  if (['CANCELLED', 'FAILED'].includes(result.status)) await clearCheckoutOrder(req.authUser.id, order.courseId, orderCode);
  await CommerceAudit.create({ courseId: order.courseId, action: 'CANCEL_OWN_ORDER', actorId: req.authUser.id, details: { orderCode, status: result.status } });
  res.json({ success: true, data: result });
}));
router.get('/orders/:orderCode/receipt', requireAuth, handle(async (req, res) => {
  if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
  const code = Number(req.params.orderCode);
  if (!Number.isSafeInteger(code) || code <= 0) return res.status(400).json({ success: false, message: 'Mã đơn không hợp lệ.' });
  const order = await Payment.findOne({ orderCode: code }).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
  const belongsToUser = order.userId === req.authUser.id || (!order.userId && order.username && normalizeIdentifier(order.username) === normalizeIdentifier(req.authUser.username));
  if (!hasOwnerRole(req.authUser) && !belongsToUser) return res.status(403).json({ success: false, message: 'Đơn hàng không thuộc tài khoản này.' });
  res.set('Cache-Control', 'private, no-store');
  res.json({ success: true, data: { orderCode: order.orderCode, courseId: order.courseId, amount: order.amount, status: order.status, buyerName: order.buyerName, buyerEmail: order.buyerEmail, buyerPhone: order.buyerPhone, createdAt: order.createdAt, pricingSnapshot: order.pricingSnapshot, purchaseConsent: order.purchaseConsent || null } });
}));
router.use('/course-commerce/admin', requireAuth, (req, res, next) => {
  if (!hasOwnerRole(req.authUser)) return res.status(403).json({ success: false, code: 'ADMIN_REQUIRED', message: 'Chỉ quản trị viên chính được quản lý thương mại khóa học.' });
  next();
}, createRateLimit({ namespace: 'course-commerce-admin', windowMs: 60000, max: 100, keyGenerator: req => req.authUser.id }));
router.get('/course-commerce/admin/overview', handle(async (_req, res) => res.json({ success: true, data: await commerceOverview() })));
router.get('/course-commerce/admin/:courseId/list', handle(async (req, res) => res.json({ success: true, ...await listCommerce(req.params.courseId, req.query) })));
router.post('/course-commerce/admin/:courseId/price', handle(async (req, res) => res.json({ success: true, data: await updateOffering(req.params.courseId, req.body || {}, req.authUser) })));
router.post('/course-commerce/admin/:courseId/promotions', handle(async (req, res) => res.status(201).json({ success: true, data: await createPromotion(req.params.courseId, req.body || {}, req.authUser) })));
router.post('/course-commerce/admin/:courseId/promotions/:id', handle(async (req, res) => res.json({ success: true, data: await togglePromotion(req.params.courseId, req.params.id, req.body || {}, req.authUser) })));
router.get('/course-commerce/admin/orders/:orderCode', handle(async (req, res) => {
  if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
  const code = Number(req.params.orderCode);
  if (!Number.isSafeInteger(code) || code <= 0) return res.status(400).json({ success: false, message: 'Mã đơn không hợp lệ.' });
  const row = await Payment.findOne({ orderCode: code }).select('-webhookData').lean();
  if (!row) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn.' });
  res.json({ success: true, data: row });
}));
for (const [action, work] of [['reconcile', reconcileManagedOrder], ['cancel', cancelManagedOrder]]) router.post(`/course-commerce/admin/orders/:orderCode/${action}`, handle(async (req, res) => {
  if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
  const result = await work(Number(req.params.orderCode));
  await CommerceAudit.create({ courseId: result.courseId, action: action === 'cancel' ? 'CANCEL_ORDER' : 'RECONCILE_ORDER', actorId: req.authUser.id, details: { orderCode: result.orderCode, status: result.status } });
  res.json({ success: true, data: result });
}));
export default router;
