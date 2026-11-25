import crypto from 'node:crypto';
import mongoose from 'mongoose';
import CourseKey from '../persistence/CourseKey.js';
import CourseAccessAudit from '../persistence/CourseAccessAudit.js';
import Enrollment from '../persistence/Enrollment.js';
import { findRegisteredAccountByEmail } from '../../identity/index.js';
import { getCourseOffering } from '../../learning/index.js';
import { getCourseAccess, grantEnrollment } from './enrollmentService.js';
import { hasOwnerRole, normalizeIdentifier } from '../../identity/index.js';

let indexesReady = false;
const fail = (status, code, message) => Object.assign(new Error(message), { status, code });
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const audit = (session, data) => CourseAccessAudit.create([data], { session });

function requireStore() {
  if (!indexesReady || mongoose.connection.readyState !== 1) throw fail(503, 'COURSE_ACCESS_UNAVAILABLE', 'Hệ thống quyền khóa học chưa sẵn sàng. Vui lòng thử lại.');
}
async function requireOffering(courseId) {
  const course = getCourseOffering(courseId);
  if (!course) throw fail(404, 'COURSE_NOT_FOUND', 'Khóa học không tồn tại.');
  // Closing sales must not invalidate already issued or gifted rights.
  return course;
}
async function transaction(work) {
  requireStore();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { return await mongoose.connection.transaction(work, { readPreference: 'primary', readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } }); }
    catch (error) { if (error.code !== 11000 || attempt === 2) throw error; }
  }
}

export async function initializeCourseAccess() {
  indexesReady = false;
  if (mongoose.connection.readyState !== 1) throw fail(503, 'COURSE_ACCESS_UNAVAILABLE', 'MongoDB chưa kết nối.');
  for (const model of [CourseKey, CourseAccessAudit]) {
    for (const [fields, options] of model.schema.indexes()) await model.collection.createIndex(fields, { ...options, maxTimeMS: 10000 });
  }
  indexesReady = true;
}

export async function issueCourseKeys(courseId, { count = 1, activateBefore = null }, actor) {
  await requireOffering(courseId);
  if (!Number.isInteger(count) || count < 1 || count > 50) throw fail(422, 'INVALID_COUNT', 'Mỗi lần tạo từ 1 đến 50 mã.');
  const expiry = activateBefore ? new Date(activateBefore) : null;
  if (expiry && (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now())) throw fail(422, 'INVALID_EXPIRY', 'Hạn kích hoạt phải ở tương lai.');
  const codes = Array.from({ length: count }, () => `TCCK-${crypto.randomBytes(24).toString('hex').toUpperCase().match(/.{1,8}/g).join('-')}`);
  await transaction(async (session) => {
    await CourseKey.create(codes.map((code) => ({ hash: hash(code), courseId, label: `…${code.slice(-8)}`, createdBy: actor.id, activateBefore: expiry })), { session, ordered: true });
    await audit(session, { courseId, action: 'ISSUE_KEYS', actorId: actor.id });
  });
  return codes;
}

export async function redeemCourseKey(courseId, value, user) {
  await requireOffering(courseId);
  if (hasOwnerRole(user)) return { alreadyRedeemed: true, access: { allowed: true, reason: 'OWNER' } };
  if (typeof value !== 'string' || value.length > 110) throw fail(422, 'INVALID_KEY', 'Mã kích hoạt không hợp lệ.');
  const compact = value.replace(/[\s-]/g, '').toUpperCase();
  if (!/^TCCK[A-F0-9]{48}$/.test(compact)) throw fail(422, 'INVALID_KEY', 'Mã khóa học phải bắt đầu bằng TCCK và đúng định dạng admin cung cấp.');
  const code = `TCCK-${compact.slice(4).match(/.{1,8}/g).join('-')}`;
  const outcome = await transaction(async (session) => {
    const key = await CourseKey.findOne({ hash: hash(code), courseId }).session(session).lean();
    if (!key || key.status === 'DISABLED') throw fail(422, 'INVALID_KEY', 'Mã không hợp lệ, đã bị vô hiệu hóa hoặc thuộc khóa học khác.');
    const existing = await Enrollment.findOne({ userId: user.id, courseId }).session(session).lean();
    if (existing?.status === 'REVOKED') throw fail(403, 'ACCESS_REVOKED', 'Quyền học đã bị thu hồi. Chỉ admin có thể khôi phục.');
    if (key.status === 'USED') {
      if (key.usedBy === user.id && existing?.status === 'ACTIVE') return { alreadyRedeemed: true };
      throw fail(409, 'KEY_USED', 'Mã này đã được sử dụng.');
    }
    if (key.activateBefore && key.activateBefore.getTime() <= Date.now()) throw fail(422, 'KEY_EXPIRED', 'Mã đã hết hạn kích hoạt.');
    if (existing?.status === 'ACTIVE') throw fail(409, 'ALREADY_HAS_ACCESS', 'Bạn đã có quyền học. Mã chưa bị sử dụng.');
    const claimed = await CourseKey.updateOne({ _id: key._id, status: 'UNUSED' }, { $set: { status: 'USED', usedBy: user.id, usedEmail: user.username, usedAt: new Date() } }, { session });
    if (claimed.modifiedCount !== 1) throw fail(409, 'KEY_USED', 'Mã này đã được sử dụng.');
    await grantEnrollment({ userId: user.id, username: user.username, courseId, source: 'KEY', mongoSession: session });
    await audit(session, { courseId, action: 'REDEEM', actorId: user.id, userId: user.id, email: user.username, keyId: String(key._id) });
    return { alreadyRedeemed: false };
  });
  return { ...outcome, access: await getCourseAccess(user, courseId) };
}

