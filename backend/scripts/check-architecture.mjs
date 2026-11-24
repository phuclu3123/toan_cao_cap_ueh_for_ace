// Static dependency lint only: no handlers, HTTP requests, DB connections or tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root=fileURLToPath(new URL('../',import.meta.url));
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):/\.[jt]s$/.test(e.name)?[path.join(dir,e.name)]:[]);
const relative=file=>path.relative(root,file).replaceAll('\\','/');
const feature=file=>relative(file).match(/^src\/modules\/([^/]+)\//)?.[1];
const errors=[];
const files=[...walk(path.join(root,'src')),...walk(path.join(root,'nest')),...walk(path.join(root,'scripts')),...walk(path.join(root,'tests')),path.join(root,'server.js')];
for(const file of files){
 const source=fs.readFileSync(file,'utf8'), ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 for(const issue of ast.parseDiagnostics)errors.push(`${relative(file)}: ${ts.flattenDiagnosticMessageText(issue.messageText,' ')}`);
 const visit=node=>{
  let specifier;
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier)specifier=node.moduleSpecifier.text;
  if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0]))specifier=node.arguments[0].text;
  if(ts.isNewExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='URL'&&node.arguments?.[0]&&ts.isStringLiteral(node.arguments[0]))specifier=node.arguments[0].text;
  if(specifier?.startsWith('.')){
   const target=path.resolve(path.dirname(file),specifier);
   const exists=fs.existsSync(target)||(target.endsWith('.js')&&fs.existsSync(target.slice(0,-3)+'.ts'));
   if(!exists)errors.push(`${relative(file)}: missing ${specifier}`);
   if(relative(target).match(/^(controllers|routes|services|models|middleware|utils|config)\//))errors.push(`${relative(file)}: runtime imports deprecated layer ${relative(target)}`);
   if(relative(file).startsWith('src/platform/')&&feature(target))errors.push(`${relative(file)}: platform depends on a feature module`);
   if(feature(file)&&feature(target)&&feature(file)!==feature(target)&&!relative(target).endsWith(`/${feature(target)}/index.js`)){
    errors.push(`${relative(file)}: cross-module access must use ${feature(target)}/index.js`);
   }
   if(relative(file).includes('/application/')&&relative(target).includes('/http/'))errors.push(`${relative(file)}: application depends on HTTP`);
  }
  ts.forEachChild(node,visit);
 };visit(ast);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Architecture lint passed: ${files.length} source/tooling files; no deprecated layer or cross-module internal imports.`);
