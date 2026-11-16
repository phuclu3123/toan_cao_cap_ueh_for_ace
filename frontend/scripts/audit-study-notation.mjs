import { studyTopics } from '../src/data/studyCurriculum.js';
import { writeFile, mkdir } from 'node:fs/promises';
const out=[];
const pattern=/[₀-₉ₙₘₖₗₛₜₓᵧᵢⱼₚ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀᵅᵝᵏᵗᵞˣʸᐟⁱʲⁿᵃᵇ′″Δδαβλεπμγφ∇∈≠≤≥×·√∑ℝ]/u;
function visit(v,path){
 if(typeof v==='string'){
  const text=v.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g,m=>m.replace(/[^\n]/g,''));
  text.split('\n').forEach((line,i)=>{if(pattern.test(line))out.push({path,line:v.split('\n')[i]});});
 }else if(Array.isArray(v))v.forEach((x,i)=>visit(x,`${path}/${i}`));
 else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))if(!['references','flashcards','traps'].includes(k))visit(x,`${path}/${k}`);
}
studyTopics.forEach((t,i)=>visit({lesson:t.lesson,quiz:t.quiz},`${i+1}`));
await mkdir(new URL('../../tmp/notation-review',import.meta.url),{recursive:true});
await writeFile(new URL('../../tmp/notation-review/remaining.json',import.meta.url),JSON.stringify(out,null,2));
console.log(JSON.stringify({count:out.length,preview:out.slice(0,65)},null,2));
