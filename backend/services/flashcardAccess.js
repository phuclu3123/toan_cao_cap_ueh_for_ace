import crypto from 'node:crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Access from '../models/FlashcardAccess.js';
import Key from '../models/FlashcardKey.js';
import Audit from '../models/FlashcardAudit.js';
import RateLimit from '../models/FlashcardRateLimit.js';
import { hasOwnerRole, normalizeIdentifier } from '../utils/roles.js';

export const accessError = (status, code, message) => Object.assign(new Error(message), { status, code });
let accessIndexesReady = false;
export function requireAccessDatabase() {
  if (mongoose.connection.readyState !== 1) throw accessError(503, 'ACCESS_UNAVAILABLE', 'Chưa kết nối được hệ thống phân quyền. Vui lòng thử lại.');
  if (!accessIndexesReady) throw accessError(503, 'ACCESS_INITIALIZING', 'Hệ thống phân quyền Flashcard chưa sẵn sàng. Vui lòng thử lại.');
}
export function futureDate(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 40) throw accessError(422, 'INVALID_EXPIRY', 'Thời hạn không hợp lệ.');
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) throw accessError(422, 'INVALID_EXPIRY', 'Thời hạn phải ở tương lai.');
  return date;
}
export const effectiveStatus = (doc, now = Date.now()) => !doc ? 'NONE'
  : doc.status === 'REVOKED' ? 'REVOKED'
    : doc.expiresAt && new Date(doc.expiresAt).getTime() <= now ? 'EXPIRED' : 'ACTIVE';

export async function getFlashcardAccess(user) {
  requireAccessDatabase();
  if (hasOwnerRole(user)) return { allowed: true, status: 'ADMIN', expiresAt: null, isAdmin: true };
  const doc = await Access.findOne({ userId: user.id }).lean();
  const status = effectiveStatus(doc);
  return { allowed: status === 'ACTIVE', status, expiresAt: doc?.expiresAt || null, isAdmin: false };
}

// Mongo retries transient conflicts. Retry a first-time unique upsert race too.
async function transaction(work) {
  requireAccessDatabase();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await mongoose.connection.transaction(work, {
        readPreference: 'primary', readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }
      });
    } catch (error) {
      if (error.code === 11000 && attempt < 2) continue;
      throw error;
    }
  }
}
const audit = async (session, entry) => Audit.create([entry], { session });
// Match publicUser()/sessionService exactly, including migrated Mongo accounts.
const stableId = user => String(user.id || user._id?.toString() || '');
function reasonText(reason) {
  if (reason === undefined) return '';
  if (typeof reason !== 'string' || reason.length > 500) throw accessError(422, 'INVALID_REASON', 'Ghi chú tối đa 500 ký tự.');
  return reason.trim();
}

export async function grantEmail({ email, expiresAt, reason, restore = false }, actor) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw accessError(422, 'INVALID_EMAIL', 'Email không hợp lệ.');
  const normalized = normalizeIdentifier(email);
  const expiry = futureDate(expiresAt);
  const note = reasonText(reason);
  return transaction(async session => {
    const user = await User.findOne({ username: normalized }).session(session).lean();
    if (!user) throw accessError(404, 'EMAIL_NOT_REGISTERED', 'Email chưa đăng ký trên website.');
    const userId = stableId(user);
    if (!userId) throw accessError(409, 'USER_ID_MISSING', 'Tài khoản chưa có ID ổn định.');
    const existing = await Access.findOne({ userId }).session(session).lean();
    if (existing?.status === 'REVOKED' && !restore) throw accessError(409, 'RESTORE_REQUIRED', 'Quyền đã bị thu hồi. Hãy dùng thao tác Khôi phục.');
    const doc = await Access.findOneAndUpdate({ userId }, {
      $set: { email: normalized, status: 'ACTIVE', source: 'ADMIN', expiresAt: expiry,
        grantedAt: new Date(), grantedBy: actor.id, revokedAt: null },
      $inc: { revision: 1 }
    }, { upsert: true, new: true, session, setDefaultsOnInsert: false }).lean();
    await audit(session, { action: existing?.status === 'REVOKED' ? 'RESTORE' : 'GRANT', actorId: actor.id, userId, email: normalized, reason: note });
    return doc;
  });
}

