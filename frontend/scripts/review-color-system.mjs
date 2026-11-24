import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { lightPalette, darkPalette } from '../src/design/colorPalette.js';

const base = process.env.UI_REVIEW_URL || 'http://localhost:5174';
const output = new URL(process.env.COLOR_REVIEW_OUTPUT || '../../artifacts/color-refinement/', import.meta.url);
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1',JSON.stringify({version:1,necessary:true,preferences:false})));
await context.route(/https:\/\/(?:accounts\.google\.com|challenges\.cloudflare\.com)\//, route => route.abort());
const page = await context.newPage();
const report = {base,checks:[],pages:[],errors:[]};
page.on('pageerror', error => report.errors.push(error.message));
const screens = [
  ['home','/','.hp-hero','.hp-button-primary'],
  ['courses','/courses','.elearning-card','.btn-course-detail'],
  ['exams','/exams','.exam-ticket','.catalog-primary-link'],
  ['blog','/blog','.headline-story-vertical',null],
  ['resources','/resources?category=all','.doc-card','.highlight-exam-tab'],
  ['community','/community','.se-question-item','.qa-ask-question-btn'],
  ['pdf','/document/k51-2-dot','.pdf-sheet[data-rendered-page]','.document-download']
];
async function open(path,selector) {
  await page.goto(base+path);
  await page.locator(selector).first().waitFor({timeout:60000});
  await page.evaluate(() => document.fonts.ready);
}
async function theme(mode) {
  if (await page.locator('html').getAttribute('data-theme') !== mode) await page.locator('.nav-controls .theme-toggle-btn').click();
  await page.waitForTimeout(350);
}
const shot = name => page.screenshot({path:fileURLToPath(new URL(`${name}.png`,output))});
function rgb(hex) { return `rgb(${[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(', ')})`; }
try {
  for (const mode of ['light','dark']) {
    const palette = mode === 'light' ? lightPalette : darkPalette;
    await open('/','.hp-hero'); await theme(mode);
    for (const [name,path,selector,action] of screens) {
      await open(path,selector);
      const paint = await page.evaluate(({selector,action}) => {
        const color = node => node ? {ink:getComputedStyle(node).color,bg:getComputedStyle(node).backgroundColor} : null;
        return {body:color(document.body),nav:color(document.querySelector('.header-wrapper .navbar')),heading:color(document.querySelector('main h1,.main-content h1')),action:color(document.querySelector(action || '.header-wrapper .btn-login-nav')),login:color(document.querySelector('.header-wrapper .btn-login-nav')),surface:color(document.querySelector(selector)),footer:color(document.querySelector('#footer')),overflow:document.documentElement.scrollWidth-innerWidth};
      },{selector,action});
      report.pages.push({name,mode,width:1440,...paint});
      if (paint.overflow > 1) throw new Error(`${name}/${mode}: overflow ${paint.overflow}`);
      if (paint.login.bg !== rgb(palette.accent) || paint.login.ink !== rgb(palette['on-accent'])) report.checks.push({warning:`Login differs from semantic colors: ${name}/${mode}`,paint:paint.login});
      await shot(`${name}-${mode}-1440`);
      if (name === 'home') {
        await page.locator('.hp-learning').scrollIntoViewIfNeeded(); await shot(`learning-${mode}-1440`);
        await page.locator('.knowledge-strip').scrollIntoViewIfNeeded(); await shot(`knowledge-${mode}-1440`);
        await page.locator('.hp-consult').scrollIntoViewIfNeeded(); await shot(`consult-${mode}-1440`);
        await page.locator('#footer').scrollIntoViewIfNeeded(); await shot(`footer-${mode}-1440`);
        await page.locator('.hp-learning').screenshot({path:fileURLToPath(new URL(`material-${mode}.png`,output))});
        await page.screenshot({path:fileURLToPath(new URL(`home-full-${mode}.png`,output)),fullPage:true});
      }
      if (['home','courses','blog','community','pdf'].includes(name)) {
        await page.setViewportSize({width:390,height:844});
        await page.evaluate(()=>window.scrollTo(0,0));
        if (name === 'pdf') await page.waitForFunction(()=>document.querySelectorAll('.pdf-sheet[data-rendered-page]').length === 1);
        await shot(`${name}-${mode}-390`);
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
        report.pages.push({name,mode,width:390,overflow});
        if (overflow > 1) throw new Error(`${name}/${mode}/390: overflow ${overflow}`);
        await page.setViewportSize({width:1440,height:1000});
      }
    }
  }
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  report.status='captured';
} catch(error) { report.status='failed';report.failure=error.stack;process.exitCode=1;await shot('failure'); }
finally {await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}
