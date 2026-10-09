import crypto from 'crypto';

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
// Firebase project IDs are public identifiers, not credentials. This project
// has one canonical Firebase tenant, so keep a safe fallback while allowing
// deployments to override it explicitly.
export const DEFAULT_FIREBASE_PROJECT_ID = 'toancaocapueh-auth';

let certificateCache = null;
let certificateCacheExpiresAt = 0;

const invalidToken = (message) => {
  const error = new Error(message);
  error.code = 'INVALID_FIREBASE_TOKEN';
  error.statusCode = 401;
  return error;
};

const serviceUnavailable = (message) => {
  const error = new Error(message);
  error.code = 'FIREBASE_AUTH_UNAVAILABLE';
  error.statusCode = 503;
  return error;
};

const decodeBase64UrlJson = (value) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    throw invalidToken('Firebase ID token is malformed');
  }
};

export const getConfiguredFirebaseProjectId = () => {
  if (String(process.env.FIREBASE_AUTH_DISABLED || '').trim().toLowerCase() === 'true') {
    return '';
  }

  const candidates = [
    process.env.FIREBASE_PROJECT_ID,
    process.env.VITE_FIREBASE_PROJECT_ID,
    DEFAULT_FIREBASE_PROJECT_ID
  ];

  for (const candidate of candidates) {
    const projectId = String(candidate || '').trim();
    if (projectId) return projectId;
  }

  return '';
};

const getFirebaseCertificates = async () => {
  if (certificateCache && Date.now() < certificateCacheExpiresAt) {
    return certificateCache;
  }

  let response;
  try {
    response = await fetch(FIREBASE_CERTS_URL, {
      signal: AbortSignal.timeout(10_000)
    });
  } catch (error) {
    throw serviceUnavailable(`Unable to load Firebase signing certificates: ${error.message}`);
  }
  if (!response.ok) {
    throw serviceUnavailable(`Unable to load Firebase signing certificates (${response.status})`);
  }

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  certificateCache = await response.json();
  certificateCacheExpiresAt = Date.now() + Math.max(60, maxAgeSeconds) * 1000;
  return certificateCache;
};

export const verifyFirebaseIdToken = async (idToken) => {
  if (typeof idToken !== 'string' || !idToken.trim() || idToken.length > 16_384) {
    throw invalidToken('Firebase ID token is required');
  }

  const expectedProjectId = getConfiguredFirebaseProjectId();

  if (!expectedProjectId) {
    throw serviceUnavailable('FIREBASE_PROJECT_ID is not configured on the backend');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw invalidToken('Firebase ID token is malformed');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeBase64UrlJson(encodedHeader);
  const payload = decodeBase64UrlJson(encodedPayload);

  if (header.alg !== 'RS256' || !header.kid) {
    throw invalidToken('Firebase ID token uses an unsupported signing algorithm');
  }

  let certificates = await getFirebaseCertificates();
  let certificate = certificates[header.kid];
  if (!certificate) {
    certificateCache = null;
    certificateCacheExpiresAt = 0;
    certificates = await getFirebaseCertificates();
    certificate = certificates[header.kid];
  }
  if (!certificate) {
    throw invalidToken('Firebase ID token signing key is unknown');
  }

  const signature = Buffer.from(
    encodedSignature.replace(/-/g, '+').replace(/_/g, '/'),
    'base64'
  );
  const verified = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    certificate,
    signature
  );

  if (!verified) {
    throw invalidToken('Firebase ID token signature is invalid');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    payload.aud !== expectedProjectId
    || payload.iss !== `https://securetoken.google.com/${expectedProjectId}`
    || typeof payload.sub !== 'string'
    || payload.sub.length === 0
    || payload.sub.length > 128
    || !Number.isFinite(payload.exp)
    || !Number.isFinite(payload.iat)
    || !Number.isFinite(payload.auth_time)
    || payload.exp <= nowSeconds
    || payload.iat > nowSeconds + 60
    || payload.auth_time > nowSeconds + 60
  ) {
    throw invalidToken('Firebase ID token claims are invalid');
  }

  if (payload.email && payload.email_verified !== true) {
    throw invalidToken('Firebase email is not verified');
  }

  return {
    uid: payload.sub,
    email: payload.email || '',
    emailVerified: Boolean(payload.email && payload.email_verified === true),
    name: payload.name || '',
    phoneNumber: payload.phone_number || '',
    expiresAt: payload.exp * 1000
  };
};
