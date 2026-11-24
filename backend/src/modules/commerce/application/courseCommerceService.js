import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { getCourseOffering, listCourseOfferings, getPublishedCourseStats } from '../../learning/index.js';
import { countActiveCourseMembers } from '../../access/index.js';
import { CourseOffer, CoursePromotion, PromotionUsage, PromotionReservation, CommerceAudit, CourseCheckoutSession } from '../persistence/CourseCommerce.js';
import Payment from '../payments/persistence/Payment.js';

let ready = false;
const fail = (statusCode, code, message) => Object.assign(new Error(message), { statusCode, code });
const int = (value, min, max, name) => { if (!Number.isSafeInteger(value) || value < min || value > max) throw fail(422, 'INVALID_CONFIGURATION', `${name} không hợp lệ.`); return value; };
const withSession = (query, session) => session ? query.session(session) : query;
const requireDb = () => { if (mongoose.connection.readyState !== 1) throw fail(503, 'COMMERCE_UNAVAILABLE', 'Dữ liệu bán khóa học chưa kết nối. Vui lòng thử lại.'); };
const requireReady = () => { requireDb(); if (!ready) throw fail(503, 'COMMERCE_UNAVAILABLE', 'Hệ thống bán khóa học chưa sẵn sàng.'); };
const knownCourse = id => { const course = getCourseOffering(id); if (!course) throw fail(404, 'COURSE_NOT_FOUND', 'Khóa học không tồn tại.'); return course; };
const audit = (actor, courseId, action, details, session) => CommerceAudit.create([{ actorId: actor.id, courseId, action, details }], { session });
export const commerceReady = () => ready && mongoose.connection.readyState === 1;
export async function initializeCourseCommerce() {
  ready = false; requireDb();
  for (const model of [CourseOffer, CoursePromotion, PromotionUsage, PromotionReservation, CommerceAudit, CourseCheckoutSession, Payment]) {
    for (const [fields, options] of model.schema.indexes()) await model.collection.createIndex(fields, { ...options, maxTimeMS: 10000 });
  }
  ready = true;
}
export async function getSellableOffering(courseId, session = null) {
  const fallback = knownCourse(courseId); requireDb();
  const saved = await withSession(CourseOffer.findOne({ courseId }), session).lean();
  return { ...fallback, amount: saved?.amount ?? fallback.amount, compareAtAmount: saved?.compareAtAmount ?? (courseId === 'tu-hoc-toan-cao-cap' ? 799000 : 0), version: saved?.version || 0, status: saved?.status || (fallback.isClosed ? 'CLOSED' : 'OPEN'), isClosed: saved ? saved.status !== 'OPEN' || saved.amount === 0 : Boolean(fallback.isClosed || fallback.amount === 0), updatedAt: saved?.updatedAt || null };
}
export function discountAmount(amount, rule) {
  const calculated = rule.type === 'PERCENT' ? Math.floor(amount * rule.value / 100) : rule.value;
  return Math.max(0, Math.min(amount - 1, calculated, rule.maxDiscount ?? amount));
}
const eligible = (promotion, now) => promotion.active && (!promotion.startsAt || promotion.startsAt <= now) && (!promotion.endsAt || promotion.endsAt > now) && promotion.used + promotion.reserved < promotion.maxUses;
export async function quoteCheckout(courseId, user, code = '', session = null) {
  const offering = await getSellableOffering(courseId, session);
  if (offering.isClosed) throw fail(403, 'COURSE_CLOSED', 'Khóa học đang tạm đóng đăng ký và thanh toán.');
  if (typeof code !== 'string' || code.length > 32) throw fail(422, 'INVALID_PROMOTION', 'Mã giảm giá không hợp lệ.');
  const normalized = code.trim().toUpperCase();
  const candidates = await withSession(CoursePromotion.find({ courseId, active: true, ...(normalized ? { code: normalized, mode: 'CODE' } : { mode: 'AUTO' }) }), session).lean();
  const now = new Date(); let best = null; let discount = 0;
  const available = candidates.filter(candidate => eligible(candidate, now));
  // One indexed lookup for all candidate rules instead of a database round
  // trip per AUTO campaign on every checkout quote.
  const usages = available.length ? await withSession(PromotionUsage.find({ promotionId: { $in: available.map(row => row._id) }, userId: user.id }), session).lean() : [];
  const usageByPromotion = new Map(usages.map(row => [String(row.promotionId), row]));
  for (const candidate of available) {
    const usage = usageByPromotion.get(String(candidate._id));
    if ((usage?.used || 0) + (usage?.reserved || 0) >= candidate.perUserLimit) continue;
    const value = discountAmount(offering.amount, candidate);
    if (value > discount) { best = candidate; discount = value; }
  }
  if (normalized && !best) throw fail(422, 'PROMOTION_UNAVAILABLE', 'Mã không áp dụng được: kiểm tra khóa học, thời hạn và lượt sử dụng.');
  return { courseId, baseAmount: offering.amount, discountAmount: discount, amount: offering.amount - discount, priceVersion: offering.version, promotionId: best?._id?.toString() || null, promotionCode: best?.mode === 'CODE' ? best.code : null, promotionLabel: best?.label || null, promotionVersion: best?.version || null, currency: 'VND' };
}
export async function publicCourseCatalog() {
  const offerings = listCourseOfferings();
  const [courses, members] = await Promise.all([
    Promise.all(offerings.map(course => getSellableOffering(course.id))),
    countActiveCourseMembers(offerings.map(course => course.id))
  ]);
  return courses.map(({ id, title, amount, compareAtAmount, isClosed, status, version, updatedAt }) => ({
    id, title, amount, compareAtAmount, isClosed, status, version, updatedAt,
    ...getPublishedCourseStats(id), studentsCount: members[id]
  }));
}
export async function updateOffering(courseId, input, actor) {
  requireReady(); knownCourse(courseId);
  const amount = int(input.amount, 0, 1000000000, 'Giá');
  const compareAtAmount = int(input.compareAtAmount ?? 0, 0, 1000000000, 'Giá tham chiếu');
  const expectedVersion = int(input.version, 0, 1000000, 'Phiên bản');
  if (!['OPEN', 'CLOSED'].includes(input.status) || (input.status === 'OPEN' && amount === 0) || (compareAtAmount && compareAtAmount < amount)) throw fail(422, 'INVALID_OFFERING', 'Giá 0đ phải đóng bán; giá tham chiếu phải bằng hoặc cao hơn giá bán.');
  try {
    return await mongoose.connection.transaction(async session => {
      const row = await CourseOffer.findOneAndUpdate({ courseId, version: expectedVersion }, { $set: { amount, compareAtAmount, status: input.status, updatedBy: actor.id }, $inc: { version: 1 } }, { upsert: expectedVersion === 0, returnDocument: 'after', session, runValidators: true });
      if (!row) throw fail(409, 'CONFIGURATION_CHANGED', 'Cấu hình vừa thay đổi. Hãy làm mới trước khi lưu.');
      await audit(actor, courseId, 'UPDATE_PRICE', { amount, compareAtAmount, status: input.status, version: row.version }, session);
      return row.toObject();
    });
  } catch (error) { if (error.code === 11000) throw fail(409, 'CONFIGURATION_CHANGED', 'Cấu hình vừa thay đổi. Hãy làm mới trước khi lưu.'); throw error; }
}
export async function createPromotion(courseId, input, actor) {
  requireReady(); knownCourse(courseId);
  const label = typeof input.label === 'string' ? input.label.trim() : '';
  const code = input.mode === 'AUTO' ? `AUTO-${crypto.randomBytes(8).toString('hex').toUpperCase()}` : String(input.code || '').trim().toUpperCase();
  if (!label || label.length > 100 || !/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code) || !['AUTO', 'CODE'].includes(input.mode) || !['PERCENT', 'FIXED'].includes(input.type)) throw fail(422, 'INVALID_PROMOTION', 'Tên, mã hoặc loại ưu đãi không hợp lệ.');
  const value = int(input.value, 1, input.type === 'PERCENT' ? 99 : 1000000000, 'Mức giảm');
  const maxUses = int(input.maxUses, 1, 1000000, 'Tổng lượt');
  const perUserLimit = int(input.perUserLimit ?? 1, 1, maxUses, 'Lượt mỗi người');
  const maxDiscount = input.maxDiscount == null || input.maxDiscount === '' ? null : int(input.maxDiscount, 1, 1000000000, 'Giảm tối đa');
  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if ((startsAt && !Number.isFinite(+startsAt)) || (endsAt && (!Number.isFinite(+endsAt) || +endsAt <= Date.now())) || (startsAt && endsAt && startsAt >= endsAt)) throw fail(422, 'INVALID_PROMOTION', 'Thời gian ưu đãi không hợp lệ.');
  try { return await mongoose.connection.transaction(async session => {
    const [row] = await CoursePromotion.create([{ courseId, code, label, mode: input.mode, type: input.type, value, maxDiscount, maxUses, perUserLimit, startsAt, endsAt, createdBy: actor.id }], { session });
    await audit(actor, courseId, 'CREATE_PROMOTION', { promotionId: row.id, code }, session); return row.toObject();
  }); } catch (error) { if (error.code === 11000) throw fail(409, 'PROMOTION_EXISTS', 'Mã đã tồn tại. Hãy chọn mã khác.'); throw error; }
}
export async function togglePromotion(courseId, id, input, actor) {
  requireReady(); knownCourse(courseId);
  if (!mongoose.isValidObjectId(id) || typeof input.active !== 'boolean' || !Number.isSafeInteger(input.version)) throw fail(422, 'INVALID_PROMOTION', 'Yêu cầu cập nhật không hợp lệ.');
  return mongoose.connection.transaction(async session => {
    const row = await CoursePromotion.findOneAndUpdate({ _id: id, courseId, version: input.version }, { $set: { active: input.active }, $inc: { version: 1 } }, { session, returnDocument: 'after' }).lean();
    if (!row) throw fail(409, 'PROMOTION_CHANGED', 'Ưu đãi đã thay đổi. Hãy làm mới.');
    await audit(actor, courseId, 'TOGGLE_PROMOTION', { promotionId: id, active: input.active }, session); return row;
  });
}
export async function reserveCommerceOrder(data, expectedQuote, code, user) {
  requireReady();
  return mongoose.connection.transaction(async session => {
    const selected = await CourseCheckoutSession.findOne({ userId: user.id, courseId: data.courseId }).session(session).lean();
    const activeOrder = selected?.phase === 'PAYMENT'
      ? await Payment.findOne({ userId: user.id, courseId: data.courseId, orderCode: selected.orderCode }).session(session).lean()
      : !selected ? await Payment.findOne({ userId: user.id, courseId: data.courseId }).sort({ createdAt: -1, _id: -1 }).session(session).lean() : null;
    if (activeOrder && ['CREATING', 'PENDING'].includes(activeOrder.status)) {
      throw fail(409, 'CHECKOUT_ACTIVE_ORDER', 'Bạn đã có đơn đang chờ thanh toán. Hãy tiếp tục hoặc hủy đơn đó trước khi tạo đơn mới.');
    }
    const quote = await quoteCheckout(data.courseId, user, code, session);
    if (['amount', 'baseAmount', 'priceVersion', 'promotionId', 'promotionVersion'].some(key => quote[key] !== expectedQuote[key])) throw fail(409, 'CHECKOUT_PRICE_CHANGED', 'Giá hoặc ưu đãi vừa thay đổi. Vui lòng kiểm tra lại.');
    if (quote.promotionId) {
      const rule = await CoursePromotion.findOneAndUpdate({ _id: quote.promotionId, active: true, version: quote.promotionVersion, $expr: { $lt: [{ $add: ['$used', '$reserved'] }, '$maxUses'] } }, { $inc: { reserved: 1 } }, { session, returnDocument: 'after' });
      if (!rule) throw fail(409, 'PROMOTION_UNAVAILABLE', 'Ưu đãi vừa hết lượt. Hãy cập nhật tổng thanh toán.');
      await PromotionUsage.updateOne({ promotionId: rule._id, userId: user.id }, { $setOnInsert: { used: 0, reserved: 0 } }, { session, upsert: true });
      const usage = await PromotionUsage.findOneAndUpdate({ promotionId: rule._id, userId: user.id, $expr: { $lt: [{ $add: ['$used', '$reserved'] }, rule.perUserLimit] } }, { $inc: { reserved: 1 } }, { session, returnDocument: 'after' });
      if (!usage) throw fail(409, 'PROMOTION_USER_LIMIT', 'Tài khoản đã dùng hoặc đang giữ đủ lượt của mã này.');
      await PromotionReservation.create([{ promotionId: rule._id, userId: user.id, orderCode: data.orderCode, status: 'RESERVED', expiresAt: data.expiresAt }], { session });
    }
    const [payment] = await Payment.create([{ ...data, amount: quote.amount, pricingSnapshot: quote }], { session });
    await CourseCheckoutSession.findOneAndUpdate({ userId: user.id, courseId: data.courseId }, { $set: { phase: 'PAYMENT', orderCode: data.orderCode, promotionCode: code.trim().toUpperCase(), draftQuote: quote } }, { session, upsert: true, runValidators: true });
    return payment;
  });
}
export async function settlePromotion(orderCode, paid, session) {
  const row = await PromotionReservation.findOne({ orderCode }).session(session);
  if (!row || row.status === 'CONSUMED' || (!paid && row.status !== 'RESERVED')) return;
  const wasReserved = row.status === 'RESERVED';
  const increments = { ...(wasReserved ? { reserved: -1 } : {}), ...(paid ? { used: 1 } : {}) };
  await CoursePromotion.updateOne({ _id: row.promotionId }, { $inc: increments }, { session });
  await PromotionUsage.updateOne({ promotionId: row.promotionId, userId: row.userId }, { $inc: increments }, { session });
  if (paid && !wasReserved) await Payment.updateOne({ orderCode }, { $set: { requiresReview: true } }, { session });
  row.status = paid ? 'CONSUMED' : 'RELEASED'; await row.save({ session });
}
export async function releaseFailedPromotion(orderCode) {
  if (!Number.isSafeInteger(orderCode)) return;
  await mongoose.connection.transaction(session => settlePromotion(orderCode, false, session));
}
export async function listCommerce(courseId, { kind = 'orders', page = 1, status = '', search = '' }) {
  requireReady(); knownCourse(courseId);
  const currentPage = Math.max(1, Math.min(100000, Number.parseInt(page, 10) || 1));
  const model = kind === 'orders' ? Payment : kind === 'promotions' ? CoursePromotion : kind === 'audit' ? CommerceAudit : null;
  if (!model) throw fail(404, 'NOT_FOUND', 'Danh sách không tồn tại.');
  const filter = { courseId };
  if (kind === 'orders' && ['CREATING', 'PENDING', 'PAID', 'CANCELLED', 'FAILED'].includes(status)) filter.status = status;
  if (typeof search === 'string' && search.trim()) {
    const term = search.trim().slice(0, 100);
    if (kind === 'orders') filter.$or = [{ username: { $regex: `^${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } }, ...(Number.isSafeInteger(Number(term)) ? [{ orderCode: Number(term) }] : [])];
    else if (kind === 'promotions') filter.code = { $regex: `^${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' };
  }
  let query = model.find(filter).sort({ createdAt: -1, _id: -1 }).skip((currentPage - 1) * 20).limit(20);
  if (kind === 'orders') query = query.select('orderCode username courseId amount status pricingSnapshot createdAt updatedAt requiresReview purchaseConsent.version purchaseConsent.acceptedAt');
  const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
  return { items, total, page: currentPage, pages: Math.max(1, Math.ceil(total / 20)) };
}
export async function commerceOverview() {
  requireReady();
  const [courses, totals] = await Promise.all([publicCourseCatalog(), Payment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }])]);
  return { courses, totals, server: { database: 'connected', commerceReady: ready, payosConfigured: Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY), uptimeSeconds: Math.floor(process.uptime()), environment: process.env.NODE_ENV || 'development' } };
}

