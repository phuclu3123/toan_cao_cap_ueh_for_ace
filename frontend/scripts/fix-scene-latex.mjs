import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { readFile, writeFile } from 'node:fs/promises';

const traverse = traverseModule.default;
const generate = generateModule.default;
const files = ['CourseScenes.jsx', 'ReviewedScenes.jsx', 'CalculusReviewScenes.jsx', 'MatrixGeometryMovies.jsx', 'MatrixArithmeticMovie.jsx', 'TransposeMatrixMovie.jsx', 'MatrixMovies.jsx'];
const outside = [
  ['4h²', '$4h^2$'], ['h²', '$h^2$'], ['y≠0', '$y\\ne0$'], ['D≠0', '$D\\ne0$'],
  ['x²', '$x^2$'], ['y²', '$y^2$'], ['t⁴', '$t^4$'], ['λ', '$\\lambda$'],
  ['a₁₃', '$a_{13}$'], ['a₂₃', '$a_{23}$'], ['z₃₂', '$z_{32}$'], ['X₃', '$X_3$'],
  ['aᵢⱼ', '$a_{ij}$'], ['Xⱼ', '$X_j$'], ['Xᵢ', '$X_i$'], ['det A≠0', '$\\det A\\ne0$'],
  ['r(A)≤3', '$r(A)\\le3$'], ['r(A)≥3', '$r(A)\\ge3$'],
  ['N≈2639', '$N\\approx2639$'], ['t⁴', '$t^4$'],
];
const inside = [['²', '^2'], ['³', '^3'], ['⁴', '^4'], ['⁻¹', '^{-1}'], ['ᵀ', '^T'], ['ᵢ', '_i'], ['ⱼ', '_j'], ['₃', '_3'], ['₁', '_1'], ['₂', '_2'], ['ⁱ⁺ʲ', '^{i+j}'], ['≠', '\\ne'], ['≤', '\\le'], ['≥', '\\ge'], ['≈', '\\approx'], ['→', '\\to'], ['Δ', '\\Delta'], ['π', '\\pi'], ['λ', '\\lambda'], ['∫', '\\int'], ['×', '\\times'], ['′', "'"]];
const stats = { edits: 0, files: {} };

