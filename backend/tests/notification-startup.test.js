import assert from 'node:assert/strict';
import test from 'node:test';
import UserNotification from '../src/modules/notifications/persistence/UserNotification.js';
import { prepareNotificationStore } from '../src/modules/notifications/application/inbox.js';

test('notification store prepares after connection and retries an interrupted initialization', async () => {
  assert.equal(UserNotification.schema.options.autoCreate, false);
  assert.equal(UserNotification.schema.options.autoIndex, false);
  const connection = UserNotification.db;
  const ready = connection.readyState, database = connection.db;
  const create = UserNotification.createCollection, indexes = UserNotification.createIndexes;
  let attempts = 0, indexed = 0;
  try {
    connection.readyState = 0;
    await assert.rejects(prepareNotificationStore(), { statusCode: 503 });
    connection.readyState = 1; connection.db = {};
    UserNotification.createCollection = async () => { if (++attempts === 1) throw new Error('temporary failure'); };
    UserNotification.createIndexes = async () => { indexed++; };
    await assert.rejects(prepareNotificationStore(), /temporary failure/);
    await Promise.all([prepareNotificationStore(), prepareNotificationStore()]);
    assert.equal(attempts, 2); assert.equal(indexed, 1);
    await prepareNotificationStore();
    assert.equal(attempts, 2);
  } finally {
    UserNotification.createCollection = create; UserNotification.createIndexes = indexes;
    connection.readyState = ready; connection.db = database;
  }
});
