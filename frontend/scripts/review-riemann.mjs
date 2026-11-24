import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/riemann/',import.meta.url);await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await page.addInitScript(()=>{localStorage.setItem('ueh_tcc_theme','light');localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false}));});
const report={checks:[],errors:[]};page.on('pageerror',error=>report.errors.push(error.message));
try{
  await page.goto('http://localhost:5174');
  const sketch=page.locator('.knowledge-strip [data-sketch-kind="integral"]');await sketch.scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.fonts.ready);
  const levels=await sketch.locator('[data-riemann-level]').evaluateAll(groups=>groups.map(group=>({n:Number(group.dataset.riemannLevel),rects:[...group.querySelectorAll('rect')].map(rect=>({x:Number(rect.getAttribute('x')),y:Number(rect.getAttribute('y')),width:Number(rect.getAttribute('width')),height:Number(rect.getAttribute('height')),sample:Number(rect.dataset.sample)}))})));
  for(const {n,rects} of levels){
    assert.equal(rects.length,n);const width=200/n;
    for(let i=0;i<n;i++){
      assert.ok(Math.abs(rects[i].x-(52+i*width))<1e-8);
      assert.ok(Math.abs(rects[i].width-width)<1e-8);
      assert.ok(Math.abs(rects[i].height-70*(.5+.3*rects[i].sample**2))<1e-8);
      assert.ok(Math.abs(rects[i].y+rects[i].height-175)<1e-8);
    }
    report.checks.push(`${n} midpoint rectangles: contiguous partition, exact f(sample), common x-axis`);
  }
  await sketch.locator('xpath=..').screenshot({path:fileURLToPath(new URL('integral-card.png',output))});
  const states=[];
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(let i=0;i<8;i++){await page.waitForTimeout(850);states.push(await sketch.locator('.concept-riemann-count').textContent());}
  assert.ok(new Set(states).size===3);report.checks.push('Visible refinement cycles through n = 4, 8, 16');
  await page.emulateMedia({reducedMotion:'reduce'});
  const stable=await sketch.locator('.concept-riemann-count').textContent();await page.waitForTimeout(1000);assert.equal(await sketch.locator('.concept-riemann-count').textContent(),stable);report.checks.push('Reduced motion stops refinement');
  assert.equal(report.errors.length,0);
}finally{await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));}
