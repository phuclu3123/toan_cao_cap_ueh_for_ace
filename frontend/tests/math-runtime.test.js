import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [indexHtml, rendererSource, examSource] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/MathRenderer.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/ExamDetail.jsx', import.meta.url), 'utf8')
])

test('KaTeX npm package is the only math renderer loaded at runtime', () => {
  assert.doesNotMatch(indexHtml, /mathjax/i)
  assert.doesNotMatch(indexHtml, /cdn\.jsdelivr\.net\/npm\/katex/i)
  assert.doesNotMatch(examSource, /MathJax|typesetPromise/)
  assert.match(rendererSource, /import katex from 'katex'/)
})

test('math rendering rejects unsafe and non-strict input with a visible fallback', () => {
  assert.match(rendererSource, /trust:\s*false/g)
  assert.match(rendererSource, /throwOnError:\s*true/g)
  assert.match(rendererSource, /strict:\s*'error'/g)
  assert.match(rendererSource, /math-render-error/)
})
