import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/light-spaces/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await context.addInitScript(()=>{localStorage.setItem('ueh_tcc_theme','light');localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false}));});
const page=await context.newPage(),report={checks:[],samples:[],errors:[]};
page.on('pageerror',error=>report.errors.push(error.message));
const check=(condition,name)=>{assert.ok(condition,name);report.checks.push(name);};
const shot=async name=>page.screenshot({path:fileURLToPath(new URL(`${name}.png`,output))});
const ready=async(path,selector)=>{await page.goto(`http://localhost:5174${path}`);await page.locator(selector).first().waitFor();await page.evaluate(()=>document.fonts.ready);};
try{
  for(const width of [1440,768,390]){
    await page.setViewportSize({width,height:1000});
    for(const [path,selector,name] of [['/resources','.resources-grid .doc-card','library'],['/courses','.course-sample-note','courses'],['/exams','.exam-teacher-note','midterm'],['/flashcards','.fc-lock-panel','flashcards']]){
      await ready(path,selector);
      if(name==='midterm')await page.locator('.exam-midterm-section').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await shot(`${name}-${width}`);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      check(!overflow,`${name} fits ${width}`);
      report.samples.push({name,width,overflow});
      if(name==='library'){
        check(await page.locator('.resources-banner-copy').evaluate(node=>getComputedStyle(node).backgroundImage.includes('paper-grain')),`Library uses pastel paper at ${width}`);
        check(await page.locator('.library-index-card').evaluate(node=>getComputedStyle(node).backgroundImage.includes('paper-grain')),`Library bookshelf retains sky material at ${width}`);
        await page.locator('.resources-tabs-wrapper button').nth(1).click();
        check(await page.locator('.resources-grid .doc-card').count()>0,`Library slide filter at ${width}`);
        await page.locator('.layout-toggle-buttons button').nth(1).click();
        await page.locator('.resources-list').waitFor();
        await page.locator('#resource-search').fill('zzzznotfound');
        await page.locator('.empty-results').waitFor();
      }
      if(name==='courses'){
        check(await page.locator('.elearning-card').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).backgroundImage.includes('paper-grain'))),`All course cards retain pastel material at ${width}`);
        check(await page.locator('.course-sample-note').count()===4,`Four actual unlocked lesson previews at ${width}`);
        await page.locator('.course-sample-section').scrollIntoViewIfNeeded();await shot(`course-samples-${width}`);
        check(await page.locator('.price-free-tag').count()===0,`Closed courses are not advertised as free at ${width}`);
      }
      if(name==='midterm'){
        check(await page.locator('.exam-teacher-note').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).backgroundImage.includes('paper-grain'))),`All midterm tiles retain pastel material at ${width}`);
        check(await page.locator('.exam-note-art:not(.is-pending)>img').count()===4,`Four actual midterm sources at ${width}`);
        check(await page.locator('.exam-note-art.is-pending').count()===1,`Mismatched midterm source marked pending at ${width}`);
        await page.locator('.exam-teacher-note[href="/document/ndt"]').click();
        await page.getByRole('heading',{name:'Đang bổ sung bản gốc'}).waitFor();
        check(await page.locator('.document-download,.document-file a').count()===0,`No wrong document download for ndt at ${width}`);
      }
      if(name==='flashcards'){
        await page.locator('.fc-demo-card').click();
        check(await page.locator('.fc-demo-card').getAttribute('aria-pressed')==='true',`Public demo card flips at ${width}`);
        check(await page.locator('.study-sheet').count()===0,`Protected study content remains gated at ${width}`);
      }
    }
  }
  await page.setViewportSize({width:1920,height:1080});
  await ready('/community','.se-question-item');
  for(const kind of ['ronaldo','rambo','faker','bunbo','banhxeo','jupiter','lexus']){
    const toy=page.locator(`.qa-geometry-toy[data-toy-kind="${kind}"]`).first();
    await toy.scrollIntoViewIfNeeded();
    if(!['bunbo','banhxeo'].includes(kind))await toy.locator('image').waitFor();
    await page.waitForTimeout(400);
    await toy.screenshot({path:fileURLToPath(new URL(`collectible-${kind}.png`,output))});
    await toy.focus();
    const before=await toy.evaluate(node=>node.style.getPropertyValue('--toy-x'));
    await page.keyboard.press('ArrowRight');
    check(await toy.evaluate(node=>node.style.getPropertyValue('--toy-x'))!==before,`${kind} keyboard movement`);
    await page.keyboard.press('Home');
  }
  await shot('universe-lower');
  check(report.errors.length===0,'No browser exceptions');
}finally{await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));}
