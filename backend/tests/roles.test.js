import assert from 'node:assert/strict';
import test from 'node:test';

import {
  OWNER_EMAIL,
  hasOwnerRole,
  isOwnerIdentifier,
  roleForIdentifier
} from '../utils/roles.js';

test('only the configured owner email receives the Admin role', () => {
  assert.equal(OWNER_EMAIL, 'luphuc321@gmail.com');
  assert.equal(roleForIdentifier(' LUPHUC321@gmail.com '), 'Admin');
  assert.equal(roleForIdentifier('admin@ueh.edu.vn'), 'Student');
  assert.equal(roleForIdentifier('student@example.com'), 'Student');
  assert.equal(roleForIdentifier(null), 'Student');
});

test('server authorization requires both the owner identity and Admin role', () => {
  assert.equal(isOwnerIdentifier('luphuc321@gmail.com'), true);
  assert.equal(hasOwnerRole({ username: OWNER_EMAIL, role: 'Admin' }), true);
  assert.equal(hasOwnerRole({ username: OWNER_EMAIL, role: 'Student' }), false);
  assert.equal(hasOwnerRole({ username: 'admin@ueh.edu.vn', role: 'Admin' }), false);
});
