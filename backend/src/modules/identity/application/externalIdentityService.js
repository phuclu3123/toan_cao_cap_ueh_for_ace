const PROVIDER_FIELDS = Object.freeze({
  firebase: 'firebaseUid',
  github: 'githubId'
});

const accountLinkConflict = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  error.code = 'ACCOUNT_LINK_CONFLICT';
  return error;
};

const normalizeSubject = (subject) => String(subject || '').trim();

// Called only after token verification and provider-UID/account conflict checks.
// A returning UID can reuse its canonical email; new/placeholder Google users
// must supply a verified email before account/session creation.
export const reconcileExternalEmail = (user, { email, emailVerified, requireVerifiedEmail = false }) => {
  const candidate = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const validEmail = value => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const current = String(user?.username || user?.email || '').trim().toLowerCase();
  const generated = current.endsWith('@users.invalid') || current.endsWith('@users.noreply.github.com');
  const verifiedCandidate = Boolean(validEmail(candidate) && emailVerified);
  if (requireVerifiedEmail && !verifiedCandidate && (!user || generated || !validEmail(current))) {
    throw Object.assign(new Error('Chưa hoàn tất đồng bộ email. Hãy bấm Google hoặc One Tap để đăng nhập lại.'), {
      statusCode: 422, code: 'GOOGLE_EMAIL_REQUIRED'
    });
  }
  if (user && verifiedCandidate && (!current || current === candidate || generated)) user.username = candidate;
  return user;
};

const normalizeProfileName = (value) => (
  typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, 120)
    : ''
);

const normalizePhoneNumber = (value) => (
  typeof value === 'string' ? value.trim().slice(0, 32) : ''
);

export const providerFieldForExternalIdentity = (provider) => {
  const field = PROVIDER_FIELDS[provider];
  if (!field) throw new TypeError(`Unsupported external identity provider: ${provider}`);
  return field;
};

export const legacyUidForExternalIdentity = (provider, subject) => {
  const normalizedSubject = normalizeSubject(subject);
  if (!normalizedSubject) throw new TypeError('External identity subject is required');
  return provider === 'github' ? `github:${normalizedSubject}` : normalizedSubject;
};

// Before provider-specific columns existed, Firebase IDs were stored directly
// in `uid` and GitHub IDs were stored as `github:<id>`. Read both shapes so
// existing accounts migrate lazily without losing enrollments or sessions.
export const providerSubjectOnUser = (user, provider) => {
  if (!user) return '';
  const field = providerFieldForExternalIdentity(provider);
  const directSubject = normalizeSubject(user[field]);
  if (directSubject) return directSubject;

  const legacyUid = normalizeSubject(user.uid);
  if (!legacyUid) return '';
  if (provider === 'github') {
    return legacyUid.startsWith('github:') ? legacyUid.slice('github:'.length) : '';
  }
  return legacyUid.startsWith('github:') ? '' : legacyUid;
};

export const sameStoredUser = (left, right) => {
  if (!left || !right) return false;
  const leftId = left?._id?.toString?.() || left?.id;
  const rightId = right?._id?.toString?.() || right?.id;
  return Boolean(leftId && rightId && String(leftId) === String(rightId));
};

export const resolveExternalIdentityOwner = ({
  provider,
  subject,
  identityUser,
  emailUser,
  emailVerified
}) => {
  const normalizedSubject = normalizeSubject(subject);
  if (!normalizedSubject) throw new TypeError('External identity subject is required');

  // Email may only be used as an account-linking signal after the provider has
  // vouched for it. A generated GitHub noreply address must never merge users.
  const verifiedEmailUser = emailVerified ? emailUser : null;
  if (identityUser && verifiedEmailUser && !sameStoredUser(identityUser, verifiedEmailUser)) {
    throw accountLinkConflict(
      'Danh tính đăng nhập và email đã được liên kết với hai tài khoản khác nhau.'
    );
  }

  const owner = identityUser || verifiedEmailUser || null;
  const existingSubject = providerSubjectOnUser(owner, provider);
  if (existingSubject && existingSubject !== normalizedSubject) {
    throw accountLinkConflict(
      `Email này đã được liên kết với một tài khoản ${provider} khác.`
    );
  }
  return owner;
};

export const attachExternalIdentity = (user, { provider, subject }) => {
  if (!user) throw new TypeError('A user is required to attach an external identity');
  const normalizedSubject = normalizeSubject(subject);
  if (!normalizedSubject) throw new TypeError('External identity subject is required');

  const currentSubject = providerSubjectOnUser(user, provider);
  if (currentSubject && currentSubject !== normalizedSubject) {
    throw accountLinkConflict(
      `Tài khoản này đã được liên kết với một danh tính ${provider} khác.`
    );
  }

  const field = providerFieldForExternalIdentity(provider);
  user[field] = normalizedSubject;
  // Preserve legacy uid for old clients and references. Only seed it for an
  // account that never had a legacy external identity.
  if (!normalizeSubject(user.uid)) {
    user.uid = legacyUidForExternalIdentity(provider, normalizedSubject);
  }
  return user;
};

// MongoDB is the canonical profile store. Provider claims are useful for
// bootstrapping missing fields, but a login must never replace details the
// user has already chosen in their UEH TCC profile.
export const seedMissingProfileFromExternalIdentity = (
  user,
  { name, phoneNumber, avatar } = {}
) => {
  if (!user) throw new TypeError('A user is required to seed profile fields');

  const providerName = normalizeProfileName(name);
  const providerPhoneNumber = normalizePhoneNumber(phoneNumber);

  if (!normalizeProfileName(user.name) && providerName) {
    user.name = providerName;
  }
  if (!normalizePhoneNumber(user.phoneNumber) && providerPhoneNumber) {
    user.phoneNumber = providerPhoneNumber;
  }
  if (!user.avatar && typeof avatar === 'string' && avatar.length <= 2048) {
    try {
      const picture = new URL(avatar);
      if (picture.protocol === 'https:' && !picture.username && !picture.password) user.avatar = picture.href;
    } catch { /* An absent or malformed provider picture is optional. */ }
  }

  return user;
};
