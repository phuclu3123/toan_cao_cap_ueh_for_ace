import { mockStudyContent } from './study-api.fixture.js';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('https://accounts.google.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { success: true, user: null, data: [], posts: [], notifications: [], members: [], stats: { trendingTags: [] }, leaderboard: [] } }));
  await mockStudyContent(context);
});

test('A single row operation keeps both matrices and its notation after playback ends', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/flashcards?topic=chuyen-de-1&mode=lesson&section=row-operations');
  await page.getByRole('button', { name: 'Chỉ dùng cần thiết', exact: true }).click();
  const stage = page.locator('.matrix-flow-stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveClass(/flow-single/);
  await expect(stage).toHaveClass(/flow-complete/);
  // Wait past the former loop boundary: the result must remain available for comparison.
  await page.waitForTimeout(4800);
  await expect(stage).toHaveClass(/phase-1.*flow-complete/);
  for (const selector of ['.matrix-flow-source', '.matrix-flow-operation', '.matrix-flow-target']) {
    expect(await stage.locator(selector).evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  }
  expect(await stage.locator('.matrix-flow-target').evaluate(element => getComputedStyle(element).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({ path: '../artifacts/study-workspace/single-operation-comparison.png' });
});

test('A multi-step rank demonstration still fades the old matrix and moves its result left', async ({ page }) => {
  await page.goto('/flashcards?topic=chuyen-de-2&mode=lesson&section=section-3');
  await page.getByRole('button', { name: 'Chỉ dùng cần thiết', exact: true }).click();
  const stage = page.locator('.matrix-flow-stage');
  await page.getByRole('button', {name:'Từng bước',exact:true}).click();
  const next = page.getByRole('button', { name: 'Bước tiếp tìm hạng', exact: true });
  await next.click();
  await expect(stage).toHaveClass(/phase-1/);
  expect(await stage.locator('.matrix-flow-source').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  await next.click();
  await expect(stage).toHaveClass(/phase-2.*flow-sequence/);
  await expect(stage.locator('.matrix-flow-source')).toHaveCSS('opacity', '0');
  await expect(stage.locator('.matrix-flow-operation')).toHaveCSS('opacity', '0');
  await expect.poll(() => stage.locator('.matrix-flow-target').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)).toBeLessThan(0);
});
