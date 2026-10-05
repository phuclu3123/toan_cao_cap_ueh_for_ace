export const normalizeIdentifier = (value) => (
  typeof value === 'string' ? value.trim().toLowerCase() : ''
);

const DEVELOPMENT_OWNER_EMAIL = 'luphuc321@gmail.com';

const configuredOwnerEmail = () => normalizeIdentifier(
  process.env.ADMIN_EMAIL
  || process.env.ADMIN_USERNAME
  || (process.env.NODE_ENV === 'production' ? '' : DEVELOPMENT_OWNER_EMAIL)
);

// Kept as a stable export for existing callers and development fixtures. The
// authorization helpers below resolve the environment dynamically so a late
// dotenv load can never leave production using the development fallback.
export const OWNER_EMAIL = configuredOwnerEmail();

export const isOwnerIdentifier = (value) => {
  const ownerEmail = configuredOwnerEmail();
  return Boolean(ownerEmail) && normalizeIdentifier(value) === ownerEmail;
};

export const roleForIdentifier = (value) => (
  isOwnerIdentifier(value) ? 'Admin' : 'Student'
);

export const hasOwnerRole = (user) => Boolean(
  user
  && user.role === 'Admin'
  && isOwnerIdentifier(user.username || user.email)
);
