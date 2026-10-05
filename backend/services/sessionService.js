import crypto from 'crypto';
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { normalizeIdentifier, roleForIdentifier } from '../utils/roles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE_PATH = path.join(__dirname, '../data/users.json');

export const SESSION_COOKIE_NAME = 'ueh_tcc_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MEMORY_SESSIONS = new Map();

const cleanupMemorySessions = () => {
  const now = Date.now();
  for (const [tokenHash, session] of MEMORY_SESSIONS.entries()) {
    if (new Date(session.expiresAt).getTime() <= now) MEMORY_SESSIONS.delete(tokenHash);
  }
};

const memoryCleanupTimer = setInterval(cleanupMemorySessions, 15 * 60 * 1000);
memoryCleanupTimer.unref?.();

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sessionStoreError = (message, cause) => {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = 'SESSION_STORE_UNAVAILABLE';
  error.statusCode = 503;
  return error;
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
};

const parseCookies = (cookieHeader = '') => Object.fromEntries(
  String(cookieHeader)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex < 0) return [safeDecode(part), ''];
      return [
        safeDecode(part.slice(0, separatorIndex)),
        safeDecode(part.slice(separatorIndex + 1))
      ];
    })
    .filter(([name]) => name)
);

const bearerToken = (authorization = '') => {
  const match = /^Bearer\s+([^\s]+)$/i.exec(String(authorization).trim());
  return match?.[1] || '';
};

const requestToken = (req) => {
  const cookieToken = parseCookies(req.headers?.cookie)[SESSION_COOKIE_NAME];
  const token = cookieToken || bearerToken(req.headers?.authorization);
  return typeof token === 'string' && token.length >= 32 && token.length <= 512
    ? token
    : '';
};

const normalizeSessionTtl = (ttlMs) => {
  const requestedTtl = Number(ttlMs);
  if (!Number.isFinite(requestedTtl)) return SESSION_TTL_MS;
  return Math.min(SESSION_TTL_MS, Math.max(1_000, Math.floor(requestedTtl)));
};

export const getSessionCookieOptions = (ttlMs = SESSION_TTL_MS) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredSameSite = String(process.env.SESSION_COOKIE_SAME_SITE || 'lax').toLowerCase();
  const sameSite = ['lax', 'strict', 'none'].includes(configuredSameSite)
    ? configuredSameSite
    : 'lax';
  const configuredSecure = process.env.SESSION_COOKIE_SECURE;
  const secure = sameSite === 'none'
    || isProduction
    || configuredSecure === 'true';
  const configuredDomain = String(process.env.SESSION_COOKIE_DOMAIN || '').trim();
  const domain = /^\.?[a-z0-9.-]+$/i.test(configuredDomain)
    ? configuredDomain
    : '';
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: normalizeSessionTtl(ttlMs),
    path: '/',
    priority: 'high',
    ...(domain ? { domain } : {})
  };
};

const toPlainObject = (user) => (
  typeof user?.toObject === 'function' ? user.toObject() : user
);

const sessionVersionOf = (user) => {
  const value = Number(toPlainObject(user)?.sessionVersion ?? 0);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
};

export const isSessionVersionCurrent = (session, user) => (
  sessionVersionOf(session) === sessionVersionOf(user)
);

export const publicUser = (user) => {
  const value = toPlainObject(user) || {};
  const username = normalizeIdentifier(value.username || value.email);
  return {
    id: value.id || value._id?.toString(),
    uid: value.uid || null,
    username,
    email: username,
    name: value.name || '',
    role: roleForIdentifier(username),
    phoneNumber: value.phoneNumber || '',
    avatar: value.avatar || value.photoURL || '',
    photoURL: value.avatar || value.photoURL || '',
    school: value.school || '',
    bio: value.bio || ''
  };
};

export const updateMemorySessionUser = (username, updatedUser) => {
  const normalizedUsername = normalizeIdentifier(username);
  const pub = publicUser(updatedUser);
  const sessionVersion = sessionVersionOf(updatedUser);
  for (const [tokenHash, session] of MEMORY_SESSIONS.entries()) {
    if (
      normalizeIdentifier(session.username) === normalizedUsername
      || session.userId === pub.id
    ) {
      MEMORY_SESSIONS.set(tokenHash, {
        ...session,
        username: pub.username,
        sessionVersion,
        user: pub
      });
    }
  }
};

const readLocalUsers = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw sessionStoreError('MongoDB is required for production sessions');
  }
  try {
    const parsed = JSON.parse(await fs.readFile(USERS_FILE_PATH, 'utf8'));
    if (!Array.isArray(parsed)) throw new TypeError('Local user store must contain an array');
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw sessionStoreError('Local user store is unavailable', error);
  }
};

