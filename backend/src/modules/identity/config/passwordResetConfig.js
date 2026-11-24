import crypto from 'node:crypto';

const DEVELOPMENT_OTP_SECRET = crypto.randomBytes(32).toString('hex');
const DEFAULT_RESEND_FROM = 'UEH TCC Helper <onboarding@resend.dev>';

const cleanEnvValue = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (
    trimmed.length >= 2
    && ((trimmed.startsWith('"') && trimmed.endsWith('"'))
      || (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const isProductionEnvironment = (env) => (
  cleanEnvValue(env.NODE_ENV).toLowerCase() === 'production'
);

const parseSmtpPort = (value) => {
  const parsed = Number.parseInt(cleanEnvValue(value) || '587', 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65_535 ? parsed : 587;
};

/**
 * Resolve the private pepper used to hash password-reset OTPs.
 *
 * Production deliberately has no generated fallback: a generated value would
 * invalidate outstanding OTPs whenever Render restarts or scales out.
 */
export const getPasswordResetSecret = (env = process.env) => {
  const candidates = [
    ['OTP_SECRET', env.OTP_SECRET],
    ['SESSION_SECRET', env.SESSION_SECRET],
    ['JWT_SECRET', env.JWT_SECRET]
  ];

  for (const [source, rawValue] of candidates) {
    const value = cleanEnvValue(rawValue);
    if (value) return { value, source, ephemeral: false };
  }

  if (!isProductionEnvironment(env)) {
    return {
      value: DEVELOPMENT_OTP_SECRET,
      source: 'ephemeral-development',
      ephemeral: true
    };
  }

  return { value: '', source: null, ephemeral: false };
};

/**
 * Normalize password-reset delivery settings in one place. Credentials are
 * returned for server-side consumers only and must never be sent to clients.
 */
export const getEmailDeliveryConfiguration = (env = process.env) => {
  const production = isProductionEnvironment(env);
  const resendApiKey = cleanEnvValue(env.RESEND_API_KEY);
  const resendFrom = cleanEnvValue(env.RESEND_FROM_EMAIL) || DEFAULT_RESEND_FROM;
  const smtpUser = cleanEnvValue(env.EMAIL_USER);
  const smtpPassword = cleanEnvValue(env.EMAIL_PASS);
  const smtpPort = parseSmtpPort(env.EMAIL_PORT);

  return {
    production,
    resend: {
      enabled: Boolean(resendApiKey),
      apiKey: resendApiKey,
      from: resendFrom,
      usesDefaultFrom: !cleanEnvValue(env.RESEND_FROM_EMAIL)
    },
    smtp: {
      enabled: Boolean(smtpUser && smtpPassword),
      partiallyConfigured: Boolean(smtpUser) !== Boolean(smtpPassword),
      user: smtpUser,
      password: smtpPassword,
      host: cleanEnvValue(env.EMAIL_HOST) || 'smtp.gmail.com',
      port: smtpPort,
      secure: cleanEnvValue(env.EMAIL_SECURE).toLowerCase() === 'true' || smtpPort === 465
    },
    mockEnabled: !production
      && cleanEnvValue(env.ALLOW_MOCK_EMAIL).toLowerCase() === 'true'
  };
};

/**
 * Return a credential-free status object suitable for logs and /api/health.
 */
export const getPasswordResetReadiness = (env = process.env) => {
  const secret = getPasswordResetSecret(env);
  const email = getEmailDeliveryConfiguration(env);
  const deliveryProvider = email.resend.enabled
    ? 'resend'
    : email.smtp.enabled
      ? 'smtp'
      : email.mockEnabled
        ? 'mock-development'
        : null;
  const issues = [];
  const warnings = [];

  if (!secret.value) {
    issues.push('Set OTP_SECRET (preferred), SESSION_SECRET, or JWT_SECRET.');
  }
  if (!deliveryProvider) {
    issues.push('Configure RESEND_API_KEY or both EMAIL_USER and EMAIL_PASS.');
  }
  if (email.smtp.partiallyConfigured) {
    warnings.push('EMAIL_USER and EMAIL_PASS must be configured together.');
  }
  if (email.resend.enabled && email.resend.usesDefaultFrom) {
    warnings.push('Set RESEND_FROM_EMAIL to a verified production sender.');
  }
  if (secret.value && !secret.ephemeral && secret.value.length < 32) {
    warnings.push(`${secret.source} should contain at least 32 random characters.`);
  }

  return {
    status: secret.value && deliveryProvider ? 'ready' : 'unavailable',
    ready: Boolean(secret.value && deliveryProvider),
    secretSource: secret.source,
    emailProvider: deliveryProvider,
    issues,
    warnings
  };
};

export const reportPasswordResetReadiness = ({
  env = process.env,
  logger = console
} = {}) => {
  const readiness = getPasswordResetReadiness(env);
  const summary = readiness.ready
    ? `[Auth] Password reset is ready (${readiness.emailProvider}).`
    : `[Auth] Password reset is unavailable: ${readiness.issues.join(' ')}`;

  if (readiness.ready) logger.info?.(summary);
  else logger.warn?.(summary);

  for (const warning of readiness.warnings) {
    logger.warn?.(`[Auth] Password reset configuration warning: ${warning}`);
  }

  return readiness;
};