export async function revokeAccess(userId, reason, actor) {
  const note = reasonText(reason);
  return transaction(async session => {
    const doc = await Access.findOneAndUpdate({ userId, status: 'ACTIVE' }, {
      $set: { status: 'REVOKED', revokedAt: new Date() }, $inc: { revision: 1 }
    }, { new: true, session }).lean();
    if (!doc) throw accessError(409, 'NO_ACTIVE_ACCESS', 'Không có quyền đang cấp để thu hồi.');
    await audit(session, { action: 'REVOKE', actorId: actor.id, userId, email: doc.email, reason: note });
    return doc;
  });
}

export async function issueKeys({ count = 1, activateBefore, accessDays }, actor) {
  if (!Number.isInteger(count) || count < 1 || count > 50) throw accessError(422, 'INVALID_COUNT', 'Mỗi lần tạo từ 1 đến 50 mã.');
  const expiry = futureDate(activateBefore);
  const days = accessDays === undefined || accessDays === null || accessDays === '' ? null : accessDays;
  if (days !== null && (!Number.isInteger(days) || days < 1 || days > 3650)) throw accessError(422, 'INVALID_DAYS', 'Thời hạn quyền từ 1 đến 3.650 ngày hoặc để trống.');
  const codes = Array.from({ length: count }, () => `TCC-${crypto.randomBytes(24).toString('hex').toUpperCase().match(/.{1,8}/g).join('-')}`);
  await transaction(async session => {
    const docs = await Key.create(codes.map(code => ({ hash: hashKey(code), label: `…${code.slice(-8)}`, createdBy: actor.id, activateBefore: expiry, accessDays: days })), { session, ordered: true });
    await audit(session, { action: 'ISSUE_KEYS', actorId: actor.id, reason: `Tạo ${docs.length} mã` });
  });
  return codes;
}
function hashKey(code) { return crypto.createHash('sha256').update(code).digest('hex'); }
function normalizeKey(value) {
  if (typeof value !== 'string' || value.length > 100) throw accessError(422, 'INVALID_KEY', 'Mã kích hoạt không hợp lệ.');
  const compact = value.replace(/[\s-]/g, '').toUpperCase();
  if (!/^TCC[A-F0-9]{48}$/.test(compact)) throw accessError(422, 'INVALID_KEY', 'Mã kích hoạt không hợp lệ.');
  return `TCC-${compact.slice(3).match(/.{1,8}/g).join('-')}`;
}

export async function redeemKey(value, user) {
  const code = normalizeKey(value);
  return transaction(async session => {
    const key = await Key.findOne({ hash: hashKey(code) }).session(session).lean();
    if (!key || key.status === 'DISABLED') throw accessError(422, 'INVALID_KEY', 'Mã không hợp lệ hoặc đã bị vô hiệu hóa.');
    const existing = await Access.findOne({ userId: user.id }).session(session).lean();
    if (existing?.status === 'REVOKED') throw accessError(403, 'ACCESS_REVOKED', 'Quyền đã bị thu hồi. Chỉ quản trị viên có thể khôi phục.');
    // Retry after a lost HTTP response returns the original outcome, never grants again.
    if (key.status === 'USED') {
      if (key.usedBy === user.id && effectiveStatus(existing) === 'ACTIVE') return { alreadyRedeemed: true };
      throw accessError(409, 'KEY_USED', 'Mã này đã được sử dụng.');
    }
    if (key.activateBefore && key.activateBefore.getTime() <= Date.now()) throw accessError(422, 'KEY_EXPIRED', 'Mã đã hết hạn kích hoạt.');
    if (effectiveStatus(existing) === 'ACTIVE') throw accessError(409, 'ALREADY_HAS_ACCESS', 'Bạn đã có quyền Flashcard. Mã vẫn chưa được sử dụng.');
    const now = new Date();
    const claimed = await Key.updateOne({ _id: key._id, status: 'UNUSED' }, { $set: { status: 'USED', usedBy: user.id, usedEmail: user.username || user.email, usedAt: now } }, { session });
    if (claimed.modifiedCount !== 1) throw accessError(409, 'KEY_USED', 'Mã này đã được sử dụng.');
    await Access.findOneAndUpdate({ userId: user.id }, {
      $set: { email: user.username || user.email, status: 'ACTIVE', source: 'KEY', grantedAt: now,
        grantedBy: key.createdBy, revokedAt: null, expiresAt: key.accessDays ? new Date(now.getTime() + key.accessDays * 86400000) : null },
      $inc: { revision: 1 }
    }, { upsert: true, session, setDefaultsOnInsert: false });
    await audit(session, { action: 'REDEEM', actorId: user.id, userId: user.id, email: user.username || user.email, keyId: String(key._id) });
    return { alreadyRedeemed: false };
  });
}

