import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';
import User from '../src/modules/identity/persistence/User.js';
import Session from '../src/modules/identity/persistence/Session.js';
import { resolveSessionUser } from '../src/modules/identity/application/sessionService.js';
import { resolveFirebaseLogin, refreshFirebaseSession } from '../src/modules/identity/http/authController.js';
import { getConfiguredFirebaseProjectId } from '../src/modules/identity/application/firebaseTokenService.js';

const originalFind = User.findOne;
const originalCreate = User.create;
const originalFetch = globalThis.fetch;
const originalSessionUpdate = Session.updateOne;
const originalSessionFind = Session.findOne;
const originalSessionDelete = Session.deleteOne;
const originalGoogleCerts = OAuth2Client.prototype.getFederatedSignonCertsAsync;
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
const originalGoogleClientIds = process.env.GOOGLE_CLIENT_IDS;
const originalViteGoogleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
const stateDescriptor = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const cert = keys.publicKey.export({ format: 'pem', type: 'spki' });
const subject = 'google-email-regression-uid';
const email = 'verified-student@example.test';
const googleSubject = '123456789012345678901';
const audience = '1234567890-regression.apps.googleusercontent.com';
let rows;
let creates;
let saves;

beforeEach(() => {
  rows = []; creates = 0; saves = 0;
  process.env.GOOGLE_CLIENT_ID = audience;
  delete process.env.GOOGLE_CLIENT_IDS;
  delete process.env.VITE_GOOGLE_CLIENT_ID;
  OAuth2Client.prototype.getFederatedSignonCertsAsync = async () => ({ certs: { 'google-email-regression-key': cert }, format: 'PEM' });
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
  Session.updateOne = originalSessionUpdate;
  Session.findOne = originalSessionFind; Session.deleteOne = originalSessionDelete;
  OAuth2Client.prototype.getFederatedSignonCertsAsync = originalGoogleCerts;
  for (const [key, value] of Object.entries({ GOOGLE_CLIENT_ID: originalGoogleClientId, GOOGLE_CLIENT_IDS: originalGoogleClientIds, VITE_GOOGLE_CLIENT_ID: originalViteGoogleClientId })) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  if (stateDescriptor) Object.defineProperty(mongoose.connection, 'readyState', stateDescriptor);
  else delete mongoose.connection.readyState;
});

