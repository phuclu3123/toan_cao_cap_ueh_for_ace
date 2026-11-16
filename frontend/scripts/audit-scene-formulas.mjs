import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { readFile } from 'node:fs/promises';

const traverse = traverseModule.default;
const files = ['CourseScenes.jsx', 'ReviewedScenes.jsx', 'CalculusReviewScenes.jsx', 'MatrixGeometryMovies.jsx', 'MatrixFlowMovie.jsx', 'MatrixArithmeticMovie.jsx', 'TransposeMatrixMovie.jsx', 'MatrixMovies.jsx'];
const mathGlyph = /[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵢⱼᵀ′Δ×π√∫≤≥≠≈∞λφαβ]/u;
const findings = [];

function check(value, file, line, kind) {
  const plain = value.replace(/\$\$?[\s\S]*?\$\$?/g, '');
  if (mathGlyph.test(plain)) findings.push({ file, line, kind, value: plain.trim().slice(0, 180) });
}

for (const file of files) {
  const source = await readFile(new URL(`../src/components/study/${file}`, import.meta.url), 'utf8');
  const tree = parse(source, { sourceType: 'module', plugins: ['jsx'] });
  traverse(tree, {
    StringLiteral(path) { check(path.node.value, file, path.node.loc.start.line, 'string'); },
    TemplateElement(path) { check(path.node.value.cooked ?? path.node.value.raw, file, path.node.loc.start.line, 'template'); },
    JSXText(path) { check(path.node.value, file, path.node.loc.start.line, 'jsx-text'); },
  });
}

console.log(JSON.stringify({ count: findings.length, findings }, null, 2));
