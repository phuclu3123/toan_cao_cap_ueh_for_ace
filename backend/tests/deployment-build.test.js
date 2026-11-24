import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

test('production install builds the Nest entry used by direct Render startup', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.scripts.postinstall, 'npm run build');
  assert.match(await readFile(new URL('../.npmrc', import.meta.url), 'utf8'), /^include=dev$/m);
  await access(new URL('../dist/bootstrap.js', import.meta.url));
});
