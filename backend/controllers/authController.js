import crypto from 'crypto';
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/emailService.js';
import { verifyFirebaseIdToken } from '../services/firebaseTokenService.js';
import { listActiveEnrollments } from '../services/enrollmentService.js';
import {
  issueSession,
  publicUser,
  rotateSession,
  revokeUserSessions,
  updateMemorySessionUser
} from '../services/sessionService.js';
import {
  hashPassword,
  needsPasswordRehash,
  verifyPassword
} from '../utils/passwordHelper.js';
import {
  isOwnerIdentifier,
  normalizeIdentifier,
  roleForIdentifier
} from '../utils/roles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_USERS_FILE = path.join(__dirname, '../data/users.json');
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const DEVELOPMENT_OTP_PEPPER = crypto.randomBytes(32).toString('hex');
const getOtpPepper = () => (
  process.env.OTP_SECRET
  || process.env.SESSION_SECRET
  || process.env.JWT_SECRET
  || (process.env.NODE_ENV !== 'production' ? DEVELOPMENT_OTP_PEPPER : '')
);
const GENERIC_RESET_MESSAGE = 'Nếu email tồn tại trong hệ thống, mã xác thực sẽ được gửi trong ít phút.';
const DUMMY_PASSWORD_HASH = await hashPassword('not-a-real-user-password');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const httpError = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const normalizeEmail = (value) => normalizeIdentifier(value);

const isValidEmail = (value) => (
  value.length <= 254 && EMAIL_PATTERN.test(value)
);

const validatePassword = (password) => {
  if (typeof password !== 'string') {
    throw httpError(400, 'INVALID_PASSWORD', 'Mật khẩu không hợp lệ.');
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw httpError(
      400,
      'WEAK_PASSWORD',
      `Mật khẩu phải dài từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự.`
    );
  }
};

const normalizeName = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, 120);
};

let localUserMutationQueue = Promise.resolve();

const withLocalUserMutation = (task) => {
  const run = localUserMutationQueue.then(task, task);
  localUserMutationQueue = run.catch(() => {});
  return run;
};

const readLocalUsers = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw httpError(503, 'USER_STORE_UNAVAILABLE', 'MongoDB is required for production authentication.');
  }
  try {
    const users = JSON.parse(await fs.readFile(LOCAL_USERS_FILE, 'utf8'));
    if (!Array.isArray(users)) throw new TypeError('Local user store must contain an array');
    return users;
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw httpError(503, 'USER_STORE_UNAVAILABLE', `Local user store is unavailable: ${error.message}`);
  }
};