// One explicit selection per account/course. A canceled selection never falls
// back to an earlier abandoned payment, even when those old links still exist.
export async function getCheckoutView(user, courseId) {
  requireReady(); knownCourse(courseId);
  const saved = await CourseCheckoutSession.findOne({ userId: user.id, courseId }).lean();
  if (saved?.phase === 'DETAILS') return { courseId, phase: 'DETAILS', order: null, promotionCode: saved.promotionCode, draftQuote: saved.draftQuote };
  const order = saved
    ? await Payment.findOne({ userId: user.id, courseId, orderCode: saved.orderCode })
    : await Payment.findOne({ userId: user.id, courseId }).sort({ createdAt: -1, _id: -1 });
  // Legacy fallback considers the latest attempt across ALL states, not the
  // latest still-pending row. A newer canceled attempt supersedes older rows.
  const showOrder = order && (saved || ['CREATING', 'PENDING'].includes(order.status));
  return { courseId, phase: showOrder ? 'PAYMENT' : 'DETAILS', resumeAutomatically: Boolean(saved || order?.expiresAt), order: showOrder ? order : null, promotionCode: saved?.promotionCode || '', draftQuote: saved?.draftQuote || null };
}

export async function clearCheckoutOrder(userId, courseId, orderCode) {
  requireReady();
  await CourseCheckoutSession.updateOne({ userId, courseId, orderCode }, { $set: { phase: 'DETAILS', orderCode: null, promotionCode: '' }, $unset: { draftQuote: 1 } });
  // Do not overwrite a newer order chosen concurrently in another tab.
  try { await CourseCheckoutSession.updateOne({ userId, courseId }, { $setOnInsert: { phase: 'DETAILS', orderCode: null, promotionCode: '' } }, { upsert: true }); }
  catch (error) { if (error.code !== 11000) throw error; }
}

export async function saveCheckoutDraft(user, courseId, promotionCode = '') {
  requireReady(); knownCourse(courseId);
  return mongoose.connection.transaction(async session => {
    const saved = await CourseCheckoutSession.findOne({ userId: user.id, courseId }).session(session).lean();
    const selected = saved?.phase === 'PAYMENT'
      ? await Payment.findOne({ userId: user.id, courseId, orderCode: saved.orderCode }).session(session).lean()
      : !saved ? await Payment.findOne({ userId: user.id, courseId }).sort({ createdAt: -1, _id: -1 }).session(session).lean() : null;
    if (selected && ['CREATING', 'PENDING'].includes(selected.status)) throw fail(409, 'CHECKOUT_ACTIVE_ORDER', 'Hãy hủy đơn đang chờ trước khi đổi giá hoặc mã giảm giá.');
    const quote = await quoteCheckout(courseId, user, promotionCode, session);
    await CourseCheckoutSession.updateOne({ userId: user.id, courseId }, { $set: { phase: 'DETAILS', orderCode: null, promotionCode: promotionCode.trim().toUpperCase(), draftQuote: quote } }, { session, upsert: true, runValidators: true });
    return quote;
  });
}
