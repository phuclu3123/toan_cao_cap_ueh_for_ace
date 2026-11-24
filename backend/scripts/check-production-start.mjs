import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';

// Run against a clean install, never against an environment containing live secrets.
assert(process.argv[2], 'Pass the directory of a clean backend production install.');
const cwd = resolve(process.argv[2]);
assert(!existsSync(join(cwd, '.env')), 'The smoke-test directory must not contain .env.');
assert(existsSync(join(cwd, 'dist/bootstrap.js')), 'Installation did not emit dist/bootstrap.js.');
const probe = net.createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/(MONGO|PAYOS|FIREBASE|RESEND|SMTP|SECRET|TOKEN|OTP|EMAIL)/i.test(key)));
Object.assign(env, { NODE_ENV: 'production', REQUIRE_DATABASE: 'false', BACKEND_HTTP_RUNTIME: 'nest', PORT: String(port), CLIENT_URL: 'https://example.test', FRONTEND_URL: 'https://example.test' });
const child = spawn(process.execPath, ['server.js'], { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '', exitCode;
child.stdout.on('data', chunk => { output = (output + chunk).slice(-32000); });
child.stderr.on('data', chunk => { output = (output + chunk).slice(-32000); });
child.once('exit', code => { exitCode = code; });
const exited = new Promise(resolve => child.once('close', resolve));
try {
  let health;
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline && exitCode === undefined) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { health = await response.json(); break; }
    } catch { /* Allow bootstrap to finish. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert(health, `Production start failed: ${output}`);
  assert(['ok', 'degraded'].includes(health.status)); // This isolated smoke test intentionally has no database.
  assert.equal(health.environment, 'production');
  assert.equal(health.database.configured, false);
  assert.doesNotMatch(output, /ERR_MODULE_NOT_FOUND|EADDRINUSE|Backend failed to start/);
  console.log('PASS: clean production install emits dist and direct node server.js serves health; no live database or PayOS used.');
} finally {
  child.kill();
  await exited;
}
