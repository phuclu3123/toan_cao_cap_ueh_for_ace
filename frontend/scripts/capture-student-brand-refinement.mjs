// Visual review only: capture current local pages without changing user data.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = new URL('../../artifacts/color-refinement/student-brand/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.addInitScript(() => {
  localStorage.setItem('ueh_tcc_theme', 'light');
  localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false }));
});
const page = await context.newPage();
const report = { pages: [], errors: [] };
page.on('pageerror', e => report.errors.push(e.message));
const capture = async (name) => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)) });
const ready = async (route, selector) => {
  await page.goto(`http://localhost:5174${route}`);
  await page.locator(selector).first().waitFor();
  await page.evaluate(() => document.fonts.ready);
};
try {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await ready('/', '.hp-student-story');
    await capture(`home-header-${width}`);
    await page.locator('.hp-student-story').scrollIntoViewIfNeeded();
    await page.locator('.hp-student-story img').evaluate(img => img.decode());
    await capture(`huyen-${width}`);
    await page.locator('.hp-student-story').screenshot({path:fileURLToPath(new URL(`huyen-section-${width}.png`,output))});
    report.pages.push(await page.evaluate(() => ({ route: '/', width: innerWidth, title: document.title, logo: document.querySelector('.navbar-logo').textContent.trim(), storyAfterArticles: !!document.querySelector('.home-article-deck + .hp-student-story'), overflow: document.documentElement.scrollWidth > innerWidth + 1, photo: document.querySelector('.hp-student-story img').naturalWidth })));
    await page.locator('#footer').scrollIntoViewIfNeeded();
    await capture(`footer-${width}`);
    await ready('/resources', '.library-research-overview');
    await page.locator('.library-research-overview').evaluate(img => img.decode());
    await capture(`library-${width}`);
    report.pages.push(await page.evaluate(() => ({ route: '/resources', width: innerWidth, originalLinkCount: document.querySelectorAll('.library-research-sheets a,a.library-research-sheets').length, detailCount: document.querySelectorAll('.library-research-detail').length, overflow: document.documentElement.scrollWidth > innerWidth + 1 })));
    await ready('/courses', '.courses-notes-preview');
    await page.locator('.courses-notes-preview').scrollIntoViewIfNeeded();
    await capture(`notes-${width}`);
    report.pages.push(await page.evaluate(() => ({ route: '/courses', width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 })));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready('/courses', '.courses-notes-preview');
  await page.locator('.courses-preview-choices button').last().click();
  await page.locator('.courses-preview-frame').click();
  await page.locator('.course-notes-dialog[open] img').evaluate(img => img.decode());
  await capture('notes-full-page');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await ready('/community', '.se-question-item');
  await page.waitForTimeout(1200);
  await capture('community-1920');
} finally {
  await writeFile(new URL('observations.json', output), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report));
