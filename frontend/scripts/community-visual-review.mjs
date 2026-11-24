import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const target = process.argv[2] || 'http://localhost:5173/community';
const out = new URL(process.argv[3] || '../../artifacts/community/live/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce', locale: 'vi-VN' });
await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
await context.route('https://accounts.google.com/**', route => route.abort());
const page = await context.newPage();
const report = [];
try {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(target);
    await page.locator('.se-question-item').first().waitFor({ timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: fileURLToPath(new URL(`${width}.png`, out)), fullPage: true });
    await page.screenshot({ path: fileURLToPath(new URL(`${width}-fold.png`, out)), fullPage: false });
    report.push(await page.evaluate(() => ({
      width: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth,
      heading: document.querySelector('h1')?.textContent,
      rows: document.querySelectorAll('.se-question-item').length
    })));
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; document.documentElement.classList.remove('light-theme'); });
    await page.screenshot({ path: fileURLToPath(new URL(`${width}-dark.png`, out)), fullPage: true });
    await page.screenshot({ path: fileURLToPath(new URL(`${width}-dark-fold.png`, out)), fullPage: false });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; document.documentElement.classList.add('light-theme'); });
  }
  await writeFile(new URL('report.json', out), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
