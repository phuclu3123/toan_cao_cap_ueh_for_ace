import { mockStudyContent } from './study-api.fixture.js';
import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { studyTopics } from '../src/data/studyCurriculum.js';
const output='../artifacts/study-workspace/source-revision';
test.beforeEach(async ({context})=>{
 await context.route('https://accounts.google.com/**',r=>r.fulfill({contentType:'application/javascript',body:''}));
 await context.route('**/api/**',r=>r.fulfill({json:{success:true,user:null,data:[],posts:[],notifications:[],members:[],stats:{trendingTags:[]},leaderboard:[]}}));
  await mockStudyContent(context);
});
async function consent(page){const button=page.getByRole('button',{name:'Chỉ dùng cần thiết',exact:true});if(await button.isVisible())await button.click();}
async function assertNoRawMath(locator){
 await expect(locator.locator('.math-render-error')).toHaveCount(0);
 const raw=await locator.evaluate(root=>{const copy=root.cloneNode(true);copy.querySelectorAll('.katex,[aria-hidden="true"]').forEach(n=>n.remove());return copy.textContent;});
 expect(raw).not.toMatch(/\$\$|\\(?:frac|begin|sum|color|sqrt|underbrace|det)\b/);
}
test('All reviewed lessons render; each attached illustration completes every manual frame',async({page})=>{
 test.setTimeout(360_000);await mkdir(output,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const results=[];
 for(const topic of studyTopics){
  for(const section of topic.lesson.sections){
   await page.goto(`/flashcards?topic=${topic.id}&mode=lesson&section=${section.id}`);
   await consent(page);
   const heading=page.locator('.study-article>h2');
   await expect(heading).toBeVisible();
   await assertNoRawMath(heading);
   expect((await heading.innerText()).trim()).not.toBe('');
   const workedNext=page.getByRole('button',{name:'Xem bước tiếp theo',exact:true});
   while(await workedNext.isEnabled())await workedNext.click();
   await assertNoRawMath(page.locator('.study-article'));
   const host=page.locator('.study-scene-host');
   if(!section.scene){await expect(host).toHaveCount(0);results.push({topic:topic.id,section:section.id,scene:null,frames:0});continue;}
   await expect(host).toHaveAttribute('data-scene-id',section.scene);
   const scene=host.locator('.math-explorer');await scene.scrollIntoViewIfNeeded();
   const manual=host.getByRole('button',{name:'Từng bước',exact:true});
   if(await manual.count())await manual.click();
   let frames=1;const next=host.getByRole('button',{name:/^Bước tiếp /});
   if(await next.count()){
    while(await next.isEnabled()&&frames<50){await next.click();frames++;await assertNoRawMath(host);}
   }
   await assertNoRawMath(page.locator('.study-article'));
   results.push({topic:topic.id,section:section.id,scene:section.scene,frames});
   if(['cramer','adjugate-identities','io-coefficient','io-open-sector','rank-minors','dimensions','product','io-table','marginal','implicit-elasticity','partial-elasticity','degenerate-extrema','budget-constraint','integrating-factor'].includes(section.scene))await scene.screenshot({path:`${output}/${section.scene}.png`});
  }
 }
 expect(errors).toEqual([]);await writeFile(`${output}/frames.json`,JSON.stringify(results,null,2));
});
test('Scenes fit phone, tablet and desktop; cards flip by surface and preserve review actions',async({page})=>{
 test.setTimeout(180_000);await mkdir(output,{recursive:true});
  for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});
  for(const [topic,section] of [['chuyen-de-1','matrix-shape'],['chuyen-de-1','matrix-product'],['chuyen-de-2','adjugate-identities'],['chuyen-de-3','section-3'],['chuyen-de-4','section-1'],['chuyen-de-4','io-demand'],['chuyen-de-5','section-2'],['chuyen-de-7','partial-elasticity'],['chuyen-de-9','budget-constraint']]){
   await page.goto(`/flashcards?topic=${topic}&mode=lesson&section=${section}`);await consent(page);
   const scene=page.locator('.study-scene-host');await scene.scrollIntoViewIfNeeded();
   await page.evaluate(()=>document.fonts.ready);
   await expect.poll(()=>page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})),{message:`No horizontal page overflow: ${width}, ${topic}, ${section}`}).toEqual({width,scroll:width});
   await scene.screenshot({path:`${output}/${topic}-${section}-${width}.png`});
  }
  await page.goto('/flashcards?topic=chuyen-de-3&mode=flashcard');await consent(page);
  await page.getByRole('button',{name:'Lật thẻ xem lời giải',exact:true}).click();
  await expect(page.getByRole('button',{name:/Đã hiểu và nhớ/})).toBeVisible();
  await assertNoRawMath(page.locator('.study-card-back'));
  await page.screenshot({path:`${output}/cards-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:/Đã hiểu và nhớ/}).click();
  await page.getByRole('button',{name:'Hoàn tác đánh giá',exact:true}).click();
  await expect(page.getByRole('button',{name:'Lật thẻ về câu hỏi',exact:true})).toHaveAttribute('aria-pressed','true');
 }
});
test('Chapter 10 opens all differential-equation sections and their mapped scenes',async({page})=>{
 const topic=studyTopics.find(item=>item.id==='chuyen-de-10');
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 expect(topic.lesson.sections).toHaveLength(9);
 for(const section of topic.lesson.sections){
  await page.goto(`/flashcards?topic=${topic.id}&mode=lesson&section=${section.id}`);await consent(page);
  await expect(page.locator('.study-article>h2')).toBeVisible();
  await assertNoRawMath(page.locator('.study-article'));
  const scene=page.locator('.study-scene-host');
  await expect(scene).toHaveAttribute('data-scene-id',section.scene);
  await expect(scene.locator('.math-explorer')).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('Calculation operands travel from the highlighted cells and future outputs stay empty',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/flashcards?topic=chuyen-de-1&mode=lesson&section=matrix-product');await consent(page);
 const scene=page.locator('.study-scene-host');await scene.scrollIntoViewIfNeeded();
 await scene.getByRole('button',{name:'Tự động',exact:true}).click();
 await expect(page.locator('.math-operand-flight')).toHaveCount(2);
 expect(await page.locator('.math-operand-flight').first().evaluate(e=>e.getAnimations().length)).toBe(1);
 await expect(scene.locator('.movie-paired-operand')).toHaveCount(2);
 await expect(scene.locator('.movie-unfilled')).toHaveCount(4);
 await scene.getByRole('button',{name:'Từng bước',exact:true}).click();
 const next=scene.getByRole('button',{name:'Bước tiếp phép toán ma trận',exact:true});
 while(await next.isEnabled())await next.click();
 await expect(scene.locator('.movie-unfilled')).toHaveCount(0);
 await expect(scene.locator('.movie-cell-result')).toHaveText('27');
});
test('Reduced motion starts with manual controls and no automatic frame changes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/flashcards?topic=chuyen-de-1&mode=lesson&section=matrix-shape');await consent(page);
 const scene=page.locator('.study-scene-host');await scene.scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
 await expect(scene.getByRole('button',{name:'Từng bước',exact:true})).toHaveAttribute('aria-pressed','true');
 const counter=scene.locator('.math-playback-transport>span');const initial=await counter.textContent();
 await page.waitForTimeout(2200);
 await expect(counter).toHaveText(initial);
});
test('Parameter exceptions, all row operations and every quiz answer remain usable',async({page})=>{
 test.setTimeout(180_000);
 await page.goto('/flashcards?topic=chuyen-de-3&mode=lesson&section=exam-methods');await consent(page);
 for(const m of ['1','6','3']){
  await page.locator('.course-inline-control select').selectOption(m);
  await page.getByRole('button',{name:'Từng bước',exact:true}).click();
  const next=page.getByRole('button',{name:'Bước tiếp hệ có tham số',exact:true});while(await next.isEnabled())await next.click();
  await expect(page.locator('.math-explorer-conclusion')).toContainText(m==='1'?'hai hạng cùng bằng 2':m==='6'?'vô nghiệm':'ba pivot khác 0');
 }
 await page.goto('/flashcards?topic=chuyen-de-1&mode=lesson&section=row-operations');
 for(const label of ['Đổi chỗ','Cộng bội dòng','Nhân một dòng','Tổ hợp hai dòng']){
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.getByRole('button',{name:'Từng bước',exact:true}).click();
  await page.getByRole('button',{name:'Bước tiếp phép biến đổi sơ cấp',exact:true}).click();
  await expect(page.locator('.matrix-flow-stage')).toHaveClass(/flow-single/);
  await assertNoRawMath(page.locator('.math-explorer'));
 }
 for(const topic of studyTopics){
  await page.goto(`/flashcards?topic=${topic.id}&mode=quiz`);
  for(let i=0;i<topic.quiz.length;i++){
   await page.getByRole('radio').nth(topic.quiz[i].correctIndex).check();
   await page.getByRole('button',{name:'Kiểm tra đáp án',exact:true}).click();
   await assertNoRawMath(page.locator('.study-quiz'));
   await page.getByRole('button',{name:i===topic.quiz.length-1?'Xem kết quả':'Câu tiếp theo',exact:true}).click();
  }
  await expect(page.locator('.study-quiz-results>h2')).toHaveText('3 / 3');
 }
});
