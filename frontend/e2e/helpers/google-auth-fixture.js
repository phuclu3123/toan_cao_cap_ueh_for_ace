import crypto from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { createRequire } from 'node:module';
import User from '../../../backend/src/modules/identity/persistence/User.js';
import { resolveFirebaseLogin } from '../../../backend/src/modules/identity/http/authController.js';
import { publicUser } from '../../../backend/src/modules/identity/application/sessionService.js';
import { getConfiguredFirebaseProjectId } from '../../../backend/src/modules/identity/application/firebaseTokenService.js';

const require = createRequire(new URL('../../../backend/package.json', import.meta.url));
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

// Browser -> real Firebase JS SDK -> signed token fixtures -> real backend
// verification/controller. Every persistence method used here is in-memory.
// This helper never connects to MongoDB or writes a local user/session file.
export function createGoogleAuthFixture(mode) {
  const previous = { find: User.findOne, create: User.create, fetch: globalThis.fetch,
    certs: OAuth2Client.prototype.getFederatedSignonCertsAsync,
    ready: Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState'), clientId: process.env.GOOGLE_CLIENT_ID };
  const audience = '1234567890-browser-fixture.apps.googleusercontent.com';
  process.env.GOOGLE_CLIENT_ID = audience;
  const firebaseKeys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const googleKeys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const uid = 'browser-firebase-uid'; const googleSub = '123456789012345678901';
  const email = 'google-browser@example.test'; const kid = `browser-fixture-${crypto.randomUUID()}`;
  const now = Math.floor(Date.now() / 1000);
  const sign = (claims, key) => {
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const input = `${encode({ alg: 'RS256', kid })}.${encode(claims)}`;
    return `${input}.${crypto.sign('RSA-SHA256', Buffer.from(input), key).toString('base64url')}`;
  };
  const firebaseToken = sign({ aud: getConfiguredFirebaseProjectId(), iss: `https://securetoken.google.com/${getConfiguredFirebaseProjectId()}`,
    sub: uid, user_id: uid, iat: now, auth_time: now, exp: now + 3600,
    firebase: { sign_in_provider: 'google.com', identities: { 'google.com': [googleSub] } }
  }, firebaseKeys.privateKey);
  const googleToken = sign({ aud: audience, iss: 'https://accounts.google.com', sub: googleSub,
    iat: now, exp: now + 3600, email, email_verified: true
  }, googleKeys.privateKey);
  const state = { creates: 0, saves: 0, rows: [] };
  const makeRow = data => ({ ...data, save: async function () { state.saves += 1; return this; } });
  if (mode !== 'new') state.rows.push(makeRow({ id: 'original-user-id', _id: 'original-mongo-id', uid,
    username: mode === 'canonical' ? email : 'firebase-012345678901234567890123@users.invalid',
    name: 'Tên hồ sơ đã lưu', school: 'UEH', bio: 'Giới thiệu đã lưu', avatar: '/saved-avatar.png',
    sessionVersion: 3, progress: { chapter: 7 }, savedCards: ['saved-card-id'] }));
  const snapshot = JSON.stringify(state.rows);
  let disposed = false;
  const pending = new Set();
  Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, get: () => 1 });
  User.findOne = query => {
    const match = part => state.rows.find(row => Object.entries(part).every(([key, value]) => value instanceof RegExp ? value.test(row[key] || '') : row[key] === value));
    const row = query.$or ? query.$or.map(match).find(Boolean) || null : match(query) || null;
    return { lean: async () => row, then: (resolve, reject) => Promise.resolve(row).then(resolve, reject) };
  };
  User.create = async data => { state.creates += 1; const row = makeRow(data); state.rows.push(row); return row; };
  globalThis.fetch = async (url, options) => String(url).includes('/robot/v1/metadata/x509/securetoken@')
    ? Response.json({ [kid]: firebaseKeys.publicKey.export({ format: 'pem', type: 'spki' }) }, { headers: { 'cache-control': 'max-age=0' } })
    : previous.fetch(url, options);
  OAuth2Client.prototype.getFederatedSignonCertsAsync = async () => ({ certs: { [kid]: googleKeys.publicKey.export({ format: 'pem', type: 'spki' }) }, format: 'PEM' });
  return {
    uid, googleSub, email, googleToken, firebaseToken, state, snapshot,
    async resolve(body) {
      if (disposed) throw new Error('Fixture has been disposed');
      const request = resolveFirebaseLogin(body);
      pending.add(request);
      try { return publicUser((await request).user); } finally { pending.delete(request); }
    },
    async dispose() {
      disposed = true;
      await Promise.allSettled([...pending]);
      User.findOne = previous.find; User.create = previous.create; globalThis.fetch = previous.fetch;
      OAuth2Client.prototype.getFederatedSignonCertsAsync = previous.certs;
      if (previous.ready) Object.defineProperty(mongoose.connection, 'readyState', previous.ready);
      else delete mongoose.connection.readyState;
      if (previous.clientId === undefined) delete process.env.GOOGLE_CLIENT_ID; else process.env.GOOGLE_CLIENT_ID = previous.clientId;
    }
  };
}
