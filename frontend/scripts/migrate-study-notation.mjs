import { parse } from '@babel/parser';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import katex from 'katex';
import { pathToFileURL } from 'node:url';

// Offline editorial migration. Runtime content remains explicit, authored LaTeX.
const files=['foundationAlgebra.js','foundationAlgebraComplements.js','foundationCalculus.js','foundationOptimization.js','studyTextbook.js','reviewedAlgebra.js','reviewedSystems.js','reviewedInputOutput.js','reviewedCalculus.js','studyQuestions.js'];
const indexMap={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₙ':'n','ₘ':'m','ₖ':'k','ₗ':'L','ₛ':'S','ₜ':'t','ₓ':'x','ᵧ':'y','ᵢ':'i','ⱼ':'j'};
const powerMap={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+','ᵀ':'T','ᵅ':'\\alpha ','ᵝ':'\\beta ','ᵏ':'k','ᵗ':'t','ᵞ':'\\gamma ','ˣ':'x','ʸ':'y','ᐟ':'/'};
const symbols={'Δ':'\\Delta ','δ':'\\delta ','α':'\\alpha ','β':'\\beta ','λ':'\\lambda ','ε':'\\varepsilon ','π':'\\pi ','μ':'\\mu ','γ':'\\gamma ','φ':'\\varphi ','∇':'\\nabla ','∈':'\\in ','≠':'\\ne ','≤':'\\le ','≥':'\\ge ','−':'-','×':'\\times ','·':'\\cdot ','√':'\\sqrt ','∑':'\\sum ','ℝ':'\\mathbb R','∞':'\\infty','⇒':'\\Rightarrow ','↔':'\\leftrightarrow ','→':'\\to ','←':'\\leftarrow '};
const mathWords=new Set(['det','ln','sin','cos','tan','cot','arcsin','arccos','arctan','arccot','log','exp','min','max','dim','ker','diag','tr','rank','AC','MC','MR','MP','AB','BA','AX','YA','PA','AP','IX','XY','KL','LK','HL','Hb','QQ','uv','xy','xz','yz','dy','dx','df','dt','dz','du','dv','dq','sf','nk','dK','dL','MPK','MPL','AE','IQ','KQ','LQ','xf','xg','xyy','xyx','xxy','xyxy']);
const isWord=w=>w.length===1 || mathWords.has(w);
for(const word of ['kt','ct','nt','HLt','Lt','MPK','MPL','fu','fv','ux','uy','vx','vy','Ce','xyy','xx','yy'])mathWords.add(word);
for(const word of ['AA','ka','pq','xF','yF','cx','af','bf','sQ','nL','AK','Ak','kN','LD','xe','dx','nA'])mathWords.add(word);
const token=/[A-Za-z]+|[0-9]+(?:[.,][0-9]+)?|[₀₁₂₃₄₅₆₇₈₉ₙₘₖₗₛₜₓᵧᵢⱼ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀᵅᵝᵏᵗᵞˣʸᐟ]+|[Δδαβλεπμγφ∇∈≠≤≥−×·√∑ℝ∞⇒↔→←′″]|[=+\-*/^_<>]|[()[\]{},;|]|\s+/uy;
function tex(s){
 return s.replace(/e([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)·([⁰¹²³⁴⁵⁶⁷⁸⁹ᵗ]+)(?![\p{L}])/gu,(_,a,b)=>`e^{${[...a].map(c=>powerMap[c]).join('')}.${[...b].map(c=>powerMap[c]).join('')}}`)
 .replace(/ˣ²/g,'^{x^2}')
 .replace(/[₀₁₂₃₄₅₆₇₈₉ₙₘₖₗₛₜₓᵧᵢⱼ]+/gu, v=>`_{${[...v].map(c=>indexMap[c]).join('')}}`)
 .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀᵅᵝᵏᵗᵞˣʸᐟ]+/gu,v=>`^{${[...v].map(c=>powerMap[c]).join('')}}`)
 .replace(/″/g,"''").replace(/′/g,"'")
 .replace(/[Δδαβλεπμγφ∇∈≠≤≥−×·√∑ℝ∞⇒↔→←]/gu,c=>symbols[c])
 .replace(/\b(det|ln|sin|cos|tan|cot|arcsin|arccos|arctan|log|exp|min|max|dim|ker)\b/g,'\\$1 ')
 .replace(/\bdiag\b/g,'\\operatorname{diag}')
 .replace(/\barccot\b/g,'\\operatorname{arccot} ')
 .replace(/\\sqrt\s*\(([^()]*)\)/g,'\\sqrt{$1}')
 .replace(/\\sqrt\s*([0-9]+(?:[.,][0-9]+)?)/g,'\\sqrt{$1}')
 .replace(/\^\(([^()]*)\)/g,'^{$1}')
 .replace(/\^([A-Za-z])(_\{[^}]+\})/g,'^{$1$2}')
 .replace(/(MP|Q)_\{k\}/g,'$1_{K}')
 .trim();
}
const changes=[],rejected=[];
function prose(s,loc){
 let output='',pos=0;
 while(pos<s.length){
  // Start on a complete mathematical word, a number, or a Unicode math symbol.
  if(!/[A-Za-z0-9Δδαβλεπμγφ∇√∑ℝ∞(]/u.test(s[pos]) || (pos>0&&/[\p{L}\p{N}]/u.test(s[pos-1]))){output+=s[pos++];continue;}
  let at=pos,last=pos,parts=[],depth=0;
  while(at<s.length){
   if(s.slice(at,at+2)==='**')break;
   token.lastIndex=at;const match=token.exec(s);if(!match)break;
   const t=match[0];
   if(/^[A-Za-z]+$/.test(t)&&!isWord(t))break;
   if(/^[A-Za-z]+$/.test(t)&&/[\p{L}]/u.test(s[at+t.length]||'')&&!/[A-Za-z₀₁₂₃₄₅₆₇₈₉ₙₘₖₗₛₜₓᵧᵢⱼ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀᵅᵝᵏᵗᵞˣʸᐟ′″]/u.test(s[at+t.length]))break;
   if(t==='('||t==='['||t==='{'){depth++;}
   if(t===')'||t===']'||t==='}'){if(depth===0)break;depth--;}
   parts.push(t);at+=t.length;if(!/^\s+$/.test(t))last=at;
  }
  let raw=s.slice(pos,last).replace(/[,;]$/,'').trimEnd();
  raw=raw.replace(/[=+*/^_<>-]+$/,'').trimEnd();
  // Plain counts, dates, letters, and prose punctuation remain ordinary text.
  const mathematical=/[₀₁₂₃₄₅₆₇₈₉ₙₘₖₗₛₜₓᵧᵢⱼ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀᵅᵝᵏᵗᵞˣʸᐟ′″Δδαβλεπμγφ∇∈≠≤≥−×·√∑ℝ∞=+*/^_<>]/u.test(raw);
  const candidate=tex(raw);
  if(raw.length>0&&mathematical&&depth===0){
   try{
    katex.renderToString(candidate,{throwOnError:true,strict:'error',trust:false});
    output+=`$${candidate}$`;pos+=raw.length;changes.push({loc,from:raw,to:candidate});continue;
   }catch(e){rejected.push({loc,raw,reason:e.rawMessage});}
  }
  output+=s[pos++];
 }
 return output;
}
export function migrate(s,loc='component'){
 return s.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|`[^`]*`)/g).map((part,i)=>i%2?part:prose(part,loc)).join('');
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
const apply=process.argv.includes('--apply');
for(const file of files){
 const path=new URL(`../src/data/${file}`,import.meta.url),source=await readFile(path,'utf8');
 const tree=parse(source,{sourceType:'module'}),edits=[];
 function walk(node,parent,key){
  if(!node||typeof node!=='object')return;
  const field=parent?.type==='ObjectProperty'&&parent.key?.name;
  if(['id','title','summary','scene','type','references','objectives'].includes(field))return;
  if(node.type==='StringLiteral'){
   if(parent?.type==='ImportDeclaration'||key==='key')return;
   const value=migrate(node.value,`${file}:${node.loc.start.line}`);
   if(value!==node.value)edits.push({start:node.start,end:node.end,text:JSON.stringify(value)});
   return;
  }
  if(node.type==='TemplateLiteral'){
   if(node.expressions.length)return;
   const raw=parent?.type==='TaggedTemplateExpression',value=raw?node.quasis[0].value.raw:node.quasis[0].value.cooked;
   const changed=migrate(value,`${file}:${node.loc.start.line}`);
   if(value!==changed)edits.push({start:node.start,end:node.end,text:raw?'`'+changed+'`':JSON.stringify(changed)});
   return;
  }
  for(const [k,v]of Object.entries(node))if(!['loc','start','end','extra'].includes(k)){if(Array.isArray(v))v.forEach(n=>walk(n,node,k));else if(v&&typeof v==='object')walk(v,node,k);}
 }
 walk(tree);
 if(apply&&edits.length){let updated=source;for(const e of edits.sort((a,b)=>b.start-a.start))updated=updated.slice(0,e.start)+e.text+updated.slice(e.end);await writeFile(path,updated);}
}
await mkdir(new URL('../../tmp/notation-review/',import.meta.url),{recursive:true});
await writeFile(new URL('../../tmp/notation-review/migration.json',import.meta.url),JSON.stringify({changes,rejected},null,2));
console.log(JSON.stringify({applied:apply,changes:changes.length,rejected:rejected.length,preview:changes.slice(0,35)},null,2));
}
