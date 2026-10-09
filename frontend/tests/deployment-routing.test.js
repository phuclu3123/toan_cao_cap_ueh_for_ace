import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const redirects = (await readFile(
  new URL('../public/_redirects', import.meta.url),
  'utf8'
))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
const netlifyConfig = await readFile(
  new URL('../../netlify.toml', import.meta.url),
  'utf8'
)

test('Netlify proxies production auth traffic before the SPA fallback', () => {
  assert.deepEqual(redirects, [
    'https://toancaocapueh.id.vn/__/auth/* https://toancaocapueh-auth.firebaseapp.com/__/auth/:splat 200!',
    'https://toancaocapueh.id.vn/__/firebase/* https://toancaocapueh-auth.firebaseapp.com/__/firebase/:splat 200!',
    'https://toancaocapueh.id.vn/api/* https://ueh-tcc-backend.onrender.com/api/:splat 200!',
    '/* /index.html 200'
  ])
})

test('Netlify previews never inherit a global production backend proxy', () => {
  assert.doesNotMatch(netlifyConfig, /from\s*=\s*"\/api\/\*"/)
  assert.doesNotMatch(netlifyConfig, /ueh-tcc-backend\.onrender\.com/)
})
