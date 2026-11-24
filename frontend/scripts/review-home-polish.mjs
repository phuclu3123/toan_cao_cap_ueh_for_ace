import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { practiceCatalog } from '../src/data/practiceCatalog.js';
const output=new URL('../../artifacts/color-refinement/polish/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false})));
await context.route(/\/api\/(?:contact|subscribe)(?:\?|$)/,route=>route.abort());
const page=await context.newPage(),report={checks:[],errors:[]};
page.on('pageerror',error=>report.errors.push(error.message));
const capture=async name=>page.screenshot({path:fileURLToPath(new URL(`${name}.png`,output))});
try {
  await page.goto('http://localhost:5174');await page.locator('.hp-catalog-counts dd').nth(2).filter({hasText:/\d/}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const values=await page.locator('.hp-catalog-counts dd span').allTextContents();
  assert.equal(Number(values[0]),practiceCatalog.reduce((sum,exam)=>sum+exam.questionsCount,0));
  assert.equal(Number(values[1]),practiceCatalog.length);
  assert.ok(Number(values[2])>0);
  assert.deepEqual(await page.locator('.hp-books img').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src'))),['/images/cover-k51.jpg','/images/cover-final-2807.jpg']);
  assert.equal(await page.locator('.hp-catalog-counts dd a').count(),3);
  assert.equal(await page.evaluate(()=>document.fonts.check('16px Lora','Tiếng Việt')),true);
  assert.equal(await page.locator('.hp-intro-ribbons path').count(),5);
  const chat=page.locator('.contact-launcher-trigger'),top=page.locator('.back-to-top-trigger');
  const chatGroup=page.locator('.contact-launcher-chat');
  const original=await chatGroup.boundingBox();
  assert.equal(await top.getAttribute('aria-hidden'),'true');
  await capture('hero-desktop');
  await page.evaluate(()=>scrollTo({top:800,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.contact-launcher-container').classList.contains('has-back-to-top'));
  await page.waitForFunction(expected=>Math.abs(document.querySelector('.contact-launcher-chat').getBoundingClientRect().x-expected)<1,original.x-66,{timeout:5000});
  const shifted=await chatGroup.boundingBox(),arrow=await top.boundingBox();
  assert.ok(Math.abs(shifted.x-(original.x-66))<1);
  assert.ok(Math.abs(arrow.x-original.x)<1);
  assert.ok(shifted.x+shifted.width<arrow.x);
  await chat.click();await page.locator('.contact-launcher-menu').waitFor();
  await page.keyboard.press('Escape');assert.equal(await page.locator('.contact-launcher-menu').count(),0);
  await top.click();await page.waitForFunction(()=>scrollY<1);
  await page.waitForFunction(()=>!document.querySelector('.contact-launcher-container').classList.contains('has-back-to-top'));
  await page.waitForFunction(expected=>Math.abs(document.querySelector('.contact-launcher-chat').getBoundingClientRect().x-expected)<1,original.x,{timeout:5000});
  assert.ok(Math.abs((await chatGroup.boundingBox()).x-original.x)<1);
  assert.equal(await page.locator('.article-deck-stage').getAttribute('data-arrival-state'),'armed');
  report.checks.push('Original book covers, actual catalog counts and three working resource links.','Scroll control replaces the original chat position; chat shifts left without overlap and returns at the top.','Contact menu and Escape work after moving; return-to-top re-arms the article deck.');
  const bridge=page.locator('.hp-section-break');
  await bridge.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  const room=await bridge.evaluate(node=>{const quote=node.firstElementChild.getBoundingClientRect(),box=node.getBoundingClientRect();return {above:quote.top-box.top,below:box.bottom-quote.bottom,text:node.innerText};});
  assert.ok(room.above>=80&&room.below>=80);assert.match(room.text,/Hiểu một lời giải/);
  const journalGap=await page.evaluate(()=>document.querySelector('.home-article-deck .hp-section-heading').getBoundingClientRect().top-document.querySelector('.hp-math-lab').getBoundingClientRect().bottom);
  assert.ok(journalGap>=144);
  await capture('bridge-desktop');
  report.checks.push('A readable editorial bridge has at least 80px breathing room on each side between pastel panels.');
  for(const [width,height] of [[1440,1000],[1024,650],[390,844],[390,560]]) {
    await page.setViewportSize({width,height});
    await page.locator('.footer-support').click();
    const dialog=page.locator('.support-dialog');await dialog.waitFor();
    const box=await dialog.boundingBox();
    assert.ok(Math.abs(box.x+box.width/2-width/2)<2,`Dialog not horizontally centered at ${width}x${height}`);
    assert.ok(Math.abs(box.y+box.height/2-height/2)<2,`Dialog not vertically centered at ${width}x${height}`);
    assert.ok(box.x>=10&&box.y>=10&&box.y+box.height<=height-10);
    assert.ok(await dialog.evaluate(node=>node.scrollWidth<=node.clientWidth+1));
    await capture(`support-centered-${width}-${height}`);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(),0);
  }
  report.checks.push('PayOS dialog is centered and bounded at desktop, tablet, mobile and short mobile heights; no payment created.');
  for(const width of [390,768,1440,2560]) {
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Page overflow at ${width}`);
    await capture(`hero-${width}`);
    for(const card of await page.locator('.hp-path-card').all()) {await card.scrollIntoViewIfNeeded();await page.waitForTimeout(550);}
    await page.locator('.hp-learning').screenshot({path:fileURLToPath(new URL(`learning-${width}.png`,output))});
    if(width>=1100) {
      const tops=await page.locator('.hp-path-card').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().top));
      assert.ok(Math.max(...tops)-Math.min(...tops)<1);
    }
  }
  await page.setViewportSize({width:390,height:844});await bridge.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await capture('bridge-mobile');
  await page.setViewportSize({width:1440,height:1000});await page.locator('.nav-controls .theme-toggle-btn').click();
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);await capture('hero-dark-mobile');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>scrollTo({top:1000,behavior:'instant'}));await page.waitForFunction(()=>document.querySelector('.contact-launcher-container').classList.contains('has-back-to-top'));
  const duration=await page.locator('.contact-launcher-chat').evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration));assert.ok(duration<=.001);
  await top.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>scrollY<1);
  report.checks.push('No overflow at four widths; mobile, dark mode and reduced-motion return-to-top checked.');
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.hp-path-action').first().click();await page.locator('.elearning-card').first().waitFor();
  await page.locator('.header-wrapper a[href="/blog"]').first().click();await page.locator('.headline-story-vertical').waitFor();
  await page.locator('.header-wrapper a[href="/"]').first().click();await page.locator('.hp-books img').first().waitFor();
  assert.equal(await page.locator('.hp-path-card').count(),3);
  assert.equal(await page.locator('.hp-books').evaluate(node=>getComputedStyle(node,'::before').content),'none');
  await capture('home-after-spa-navigation');
  report.checks.push('Home to courses to blog to home uses SPA navigation without restoring obsolete book decorations or nested learning boxes.');
  assert.deepEqual(report.errors,[]);report.status='passed';
} catch(error) {report.status='failed';report.failure=error.stack;process.exitCode=1;await capture('failure');}
finally {await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}
