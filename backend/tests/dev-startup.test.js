import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('a duplicate dev backend exits before database initialization or background work', async t => {
  const blocker = net.createServer();
  await new Promise(resolve => blocker.listen(0, resolve));
  t.after(() => new Promise(resolve => blocker.close(resolve)));
  const child = spawn(process.execPath, ['scripts/dev.mjs'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, PORT: String(blocker.address().port) },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => child.kill());
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('Duplicate backend did not exit.')); }, 5000);
    child.once('error', reject);
    child.once('exit', value => { clearTimeout(timer); resolve(value); });
  });
  assert.equal(code, 1);
  assert.match(output, /already in use/);
  assert.doesNotMatch(output, /MongoDB|maintenance|Starting Nest|Indexes ready/);
});
