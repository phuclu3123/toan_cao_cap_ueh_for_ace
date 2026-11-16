import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { studyTopics } from '../src/data/studyCurriculum.js';
import { solveLeontief } from '../src/utils/mathExplorers.js';
import { adjugate, determinant, multiplyMatrices } from '../src/utils/matrixMath.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Every section cites sources and retrieval tasks; every illustration has an explicit mapping',()=>{
 const registry=readFileSync(new URL('../src/components/study/MathExplorers.jsx',import.meta.url),'utf8');
 const ids=new Set();
 for(const topic of studyTopics){
  const sections=new Set(topic.lesson.sections.map(s=>s.id));
  for(const section of topic.lesson.sections){
   assert.ok(section.references.length>0);
   if(section.scene) assert.ok(registry.includes(`${section.scene}:`)||registry.includes(`'${section.scene}':`),section.scene);
   const cards=topic.flashcards.filter(c=>c.sectionId===section.id);
   assert.equal(cards.length,3 + Math.max(0,(section.recalls?.length || 1)-1));
   assert.equal(new Set(cards.map(c=>c.front)).size,cards.length);
  }
  for(const card of topic.flashcards){assert.ok(sections.has(card.sectionId));assert.ok(!ids.has(card.id));ids.add(card.id);}
  for(const question of topic.quiz){assert.ok(sections.has(question.sectionId));assert.equal(new Set(question.options).size,4);assert.ok(question.correctIndex>=0&&question.correctIndex<4);assert.ok(question.explanation.length>30);}
 }
});
test('Core source topics retain their own illustrations, with no dimension notation in homogeneous systems',()=>{
 const required={2:['section-2','adjugate-identities','gauss-jordan','matrix-equations','rank-minors','section-3','rank-parameter'],3:['section-1','gauss-system','homogeneous','section-3'],4:['section-1','io-table','io-flows','section-2','section-3','io-technology'],6:['section-1','section-3','implicit-elasticity'],7:['section-1','section-2','partial-elasticity'],9:['section-2','budget-constraint']};
 for(const [chapter,ids] of Object.entries(required)) for(const id of ids) assert.ok(studyTopics[+chapter-1].lesson.sections.find(s=>s.id===id)?.scene,`${chapter}/${id}`);
 assert.doesNotMatch(JSON.stringify(studyTopics[2]),/\\dim|\\ker|affine/);
});
test('Matrix-equation examples preserve left and right multiplication order',()=>{
 const a=[[2,1],[1,1]],b=[[1,2],[3,4]],c=[[2,0],[1,3]];
 const inverse=[[1,-1],[-1,2]],x=[[-2,-2],[5,6]],y=[[2,-2],[-2,5]];
 assert.deepEqual(multiplyMatrices(a,inverse),[[1,0],[0,1]]);
 assert.deepEqual(multiplyMatrices(inverse,a),[[1,0],[0,1]]);
 assert.deepEqual(multiplyMatrices(a,x),b);
 assert.deepEqual(multiplyMatrices(y,a),c);
 const section=studyTopics[1].lesson.sections.find(s=>s.id==='matrix-equations');
 assert.match(section.workedExample.question,/AX=B.*YA=C/s);
 assert.equal(section.scene,'matrix-equations');
});
test('Cramer 3×3 replacement determinants produce a solution of all three source equations',()=>{
 const a=[[1,2,2],[2,3,3],[1,3,-1]],b=[-1,0,1],d=determinant(a);
 assert.equal(d,4);
 const ds=[0,1,2].map(j=>determinant(a.map((row,i)=>row.map((v,k)=>k===j?b[i]:v))));
 assert.deepEqual(ds,[12,-4,-4]);
 const x=ds.map(v=>[v/d]);assert.deepEqual(x,[[3],[-1],[-1]]);
 assert.deepEqual(multiplyMatrices(a,x),b.map(v=>[v]));
 assert.equal(determinant([[1,2,2],[2,3,1],[1,1,-1]]),0);
 for(const t of [-3,0,2])assert.deepEqual(multiplyMatrices([[1,2,2],[2,3,1],[1,1,-1]],[[4*t],[-3*t],[t]]),[[0],[0],[0]]);
});
test('Two distinct solutions differ by a homogeneous solution, matching the source multiple-choice item',()=>{
 const a=[[1,1,1],[2,2,2],[3,3,3]],x1=[[1],[0],[0]],x2=[[0],[1],[0]];
 const b=multiplyMatrices(a,x1),difference=x1.map((row,i)=>[row[0]-x2[i][0]]);
 assert.deepEqual(multiplyMatrices(a,x2),b);
 assert.deepEqual(multiplyMatrices(a,difference),[[0],[0],[0]]);
 const affineCombination=x1.map((row,i)=>[2*row[0]-x2[i][0]]);
 assert.deepEqual(multiplyMatrices(a,affineCombination),b);
 const section=studyTopics[2].lesson.sections.find(s=>s.id==='exam-logic');
 assert.match(section.workedExample.question,/hai nghiệm phân biệt/);
 assert.match(section.content,/A\(X_1-X_2\)=0/);
 assert.ok(section.references.some(ref=>ref.includes('trang 24')));
});
test('Adjugate formulas (7) and (8) hold for invertible and singular matrices',()=>{
 for(const a of [[[1,0,6],[2,1,5],[3,4,1]],[[1,2,3],[2,4,6],[0,1,2]],[[0,0,0],[0,0,0],[0,0,0]],[[2,0,0,0],[0,3,0,0],[0,0,-1,0],[0,0,0,4]]]){
  const p=adjugate(a),d=determinant(a),expected=a.map((r,i)=>r.map((_,j)=>i===j?d:0));
  close(determinant(p),d**(a.length-1));
  for(const product of [multiplyMatrices(a,p),multiplyMatrices(p,a)])product.forEach((row,i)=>row.forEach((v,j)=>close(v,expected[i][j])));
 }
});
test('Outside-sector input shares are column complements and differ from final demand',()=>{
 const a=[[.1,.2,.2],[.3,.2,.1],[.2,.3,.3]],x=[210,180,200];
 const outside=x.map((v,j)=>v*(1-a.reduce((sum,row)=>sum+row[j],0)));
 outside.forEach((v,i)=>close(v,[84,54,80][i]));
 close(outside.reduce((s,v)=>s+v,0),218);
 assert.notEqual(outside[1],61);
});
test('Three-sector K51 production balances and technical change match exact source values',()=>{
 const a=[[.1,.2,.2],[.3,.2,.1],[.2,.3,.3]],d=[113,61,44];
 const original=solveLeontief(a,d);original.output.forEach((v,i)=>close(v,[210,180,200][i]));
 assert.equal(original.transactions[1][0],63);
 const changed=a.map(r=>[...r]);changed[1][0]=.2;
 const result=solveLeontief(changed,d);
 result.output.forEach((v,i)=>{close(v,[80010/401,59790/401,73690/401][i]);close(v,result.transactions[i].reduce((s,x)=>s+x,0)+d[i]);});
 assert.deepEqual(a[1],[.3,.2,.1]);
 const shock=solveLeontief(a,[10,-5,5]);
 const after=solveLeontief(a,[123,56,49]);
 after.output.forEach((v,i)=>close(v-original.output[i],shock.output[i]));
});
test('Rectangular multiplication and the lecture adjugate are independently verified',()=>{
 const a=[[1,2,3],[4,5,6]],b=[[2,0],[1,3],[-1,2]];
 assert.deepEqual(multiplyMatrices(a,b),[[1,12],[7,27]]);
 assert.deepEqual(multiplyMatrices(b,a),[[2,4,6],[13,17,21],[7,8,9]]);
 const c=[[1,0,6],[2,1,5],[3,4,1]];
 assert.equal(determinant(c),11);
 assert.deepEqual(adjugate(c),[[-19,24,-6],[13,-17,7],[5,-4,1]]);
 assert.deepEqual(multiplyMatrices(c,adjugate(c)),[[11,0,0],[0,11,0],[0,0,11]]);
});
test('The lecture parameter classification has both exceptional cases and valid general solutions',()=>{
 for(const m of [-7,0,2,3,7,20]){
  const a=[[1,3,2],[2,4,m],[1,m,-1]];
  close(determinant(a),-(m-1)*(m-6));
  const x=[-(m+14)/(m-6),4/(m-6),4/(m-6)];
  multiplyMatrices(a,x.map(v=>[v])).forEach((row,i)=>close(row[0],[-1,2,3][i]));
 }
 for(const t of [-2,0,.5,4]){
  const a=[[1,3,2],[2,4,1],[1,1,-1]],x=[5+2.5*t,-2-1.5*t,t];
  multiplyMatrices(a,x.map(v=>[v])).forEach((row,i)=>close(row[0],[-1,2,3][i]));
 }
 // At m=6, the row reduction reaches 0=20, so no candidate can satisfy it.
 assert.equal((6-1)*(6-6),0);assert.equal(4*(6-1),20);
});
test('K51 existence example is unique off m=1 and consistent with infinitely many solutions at m=1',()=>{
 for(const m of [-3,0,2,8]) close(determinant([[m,1,2],[1,2,3],[2,3,5]]),m-1);
 for(const t of [-4,0,1.5,7]){
  const x=[-t,1-t,t];
  multiplyMatrices([[1,1,2],[1,2,3],[2,3,5]],x.map(v=>[v])).forEach((row,i)=>close(row[0],[1,2,3][i]));
 }
});
test('Bordered Hessian identity works even when one constraint derivative is zero',()=>{
 for(const [gx,gy,a,b,c] of [[1,1,0,1,0],[0,2,3,4,5],[2,0,-3,2,1],[-2,3,1,-4,2]]){
  const hb=[[0,gx,gy],[gx,a,b],[gy,b,c]];
  const tangentCurvature=a*gy*gy-2*b*gx*gy+c*gx*gx;
  close(determinant(hb),-tangentCurvature);
 }
});
