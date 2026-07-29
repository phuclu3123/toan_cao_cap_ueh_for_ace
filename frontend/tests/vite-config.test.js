import assert from 'node:assert/strict'
import test from 'node:test'

import viteConfig from '../vite.config.js'

test('Vite 8 build config uses supported Rolldown code splitting', () => {
  const output = viteConfig.build?.rolldownOptions?.output

  assert.ok(output?.codeSplitting)
  assert.ok(Array.isArray(output.codeSplitting.groups))
  assert.equal(viteConfig.build?.rollupOptions, undefined)
  assert.equal(viteConfig.build?.chunkSizeWarningLimit, undefined)

  const groupNames = output.codeSplitting.groups.map((group) => group.name)
  assert.deepEqual(groupNames, ['react-vendor', 'firebase', 'icons', 'math'])
})
