import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createCommerceMaintenanceRunner, maintenanceRetryDelay } from '../src/modules/commerce/payments/jobs/commerceMaintenance.js';
import { createPayOSClient, shouldMarkCreateFailure } from '../src/modules/commerce/payments/application/paymentService.js';

const query = rows => ({ sort() { return this; }, limit() { return this; }, select() { return this; }, lean: async () => rows });
function fixture(overrides = {}) {
  const state = { filter: null, writes: [], logs: [], reconciled: [], cancelled: [], released: [] };
  const rows = [{ _id: 'fixture-order', orderCode: 123, status: 'PENDING' }];
  const deps = {
    payments: { find(filter) { state.filter = filter; return query(rows); }, updateOne: async (...args) => { state.writes.push(args); }, findOne: () => query(null) },
    reservations: { find: () => query([]) }, connected: () => true, now: () => 100000,
    reconcile: async code => state.reconciled.push(code), cancel: async code => state.cancelled.push(code),
    release: async code => state.released.push(code), logger: { warn: (...args) => state.logs.push(args) }, ...overrides
  };
  return { state, deps, rows, run: createCommerceMaintenanceRunner(deps) };
}

test('maintenance selects only due pending orders and preserves successful provider checks', async () => {
  const { state, run } = fixture(); await run();
  assert.deepEqual(state.filter.status, { $in: ['CREATING', 'PENDING'] });
  assert.equal(+state.filter.$or[1].maintenanceRetryAt.$lte, 100000);
  assert.deepEqual(state.reconciled, [123]); assert.deepEqual(state.writes, []); assert.deepEqual(state.logs, []);
});

test('provider rejection backs off without declaring payment, releasing quota or overriding PAID', async () => {
  const error = Object.assign(new Error('Provider payload must not be logged'), { code: 'PAYOS_REJECTED', providerCode: 'fixture-declined', providerHttpStatus: 200 });
  const { state, run } = fixture({ reconcile: async () => { throw error; } }); await run();
  const [filter, update] = state.writes[0];
  assert.deepEqual(filter.status, { $in: ['CREATING', 'PENDING'] });
  assert.equal(update.$inc.maintenanceFailures, 1); assert.equal(+update.$set.maintenanceRetryAt, 220000);
  assert.equal('status' in update.$set, false); assert.deepEqual(state.released, []);
  assert.equal(state.logs[0][1].providerCode, 'fixture-declined');
  assert.equal(JSON.stringify(state.logs).includes(error.message), false);
});

test('maintenance backoff grows and stays bounded; recovery clears only retry metadata', async () => {
  assert.equal(maintenanceRetryDelay(1), 120000); assert.equal(maintenanceRetryDelay(2), 240000);
  assert.equal(maintenanceRetryDelay(100), 3600000);
  const { rows, state, run } = fixture(); rows[0].maintenanceFailures = 3; await run();
  assert.deepEqual(state.writes[0][1], { $unset: { maintenanceFailures: '', maintenanceRetryAt: '' } });
});

test('provider Retry-After is respected and expired orders use verified cancellation', async () => {
  const { rows, state, run } = fixture({ cancel: async () => { throw Object.assign(new Error(), { code: 'PAYOS_UNAVAILABLE', retryAfterMs: 600000 }); } });
  rows[0].expiresAt = new Date(1); await run();
  assert.deepEqual(state.reconciled, []); assert.equal(+state.writes[0][1].$set.maintenanceRetryAt, 700000);
});

test('maintenance does not overlap and does no work while MongoDB is disconnected', async () => {
  let release;
  const { state, run } = fixture({ reconcile: () => new Promise(resolve => { release = resolve; }) });
  const first = run(); await new Promise(resolve => setImmediate(resolve)); await run();
  release(); await first; assert.equal(state.logs.length, 0);
  const disconnected = fixture({ connected: () => false }); await disconnected.run(); assert.equal(disconnected.state.filter, null);
});

test('expired promotion holds are released only for terminal failed or cancelled payments', async () => {
  const f = fixture({ reservations: { find: () => query([{ orderCode: 1 }, { orderCode: 2 }, { orderCode: 3 }]) } });
  f.deps.payments.findOne = ({ orderCode }) => query({ status: ['PAID', 'CANCELLED', 'PENDING'][orderCode - 1] });
  await f.run(); assert.deepEqual(f.state.released, [2]);
});

