import { OAuth2Client } from 'google-auth-library';

const verifier = new OAuth2Client({ transporterOptions: { timeout: 10_000, retry: false } });
const authError = (statusCode, code, message) => Object.assign(new Error(message), { statusCode, code });

export const getConfiguredGoogleClientIds = () => [...new Set([
  process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_IDS, process.env.VITE_GOOGLE_CLIENT_ID
].flatMap(value => String(value || '').split(/[\s,]+/)).filter(Boolean))];

// Firebase's top-level email can be absent with multiple-accounts-per-email.
// A second, independently verified Google token supplies the email ONLY when
// its subject is linked in the already verified Firebase token. Never compare
// Google `sub` directly with Firebase UID: these are different identifiers.
export const verifyGoogleIdentityForFirebase = async (googleIdToken, firebaseIdentity) => {
  if (typeof googleIdToken !== 'string' || !googleIdToken.trim()) {
    throw authError(422, 'GOOGLE_EMAIL_REQUIRED', 'Chưa hoàn tất đồng bộ email. Hãy bấm Google hoặc One Tap để đăng nhập lại.');
  }
  if (googleIdToken.length > 16_384) {
    throw authError(401, 'INVALID_GOOGLE_IDENTITY', 'Thông tin xác thực Google không hợp lệ. Vui lòng đăng nhập lại.');
  }
  const audience = getConfiguredGoogleClientIds();
  if (!audience.length) {
    throw authError(503, 'GOOGLE_AUTH_NOT_CONFIGURED', 'Máy chủ chưa sẵn sàng đồng bộ email Google. Vui lòng liên hệ quản trị viên.');
  }
  let payload;
  try {
    const ticket = await verifier.verifyIdToken({ idToken: googleIdToken, audience });
    payload = ticket.getPayload();
  } catch (error) {
    // Verification-library errors can include claims. Never return/log them.
    const unavailable = ['ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH'].includes(error.code)
      || Number(error.response?.status) >= 500;
    throw authError(unavailable ? 503 : 401,
      unavailable ? 'GOOGLE_AUTH_UNAVAILABLE' : 'INVALID_GOOGLE_IDENTITY',
      unavailable ? 'Tạm thời chưa xác minh được Google. Vui lòng thử lại.' : 'Thông tin xác thực Google không hợp lệ. Vui lòng đăng nhập lại.');
  }
  const now = Math.floor(Date.now() / 1000);
  if (!payload || typeof payload.sub !== 'string' || !payload.sub
      || !Number.isFinite(payload.exp) || payload.exp <= now
      || !Number.isFinite(payload.iat) || payload.iat > now + 60
      || payload.email_verified !== true || typeof payload.email !== 'string'
      || payload.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
      || firebaseIdentity.signInProvider !== 'google.com'
      || !firebaseIdentity.googleSubjects?.includes(payload.sub)) {
    throw authError(401, 'INVALID_GOOGLE_IDENTITY', 'Danh tính Google chưa khớp với phiên đăng nhập. Vui lòng đăng nhập lại đúng tài khoản.');
  }
  return { email: payload.email.trim().toLowerCase(), emailVerified: true };
};