function token(extra = {}) {
  const project = getConfiguredFirebaseProjectId();
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const data = `${encode({ alg: 'RS256', kid: 'google-email-regression-key' })}.${encode({
    aud: project, iss: `https://securetoken.google.com/${project}`, sub: subject,
    iat: now, auth_time: now, exp: now + 3600, firebase: { sign_in_provider: 'google.com', identities: { 'google.com': [googleSubject] } }, ...extra
  })}`;
  return `${data}.${crypto.sign('RSA-SHA256', Buffer.from(data), keys.privateKey).toString('base64url')}`;
}
async function sync(extra, googleIdToken) {
  return (await resolveFirebaseLogin({ idToken: token(extra), googleIdToken })).user;
}
function googleToken(extra = {}, signingKey = keys.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const data = `${encode({ alg: 'RS256', kid: 'google-email-regression-key' })}.${encode({
    aud: audience, iss: 'https://accounts.google.com', sub: googleSubject,
    iat: now, exp: now + 3600, email, email_verified: true, ...extra
  })}`;
  return `${data}.${crypto.sign('RSA-SHA256', Buffer.from(data), signingKey).toString('base64url')}`;
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

test('multiple-accounts-per-email: two verified tokens create one account and reuse it on later login', async () => {
  const first = await sync({}, googleToken());
  const later = await sync({});
  assert.equal(first, later); assert.equal(creates, 1); assert.equal(first.username, email);
});

test('multiple-accounts-per-email: repairs the original placeholder without changing id, legacy uid, profile or references', async () => {
  const user = existing('firebase-012345678901234567890123@users.invalid');
  delete user.firebaseUid; // Exercise an older record that only had uid.
  user._id = 'original-mongo-id'; user.avatar = '/original.png'; user.phoneNumber = '0900000000';
  user.progress = { chapter: 5 }; user.savedCards = ['original-card']; user.sessionVersion = 7;
  const before = JSON.parse(JSON.stringify(user));
  const result = await sync({ name: 'New provider display name' }, googleToken());
  const after = JSON.parse(JSON.stringify(result));
  delete before.username; delete after.username; delete after.firebaseUid; delete after.role;
  assert.deepEqual(after, before);
  assert.equal(result.username, email); assert.equal(result.firebaseUid, subject);
  assert.equal(result.id, user.id); assert.equal(rows.length, 1); assert.equal(creates, 0); assert.equal(saves, 1);
});

test('Google proof can link a password account with the same verified email without replacing its existing data', async () => {
  const user = existing(email); delete user.uid; delete user.firebaseUid; user.password = 'existing-password-hash';
  const result = await sync({}, googleToken());
  assert.equal(result, user); assert.equal(result.id, 'stable-existing-account');
  assert.equal(result.password, 'existing-password-hash'); assert.equal(creates, 0);
});

test('returning canonical accounts need no Google proof, Google keys, or new Google configuration', async () => {
  const user = existing(email); delete process.env.GOOGLE_CLIENT_ID;
  OAuth2Client.prototype.getFederatedSignonCertsAsync = async () => assert.fail('Google proof verification is unnecessary');
  assert.equal(await sync({}), user); assert.equal(creates, 0);
});

for (const [label, claims] of [
  ['wrong audience', { aud: 'other-app.apps.googleusercontent.com' }],
  ['wrong issuer', { iss: 'https://attacker.example.test' }],
  ['expired', { exp: Math.floor(Date.now() / 1000) - 10 }],
  ['unverified email', { email_verified: false }],
  ['different Google subject', { sub: 'different-google-user' }],
  ['missing email', { email: undefined }]
]) test(`Google proof ${label} cannot modify or create any user`, async () => {
  const user = existing('firebase-012345678901234567890123@users.invalid');
  const before = JSON.stringify(user);
  await assert.rejects(sync({}, googleToken(claims)), error => error.code === 'INVALID_GOOGLE_IDENTITY');
  assert.equal(JSON.stringify(user), before); assert.equal(saves, 0); assert.equal(creates, 0);
});

test('a forged Google signature cannot repair an account', async () => {
  const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  await assert.rejects(sync({}, googleToken({}, other.privateKey)), error => error.code === 'INVALID_GOOGLE_IDENTITY');
  assert.equal(saves, 0); assert.equal(creates, 0);
});

test('a Google proof without a linked subject in the Firebase token cannot repair an account', async () => {
  await assert.rejects(sync({ firebase: { sign_in_provider: 'google.com' } }, googleToken()), error => error.code === 'INVALID_GOOGLE_IDENTITY');
  assert.equal(saves, 0); assert.equal(creates, 0);
});

test('two valid tokens still cannot merge the UID owner with a different existing email owner', async () => {
  const user = existing('firebase-012345678901234567890123@users.invalid');
  rows.push({ id: 'other-account', username: email, firebaseUid: 'other-firebase-uid' });
  const before = JSON.stringify(rows);
  await assert.rejects(sync({}, googleToken()), error => error.code === 'ACCOUNT_LINK_CONFLICT');
  assert.equal(JSON.stringify(rows), before); assert.match(user.username, /@users\.invalid$/);
  assert.equal(saves, 0); assert.equal(creates, 0);
});

test('missing Google audience configuration fails before mutating a placeholder', async () => {
  delete process.env.GOOGLE_CLIENT_ID;
  const user = existing('firebase-012345678901234567890123@users.invalid');
  await assert.rejects(sync({}, googleToken()), error => error.code === 'GOOGLE_AUTH_NOT_CONFIGURED');
  assert.match(user.username, /@users\.invalid$/); assert.equal(saves, 0); assert.equal(creates, 0);
});

for (const matched of [true, false]) test(`Firebase refresh preserves the same opaque session and does not revive logout (matched=${matched})`, async () => {
  rows = [{ id: 'stable-original-account', uid: 'legacy-uid', firebaseUid: subject, username: email, name: 'Original profile', sessionVersion: 3 }];
  const before = JSON.stringify(rows);
  let filter; let update; let cookie;
  Session.updateOne = async (f, u) => { filter = f; update = u; return { matchedCount: matched ? 1 : 0 }; };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, setHeader() {}, cookie(...args) { cookie = args; } };
  await refreshFirebaseSession({ body: { idToken: token() }, headers: { cookie: `ueh_tcc_session=${'a'.repeat(43)}` }, authUser: { id: rows[0].id }, authSession: { sessionVersion: 3 } }, res);
  assert.equal(res.statusCode, matched ? 200 : 401);
  assert.equal(filter.userId, rows[0].id);
  assert.equal(filter.sessionVersion, 3);
  assert.ok(update.$max.expiresAt > new Date());
  assert.equal(cookie?.[1], matched ? 'a'.repeat(43) : undefined);
  assert.equal(JSON.stringify(rows), before);
  assert.equal(creates, 0); assert.equal(saves, 0);
});

test('background refresh cannot replace an account with another cached Firebase identity', async () => {
  rows = [{ id: 'firebase-account', firebaseUid: subject, username: email }];
  Session.updateOne = async () => { throw new Error('Must not change another session'); };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await refreshFirebaseSession({ body: { idToken: token() }, authUser: { id: 'different-password-account' } }, res);
  assert.equal(res.statusCode, 409); assert.equal(res.body.code, 'SESSION_IDENTITY_MISMATCH');
  assert.equal(creates, 0); assert.equal(saves, 0);
});

test('matching cached Firebase identity does not shorten an existing longer password session', async () => {
  rows = [{ id: 'original-account', firebaseUid: subject, username: email }];
  Session.updateOne = async () => ({ matchedCount: 1 });
  let options;
  const res = { status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, setHeader() {}, cookie(_name, _value, value) { options = value; } };
  const remaining = 7 * 24 * 60 * 60 * 1000;
  await refreshFirebaseSession({ body: { idToken: token() }, headers: { cookie: `ueh_tcc_session=${'b'.repeat(43)}` }, authUser: { id: rows[0].id }, authSession: { sessionVersion: 0, expiresAt: new Date(Date.now() + remaining) } }, res);
  assert.equal(res.body.success, true);
  assert.ok(options.maxAge > remaining - 10000);
  assert.equal(creates, 0); assert.equal(saves, 0);
});
