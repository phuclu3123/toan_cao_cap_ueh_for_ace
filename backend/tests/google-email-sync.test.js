import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { resolveSessionUser } from '../services/sessionService.js';
import { upsertExternalUser } from '../controllers/authController.js';
import { verifyFirebaseIdToken, getConfiguredFirebaseProjectId } from '../services/firebaseTokenService.js';

const originalFind = User.findOne;
const originalCreate = User.create;
const originalFetch = globalThis.fetch;
const originalSessionFind = Session.findOne;
const originalSessionDelete = Session.deleteOne;
const stateDescriptor = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const cert = keys.publicKey.export({ format: 'pem', type: 'spki' });
const subject = 'google-email-regression-uid';
const email = 'verified-student@example.test';
let rows;
let creates;
let saves;

beforeEach(() => {
  rows = []; creates = 0; saves = 0;
  // Stub all persistence in this process. No real connection, account, session or file writes.
  Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, get: () => 1 });
  User.findOne = query => {
    const match = part => rows.find(row => Object.entries(part).every(([key, value]) => value instanceof RegExp ? value.test(row[key] || '') : row[key] === value));
    const row = query.$or ? query.$or.map(match).find(Boolean) || null : match(query) || null;
    return { lean: async () => row, then: (resolve, reject) => Promise.resolve(row).then(resolve, reject) };
  };
  User.create = async data => {
    creates += 1;
    const row = { ...data, save: async function () { saves += 1; return this; } };
    rows.push(row); return row;
  };
  globalThis.fetch = async () => Response.json({ 'google-email-regression-key': cert }, { headers: { 'cache-control': 'max-age=3600' } });
});
afterEach(() => {
  User.findOne = originalFind; User.create = originalCreate; globalThis.fetch = originalFetch;
  Session.findOne = originalSessionFind; Session.deleteOne = originalSessionDelete;
  if (stateDescriptor) Object.defineProperty(mongoose.connection, 'readyState', stateDescriptor);
  else delete mongoose.connection.readyState;
});

function token(extra = {}) {
  const project = getConfiguredFirebaseProjectId();
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const data = `${encode({ alg: 'RS256', kid: 'google-email-regression-key' })}.${encode({
    aud: project, iss: `https://securetoken.google.com/${project}`, sub: subject,
    iat: now, auth_time: now, exp: now + 3600, firebase: { sign_in_provider: 'google.com' }, ...extra
  })}`;
  return `${data}.${crypto.sign('RSA-SHA256', Buffer.from(data), keys.privateKey).toString('base64url')}`;
}
async function sync(extra) {
  const identity = await verifyFirebaseIdToken(token(extra));
  return upsertExternalUser({ provider: 'firebase', subject: identity.uid,
    email: identity.email, emailVerified: identity.emailVerified,
    requireVerifiedEmail: identity.signInProvider === 'google.com', name: 'Provider Name' });
}
function existing(username) {
  const row = { id: 'stable-existing-account', uid: subject, firebaseUid: subject, username,
    name: 'Tên đã lưu', school: 'UEH', bio: 'Ghi chú đã lưu',
    save: async function () { saves += 1; return this; } };
  rows.push(row); return row;
}

test('verified Google email repairs the placeholder on the same Firebase UID and preserves its profile/id', async () => {
  const user = existing('firebase-012345678901234567890123@users.invalid');
  const result = await sync({ email, email_verified: true });
  assert.equal(result, user);
  assert.equal(result.id, 'stable-existing-account');
  assert.equal(result.uid, subject);
  assert.equal(result.firebaseUid, subject);
  assert.equal(result.username, email);
  assert.equal(result.name, 'Tên đã lưu');
  assert.equal(result.bio, 'Ghi chú đã lưu');
  assert.equal(creates, 0); assert.equal(saves, 1);
});
test('new Google users without email fail before creating a placeholder account', async () => {
  await assert.rejects(sync({}), error => error.code === 'GOOGLE_EMAIL_REQUIRED' && error.statusCode === 422);
  assert.equal(creates, 0); assert.equal(saves, 0);
});

test('Firebase phone sign-in retains its existing no-email account flow', async () => {
  const user = await sync({ firebase: { sign_in_provider: 'phone' }, phone_number: '+84000000000' });
  assert.match(user.username, /^firebase-[a-f0-9]{24}@users\.invalid$/);
  assert.equal(creates, 1);
});
test('an existing placeholder without email receives a recoverable error, with no data changes', async () => {
  const user = existing('firebase-012345678901234567890123@users.invalid');
  await assert.rejects(sync({}), error => error.code === 'GOOGLE_EMAIL_REQUIRED');
  assert.match(user.username, /@users\.invalid$/);
  assert.equal(creates, 0); assert.equal(saves, 0);
});
test('a returning verified UID reuses a canonical account even when email is absent from this token', async () => {
  const user = existing(email);
  assert.equal(await sync({}), user);
  assert.equal(user.username, email); assert.equal(creates, 0);
});
test('a new Google account with verified email is created once and reused on the next sign-in', async () => {
  const first = await sync({ email, email_verified: true });
  const again = await sync({ email, email_verified: true });
  assert.equal(first, again); assert.equal(creates, 1);
});
test('an unverified Google email cannot mutate or link an account', async () => {
  const user = existing(email);
  await assert.rejects(sync({ email, email_verified: false }), error => error.code === 'INVALID_FIREBASE_TOKEN');
  assert.equal(user.username, email); assert.equal(saves, 0); assert.equal(creates, 0);
});
test('a verified email belonging to another user is rejected instead of merging accounts', async () => {
  const original = existing('firebase-012345678901234567890123@users.invalid');
  rows.push({ id: 'other-account', username: email, firebaseUid: 'different-uid' });
  await assert.rejects(sync({ email, email_verified: true }), error => error.code === 'ACCOUNT_LINK_CONFLICT');
  assert.match(original.username, /@users\.invalid$/); assert.equal(saves, 0); assert.equal(creates, 0);
});
test('an existing canonical email is not silently changed to a different provider email', async () => {
  const user = existing('canonical@example.test');
  assert.equal(await sync({ email, email_verified: true }), user);
  assert.equal(user.username, 'canonical@example.test');
});

test('a session issued before email completion still resolves the same account by its stable ID', async () => {
  const oldEmail = 'firebase-012345678901234567890123@users.invalid';
  existing(email);
  Session.findOne = () => ({ lean: async () => ({ userId: 'stable-existing-account', username: oldEmail, sessionVersion: 0, expiresAt: new Date(Date.now() + 60000) }) });
  Session.deleteOne = async () => { assert.fail('a valid session must not be deleted after completing its email'); };
  const user = await resolveSessionUser({ headers: { cookie: 'ueh_tcc_session=regression-session-token-email-upgrade' } });
  assert.equal(user.id, 'stable-existing-account');
  assert.equal(user.username, email);
});

test('legacy sessions cannot switch to another account reusing their previous email', async () => {
  const replacement = existing(email); replacement.id = 'different-account';
  let revoked = false;
  Session.findOne = () => ({ lean: async () => ({ userId: 'deleted-account', username: email, sessionVersion: 0, expiresAt: new Date(Date.now() + 60000) }) });
  Session.deleteOne = async () => { revoked = true; };
  const user = await resolveSessionUser({ headers: { cookie: 'ueh_tcc_session=regression-session-token-deleted-account' } });
  assert.equal(user, null); assert.equal(revoked, true);
});
