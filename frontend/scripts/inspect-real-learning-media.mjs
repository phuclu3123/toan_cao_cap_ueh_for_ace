import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/media/',import.meta.url);await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try {
  const page=await browser.newPage({viewport:{width:1100,height:750}});
  if(!process.argv.includes('--community-only')) {
  await page.route('http://localhost:5174/__media-capture',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"><iframe title="Course preview" style="border:0;width:1100px;height:619px" allow="autoplay; encrypted-media" src="https://www.youtube.com/embed/ut-WxyDjtPQ?autoplay=1&mute=1&start=240&controls=0&rel=0"></iframe></body></html>'}));
  await page.goto('http://localhost:5174/__media-capture',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  const frame=page.frames().find(candidate=>candidate.url().includes('youtube.com/embed'));
  const state=frame?await frame.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,1500),videos:[...document.querySelectorAll('video')].map(video=>({time:video.currentTime,width:video.videoWidth,height:video.videoHeight,ready:video.readyState,paused:video.paused}))})): {error:'No embed frame.'};
  await page.screenshot({path:fileURLToPath(new URL('youtube-frame-candidate.png',output))});
  if(!state.videos?.some(video=>video.ready>=2&&video.width>0)) throw new Error('No genuine video frame available.');
  await frame.evaluate(()=>{const video=document.querySelector('video');video.pause();video.currentTime=240;});
  await frame.waitForFunction(()=>{const video=document.querySelector('video');return video.readyState>=2&&!video.seeking&&Math.abs(video.currentTime-240)<.1;});
  await page.locator('iframe').screenshot({path:fileURLToPath(new URL('lesson-video-frame.png',output))});
  await writeFile(new URL('youtube-state.json',output),JSON.stringify(state,null,2));console.log(JSON.stringify(state,null,2));
  }
  await page.context().addInitScript(()=>localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false})));
  await page.route('**/api/community/posts/*',route=>{
    const url=new URL(route.request().url());url.searchParams.set('recordView','false');return route.continue({url:url.href});
  });
  await page.setViewportSize({width:820,height:1100});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://localhost:5174/community/ueh-pnta-lagrange-cobb-douglas',{waitUntil:'domcontentloaded'});
  const question=page.locator('#question-section .se-detail-math-content');
  await question.waitFor();await question.locator('.katex').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  const header=page.locator('.se-detail-header-block');await header.scrollIntoViewIfNeeded();
  const clip=await page.evaluate(()=>{
    const header=document.querySelector('.se-detail-header-block').getBoundingClientRect(),question=document.querySelector('#question-section').getBoundingClientRect();
    const x=Math.min(header.left,question.left),y=header.top+scrollY;
    return {x,y,width:Math.max(header.right,question.right)-x,height:Math.min(590,question.bottom+scrollY-y)};
  });
  await page.screenshot({path:fileURLToPath(new URL('community-question.png',output)),clip});
  const source={url:'http://localhost:5174/community/ueh-pnta-lagrange-cobb-douglas',selector:'.se-detail-header-block + #question-section',title:await page.locator('.se-detail-question-title').innerText(),crop:clip};
  await writeFile(new URL('community-source.json',output),JSON.stringify(source,null,2));console.log(JSON.stringify(source,null,2));
} finally {await browser.close();}
