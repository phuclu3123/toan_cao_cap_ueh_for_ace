import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import '../config/db.js';
import Access from '../models/FlashcardAccess.js';
import Key from '../models/FlashcardKey.js';
import Audit from '../models/FlashcardAudit.js';
import RateLimit from '../models/FlashcardRateLimit.js';
import { requireAccessDatabase } from '../services/flashcardAccess.js';

test('flashcard models initialize before connect without issuing collection/index writes', { timeout: 2000 }, async () => {
  assert.equal(mongoose.connection.readyState, 0);
  assert.equal(mongoose.get('bufferCommands'), false);
  for (const model of [Access, Key, Audit, RateLimit]) {
    assert.equal(model.schema.options.autoCreate, false);
    assert.equal(model.schema.options.autoIndex, false);
    await model.init();
  }
  assert.equal(mongoose.connection.readyState, 0);
});

test('flashcard access remains closed if its database is unavailable', () => {
  assert.throws(requireAccessDatabase, error => error.status === 503 && error.code === 'ACCESS_UNAVAILABLE');
});
