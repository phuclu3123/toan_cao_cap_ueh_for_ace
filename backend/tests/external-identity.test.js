import assert from 'node:assert/strict';
import test from 'node:test';

import User from '../models/User.js';
import {
  attachExternalIdentity,
  providerSubjectOnUser,
  resolveExternalIdentityOwner
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

test('user schema enforces sparse unique provider identifiers', () => {
  for (const field of ['firebaseUid', 'githubId']) {
    const path = User.schema.path(field);
    assert.ok(path, `${field} should exist`);
    assert.equal(path.options.unique, true);
    assert.equal(path.options.sparse, true);
  }
});
