import crypto from 'crypto';
import path from 'path';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { checkMongoDBConnected } from '../config/db.js';
import { dataDir, readJSONFile, writeJSONFile } from '../utils/jsonHelper.js';
import { assertPersistentStorage } from '../utils/storagePolicy.js';
import { roleForIdentifier } from '../utils/roles.js';

export const SESSION_COOKIE_NAME = 'ueh_tcc_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const sessionsFilePath = path.join(dataDir, 'sessions.json');
const usersFilePath = path.join(dataDir, 'users.json');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const parseCookies = (cookieHeader = '') => Object.fromEntries(
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex < 0) return [part, ''];
      return [
        decodeURIComponent(part.slice(0, separatorIndex)),
        decodeURIComponent(part.slice(separatorIndex + 1))
      ];
    })
);

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: SESSION_TTL_MS,
  path: '/'
});

const publicUser = (user) => ({
  id: user.id || user._id?.toString(),
  uid: user.uid || null,
  username: user.username,
  email: user.username,
  name: user.name,
  role: roleForIdentifier(user.username),
  phoneNumber: user.phoneNumber || '',
  avatar: user.avatar || '',
  school: user.school || '',
  bio: user.bio || ''
});

export const issueSession = async (res, user) => {
  assertPersistentStorage();
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const userId = user.id || user._id?.toString();
  const username = user.username;

  if (!userId || !username) {
    throw new Error('Cannot issue a session without a stable user identity');
  }

  if (checkMongoDBConnected()) {
    await Session.create({ tokenHash, userId, username, expiresAt });
  } else {
    const now = Date.now();
    const sessions = readJSONFile(sessionsFilePath, [])
      .filter((session) => new Date(session.expiresAt).getTime() > now);
    sessions.push({
      tokenHash,
      userId,
      username,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    });
    writeJSONFile(sessionsFilePath, sessions);
  }

  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());
};

export const resolveSessionUser = async (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const tokenHash = hashToken(token);
  let session = null;
  assertPersistentStorage();

  if (checkMongoDBConnected()) {
    session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() }
    }).lean();
  } else {
    const sessions = readJSONFile(sessionsFilePath, []);
    session = sessions.find((item) => (
      item.tokenHash === tokenHash
      && new Date(item.expiresAt).getTime() > Date.now()
    ));
  }

  if (!session) return null;

  let user = null;
  if (checkMongoDBConnected()) {
    user = await User.findOne({
      $or: [{ id: session.userId }, { username: session.username }]
    }).lean();
  } else {
    const users = readJSONFile(usersFilePath, []);
    user = users.find((item) => (
      item.id === session.userId || item.username === session.username
    ));
  }

  return user ? publicUser(user) : null;
};

export const revokeSession = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];

  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });

  if (token) {
    assertPersistentStorage();
    const tokenHash = hashToken(token);
    if (checkMongoDBConnected()) {
      await Session.deleteOne({ tokenHash });
    } else {
      const sessions = readJSONFile(sessionsFilePath, [])
        .filter((session) => session.tokenHash !== tokenHash);
      writeJSONFile(sessionsFilePath, sessions);
    }
  }

};