export async function grantCourseEmail(courseId, email, restore, actor) {
  await requireOffering(courseId);
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(422, 'INVALID_EMAIL', 'Email không hợp lệ.');
  if (restore !== undefined && typeof restore !== 'boolean') throw fail(422, 'INVALID_RESTORE', 'Thao tác khôi phục không hợp lệ.');
  return transaction(async (session) => {
    const user = await findRegisteredAccountByEmail(normalizeIdentifier(email), session);
    if (!user) throw fail(404, 'EMAIL_NOT_REGISTERED', 'Email chưa đăng ký trên website.');
    const userId = String(user.id || user._id);
    const current = await Enrollment.findOne({ userId, courseId }).session(session).lean();
    if (current?.status === 'REVOKED' && !restore) throw fail(409, 'RESTORE_REQUIRED', 'Quyền đã bị thu hồi. Hãy chọn Khôi phục trong danh sách học viên.');
    if (current?.status === 'ACTIVE') return { alreadyGranted: true };
    await grantEnrollment({ userId, username: user.username, courseId, source: 'ADMIN', mongoSession: session });
    await audit(session, { courseId, action: restore ? 'RESTORE' : 'GRANT', actorId: actor.id, userId, email: user.username });
    return { alreadyGranted: false };
  });
}

export async function revokeCourseMember(courseId, userId, actor, reason='') {
  if (typeof userId !== 'string' || !userId || userId.length > 150) throw fail(422, 'INVALID_USER', 'Tài khoản không hợp lệ.');
  return transaction(async (session) => {
    const member = await Enrollment.findOneAndUpdate({ courseId, userId, status: 'ACTIVE' }, { $set: { status: 'REVOKED', revokedAt: new Date() } }, { session, returnDocument: 'after' }).lean();
    if (!member) throw fail(409, 'NO_ACTIVE_ACCESS', 'Tài khoản không có quyền đang hoạt động.');
    await audit(session, { courseId, action: 'REVOKE', actorId: actor.id, userId, email: member.username,reason:String(reason).trim().slice(0,500) });
  });
}

export async function disableCourseKey(courseId, id, actor) {
  if (!mongoose.isValidObjectId(id)) throw fail(422, 'INVALID_ID', 'Mã không hợp lệ.');
  return transaction(async (session) => {
    const key = await CourseKey.findOneAndUpdate({ _id: id, courseId, status: 'UNUSED' }, { $set: { status: 'DISABLED' } }, { session, returnDocument: 'after' }).lean();
    if (!key) throw fail(409, 'KEY_NOT_UNUSED', 'Chỉ vô hiệu hóa được mã chưa sử dụng.');
    await audit(session, { courseId, action: 'DISABLE_KEY', actorId: actor.id, keyId: id });
  });
}

export async function listCourseAccess(courseId, { kind = 'members', page = 1, search = '' }) {
  requireStore();
  if (!getCourseOffering(courseId)) throw fail(404, 'COURSE_NOT_FOUND', 'Khóa học không tồn tại.');
  const model = kind === 'members' ? Enrollment : kind === 'keys' ? CourseKey : kind === 'audit' ? CourseAccessAudit : null;
  if (!model) throw fail(404, 'NOT_FOUND', 'Danh sách không tồn tại.');
  const currentPage = Math.max(1, Math.min(100000, Number.parseInt(page, 10) || 1));
  const filter = { courseId };
  if (kind === 'members' && typeof search === 'string' && search.trim()) filter.username = { $regex: `^${normalizeIdentifier(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` };
  const [items, total] = await Promise.all([model.find(filter).select('-hash').sort({ createdAt: -1, _id: -1 }).skip((currentPage - 1) * 25).limit(25).lean(), model.countDocuments(filter)]);
  return { items, total, page: currentPage, pages: Math.max(1, Math.ceil(total / 25)) };
}