export async function disableKey(id, actor) {
  if (!mongoose.isValidObjectId(id)) throw accessError(422, 'INVALID_ID', 'Mã không hợp lệ.');
  return transaction(async session => {
    const key = await Key.findOneAndUpdate({ _id: id, status: 'UNUSED' }, { $set: { status: 'DISABLED' } }, { session, new: true }).lean();
    if (!key) throw accessError(409, 'KEY_NOT_UNUSED', 'Chỉ vô hiệu hóa được mã chưa sử dụng.');
    await audit(session, { action: 'DISABLE_KEY', actorId: actor.id, keyId: id });
    return key;
  });
}

export async function consumeAccessLimit(scope, identifier, max, windowMs = 60000) {
  requireAccessDatabase();
  const bucket = Math.floor(Date.now() / windowMs);
  const _id = hashKey(`${scope}:${identifier}:${bucket}`);
  let counter;
  try {
    counter = await RateLimit.findOneAndUpdate({ _id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) } }, { upsert: true, new: true }).lean();
  } catch (error) {
    if (error.code !== 11000) throw error;
    counter = await RateLimit.findOneAndUpdate({ _id }, { $inc: { count: 1 } }, { new: true }).lean();
  }
  if (!counter || counter.count > max) throw accessError(429, 'RATE_LIMITED', 'Bạn thao tác quá nhanh. Vui lòng chờ một phút.');
}

export async function listAccessData(kind, { page = 1, search = '' }) {
  const models = { members: Access, keys: Key, audit: Audit };
  const model = Object.hasOwn(models, kind) ? models[kind] : null;
  if (!model) throw accessError(404, 'NOT_FOUND', 'Danh sách không tồn tại.');
  const currentPage = Math.min(100000, Math.max(1, Number.parseInt(page, 10) || 1));
  const filter = {};
  if (kind === 'members' && typeof search === 'string' && search.trim()) {
    const escaped = normalizeIdentifier(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.email = { $regex: `^${escaped}` };
  }
  const [items, total] = await Promise.all([
    model.find(filter).sort({ createdAt: -1, _id: -1 }).skip((currentPage - 1) * 25).limit(25).lean(),
    model.countDocuments(filter)
  ]);
  return { items: kind === 'members' ? items.map(doc => ({ ...doc, effectiveStatus: effectiveStatus(doc) })) : items,
    total, page: currentPage, pages: Math.max(1, Math.ceil(total / 25)) };
}

export async function initializeFlashcardAccess() {
  accessIndexesReady = false;
  if (mongoose.connection.readyState !== 1) throw accessError(503, 'ACCESS_UNAVAILABLE', 'MongoDB chưa kết nối.');
  // bufferCommands=false: models must not auto-create before connect. Creating
  // indexes explicitly here also creates missing collections without using the
  // cached Model.init() promise from module evaluation. Never drop/sync indexes.
  for (const model of [Access, Key, Audit, RateLimit]) {
    for (const [fields, options] of model.schema.indexes()) {
      await model.collection.createIndex(fields, { ...options, maxTimeMS: 10000 });
    }
  }
  accessIndexesReady = true;
}