function convert(value, file) {
  const tokens = value.split(/(\$\$[\s\S]*?\$\$|\$[^$\n\r]+?\$)/g);
  const result = tokens.map(token => {
    if (token.startsWith('$') && token.endsWith('$')) {
      let formula = token.slice(1, -1);
      if (token.startsWith('$$')) formula = token.slice(2, -2);
      for (const [from, to] of inside) formula = formula.split(from).join(to);
      const delimiter = token.startsWith('$$') ? '$$' : '$';
      return delimiter + formula + delimiter;
    }
    let text = token;
    for (const [from, to] of outside) text = text.split(from).join(to);
    if (file === 'CourseScenes.jsx') {
      text = text.replaceAll('Δx=', 'bước h=')
        .replaceAll('f′=', 'đạo hàm=')
        .replaceAll('khi y≠0', 'khi $y\\ne0$')
        .replaceAll('Tại (5,0)', 'Tại $(5,0)$')
        .replaceAll('Sai lệch 4h²', 'Sai lệch $4h^2$')
        .replaceAll('sai lệch là h²', 'sai lệch là $h^2$')
        .replaceAll('x=λ, x+y=10', '$x=\\lambda$, $x+y=10$')
        .replaceAll('y=λ, ', '$y=\\lambda$, ')
        .replaceAll('k>0, k<16 cho k′>0, k>16 cho k′<0; k=0', '$k>0$, $k<16$ cho $k\'>0$, $k>16$ cho $k\'<0$; $k=0$');
      if (text.includes('Tính ∫') && text.includes('2xe^{2x}dx')) text = text.replace('∫$2xe^{2x}dx$', '$\\int 2xe^{2x}\\,dx$');
      if (text.includes('Tại t=24: N≈2639.')) text = text.replace('Tại t=24: N≈2639.', 'Tại $t=24$: $N\\approx2639$.');
      if (text.includes('Vì (x²)′=2x')) text = text.replace('Vì (x²)′=2x, vế trái là (x²y)′.', "Vì $(x^2)'=2x$, vế trái là $(x^2y)'$.");
      if (text.startsWith('Xét y=0 trước:')) text = text.replace('Xét y=0 trước:', 'Xét $y=0$ trước:');
      if (text.startsWith('Với y≠0:')) text = text.replace('Với y≠0:', 'Với $y\\ne0$:');
      if (text.includes('Vì 1+x²>0')) text = text.replace('Vì 1+x²>0', 'Vì $1+x^2>0$');
    }
    if (file === 'ReviewedScenes.jsx') {
      text = text.replaceAll('a₁₃', '$a_{13}$').replaceAll('a₂₃', '$a_{23}$')
        .replaceAll('X₃', '$X_3$').replaceAll('z₃₂=40', '$z_{32}=40$')
        .replaceAll('aᵢⱼ', '$a_{ij}$').replaceAll('Xⱼ', '$X_j$').replaceAll('Xᵢ', '$X_i$')
        .replaceAll('D≠0', '$D\\ne0$')
        .replaceAll('Dòng cuối: −4z=4 nên z=−1. Thế ngược cho y=−1, x=3. Kiểm tra AX=B với B=(−1,0,1)ᵀ.', 'Dòng cuối cho $-4z=4$, nên $z=-1$. Thế ngược, $y=-1$, $x=3$. Kiểm tra $AX=B$ với $B=(-1,0,1)^T$.')
        .replaceAll('A tam giác trên: $det A=1(-5)\\cdot0\\cdot6=0$, nên r(A)≤3.', 'A tam giác trên: $\\det A=1(-5)\\cdot0\\cdot6=0$, nên $r(A)\\le3$.')
        .replaceAll('$det M=1(-5)2=-10\\ne0$, nên r(A)≥3.', '$\\det M=1(-5)\\cdot2=-10\\ne0$, nên $r(A)\\ge3$.')
        .replaceAll('$3le r(A)le3Rightarrow r(A)=3$.', '$3\\le r(A)\\le3\\Rightarrow r(A)=3$.')
        .replaceAll('det A=0 cho cận trên.', '$\\det A=0$ cho cận trên.')
        .replaceAll('với det A≠0.', 'với $\\det A\\ne0$.')
        .replaceAll('ngành 3 nhận 1 đơn vị cần 0,2 đầu vào từ ngành 1.', 'ngành 3 nhận 1 đơn vị cần 0,2 đầu vào từ ngành 1.');
    }
    if (file === 'CalculusReviewScenes.jsx') {
      text = text.replaceAll('với I>0.', 'với $I>0$.')
        .replaceAll('Tại I=16:', 'Tại $I=16$:')
        .replaceAll('S=8pm4', '$S=8\\pm4$')
        .replaceAll('Sle.3I=4.8', '$S\\le0.3I=4.8$')
        .replaceAll('chọn S=4; nhánh S=12', 'chọn $S=4$; nhánh $S=12$')
        .replaceAll('khi t≠0:', 'khi $t\\ne0$:');
    }
    if (file === 'MatrixGeometryMovies.jsx') text = text.replaceAll('Dấu ⁱ⁺ʲ bắt buộc được giữ.', 'Giữ đúng dấu $(-1)^{i+j}$ của từng phần bù đại số.');
    return text;
  }).join('');
  return result;
}