const getFreshUser = async (identifier) => {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;

  if (mongoose.connection.readyState === 1) {
    try {
      const exactIdentifier = new RegExp(`^${escapeRegex(normalized)}$`, 'i');
      const user = await User.findOne({
        $or: [
          { id: normalized },
          { uid: normalized },
          { username: exactIdentifier }
        ]
      }).lean();
      return user ? { user: publicUser(user), sessionVersion: sessionVersionOf(user) } : null;
    } catch (error) {
      throw sessionStoreError('Database user lookup failed', error);
    }
  }

  const found = (await readLocalUsers()).find((user) => (
    normalizeIdentifier(user.id) === normalized
    || normalizeIdentifier(user.uid) === normalized
    || normalizeIdentifier(user.username || user.email) === normalized
  ));
  return found ? { user: publicUser(found), sessionVersion: sessionVersionOf(found) } : null;
};

export const issueSession = async (res, user, { ttlMs = SESSION_TTL_MS } = {}) => {
  const safeUser = publicUser(user);
  const sessionVersion = sessionVersionOf(user);
  const userId = safeUser.id;
  const username = safeUser.username;

  if (!userId || !username) {
    throw new TypeError('Cannot issue a session without a stable user identity');
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const normalizedTtl = normalizeSessionTtl(ttlMs);
  const expiresAt = new Date(Date.now() + normalizedTtl);
  const session = { userId, username, sessionVersion, expiresAt, user: safeUser };

  if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV === 'production') {
    throw sessionStoreError('MongoDB is required for production sessions');
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await Session.create({ tokenHash, userId, username, sessionVersion, expiresAt });
    } catch (error) {
      throw sessionStoreError('Could not persist the login session', error);
    }
  }

  MEMORY_SESSIONS.set(tokenHash, session);
  res.setHeader('Cache-Control', 'no-store');
  res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions(normalizedTtl));
  return token;
};

export const resolveSessionUser = async (req) => {
  const token = requestToken(req);
  if (!token) return null;

  const tokenHash = hashToken(token);
  if (mongoose.connection.readyState === 1) {
    let persistedSession;
    try {
      persistedSession = await Session.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() }
      }).lean();
    } catch (error) {
      throw sessionStoreError('Database session lookup failed', error);
    }

    if (!persistedSession) {
      MEMORY_SESSIONS.delete(tokenHash);
      return null;
    }
    const freshIdentity = await getFreshUser(
      persistedSession.username || persistedSession.userId
    );
    if (!freshIdentity || !isSessionVersionCurrent(persistedSession, freshIdentity)) {
      MEMORY_SESSIONS.delete(tokenHash);
      await Session.deleteOne({ tokenHash }).catch(() => {});
      return null;
    }

    MEMORY_SESSIONS.set(tokenHash, { ...persistedSession, user: freshIdentity.user });
    return freshIdentity.user;
  }

  if (process.env.NODE_ENV === 'production') {
    throw sessionStoreError('MongoDB is required for production sessions');
  }

  const memorySession = MEMORY_SESSIONS.get(tokenHash);
  if (!memorySession) return null;
  if (memorySession.expiresAt <= new Date()) {
    MEMORY_SESSIONS.delete(tokenHash);
    return null;
  }

  const freshIdentity = await getFreshUser(memorySession.username || memorySession.userId);
  if (!freshIdentity || !isSessionVersionCurrent(memorySession, freshIdentity)) {
    MEMORY_SESSIONS.delete(tokenHash);
    return null;
  }

  MEMORY_SESSIONS.set(tokenHash, { ...memorySession, user: freshIdentity.user });
  return freshIdentity.user;
};

const revokeRequestTokens = async (req) => {
  const cookieToken = parseCookies(req.headers?.cookie)[SESSION_COOKIE_NAME] || '';
  const authorizationToken = bearerToken(req.headers?.authorization);
  const tokens = [...new Set([cookieToken, authorizationToken].filter(
    (token) => token.length >= 32 && token.length <= 512
  ))];
  if (tokens.length === 0) return;

  if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV === 'production') {
    throw sessionStoreError('Could not revoke the session while the database is unavailable');
  }

  const tokenHashes = tokens.map(hashToken);

  if (mongoose.connection.readyState === 1) {
    try {
      await Session.deleteMany({ tokenHash: { $in: tokenHashes } });
    } catch (error) {
      throw sessionStoreError('Could not revoke the persisted session', error);
    }
  }

  for (const tokenHash of tokenHashes) MEMORY_SESSIONS.delete(tokenHash);
};

export const revokeSession = async (req, res) => {
  await revokeRequestTokens(req);
  const { maxAge, ...clearOptions } = getSessionCookieOptions();
  res.clearCookie(SESSION_COOKIE_NAME, clearOptions);
};

export const rotateSession = async (req, res, user, options) => {
  await revokeRequestTokens(req);
  return issueSession(res, user, options);
};

export const revokeUserSessions = async (user) => {
  const safeUser = publicUser(user);
  if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV === 'production') {
    throw sessionStoreError('Could not revoke user sessions while the database is unavailable');
  }

  for (const [tokenHash, session] of MEMORY_SESSIONS.entries()) {
    if (session.userId === safeUser.id || normalizeIdentifier(session.username) === safeUser.username) {
      MEMORY_SESSIONS.delete(tokenHash);
    }
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await Session.deleteMany({
        $or: [
          { userId: safeUser.id },
          { username: safeUser.username }
        ]
      });
    } catch (error) {
      throw sessionStoreError('Could not revoke existing user sessions', error);
    }
  }
};