function providerFixture(t, response) {
  const keys = ['PAYOS_CLIENT_ID', 'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY'];
  const previous = keys.map(key => process.env[key]);
  keys.forEach(key => { process.env[key] = 'fixture-only-secret'; });
  t.after(() => keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; }));
  t.mock.method(globalThis, 'fetch', async () => response);
}

test('PayOS errors retain sanitized provider codes without leaking response bodies or secrets', async t => {
  providerFixture(t, new Response(JSON.stringify({ code: '231', desc: 'fixture-only-secret' }), { status: 200 }));
  await assert.rejects(createPayOSClient()('/fixture'), error => {
    assert.equal(error.code, 'PAYOS_REJECTED'); assert.equal(error.providerCode, '231'); assert.equal(error.providerHttpStatus, 200);
    assert.equal(JSON.stringify(error).includes('fixture-only-secret'), false); assert.equal(error.message.includes('fixture-only-secret'), false); return true;
  });
});

test('PayOS rate limiting with a non-JSON body is retryable rather than a definitive rejection', async t => {
  providerFixture(t, new Response('Too many requests', { status: 429, headers: { 'Retry-After': '90' } }));
  await assert.rejects(createPayOSClient()('/fixture'), error => { assert.equal(error.code, 'PAYOS_UNAVAILABLE'); assert.equal(error.retryAfterMs, 90000); assert.equal(shouldMarkCreateFailure(error), false); return true; });
});

test('invalid merchant credentials cannot mark a recoverable create as failed', async t => {
  providerFixture(t, new Response('{}', { status: 401 }));
  await assert.rejects(createPayOSClient()('/fixture'), error => { assert.equal(error.code, 'PAYOS_AUTH_FAILED'); assert.equal(error.statusCode, 503); assert.equal(shouldMarkCreateFailure(error), false); return true; });
});

test('malformed successful provider responses fail closed', async t => {
  providerFixture(t, new Response('<html>gateway</html>', { status: 200 }));
  await assert.rejects(createPayOSClient()('/fixture'), { code: 'PAYOS_INVALID_RESPONSE' });
});

test('course, donation and queued maintenance share a provider cooldown, then recover', async t => {
  providerFixture(t, null);
  let clock = 1000;
  let requests = 0;
  const client = createPayOSClient({ now: () => clock, fetchImpl: async () => {
    requests++;
    return requests === 1
      ? new Response('limited', { status: 429, headers: { 'Retry-After': '90' } })
      : new Response(JSON.stringify({ code: '00', data: {} }));
  } });
  const results = await Promise.allSettled([client('/course'), client('/donation'), client('/maintenance')]);
  assert.equal(requests, 1);
  for (const [index, result] of results.entries()) {
    assert.equal(result.status, 'rejected');
    assert.equal(result.reason.providerHttpStatus, 429);
    assert.equal(result.reason.retryAfterMs, 90000);
    assert.equal(shouldMarkCreateFailure(result.reason), index !== 0);
  }
  clock += 89999;
  await assert.rejects(client('/donation'), { retryAfterMs: 1 });
  clock++;
  assert.equal((await client('/donation')).code, '00');
  assert.equal(requests, 2);
});

test('maintenance stops the batch after merchant rate limiting', async () => {
  let requests = 0;
  const f = fixture({ reconcile: async () => {
    requests++;
    throw Object.assign(new Error(), { code: 'PAYOS_UNAVAILABLE', providerHttpStatus: 429 });
  } });
  f.rows.push({ _id: 'second-order', orderCode: 456 });
  await f.run();
  assert.equal(requests, 1);
  assert.equal(f.state.writes.length, 1);
});

test('runtime Mongoose queries use returnDocument rather than deprecated options', async () => {
  const walk = async folder => {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), folder);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.js')) assert.doesNotMatch(await readFile(path, 'utf8'), /\b(?:new|returnOriginal)\s*:\s*(?:true|false)\b/, path.pathname);
    }
  };
  await walk(new URL('../src/', import.meta.url));
});
