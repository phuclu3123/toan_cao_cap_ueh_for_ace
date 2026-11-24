// Capture the requested directional entrances with motion enabled.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/student-brand/motion/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
await page.addInitScript(()=>{localStorage.setItem('ueh_tcc_theme','light');localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false}));});
const report=[];
try {
 await page.goto('http://localhost:5174/');await page.locator('.campus-home').waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.locator('.brand-loader').waitFor({state:'hidden'});
 for(const [name,selector] of [['thao','.hp-voice-inner'],['huyen','.hp-student-story-inner']]){
  const node=page.locator(selector);
  const before=await node.evaluate(el=>({transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity}));
  await node.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.68,behavior:'instant'}));
  await page.waitForTimeout(190);
  const during=await node.evaluate(el=>({transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity,direction:el.dataset.revealDirection}));
  await page.screenshot({path:fileURLToPath(new URL(`${name}-entering.png`,output))});
  await page.waitForTimeout(1100);
  const after=await node.evaluate(el=>({transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity}));
  await node.screenshot({path:fileURLToPath(new URL(`${name}-settled.png`,output))});
  report.push({name,before,during,after});
 }
 report.push(await page.locator('.nav-link-item.active').first().evaluate(el=>({activeBackground:getComputedStyle(el).backgroundColor,activeColor:getComputedStyle(el).color})));
 await writeFile(new URL('observations.json',output),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
} finally {await browser.close();}
