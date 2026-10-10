import assert from 'node:assert/strict';
import test from 'node:test';

import User from '../models/User.js';
import {
  attachExternalIdentity,
  providerSubjectOnUser,
  resolveExternalIdentityOwner,
  seedMissingProfileFromExternalIdentity
} from '../services/externalIdentityService.js';

test('a verified GitHub email links to the existing Firebase user without replacing legacy uid', () => {
  const existingUser = {
    id: 'user-1',
    uid: 'firebase-uid-1',
    firebaseUid: 'firebase-uid-1',
    username: 'student@example.com'
  };

  const owner = resolveExternalIdentityOwner({
    provider: 'github',
    subject: '12345',
    identityUser: null,
    emailUser: existingUser,
    emailVerified: true
  });
  attachExternalIdentity(owner, { provider: 'github', subject: '12345' });

  assert.equal(owner, existingUser);
  assert.equal(owner.githubId, '12345');
  assert.equal(owner.firebaseUid, 'firebase-uid-1');
  assert.equal(owner.uid, 'firebase-uid-1');
});

test('a verified Firebase email links to a legacy GitHub user without replacing legacy uid', () => {
  const existingUser = {
    id: 'user-2',
    uid: 'github:98765',
    username: 'student@example.com'
  };

  const owner = resolveExternalIdentityOwner({
    provider: 'firebase',
    subject: 'firebase-uid-2',
    identityUser: null,
    emailUser: existingUser,
    emailVerified: true
  });
  attachExternalIdentity(owner, { provider: 'firebase', subject: 'firebase-uid-2' });

  assert.equal(owner.firebaseUid, 'firebase-uid-2');
  assert.equal(owner.uid, 'github:98765');
  assert.equal(providerSubjectOnUser(owner, 'github'), '98765');
});

test('an unverified or generated email is never used to merge accounts', () => {
  const emailUser = {
    id: 'user-3',
    uid: 'firebase-uid-3',
    username: '123+student@users.noreply.github.com'
  };

  const owner = resolveExternalIdentityOwner({
    provider: 'github',
    subject: '123',
    identityUser: null,
    emailUser,
    emailVerified: false
  });

  assert.equal(owner, null);
});

test('provider identity and verified email pointing at different users is rejected', () => {
  assert.throws(
    () => resolveExternalIdentityOwner({
      provider: 'github',
      subject: '123',
      identityUser: { id: 'identity-owner', githubId: '123' },
      emailUser: { id: 'email-owner', uid: 'firebase-uid' },
      emailVerified: true
    }),
    (error) => error.code === 'ACCOUNT_LINK_CONFLICT' && error.statusCode === 409
  );
});

test('the same provider cannot be silently replaced through a matching email', () => {
  const emailUser = {
    id: 'user-4',
    uid: 'firebase-uid-4',
    githubId: 'old-github-id'
  };

  assert.throws(
    () => resolveExternalIdentityOwner({
      provider: 'github',
      subject: 'new-github-id',
      identityUser: null,
      emailUser,
      emailVerified: true
    }),
    (error) => error.code === 'ACCOUNT_LINK_CONFLICT' && error.statusCode === 409
  );
});

test('legacy provider IDs are recognized and lazily copied to provider-specific fields', () => {
  const legacyGithubUser = { id: 'user-5', uid: 'github:555' };
  assert.equal(providerSubjectOnUser(legacyGithubUser, 'github'), '555');

  attachExternalIdentity(legacyGithubUser, { provider: 'github', subject: '555' });
  assert.equal(legacyGithubUser.githubId, '555');
  assert.equal(legacyGithubUser.uid, 'github:555');
});

test('external sign-in preserves the canonical profile already stored by the user', () => {
  const canonicalUser = {
    id: 'user-6',
    name: 'Nguyen Van A',
    phoneNumber: '0901234567',
    avatar: 'data:image/png;base64,canonical-avatar',
    school: 'UEH',
    bio: 'Canonical profile biography'
  };
  const originalProfile = { ...canonicalUser };

  const result = seedMissingProfileFromExternalIdentity(canonicalUser, {
    name: 'Google Display Name',
    phoneNumber: '+1 555 0100'
  });

  assert.equal(result, canonicalUser);
  assert.deepEqual(canonicalUser, originalProfile);
});

test('external sign-in seeds only blank canonical profile fields', () => {
  const user = {
    id: 'user-7',
    name: '   ',
    phoneNumber: '',
    avatar: 'existing-avatar',
    school: 'UEH',
    bio: 'Existing biography'
  };

  seedMissingProfileFromExternalIdentity(user, {
    name: '  Google   Student  ',
    phoneNumber: '  0909 123 456  '
  });

  assert.equal(user.name, 'Google Student');
  assert.equal(user.phoneNumber, '0909 123 456');
  assert.equal(user.avatar, 'existing-avatar');
  assert.equal(user.school, 'UEH');
  assert.equal(user.bio, 'Existing biography');
});

test('provider profile defaults respect canonical field length limits', () => {
  const user = { name: '', phoneNumber: '' };

  seedMissingProfileFromExternalIdentity(user, {
    name: `  ${'N'.repeat(140)}  `,
    phoneNumber: `  ${'1'.repeat(40)}  `
  });

  assert.equal(user.name, 'N'.repeat(120));
  assert.equal(user.phoneNumber, '1'.repeat(32));
});

test('a password account keeps one canonical profile while linking Firebase and GitHub', () => {
  const passwordUser = {
    id: 'user-8',
    username: 'student@example.com',
    password: 'stored-password-hash',
    name: 'Canonical Student',
    phoneNumber: '0901234567',
    avatar: 'canonical-avatar',
    school: 'UEH',
    bio: 'Canonical biography'
  };
  const originalProfile = {
    password: passwordUser.password,
    name: passwordUser.name,
    phoneNumber: passwordUser.phoneNumber,
    avatar: passwordUser.avatar,
    school: passwordUser.school,
    bio: passwordUser.bio
  };

  attachExternalIdentity(passwordUser, {
    provider: 'firebase',
    subject: 'firebase-uid-8'
  });
  seedMissingProfileFromExternalIdentity(passwordUser, {
    name: 'Google Name',
    phoneNumber: '+1 555 0100'
  });
  attachExternalIdentity(passwordUser, {
    provider: 'github',
    subject: 'github-id-8'
  });
  seedMissingProfileFromExternalIdentity(passwordUser, {
    name: 'GitHub Name',
    phoneNumber: ''
  });

  assert.equal(passwordUser.id, 'user-8');
  assert.equal(passwordUser.firebaseUid, 'firebase-uid-8');
  assert.equal(passwordUser.githubId, 'github-id-8');
  assert.deepEqual(
    {
      password: passwordUser.password,
      name: passwordUser.name,
      phoneNumber: passwordUser.phoneNumber,
      avatar: passwordUser.avatar,
      school: passwordUser.school,
      bio: passwordUser.bio
    },
    originalProfile
  );
});

test('user schema enforces sparse unique provider identifiers', () => {
  for (const field of ['firebaseUid', 'githubId']) {
    const path = User.schema.path(field);
    assert.ok(path, `${field} should exist`);
    assert.equal(path.options.unique, true);
    assert.equal(path.options.sparse, true);
  }
});
