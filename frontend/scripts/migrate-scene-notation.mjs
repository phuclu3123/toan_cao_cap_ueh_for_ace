import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { readFile, writeFile } from 'node:fs/promises';
import { migrate } from './migrate-study-notation.mjs';
const traverse=traverseModule.default,generate=generateModule.default;
const files=['CourseScenes.jsx','ReviewedScenes.jsx','CalculusReviewScenes.jsx','MatrixGeometryMovies.jsx','MatrixFlowMovie.jsx','MatrixArithmeticMovie.jsx','TransposeMatrixMovie.jsx'];
const changed=[];
const math=(expression)=>t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('MathText'),[t.jsxAttribute(t.jsxIdentifier('inline'),null)]),t.jsxClosingElement(t.jsxIdentifier('MathText')),[t.jsxExpressionContainer(expression)],false);
function isText(node){return t.isStringLiteral(node)||t.isNumericLiteral(node)||t.isTemplateLiteral(node)||t.isBinaryExpression(node)&&node.operator==='+'||t.isConditionalExpression(node)&&isText(node.consequent)&&isText(node.alternate);}
for(const file of files){
 const path=new URL(`../src/components/study/${file}`,import.meta.url),source=await readFile(path,'utf8'),tree=parse(source,{sourceType:'module',plugins:['jsx']}),containers=new WeakSet();
 traverse(tree,{
  StringLiteral(p){
   if(p.parentPath.isImportDeclaration()||p.key==='key')return;
   const attribute=p.findParent(a=>a.isJSXAttribute());
   if(attribute&&(!['title','description','label','value'].includes(attribute.node.name.name)||/^[a-z]/.test(attribute.parent.name?.name||'')))return;
   const old=p.node.value,next=migrate(old,`${file}:${p.node.loc?.start.line}`);if(next===old)return;
   changed.push({file,from:old,to:next});p.node.value=next;delete p.node.extra;
   const parent=p.findParent(a=>a.isJSXExpressionContainer());if(parent)containers.add(parent.node);
  },
  TemplateLiteral(p){
   for(const quasi of p.node.quasis){
    const old=quasi.value.cooked ?? quasi.value.raw,next=migrate(old,`${file}:${quasi.loc?.start.line}`);
    if(next===old)continue;
    changed.push({file,from:old,to:next});
    quasi.value.cooked=next;
    quasi.value.raw=p.parentPath.isTaggedTemplateExpression()?next:next.replaceAll('\\','\\\\');
   }
  },
  JSXText(p){
   const parent=p.parentPath.node.openingElement?.name?.name;if(['text','tspan','MathText'].includes(parent))return;
   const next=migrate(p.node.value,`${file}:${p.node.loc?.start.line}`);
   if(next!==p.node.value){changed.push({file,from:p.node.value,to:next});p.replaceWith(math(t.stringLiteral(next)));p.skip();}
  },
  JSXExpressionContainer:{exit(p){
   if(!containers.has(p.node)||p.parentPath.isJSXAttribute()||!isText(p.node.expression))return;
   const name=p.parentPath.node.openingElement?.name?.name;if(['MathText','text','tspan'].includes(name))return;
   p.replaceWith(math(p.node.expression));p.skip();
  }},
 });
 if(!process.argv.includes('--dry-run'))await writeFile(path,generate(tree,{comments:true},source).code+'\n');
}
await writeFile(new URL('../../tmp/notation-review/scenes.json',import.meta.url),JSON.stringify(changed,null,2));
console.log(JSON.stringify({strings:changed.length,preview:changed.slice(0,12)},null,2));
