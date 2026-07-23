import crypto from 'crypto';

export const hashPassword = (password) => {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedPassword) => {
  if (!password || !storedPassword) return false;

  // Check if stored in salt:hash format
  if (storedPassword.includes(':')) {
    try {
      const [salt, originalHash] = storedPassword.split(':');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      const hashBuf = Buffer.from(hash, 'hex');
      const origBuf = Buffer.from(originalHash, 'hex');
      if (hashBuf.length !== origBuf.length) return false;
      return crypto.timingSafeEqual(hashBuf, origBuf);
    } catch {
      return false;
    }
  }

  // Fallback support for legacy plaintext passwords during transition
  return password === storedPassword;
};
