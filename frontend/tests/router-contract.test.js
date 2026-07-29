import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const blogDetailSource = await readFile(
  new URL('../src/pages/BlogDetailPage.jsx', import.meta.url),
  'utf8'
)

test('router uses clean canonical paths and keeps explicit legacy redirects', () => {
  assert.match(appSource, /createBrowserRouter/)
  assert.doesNotMatch(appSource, /createHashRouter/)

  for (const route of [
    "path: 'courses'",
    "path: 'course/:slug'",
    "path: 'account'",
    "path: 'resources'",
    "path: 'document/:id'",
    "path: 'exams'",
    "path: 'exam/:id'",
    "path: 'blog'",
    "path: 'blog/:slug'"
  ]) {
    assert.ok(appSource.includes(route), `Missing canonical route: ${route}`)
  }

  assert.ok(appSource.includes("path: 'doc/:id'"))
  assert.ok(appSource.includes("path: 'profile'"))
})

test('blog section links use BrowserRouter URLs instead of hash URLs', () => {
  assert.doesNotMatch(blogDetailSource, /\/#\/blog\//)
  assert.match(blogDetailSource, /window\.location\.origin}\/blog\//)
})
