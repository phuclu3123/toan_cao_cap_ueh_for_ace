// Capture genuine frames from the existing public sample lessons, not generated teaching content.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = new URL('../../artifacts/color-refinement/course-frames/', import.meta.url);
await mkdir(output, {recursive:true});
const clips = [
  {id:'DTcEh5Vl8-M',name:'lesson-partial-derivatives',seconds:900},
  {id:'K7EF4KAL2Wg',name:'lesson-lagrange',seconds:1800},
  {id:'3y3kTI6gazQ',name:'lesson-differential-equations',seconds:1200}
];
const browser = await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const context = await browser.newContext({viewport:{width:1280,height:720}});
const results = [];
try {
  for (const clip of clips) {
    const page = await context.newPage();
    try {
      await page.route('http://localhost:5174/__course-frame',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><body style="margin:0;overflow:hidden"><iframe title="Public lesson" style="border:0;width:1280px;height:720px" allow="autoplay; encrypted-media" src="https://www.youtube.com/embed/${clip.id}?autoplay=1&mute=1&start=${clip.seconds}&controls=0&rel=0"></iframe></body></html>`}));
      await page.goto('http://localhost:5174/__course-frame',{waitUntil:'domcontentloaded'});
      const frame = page.frameLocator('iframe');
      await frame.locator('video').waitFor({timeout:45000});
      const embed = page.frames().find(candidate=>candidate.url().includes('youtube.com/embed'));
      await embed.evaluate(async()=>{const video=document.querySelector('video');video.muted=true;await video.play().catch(()=>{});});
      await embed.waitForFunction(()=>{const video=document.querySelector('video');return video?.readyState>=2&&video.videoWidth>0&&video.duration>3600;},null,{timeout:45000});
      await embed.evaluate(seconds=>{const video=document.querySelector('video');video.pause();video.currentTime=seconds;},clip.seconds);
      await embed.waitForFunction(seconds=>{const video=document.querySelector('video');return video.readyState>=2&&!video.seeking&&Math.abs(video.currentTime-seconds)<.15;},clip.seconds,{timeout:20000});
      await embed.addStyleTag({content:'body *{visibility:hidden!important}video{visibility:visible!important}'});
      await frame.locator('video').screenshot({path:fileURLToPath(new URL(`${clip.name}.png`,output))});
      const state = await embed.evaluate(()=>{const video=document.querySelector('video');return {time:video.currentTime,duration:video.duration,width:video.videoWidth,height:video.videoHeight};});
      results.push({...clip,...state,source:`https://www.youtube.com/watch?v=${clip.id}`});
      console.log(JSON.stringify(results.at(-1)));
    } catch (error) {
      const embed = page.frames().find(candidate=>candidate.url().includes('youtube.com/embed'));
      const state = embed ? await embed.evaluate(()=>({text:document.body.innerText.slice(0,600),videos:[...document.querySelectorAll('video')].map(video=>({time:video.currentTime,duration:video.duration,ready:video.readyState,paused:video.paused,error:video.error?.message}))})) : {};
      console.log(JSON.stringify({name:clip.name,error:error.message,state}));
      await page.screenshot({path:fileURLToPath(new URL(`${clip.name}-unavailable.png`,output))});
      throw error;
    } finally { await page.close(); }
  }
} finally {
  await writeFile(new URL('sources.json',output),JSON.stringify(results,null,2));
  await browser.close();
}
