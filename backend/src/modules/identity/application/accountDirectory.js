import User from '../persistence/User.js';
import { normalizeIdentifier } from '../domain/roles.js';

// Internal account directory. The identity module owns queries and projections.
// The caller supplies its existing transaction so grants retain atomic behavior.
export function findRegisteredAccountByEmail(email, session = null) {
  return User.findOne({ username: normalizeIdentifier(email) }).session(session).lean();
}

export function findPublicAccountsByAliases(aliases) {
  return User.find({
    $or: [
      { id: { $in: aliases } },
      { uid: { $in: aliases } },
      { firebaseUid: { $in: aliases } },
      { githubId: { $in: aliases } },
      { username: { $in: aliases.map(value => value.toLowerCase()) } }
    ]
  }).select('id uid firebaseUid githubId username name avatar school role').lean();
}

export function findPublicAccountByAliases(aliases, username) {
  // Read-only compatibility for old forum profile URLs. This mapping is never
  // used to authenticate, link accounts, or grant permissions.
  const legacyProfiles = {
    'user-phuc': 'luphuc321@gmail.com',
    'user-phuc-519': 'luphuc519@gmail.com',
    'user-phuc-0809': 'luphuc08092006@gmail.com'
  };
  const profileUsername = legacyProfiles[username] || username;
  return User.findOne({
    $or: [
      { id: { $in: aliases } },
      { uid: { $in: aliases } },
      { firebaseUid: { $in: aliases } },
      { githubId: { $in: aliases } },
      { username: profileUsername.toLowerCase() }
    ]
  }).select('id uid firebaseUid githubId username name avatar school bio role').lean();
}
