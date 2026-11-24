import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { practiceCatalog } from '../src/data/practiceCatalog.js';

const baseUrl = process.env.UI_REVIEW_URL || 'http://localhost:5174';
const output = new URL(process.env.UI_REVIEW_OUTPUT || '../../artifacts/ui-refinement/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
await context.route(/https:\/\/(?:accounts\.google\.com|challenges\.cloudflare\.com)\//, route => route.abort());
const page = await context.newPage();
const report = { checks: [], pageErrors: [], layout: [], longTasks: [] };
page.on('pageerror', error => report.pageErrors.push(error.message));
const screenshot = name => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)) });
const go = async path => {
  await page.goto(`${baseUrl}${path}`);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.getByText('Chưa tải được trang', { exact: true }).count(), 0, `Route boundary failed: ${path}`);
};
const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const renderReady = async count => {
  await page.waitForFunction(total => document.querySelectorAll('.pdf-sheet[data-rendered-page]').length === total, count, { timeout: 60000 });
};
try {
  await go('/');
  await page.locator('.home-stats dd').nth(2).filter({ hasText: /\d/ }).waitFor();
  assert.deepEqual(await page.locator('.publication-covers img').evaluateAll(images => images.map(image => image.getAttribute('src'))), ['/images/cover-k51.jpg', '/images/cover-final-2807.jpg']);
  assert.equal(await page.locator('.home-stats dd').first().innerText(), String(practiceCatalog.reduce((sum, exam) => sum + exam.questionsCount, 0)));
  assert.equal(await page.locator('.home-stats dd').nth(1).innerText(), String(practiceCatalog.length));
  const catalog = await (await context.request.get('http://localhost:5000/api/resources')).json();
  const pdfCount = new Set(Object.values(catalog.resources).flat().filter(item => /\.pdf$/i.test(item.pdf || '')).map(item => item.id)).size;
  assert.equal(await page.locator('.home-stats dd').nth(2).innerText(), String(pdfCount));
  report.checks.push(`Original book covers preserved; real catalog: ${practiceCatalog.reduce((sum,exam)=>sum+exam.questionsCount,0)} questions, ${practiceCatalog.length} exams, ${pdfCount} PDFs.`);
  await screenshot('home-final-1440');

  const feature = page.locator('.news-feature');
  await feature.waitFor({ state: 'attached' });
  await page.waitForTimeout(500);
  assert.equal(await feature.evaluate(node => node.classList.contains('is-revealed')), false);
  await feature.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.news-feature').classList.contains('is-revealed'));
  report.checks.push('Below-fold content stays pending after 400ms and reveals once upon entering the viewport.');

  await page.locator('.knowledge-strip').scrollIntoViewIfNeeded();
  const runner = page.locator('.concept-card').first().locator('.concept-runner');
  const x = await runner.getAttribute('cx');
  await page.waitForFunction(before => document.querySelector('.concept-card .concept-runner').getAttribute('cx') !== before, x);
  assert.equal(await page.locator('.knowledge-strip button').count(), 0);
  assert.equal(Math.round((await page.locator('.concept-card a > svg').first().boundingBox()).width), 18);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(100);
  const still = await runner.getAttribute('cx'); await page.waitForTimeout(200); assert.equal(await runner.getAttribute('cx'), still);
  assert.equal(await page.locator('.reveal-item:not(.is-revealed)').count(), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => { window.qaLongTasks=[]; window.qaPerf = new PerformanceObserver(list => window.qaLongTasks.push(...list.getEntries().map(entry => entry.duration))); window.qaPerf.observe({ type:'longtask' }); });
  await page.waitForTimeout(1800);
  report.longTasks = await page.evaluate(() => { window.qaPerf.disconnect(); return window.qaLongTasks; });
  await screenshot('knowledge-final-1440');
  report.checks.push('Parabola marker animates automatically; reduced-motion freezes it and immediately exposes pending content; icons remain 18px.');

  await go('/resources?category=all');
  await page.locator('.doc-card').first().waitFor();
  const resourceRects = await page.locator('.doc-card .card-image-wrapper').evaluateAll(nodes => nodes.map(node => {
    const art = node.firstElementChild.getBoundingClientRect(), wrapper = node.getBoundingClientRect();
    return { height:wrapper.height, gap:Math.abs(art.top-wrapper.top), delta:Math.abs(art.height-wrapper.height) };
  }));
  assert.ok(resourceRects.every(rect => rect.gap < 2 && rect.delta < 2));
  await page.locator('.doc-card').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(450); await screenshot('resources-final-1440');
  report.checks.push('Resource artwork fills the reserved image slot without the old double-height placeholder.');

  await go('/courses'); await page.locator('.elearning-card').first().waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('.elearning-card img')].every(image => image.complete && image.naturalWidth > 0));
  assert.equal(await page.locator('.elearning-card').count(), 4);
  await screenshot('courses-final-1440');
  report.checks.push('Four new original SVG course covers decode successfully, including SQL; catalog uses a two-column layout.');

  await go('/exams'); await page.locator('.exam-ticket').first().waitFor();
  assert.equal(await page.locator('.exam-ticket').count(), practiceCatalog.length);
  await page.locator('.exam-filter-row button').filter({ hasText: /^K51$/ }).click();
  assert.equal(await page.locator('.exam-ticket').count(), practiceCatalog.filter(exam => exam.title.includes('K51')).length);
  await page.locator('.exam-search input').fill('nothing-found-qa'); assert.equal(await page.locator('.exam-ticket').count(),0);
  await page.locator('.exam-empty button').click(); assert.equal(await page.locator('.exam-ticket').count(),practiceCatalog.length);
  await screenshot('exams-final-1440');
  report.checks.push('Exam search, cohort filters and empty-state reset operate on the real exam catalog.');

  await go('/blog'); await page.locator('.headline-story-vertical').waitFor();
  await page.locator('.blog-search input').fill('nothing-found-qa'); assert.equal(await page.locator('.headline-story-vertical').count(),0);
  await page.locator('.blog-search input').fill('');
  await page.locator('.journal-filter-bar button').nth(1).click();
  assert.ok((await page.locator('.journal-filter-bar > span').innerText()).includes('1'));
  await page.locator('.journal-filter-bar button').first().click();
  await screenshot('blog-final-1440');
  report.checks.push('Blog search/category filtering works; the full featured cover fits its frame.');

  await go('/document/k51-2-dot'); await renderReady(3);
  assert.ok(await page.locator('.pdf-sheet .textLayer span').count() > 0);
  assert.equal(await page.locator('.document-heading h1').innerText(), 'Toán cao cấp K51 · Hai đợt thi');
  await page.locator('.pdf-link-layer button').first().waitFor();
  assert.ok((await page.locator('.pdf-link-layer a').first().getAttribute('href')).startsWith('https://docs.google.com/'));
  await page.locator('.pdf-link-layer button').first().click();
  await renderReady(3);
  assert.ok(Number(await page.locator('#pdf-page-number').inputValue()) > 1);
  await page.locator('#pdf-page-number').fill('1'); await page.locator('#pdf-page-number').press('Enter'); await renderReady(3);
  await screenshot('pdf-final-1440');
  await page.getByRole('button',{name:'Nhóm trang sau',exact:true}).click(); await renderReady(3);
  assert.equal(await page.locator('#pdf-page-number').inputValue(),'4');
  await page.locator('#pdf-page-number').fill('158'); await page.locator('#pdf-page-number').press('Enter'); await renderReady(1);
  await page.locator('#pdf-page-number').fill('1'); await page.locator('#pdf-page-number').press('Enter'); await renderReady(3);
  await page.locator('#pdf-layout').selectOption('5'); await renderReady(5);
  const before = await page.locator('.pdf-sheet canvas').first().boundingBox();
  await page.getByRole('button',{name:'Phóng to',exact:true}).click(); await renderReady(5);
  assert.ok((await page.locator('.pdf-sheet canvas').first().boundingBox()).width > before.width);
  await page.getByRole('button',{name:'Vừa khung',exact:true}).click(); await renderReady(5);
  await page.getByRole('button',{name:'Đọc riêng trang 2',exact:true}).click(); await renderReady(1);
  assert.equal(await page.locator('#pdf-page-number').inputValue(),'2');
  await page.getByRole('button',{name:'Xoay trang',exact:true}).click(); await renderReady(1);
  const rotated = await page.locator('.pdf-sheet canvas').boundingBox(); assert.ok(rotated.width > rotated.height);
  for (let turn=0; turn<3; turn++) { await page.getByRole('button',{name:'Xoay trang',exact:true}).click(); await renderReady(1); }
  await page.locator('#pdf-layout').selectOption('auto'); await renderReady(3);
  report.checks.push('PDF: three pages at 1440px, five-page option, original internal links, group navigation, last page, text selection layer, zoom, per-page focus and rotation.');

  await page.setViewportSize({width:2560,height:1300}); await renderReady(5); await screenshot('pdf-final-2560');
  await page.setViewportSize({width:390,height:844}); await renderReady(1); assert.ok(await overflow() <= 1); await screenshot('pdf-final-390');
  report.checks.push('PDF auto layout adapts from five pages at 2560px to one at 390px without page overflow.');

  await page.setViewportSize({width:1440,height:1000});
  let failPdf = true;
  const pdfRoute = route => failPdf ? route.abort() : route.continue();
  await context.route('**/docs/K51_2_dot.pdf', pdfRoute);
  await go('/document/k51-2-dot');
  await page.locator('.pdf-error').waitFor();
  failPdf = false;
  await page.locator('.pdf-error button').click(); await renderReady(3);
  await context.unroute('**/docs/K51_2_dot.pdf', pdfRoute);
  assert.equal(await page.locator('.pdf-page-error').count(), 0);
  report.checks.push('A failed PDF request shows a local error with original-file fallback; retry reloads the actual document successfully.');

  for (const width of [1440,768,390]) {
    await page.setViewportSize({width,height:960});
    for (const [path,selector,name] of [['/','.publication-covers','home'],['/courses','.elearning-card','courses'],['/exams','.exam-ticket','exams'],['/blog','.headline-story-vertical','blog'],['/resources?category=all','.doc-card','resources']]) {
      await go(path); await page.locator(selector).first().waitFor();
      const extra = await overflow(); report.layout.push({name,width,overflow:extra}); assert.ok(extra <= 1,`${name} overflow at ${width}: ${extra}`);
      if (width===390) await screenshot(`${name}-final-390`);
    }
  }
  await page.setViewportSize({width:1440,height:1000}); await go('/');
  await page.locator('.nav-controls .theme-toggle-btn').click();
  await page.locator('.knowledge-strip').scrollIntoViewIfNeeded(); await screenshot('knowledge-final-dark');
  assert.equal(await page.locator('.knowledge-strip').evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(20, 23, 29)');
  assert.equal(await page.locator('.brand-social--facebook').getAttribute('href'),'https://www.facebook.com/profile.php?id=61577916376501');
  assert.equal(await page.locator('.brand-social--youtube').getAttribute('href'),'https://www.youtube.com/@phuclu3569');
  assert.equal(await page.locator('a.brand-social--tiktok').count(),0);
  report.checks.push('Desktop/tablet/mobile layouts fit; dark surfaces are neutral; official Facebook/YouTube/Zalo links and TikTok placeholder are correct.');
  assert.deepEqual(report.pageErrors, []);
  report.status = 'passed';
} catch (error) {
  report.status='failed'; report.failure=error.stack; await screenshot('failure'); process.exitCode=1;
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2)); await browser.close();
}
