// Public capability API. Other modules import this entry, never HTTP controllers.
export { getPasswordResetReadiness, reportPasswordResetReadiness } from './config/passwordResetConfig.js';
export { getEmailDeliveryConfiguration } from './config/passwordResetConfig.js';
export { hasOwnerRole, isOwnerIdentifier, normalizeIdentifier } from './domain/roles.js';
export { optionalAuth, requireAuth } from './http/requireAuth.js';
export { resolveSessionUser } from './application/sessionService.js';
export { findRegisteredAccountByEmail, findPublicAccountsByAliases, findPublicAccountByAliases } from './application/accountDirectory.js';
