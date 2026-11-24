import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../artifacts/color-refinement/references/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = [];
for (const [name, url] of [
  ['noctorium', 'https://noctorium.vn/'],
  ['spacedesk', 'https://www.spacedesk.net/'],
  ['fullstackdatascience', 'https://fullstackdatascience.com/'],
  ['linear', 'https://linear.app/'],
  ['notion', 'https://www.notion.com/']
]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)) });
    const colors = await page.evaluate(() => {
      const palette = new Map();
      for (const element of document.querySelectorAll('body *')) {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.top > innerHeight || rect.bottom < 0) continue;
        const style = getComputedStyle(element);
        for (const role of ['backgroundColor', 'color']) {
          const value = style[role];
          if (value === 'rgba(0, 0, 0, 0)') continue;
          const key = `${role}: ${value}`;
          palette.set(key, (palette.get(key) || 0) + 1);
        }
      }
      return [...palette].sort((a,b) => b[1]-a[1]).slice(0,18);
    });
    report.push({ name, url, colors });
  } catch (error) { report.push({ name, url, error: error.message }); }
  await page.close();
}
await writeFile(new URL('report.json', output), JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report,null,2));
