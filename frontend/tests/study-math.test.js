import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStudyMathText } from '../../shared/studyMath.mjs';

test('Standalone single-dollar math blocks become display blocks', () => {
  const text = 'Before\n$\nf_x=\\frac{\\partial f}{\\partial x}\n$\nAfter';
  const result = normalizeStudyMathText(text);
  assert.equal(result, 'Before\n$$\nf_x=\\dfrac{\\partial f}{\\partial x}\n$$\nAfter');
  assert.equal(normalizeStudyMathText(result), result);
});
test('Limits with subscripts use display math and display style', () => {
  const result = normalizeStudyMathText(String.raw`$\lim_{x\to a}f(x)=L$ describes a limit.`);
  assert.equal(result, String.raw`$$\displaystyle \lim_{x\to a}f(x)=L$$ describes a limit.`);
  assert.equal(normalizeStudyMathText(result), result);
  assert.equal(normalizeStudyMathText(String.raw`$\lim_{x\to0}x$`, { inline: true }), String.raw`$\displaystyle \lim_{x\to0}x$`);
});
test('Fractions use dfrac without corrupting aligned equations or prose', () => {
  assert.equal(normalizeStudyMathText(String.raw`$f(x)=(x^2-1)/(x-1)$`), String.raw`$f(x)=\dfrac{x^2-1}{x-1}$`);
  const aligned = String.raw`$$\begin{pmatrix}1&2\\3&4\end{pmatrix}$$`;
  assert.equal(normalizeStudyMathText(aligned), aligned);
  assert.equal(normalizeStudyMathText('Prices are $5 and $10.'), 'Prices are $5 and $10.');
});
