import test from 'node:test';
import assert from 'node:assert/strict';
import { requireTurnstile } from '../src/platform/http/turnstile.js';

test('Turnstile rejects missing, invalid and mismatched tokens before allowing a controller', async (t) => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  t.after(() => { process.env = originalEnv; globalThis.fetch = originalFetch; });
  Object.assign(process.env, {
    TURNSTILE_MODE: 'required', TURNSTILE_SITE_KEY: 'site',
    TURNSTILE_SECRET_KEY: 'secret', TURNSTILE_HOSTNAMES: 'localhost,toancaocapueh.id.vn'
  });
  let providerCalls = 0;
  let result = { success: true, action: 'login', hostname: 'toancaocapueh.id.vn' };
  globalThis.fetch = async (_url, options) => {
    providerCalls++;
    assert.equal(JSON.parse(options.body).secret, 'secret');
    return { ok: true, json: async () => result };
  };
  const invoke = async (token) => {
    const state = { allowed: false };
    const res = {
      status(code) { state.status = code; return this; },
      json(body) { state.body = body; return this; }
    };
    await requireTurnstile('login')({ body: { 'cf-turnstile-response': token } }, res, () => { state.allowed = true; });
    return state;
  };

  assert.equal((await invoke(undefined)).status, 422);
  assert.equal((await invoke('x'.repeat(2049))).status, 422);
  assert.equal(providerCalls, 0);
  assert.equal((await invoke('valid')).allowed, true);
  result = { success: false };
  assert.equal((await invoke('invalid')).status, 403);
  result = { success: true, action: 'register', hostname: 'toancaocapueh.id.vn' };
  assert.equal((await invoke('wrong-action')).status, 403);
  result = { success: true, action: 'login', hostname: 'attacker.example' };
  assert.equal((await invoke('wrong-host')).status, 403);
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal((await invoke('network-error')).status, 503);
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal((await invoke('partial-config')).status, 503);
  process.env.TURNSTILE_MODE = 'invalid';
  assert.equal((await invoke('invalid-mode')).status, 503);
  process.env.TURNSTILE_MODE = 'off';
  assert.equal((await invoke(undefined)).allowed, true);
  process.env.TURNSTILE_MODE = 'auto';
  delete process.env.TURNSTILE_SITE_KEY;
  assert.equal((await invoke(undefined)).allowed, true);
});
