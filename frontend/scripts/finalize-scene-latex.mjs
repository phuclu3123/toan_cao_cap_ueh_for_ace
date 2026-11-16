import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { readFile, writeFile } from 'node:fs/promises';

const traverse = traverseModule.default;
const generate = generateModule.default;
const edits = [];
const files = ['CourseScenes.jsx', 'MatrixGeometryMovies.jsx', 'TransposeMatrixMovie.jsx', 'MatrixMovies.jsx'];

for (const file of files) {
  const path = new URL('../src/components/study/' + file, import.meta.url);
  const source = await readFile(path, 'utf8');
  const tree = parse(source, { sourceType: 'module', plugins: ['jsx'] });
  traverse(tree, {
    JSXElement(path) {
      if (file !== 'CourseScenes.jsx' || path.node.openingElement.name.name !== 'svg') return;
      const surface = path.node.openingElement.attributes.some(attribute => attribute.name?.name === 'className' && attribute.value?.value === 'course-surface');
      if (!surface) return;
      const aria = path.node.openingElement.attributes.find(attribute => attribute.name?.name === 'aria-label');
      if (aria) aria.value = t.stringLiteral('Mặt cong hai biến và hai hướng mặt cắt');
      const formula = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier('MathText'), [t.jsxAttribute(t.jsxIdentifier('inline'), null), t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('course-surface-formula'))]),
        t.jsxClosingElement(t.jsxIdentifier('MathText')),
        [t.jsxExpressionContainer(t.templateLiteral([
          t.templateElement({ raw: '$z=', cooked: '$z=' }, false),
          t.templateElement({ raw: 'x^2+(', cooked: 'x^2+(' }, false),
          t.templateElement({ raw: ')y^2$', cooked: ')y^2$' }, true),
        ], [t.identifier('a'), t.identifier('b')]))],
        false,
      );
      path.replaceWith(t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [path.node, formula]));
      path.skip();
      edits.push(file + ':surface equation rendered with KaTeX');
    },
    StringLiteral(path) {
      let value = path.node.value;
      if (file === 'MatrixGeometryMovies.jsx') value = value.replace('$(-1)$ⁱ⁺ʲ', '$(-1)^{i+j}$');
      if (file === 'CourseScenes.jsx' && value.includes('Tính ∫') && value.includes('2xe^{2x}dx')) value = 'Tính $\\int 2xe^{2x}\\,dx$ trong phương trình tuyến tính. Giữ dấu trừ và hệ số $1/2$.';
      if (value !== path.node.value) {
        path.node.value = value;
        delete path.node.extra;
        edits.push(file + ':' + path.node.loc.start.line);
      }
    },
    JSXText(path) {
      if (file === 'TransposeMatrixMovie.jsx' && path.node.value.trim() === 'Aᵀ') {
        path.node.value = path.node.value.replace('Aᵀ', 'A chuyển vị');
        edits.push(file + ':' + path.node.loc.start.line);
      }
    },
    ExportNamedDeclaration(path) {
      if (file === 'MatrixMovies.jsx' && path.node.declaration?.id?.name === 'InverseMatrixMovie') {
        path.remove();
        edits.push(file + ':removed unused two by two inverse demo');
      }
    },
    ImportDeclaration(path) {
      if (file === 'MatrixMovies.jsx' && (path.node.source.value === '../../hooks/useMathPlayback' || path.node.source.value === 'react' && path.node.specifiers.some(item => item.imported?.name === 'useState'))) {
        path.remove();
      }
    },
  });
  await writeFile(path, generate(tree, { comments: true }, source).code + '\n');
}
console.log(JSON.stringify({ edits }, null, 2));
