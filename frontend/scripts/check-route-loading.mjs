import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const out = new URL('../../artifacts/community/loading-fix/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
try {
  for (const port of [5173, 5174]) {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 960 } });
    await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
    await context.route('https://accounts.google.com/**', route => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (let visit = 0; visit < 2; visit += 1) {
      await page.goto(`http://localhost:${port}/community`);
      await page.locator('.se-question-item').first().waitFor({ timeout: 30000 });
      assert.equal(await page.locator('.route-load-error').count(), 0);
    }
    assert.deepEqual(errors, []);
    await page.screenshot({ path: fileURLToPath(new URL(`${port}.png`, out)) });
    results.push({ port, visits: 2, rows: await page.locator('.se-question-item').count(), runtimeErrors: errors });
    await context.close();
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const brokenModule = '**/src/components/community/CommunitySidebar.jsx*';
  await page.route(brokenModule, route => route.fulfill({ contentType: 'application/javascript', body: 'export const broken = true;' }));
  await page.goto('http://localhost:5174/community');
  await page.locator('.route-load-error').waitFor({ timeout: 30000 });
  assert.equal(await page.locator('.route-load-error .brand-loader').count(), 0);
  assert.equal(await page.locator('.route-load-error button').count(), 1);
  await page.screenshot({ path: fileURLToPath(new URL('module-error.png', out)) });
  await page.unroute(brokenModule);
  await page.reload();
  await page.locator('.se-question-item').first().waitFor({ timeout: 30000 });
  results.push({ injectedMissingExport: 'actionable error, no loading animation', reloadAfterRecovery: 'passed' });
  await context.close();
  await writeFile(new URL('report.json', out), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