for (const file of files) {
  const path = new URL('../src/components/study/' + file, import.meta.url);
  const source = await readFile(path, 'utf8');
  const tree = parse(source, { sourceType: 'module', plugins: ['jsx'] });
  traverse(tree, {
    TemplateLiteral(path) {
      const attribute = path.findParent(parent => parent.isJSXAttribute());
      if (file === 'CourseScenes.jsx' && attribute?.node.name.name === 'label' && path.node.quasis[0].value.raw === 'ΔX') {
        path.node.quasis[0].value = { raw: '$\\\\Delta X_{', cooked: '$\\Delta X_{' };
        path.node.quasis.at(-1).value = { raw: '}$', cooked: '}$' };
        stats.edits += 1;
        return;
      }
      for (const quasi of path.node.quasis) {
        const next = convert(quasi.value.cooked ?? quasi.value.raw, file);
        if (next === (quasi.value.cooked ?? quasi.value.raw)) continue;
        quasi.value.cooked = next;
        quasi.value.raw = path.parentPath.isTaggedTemplateExpression() ? next : next.replaceAll('\\', '\\\\');
        stats.edits += 1;
      }
    },
    StringLiteral(path) {
      const next = convert(path.node.value, file);
      if (next !== path.node.value) {
        path.node.value = next;
        delete path.node.extra;
        stats.edits += 1;
      }
    },
    JSXText(path) {
      const value = path.node.value;
      if (value.trim() === '×') {
        path.replaceWith(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('MathText'), [t.jsxAttribute(t.jsxIdentifier('inline'), null)]), t.jsxClosingElement(t.jsxIdentifier('MathText')), [t.jsxExpressionContainer(t.stringLiteral('$\\times$'))], false));
        stats.edits += 1;
      } else if (value.includes('⅔ × 6% = +4%')) {
        path.replaceWith(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('MathText'), [t.jsxAttribute(t.jsxIdentifier('inline'), null)]), t.jsxClosingElement(t.jsxIdentifier('MathText')), [t.jsxExpressionContainer(t.stringLiteral('$\\frac23\\times6\\%=4\\%$'))], false));
        stats.edits += 1;
      } else if (value.includes('⅓ × (−3%) = −1%')) {
        path.replaceWith(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('MathText'), [t.jsxAttribute(t.jsxIdentifier('inline'), null)]), t.jsxClosingElement(t.jsxIdentifier('MathText')), [t.jsxExpressionContainer(t.stringLiteral('$\\frac13\\times(-3\\%)=-1\\%$'))], false));
        stats.edits += 1;
      } else if (file === 'CalculusReviewScenes.jsx' && value.includes('Cam: f(t,0)')) {
        path.node.value = value.replace('Cam: f(t,0) · Xanh nét đứt: f(0,t)', 'Đường cam: biến thứ nhất thay đổi · nét đứt xanh: biến thứ hai thay đổi');
        stats.edits += 1;
      } else if (file === 'CourseScenes.jsx' && (value.includes('x · cam') || value.includes('y · xanh'))) {
        path.node.value = value.replace('x · cam', 'hướng màu cam').replace('y · xanh', 'hướng màu xanh');
        stats.edits += 1;
      } else {
        const next = convert(value, file);
        if (next !== value) {
          path.node.value = next;
          stats.edits += 1;
        }
      }
    },
  });
  if (file === 'CourseScenes.jsx') {
    traverse(tree, {
      JSXElement(path) {
        const opening = path.node.openingElement;
        if (opening.name.name !== 'text') return;
        const x = opening.attributes.find(attribute => attribute.name?.name === 'x')?.value?.value;
        const parent = path.findParent(item => item.isJSXElement() && item.node.openingElement.name.name === 'svg');
        const className = parent?.node.openingElement.attributes.find(attribute => attribute.name?.name === 'className')?.value?.value;
        if (className === 'course-surface' && x === '220') path.remove();
      }
    });
  }
  if (file === 'CalculusReviewScenes.jsx') {
    traverse(tree, {
      JSXElement(path) {
        const opening = path.node.openingElement;
        if (opening.name.name !== 'text') return;
        const parent = path.findParent(item => item.isJSXElement() && item.node.openingElement.name.name === 'svg');
        if (parent?.node.openingElement.attributes.some(attribute => attribute.name?.name === 'className' && attribute.value?.value === 'analysis-plot')) return;
      }
    });
  }
  await writeFile(path, generate(tree, { comments: true }, source).code + '\n');
}
console.log(JSON.stringify(stats, null, 2));