const saveLocalUsers = async (users) => {
  const directory = path.dirname(LOCAL_USERS_FILE);
  const temporaryFile = `${LOCAL_USERS_FILE}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600
    });
    await fs.rename(temporaryFile, LOCAL_USERS_FILE);
  } catch (error) {
    try {
      await fs.rm(temporaryFile, { force: true });
    } catch {}
    throw httpError(503, 'USER_STORE_UNAVAILABLE', `Could not persist local users: ${error.message}`);
  }
};

const secretSelection = '+password +otpHash +otpExpiresAt +otpAttempts';

const findUserByIdentifier = async (identifier, { includeSecrets = false } = {}) => {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;

  if (mongoose.connection.readyState === 1) {
    const exactIdentifier = new RegExp(`^${escapeRegex(normalized)}$`, 'i');
    let query = User.findOne({ username: exactIdentifier });
    if (includeSecrets) query = query.select(secretSelection);
    return query;
  }

  return (await readLocalUsers()).find(
    (user) => normalizeIdentifier(user.username || user.email) === normalized
  ) || null;
};

const findUserByUid = async (uid, { includeSecrets = false } = {}) => {
  if (typeof uid !== 'string' || !uid.trim()) return null;
  const normalizedUid = uid.trim();

  if (mongoose.connection.readyState === 1) {
    let query = User.findOne({ uid: normalizedUid });
    if (includeSecrets) query = query.select(secretSelection);
    return query;
  }

  return (await readLocalUsers()).find((user) => user.uid === normalizedUid) || null;
};

const findAuthenticatedUser = async (identity) => {
  const id = typeof identity?.id === 'string' ? identity.id : '';
  const uid = typeof identity?.uid === 'string' ? identity.uid : '';
  const username = normalizeIdentifier(identity?.username || identity?.email);

  if (mongoose.connection.readyState === 1) {
    const candidates = [];
    if (id) candidates.push({ id });
    if (uid) candidates.push({ uid });
    if (username) candidates.push({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') });
    return candidates.length ? User.findOne({ $or: candidates }) : null;
  }

  return (await readLocalUsers()).find((user) => (
    (id && user.id === id)
    || (uid && user.uid === uid)
    || (username && normalizeIdentifier(user.username || user.email) === username)
  )) || null;
};

const createUser = async (userData) => {
  if (mongoose.connection.readyState === 1) {
    return User.create(userData);
  }

  return withLocalUserMutation(async () => {
    const users = await readLocalUsers();
    const username = normalizeIdentifier(userData.username);
    if (users.some((user) => normalizeIdentifier(user.username || user.email) === username)) {
      throw httpError(409, 'ACCOUNT_EXISTS', 'Tài khoản này đã tồn tại.');
    }
    if (userData.uid && users.some((user) => user.uid === userData.uid)) {
      throw httpError(409, 'ACCOUNT_EXISTS', 'Tài khoản này đã tồn tại.');
    }

    const storedUser = { ...userData };
    users.push(storedUser);
    await saveLocalUsers(users);
    return storedUser;
  });
};

const persistUser = async (user) => {
  if (typeof user?.save === 'function') {
    return user.save();
  }

  return withLocalUserMutation(async () => {
    const users = await readLocalUsers();
    const index = users.findIndex((candidate) => (
      (user.id && candidate.id === user.id)
      || (user.uid && candidate.uid === user.uid)
      || normalizeIdentifier(candidate.username || candidate.email) === normalizeIdentifier(user.username || user.email)
    ));
    if (index < 0) {
      throw httpError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.');
    }
    users[index] = { ...user };
    await saveLocalUsers(users);
    return users[index];
  });
};

const rehashPasswordIfCurrent = async (user, password) => {
  const originalPasswordHash = user?.password;
  if (typeof originalPasswordHash !== 'string' || !originalPasswordHash) return null;

  // scrypt deliberately runs before the short compare-and-set write. If a
  // reset changes the password meanwhile, the original hash no longer
  // matches and this login cannot overwrite the newer password.
  const upgradedPasswordHash = await hashPassword(password);

  if (mongoose.connection.readyState === 1) {
    return User.findOneAndUpdate(
      { _id: user._id, password: originalPasswordHash },
      { $set: { password: upgradedPasswordHash } },
      { new: true, runValidators: true }
    ).select(secretSelection);
  }

  return withLocalUserMutation(async () => {
    const users = await readLocalUsers();
    const index = users.findIndex((candidate) => (
      (user.id && candidate.id === user.id)
      || (user.uid && candidate.uid === user.uid)
      || normalizeIdentifier(candidate.username || candidate.email)
        === normalizeIdentifier(user.username || user.email)
    ));
    if (index < 0 || users[index].password !== originalPasswordHash) return null;

    users[index] = { ...users[index], password: upgradedPasswordHash };
    await saveLocalUsers(users);
    return users[index];
  });
};

const sendAuthError = (res, error, fallbackMessage) => {
  const isDuplicate = error?.code === 11000;
  const statusCode = isDuplicate ? 409 : (error?.statusCode || 500);
  const code = isDuplicate ? 'ACCOUNT_EXISTS' : (error?.code || 'AUTH_OPERATION_FAILED');
  if (statusCode >= 500) console.error(`[Auth] ${code}:`, error?.message || error);
  return res.status(statusCode).json({
    success: false,
    code,
    message: statusCode >= 500 ? fallbackMessage : error.message
  });
};

const upsertExternalUser = async ({ uid, email, name, phoneNumber }) => {
  const sameStoredUser = (left, right) => {
    const leftId = left?._id?.toString() || left?.id;
    const rightId = right?._id?.toString() || right?.id;
    return Boolean(leftId && rightId && leftId === rightId);
  };

  const linkIdentity = async (user) => {
    if (user.uid && user.uid !== uid) {
      throw httpError(409, 'ACCOUNT_LINK_CONFLICT', 'Email này đã liên kết với tài khoản khác.');
    }
    user.uid = uid;
    if (email) user.username = normalizeEmail(email);
    if (name) user.name = normalizeName(name);
    if (phoneNumber) user.phoneNumber = String(phoneNumber).trim().slice(0, 32);
    user.role = roleForIdentifier(user.username);
    return persistUser(user);
  };

  const findMatchingUsers = async () => {
    const [uidUser, emailUser] = await Promise.all([
      findUserByUid(uid),
      email ? findUserByIdentifier(email) : Promise.resolve(null)
    ]);
    if (uidUser && emailUser && !sameStoredUser(uidUser, emailUser)) {
      throw httpError(409, 'ACCOUNT_LINK_CONFLICT', 'Danh tính đăng nhập đang liên kết với hai tài khoản khác nhau.');
    }
    return uidUser || emailUser;
  };

  const existingUser = await findMatchingUsers();
  if (existingUser) {
    return linkIdentity(existingUser);
  }

  const username = normalizeEmail(email)
    || `firebase-${crypto.createHash('sha256').update(uid).digest('hex').slice(0, 24)}@users.invalid`;
  try {
    return await createUser({
      id: `u-${crypto.randomUUID()}`,
      uid,
      username,
      name: normalizeName(name) || 'Người dùng',
      phoneNumber: phoneNumber ? String(phoneNumber).trim().slice(0, 32) : '',
      role: roleForIdentifier(username)
    });
  } catch (error) {
    // Two OAuth callbacks can race (redirect result + auth-state listener).
    // The unique indexes choose the winner; the loser reloads and links to it.
    if (error?.code !== 11000) throw error;
    const concurrentUser = await findMatchingUsers();
    if (!concurrentUser) throw error;
    return linkIdentity(concurrentUser);
  }
};

const otpDigest = (email, otpCode) => crypto
  .createHmac('sha256', getOtpPepper() || 'missing-production-otp-secret')
  .update(`${email}\0${otpCode}`)
  .digest('hex');

const otpMatches = (email, otpCode, storedDigest) => {
  if (!/^[a-f0-9]{64}$/i.test(storedDigest || '')) return false;
  const expected = Buffer.from(storedDigest, 'hex');
  const actual = Buffer.from(otpDigest(email, otpCode), 'hex');
  return crypto.timingSafeEqual(actual, expected);
};

const clearOtp = (user) => {
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpAttempts = 0;
  delete user.otpCode;
};

const invalidOtpError = () => httpError(
  400,
  'INVALID_OR_EXPIRED_OTP',
  'Mã xác thực không đúng hoặc đã hết hạn.'
);

const consumePasswordReset = async ({ email, otpCode, newPassword }) => {
  const now = new Date();

  if (mongoose.connection.readyState === 1) {
    const user = await findUserByIdentifier(email, { includeSecrets: true });
    const expiresAt = user?.otpExpiresAt ? new Date(user.otpExpiresAt) : null;
    const expired = !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= now;
    const attempts = Number(user?.otpAttempts || 0);
    const validOtp = Boolean(user)
      && !expired
      && attempts < OTP_MAX_ATTEMPTS
      && otpMatches(email, otpCode, user.otpHash);

    if (!validOtp) {
      if (user) {
        if (expired || attempts >= OTP_MAX_ATTEMPTS) {
          await User.updateOne(
            { _id: user._id, otpHash: user.otpHash },
            {
              $set: { otpAttempts: 0 },
              $unset: { otpHash: 1, otpExpiresAt: 1, otpCode: 1 }
            }
          );
        } else {
          const attempted = await User.findOneAndUpdate(
            {
              _id: user._id,
              otpHash: user.otpHash,
              otpExpiresAt: { $gt: now },
              otpAttempts: { $lt: OTP_MAX_ATTEMPTS }
            },
            { $inc: { otpAttempts: 1 } },
            { new: true, select: secretSelection }
          );
          if (Number(attempted?.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
            await User.updateOne(
              { _id: user._id, otpHash: user.otpHash, otpAttempts: { $gte: OTP_MAX_ATTEMPTS } },
              {
                $set: { otpAttempts: 0 },
                $unset: { otpHash: 1, otpExpiresAt: 1, otpCode: 1 }
              }
            );
          }
        }
      }
      throw invalidOtpError();
    }

    // The OTP hash is part of the filter, so only one concurrent request can
    // consume it. Later requests fail after the first update unsets the hash.
    const passwordHash = await hashPassword(newPassword);
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        otpHash: user.otpHash,
        otpExpiresAt: { $gt: now },
        otpAttempts: { $lt: OTP_MAX_ATTEMPTS }
      },
      {
        $set: { password: passwordHash, otpAttempts: 0 },
        $inc: { sessionVersion: 1 },
        $unset: { otpHash: 1, otpExpiresAt: 1, otpCode: 1 }
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) throw invalidOtpError();
    return updatedUser;
  }

  return withLocalUserMutation(async () => {
    const users = await readLocalUsers();
    const index = users.findIndex(
      (candidate) => normalizeIdentifier(candidate.username || candidate.email) === email
    );
    const user = index >= 0 ? users[index] : null;
    const expiresAt = user?.otpExpiresAt ? new Date(user.otpExpiresAt) : null;
    const expired = !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= now;
    const attempts = Number(user?.otpAttempts || 0);
    const validOtp = Boolean(user)
      && !expired
      && attempts < OTP_MAX_ATTEMPTS
      && otpMatches(email, otpCode, user.otpHash);

    if (!validOtp) {
      if (user) {
        user.otpAttempts = attempts + 1;
        if (expired || user.otpAttempts >= OTP_MAX_ATTEMPTS) clearOtp(user);
        users[index] = user;
        await saveLocalUsers(users);
      }
      throw invalidOtpError();
    }

    user.password = await hashPassword(newPassword);
    user.sessionVersion = Math.max(0, Number(user.sessionVersion) || 0) + 1;
    clearOtp(user);
    users[index] = user;
    await saveLocalUsers(users);
    return user;
  });
};

export const signup = async (req, res) => {
  const username = normalizeEmail(req.body?.username);
  const password = req.body?.password;
  const name = normalizeName(req.body?.name);

  try {
    if (!isValidEmail(username) || !name) {
      throw httpError(400, 'INVALID_SIGNUP_DATA', 'Vui lòng nhập tên và địa chỉ email hợp lệ.');
    }
    validatePassword(password);
    if (isOwnerIdentifier(username)) {
      throw httpError(403, 'PROTECTED_ACCOUNT', 'Tài khoản quản trị phải được xác minh qua nhà cung cấp đăng nhập.');
    }
    if (await findUserByIdentifier(username)) {
      throw httpError(409, 'ACCOUNT_EXISTS', 'Tài khoản này đã tồn tại.');
    }

    const user = await createUser({
      id: `u-${crypto.randomUUID()}`,
      username,
      password: await hashPassword(password),
      name,
      role: 'Student'
    });
    await issueSession(res, user);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: publicUser(user)
    });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể đăng ký tài khoản lúc này.');
  }
};

export const login = async (req, res) => {
  const username = normalizeIdentifier(req.body?.username);
  const password = req.body?.password;

  if (!username || username.length > 254 || typeof password !== 'string' || password.length > PASSWORD_MAX_LENGTH) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ.'
    });
  }

  try {
    let user = await findUserByIdentifier(username, { includeSecrets: true });
    let passwordValid = await verifyPassword(password, user?.password || DUMMY_PASSWORD_HASH);
    if (!user || !passwordValid) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu chưa chính xác.'
      });
    }

    if (needsPasswordRehash(user.password)) {
      const rehashedUser = await rehashPasswordIfCurrent(user, password);
      if (rehashedUser) {
        user = rehashedUser;
      } else {
        // Another login or password reset won the race. Re-read and verify the
        // current hash; never persist the stale user object we verified above.
        user = await findUserByIdentifier(username, { includeSecrets: true });
        passwordValid = await verifyPassword(password, user?.password || DUMMY_PASSWORD_HASH);
        if (!user || !passwordValid) {
          return res.status(401).json({
            success: false,
            code: 'INVALID_CREDENTIALS',
            message: 'Tên đăng nhập hoặc mật khẩu chưa chính xác.'
          });
        }
      }
    }

    await issueSession(res, user);
    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: publicUser(user)
    });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể đăng nhập lúc này.');
  }
};

export const getMe = async (req, res) => {
  try {
    const enrollments = await listActiveEnrollments(req.authUser);
    return res.status(200).json({ success: true, user: req.authUser, enrollments });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể tải thông tin tài khoản.');
  }
};

export const syncFirebaseAuth = async (req, res) => {
  try {
    const identity = await verifyFirebaseIdToken(req.body?.idToken);
    const user = await upsertExternalUser(identity);
    await rotateSession(req, res, user, {
      // A manually verified Firebase token cannot reveal later account
      // revocation. Bound the backend cookie to this signed token's lifetime;
      // the client refresh listener rotates it with each new ID token.
      ttlMs: identity.expiresAt - Date.now()
    });
    return res.json({
      success: true,
      message: 'Đồng bộ tài khoản thành công!',
      user: publicUser(user)
    });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể xác thực tài khoản Firebase lúc này.');
  }
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_EMAIL',
      message: 'Địa chỉ email không hợp lệ.'
    });
  }

  let user;
  try {
    if (!getOtpPepper()) {
      throw httpError(503, 'PASSWORD_RESET_UNAVAILABLE', 'Khôi phục mật khẩu chưa được cấu hình.');
    }
    user = await findUserByIdentifier(email, { includeSecrets: true });
    if (!user) return res.json({ success: true, message: GENERIC_RESET_MESSAGE });

    const otpCode = crypto.randomInt(100_000, 1_000_000).toString();
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpHash = otpDigest(email, otpCode);
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0;
    delete user.otpCode;
    await persistUser(user);

    try {
      const emailResult = await sendOtpEmail(email, user.name, otpCode, otpExpiresAt.toISOString());
      return res.json({
        success: true,
        message: GENERIC_RESET_MESSAGE,
        ...(process.env.NODE_ENV !== 'production' && emailResult?.isMock ? { isMock: true } : {})
      });
    } catch (error) {
      clearOtp(user);
      await persistUser(user).catch(() => {});
      throw httpError(503, 'EMAIL_DELIVERY_UNAVAILABLE', 'Dịch vụ gửi email đang tạm gián đoạn.');
    }
  } catch (error) {
    return sendAuthError(res, error, 'Không thể xử lý yêu cầu khôi phục mật khẩu lúc này.');
  }
};

export const resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otpCode = typeof req.body?.otpCode === 'string' ? req.body.otpCode.trim() : '';
  const newPassword = req.body?.newPassword;

  try {
    if (!getOtpPepper()) {
      throw httpError(503, 'PASSWORD_RESET_UNAVAILABLE', 'Khôi phục mật khẩu chưa được cấu hình.');
    }
    if (!isValidEmail(email) || !/^\d{6}$/.test(otpCode)) {
      throw httpError(400, 'INVALID_RESET_REQUEST', 'Email hoặc mã xác thực không hợp lệ.');
    }
    validatePassword(newPassword);

    const user = await consumePasswordReset({
      email,
      otpCode,
      newPassword
    });
    // The password update increments sessionVersion atomically, so every old
    // cookie is already invalid even if physical cleanup briefly fails.
    try {
      await revokeUserSessions(user);
    } catch (error) {
      console.error('[Auth] Old session cleanup deferred:', error?.message || error);
    }

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.'
    });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể cập nhật mật khẩu lúc này.');
  }
};

const validateProfilePatch = (body = {}) => {
  const patch = {};
  if (body.name !== undefined) {
    const name = normalizeName(body.name);
    if (!name) throw httpError(400, 'INVALID_PROFILE', 'Tên hiển thị không hợp lệ.');
    patch.name = name;
  }
  if (body.phoneNumber !== undefined) {
    if (typeof body.phoneNumber !== 'string' || body.phoneNumber.trim().length > 32) {
      throw httpError(400, 'INVALID_PROFILE', 'Số điện thoại không hợp lệ.');
    }
    patch.phoneNumber = body.phoneNumber.trim();
  }
  if (body.school !== undefined) {
    if (typeof body.school !== 'string' || body.school.trim().length > 160) {
      throw httpError(400, 'INVALID_PROFILE', 'Tên trường không hợp lệ.');
    }
    patch.school = body.school.trim();
  }
  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string' || body.bio.trim().length > 2_000) {
      throw httpError(400, 'INVALID_PROFILE', 'Giới thiệu cá nhân không hợp lệ.');
    }
    patch.bio = body.bio.trim();
  }
  if (body.avatar !== undefined) {
    if (typeof body.avatar !== 'string' || body.avatar.length > 2_500_000) {
      throw httpError(400, 'INVALID_PROFILE', 'Ảnh đại diện không hợp lệ hoặc quá lớn.');
    }
    const isRasterDataUrl = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(body.avatar);
    let isWebUrl = false;
    if (body.avatar) {
      try {
        const parsed = new URL(body.avatar);
        isWebUrl = parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {}
    }
    if (body.avatar && !isRasterDataUrl && !isWebUrl) {
      throw httpError(400, 'INVALID_PROFILE', 'Định dạng ảnh đại diện không được hỗ trợ.');
    }
    patch.avatar = body.avatar;
  }
  return patch;
};

export const updateProfile = async (req, res) => {
  try {
    const user = await findAuthenticatedUser(req.authUser);
    if (!user) throw httpError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.');

    const patch = validateProfilePatch(req.body);
    Object.assign(user, patch);
    const updatedUser = await persistUser(user);
    updateMemorySessionUser(req.authUser.username, updatedUser);

    return res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: publicUser(updatedUser)
    });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể cập nhật hồ sơ lúc này.');
  }
};

const githubRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'UEH-TCC-Web',
      ...options.headers
    },
    signal: AbortSignal.timeout(10_000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw httpError(502, 'GITHUB_AUTH_FAILED', 'GitHub không thể xác thực yêu cầu đăng nhập.');
  }
  return data;
};

// OAuth client IDs identify a public application and are intentionally safe to
// return to the browser. Keep every client secret on the server: the browser
// only needs this value to begin GitHub's authorization-code redirect.
export const getPublicAuthProviders = () => {
  const githubClientId = String(process.env.GITHUB_CLIENT_ID || '').trim();

  return {
    github: {
      enabled: Boolean(githubClientId),
      clientId: githubClientId || null
    }
  };
};

export const getAuthProviders = (_req, res) => {
  res.set('Cache-Control', 'no-store');
  return res.json({
    success: true,
    providers: getPublicAuthProviders()
  });
};

export const exchangeGithubToken = async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!code || code.length > 512) {
    return res.status(400).json({ success: false, code: 'INVALID_OAUTH_CODE', message: 'Mã GitHub không hợp lệ.' });
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw httpError(503, 'GITHUB_AUTH_UNAVAILABLE', 'Đăng nhập GitHub chưa được cấu hình.');
    }

    const tokenData = await githubRequest('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    if (!tokenData.access_token) {
      throw httpError(401, 'GITHUB_AUTH_FAILED', 'Mã GitHub không hợp lệ hoặc đã được sử dụng.');
    }

    const authorization = { Authorization: `Bearer ${tokenData.access_token}` };
    const [githubUser, githubEmails] = await Promise.all([
      githubRequest('https://api.github.com/user', { headers: authorization }),
      githubRequest('https://api.github.com/user/emails', { headers: authorization })
    ]);
    if (!githubUser.id) {
      throw httpError(401, 'GITHUB_AUTH_FAILED', 'Không đọc được danh tính GitHub.');
    }

    const verifiedEmails = Array.isArray(githubEmails)
      ? githubEmails.filter((entry) => entry?.verified && isValidEmail(normalizeEmail(entry.email)))
      : [];
    const email = normalizeEmail(
      verifiedEmails.find((entry) => entry.primary)?.email
      || verifiedEmails[0]?.email
    );
    const login = String(githubUser.login || 'user').replace(/[^a-z0-9-]/gi, '').slice(0, 39) || 'user';
    const fallbackEmail = `${githubUser.id}+${login}@users.noreply.github.com`;
    const user = await upsertExternalUser({
      uid: `github:${githubUser.id}`,
      email: email || fallbackEmail,
      name: githubUser.name || githubUser.login || 'GitHub user',
      phoneNumber: ''
    });
    await issueSession(res, user);

    return res.json({
      success: true,
      message: 'Đăng nhập GitHub thành công!',
      user: publicUser(user)
    });
  } catch (error) {
    return sendAuthError(res, error, 'Không thể đăng nhập GitHub lúc này.');
  }
};
