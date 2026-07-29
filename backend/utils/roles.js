export const OWNER_EMAIL = 'luphuc321@gmail.com';

export const normalizeIdentifier = (value) => (
  typeof value === 'string' ? value.trim().toLowerCase() : ''
);

export const isOwnerIdentifier = (value) => normalizeIdentifier(value) === OWNER_EMAIL;

export const roleForIdentifier = (value) => (
  isOwnerIdentifier(value) ? 'Admin' : 'Student'
);

export const hasOwnerRole = (user) => Boolean(
  user
  && user.role === 'Admin'
  && isOwnerIdentifier(user.username || user.email)
);
