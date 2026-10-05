import crypto from 'crypto';
import { promisify } from 'util';

const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;

const scrypt = promisify(crypto.scrypt);

const deriveKey = async (password, salt, options = {}) => scrypt(
  password,
  salt,
  KEY_LENGTH,
  {
    N: options.N || SCRYPT_COST,
    r: options.r || SCRYPT_BLOCK_SIZE,
    p: options.p || SCRYPT_PARALLELIZATION,
    maxmem: 64 * 1024 * 1024
  }
);

const safeEqualHex = (actual, expected) => {
  if (!/^[a-f0-9]+$/i.test(expected) || expected.length % 2 !== 0) return false;
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (actual.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(actual, expectedBuffer);
};

export const hashPassword = async (password) => {
  if (typeof password !== 'string' || password.length === 0) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await deriveKey(password, salt)).toString('hex');
  return `${SCRYPT_PREFIX}$${SCRYPT_COST}$${SCRYPT_BLOCK_SIZE}$${SCRYPT_PARALLELIZATION}$${salt}$${hash}`;
};

export const verifyPassword = async (password, storedPassword) => {
  if (typeof password !== 'string' || typeof storedPassword !== 'string') return false;
  if (!password || !storedPassword) return false;

  if (storedPassword.startsWith(`${SCRYPT_PREFIX}$`)) {
    try {
      const [prefix, rawN, rawR, rawP, salt, originalHash, ...rest] = storedPassword.split('$');
      const N = Number(rawN);
      const r = Number(rawR);
      const p = Number(rawP);
      if (
        prefix !== SCRYPT_PREFIX
        || rest.length > 0
        || !salt
        || !Number.isInteger(N)
        || !Number.isInteger(r)
        || !Number.isInteger(p)
        || N < 2 || N > 1_048_576
        || r < 1 || r > 32
        || p < 1 || p > 16
      ) return false;
      return safeEqualHex(await deriveKey(password, salt, { N, r, p }), originalHash);
    } catch {
      return false;
    }
  }

  // Backward-compatible verification for the previous salt:hash format.
  // Plaintext passwords are deliberately never accepted.
  if (/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(storedPassword)) {
    try {
      const [salt, originalHash] = storedPassword.split(':');
      return safeEqualHex(await deriveKey(password, salt), originalHash);
    } catch {
      return false;
    }
  }

  return false;
};

export const needsPasswordRehash = (storedPassword) => (
  typeof storedPassword === 'string' && !storedPassword.startsWith(`${SCRYPT_PREFIX}$`)
);
