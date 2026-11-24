import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../artifacts/color-refinement/page-rhythm/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await context.addInitScript(() => { localStorage.setItem('ueh_tcc_theme', 'light'); localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })); });
const page = await context.newPage();
const report = { pages: [], errors: [] };
page.on('pageerror', error => report.errors.push(error.message));
await context.route(/\/api\/(?:contact|subscribe)(?:\?|$)/, route => route.abort());
try {
  const routes = process.argv.includes('--catalog') ? [['/resources', '.resources-grid .doc-card', 'library'], ['/exams', '.exam-catalog-hero', 'exams'], ['/flashcards', '.fc-lock-panel', 'flashcard'], ['/blog', '.headline-story-vertical', 'blog']] : [['/', '.hp-voice', 'voice'], ['/courses', '.courses-hero', 'courses'], ['/community', '.qa-feed-header-section', 'community']];
  for (const [route, selector, name] of routes) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`http://localhost:5174${route}`);
      await page.locator(selector).first().waitFor();
      if (name === 'community') await page.locator('.se-question-item').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (name === 'voice') await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(650);
      await page.screenshot({ path: fileURLToPath(new URL(`${name}-${width}.png`, output)) });
      const details = await page.locator(selector).first().evaluate((node, name) => {
        const style = getComputedStyle(node);
        if (name === 'voice') {
          const image = node.querySelector('img');
          return { name: node.querySelector('figcaption').innerText, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, image: { loaded: image.complete, naturalWidth: image.naturalWidth, displayedWidth: image.clientWidth } };
        }
        if (name === 'community') return { activeNavigation: getComputedStyle(document.querySelector('.nav-link-item.active')).backgroundColor, headerMaterial: getComputedStyle(node.querySelector('.qa-explore-row')).backgroundImage.includes('paper-grain'), questionRadius: getComputedStyle(document.querySelector('.se-question-item')).borderRadius };
        if (name === 'courses') return { realLessonLoaded: node.querySelector('img').naturalWidth > 0 };
        return {};
      }, name);
      report.pages.push({ route, width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), ...details });
      if (name === 'courses') {
        await page.locator('#enroll').scrollIntoViewIfNeeded();
        await page.screenshot({ path: fileURLToPath(new URL(`course-consultation-${width}.png`, output)) });
      }
    }
  }
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify(report));
}
