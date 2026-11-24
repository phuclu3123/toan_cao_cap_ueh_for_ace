import assert from 'node:assert/strict';
import test from 'node:test';
import { communityExcerpt } from '../src/utils/communityExcerpt.js';

test('feed excerpts preserve complete inline math and flatten display math', () => {
  assert.equal(communityExcerpt('<p>Tính $$\\dfrac{x^2-1}{x-1}$$.</p>'), 'Tính $\\dfrac{x^2-1}{x-1}$.');
  const excerpt = communityExcerpt('Cho $\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ và tìm định thức của ma trận.', 20);
  assert.equal((excerpt.match(/\$/g) || []).length % 2, 0);
  assert.ok(excerpt.endsWith('…'));
});
test('incomplete or oversized formulas do not leak broken LaTeX into the feed', () => {
  assert.equal(communityExcerpt('Tìm nghiệm $x^2 +'), 'Tìm nghiệm…');
  assert.doesNotMatch(communityExcerpt('$' + 'x'.repeat(260) + '$'), /\$/);
  assert.doesNotMatch(communityExcerpt('Nội dung <b>đậm</b> ![ảnh](https://example.test/a.png)'), /<b>|!\[/);
});

test('Vietnamese text inside a formula is displayed as prose without raw LaTeX', () => {
  const text = communityExcerpt('Tìm $$f(x)=x^2 \\quad \\text{với điều kiện} \\quad x>0$$.');
  assert.equal(text, 'Tìm $f(x)=x^2$ với điều kiện $x>0$.');
});
