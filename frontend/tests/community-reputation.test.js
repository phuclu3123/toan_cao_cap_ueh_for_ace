import assert from 'node:assert/strict';
import test from 'node:test';
import { getTierByPoints, getTierProgress } from '../src/services/reputationService.js';

test('contribution points never imply the administrator role', () => {
  assert.equal(getTierByPoints(0).id, 'novice');
  assert.equal(getTierByPoints(20_000).id, 'legend');
  assert.equal(getTierProgress(20_000).nextTier, null);
  assert.equal(getTierProgress(0).nextTier.id, 'explorer');
});
