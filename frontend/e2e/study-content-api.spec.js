import { test, expect } from '@playwright/test';
import { mockStudyContent } from './study-api.fixture.js';
import { studyTopics } from '../src/data/studyCurriculum.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://accounts.google.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { success: true, user: null, data: [], posts: [], notifications: [], members: [], stats: {}, leaderboard: [] } }));
  await mockStudyContent(context);
});
const enter = async (page, url) => {
  await page.goto(url);
  const consent = page.getByRole('button', { name: 'Chỉ dùng cần thiết', exact: true });
  if (await consent.isVisible()) await consent.click();
  await expect(page.locator('.study-heading')).toBeVisible();
};
test('Content loading uses the shared brand loader on desktop and mobile', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/api/flashcards/topics/chuyen-de-1', async route => { await pending; await route.fallback(); });
  await page.goto('/flashcards');
  try {
    await expect(page.locator('.brand-loader[data-loading-phase="content"]')).toBeVisible();
    await expect(page.locator('.brand-loader-mark')).toHaveText('UEHTCC');
    await expect(page.locator('.brand-loader-paper--front')).toHaveCSS('position', 'absolute');
    await page.getByRole('button', { name: 'Tạm dừng chuyển động' }).click();
    await expect(page.locator('.brand-loader-turn')).toHaveCSS('animation-play-state', 'paused');
    await page.getByRole('button', { name: 'Tiếp tục chuyển động' }).click();
    await expect(page.locator('.brand-loader-turn')).toHaveCSS('animation-play-state', 'running');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const loader = page.locator('.brand-loader');
      await expect(loader).toBeVisible();
      const mark = await page.locator('.brand-loader-inner').boundingBox();
      expect(Math.abs(mark.x + mark.width / 2 - width / 2)).toBeLessThan(3);
      await page.locator('.brand-loader-turn').evaluate(element => { const animation = element.getAnimations()[0]; animation.pause(); animation.currentTime = 0; });
      await page.screenshot({ path: testInfo.outputPath(`loading-${width}.png`) });
      await page.locator('.brand-loader-turn').evaluate(element => { const animation = element.getAnimations()[0]; animation.currentTime = Number(animation.effect.getTiming().duration) / 2; });
      await page.screenshot({ path: testInfo.outputPath(`loading-back-${width}.png`) });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.brand-loader-turn')).toHaveCSS('animation-name', 'none');
    await expect(page.getByRole('button', { name: 'Tạm dừng chuyển động' })).toBeHidden();
  } finally { release(); }
  await expect(page.locator('.study-heading')).toBeVisible();
});
test('Chapter 6 separates applications and card links return to the right section', async ({ page }) => {
  await enter(page, '/flashcards?topic=chuyen-de-6');
  await expect(page.locator('.study-outline')).not.toContainText('MC–AC');
  await page.getByRole('link', { name: 'Ứng dụng kinh tế' }).click();
  await expect(page.locator('.study-article h2')).toContainText('lợi nhuận biên');
  await expect(page.locator('.study-outline button')).toHaveCount(5);
  await page.goto('/flashcards?topic=chuyen-de-6&mode=lesson&section=economic-average');
  await expect(page.locator('.study-article h2')).toContainText('MC–AC');
  await expect(page.getByRole('link', { name: 'Ứng dụng kinh tế' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('button', { name: 'Biên tập học liệu' })).toHaveCount(0);
});
test('Owner edits a recall, saves version and sees the updated topic', async ({ page }) => {
  await page.route('**/api/auth/me', route => route.fulfill({ json: { success: true, user: { id: 'owner', username: 'luphuc321@gmail.com', name: 'Owner', role: 'Admin' } } }));
  let saved;
  await page.route('**/api/flashcards/topics/chuyen-de-10', async route => {
    if (route.request().method() !== 'PUT') return route.fallback();
    saved = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, topic: saved.topic, version: 2 } });
  });
  await enter(page, '/flashcards?topic=chuyen-de-10');
  await page.getByRole('button', { name: 'Biên tập học liệu' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Mục học liệu').selectOption('logistic');
  await dialog.getByLabel('Câu hỏi 1', { exact: true }).fill('Câu hỏi logistic đã biên tập');
  await dialog.getByRole('button', { name: 'Lưu học liệu' }).click();
  await expect(dialog).not.toBeVisible();
  expect(saved.version).toBe(1);
  expect(saved.topic.lesson.sections.find(s => s.id === 'logistic').recalls[0].front).toBe('Câu hỏi logistic đã biên tập');
  await page.getByRole('button', { name: 'Biên tập học liệu' }).click();
  await expect(page.getByRole('dialog')).toContainText('Bản 2');
});
test('Database failures are visible and can be retried', async ({ page }) => {
  let unavailable = true;
  await page.route('**/api/flashcards/topics/chuyen-de-1', route => route.fulfill({ status: unavailable ? 503 : 200, json: unavailable ? { success: false, message: 'Kho học liệu chưa kết nối.' } : { success: true, topic: studyTopics[0], version: 1 } }));
  await page.goto('/flashcards');
  await expect(page.getByRole('heading', { name: 'Chưa tải được học liệu' })).toBeVisible();
  const consent = page.getByRole('button', { name: 'Chỉ dùng cần thiết', exact: true }); if (await consent.isVisible()) await consent.click();
  unavailable = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.locator('.study-heading')).toBeVisible();
});
test('Partial derivatives and limits render as display math without raw delimiters', async ({ page }, testInfo) => {
  for (const [topic, section] of [['chuyen-de-7','section-1'], ['chuyen-de-5','limits-core']]) {
    await enter(page, `/flashcards?topic=${topic}&mode=lesson&section=${section}`);
    const definition = page.locator('.study-definition');
    await expect(definition.locator('.katex-display').first()).toBeVisible();
    await expect(definition.locator('.math-render-error')).toHaveCount(0);
    const raw = await definition.evaluate(element => { const clone = element.cloneNode(true); clone.querySelectorAll('.katex').forEach(node => node.remove()); return clone.textContent; });
    expect(raw).not.toMatch(/\$|\\(?:frac|dfrac|partial|lim)\b/);
    await definition.screenshot({ path: testInfo.outputPath(`math-${topic}.png`) });
  }
});
test('Focused flashcards keep the answer separate from expandable conditions', async ({ page }, testInfo) => {
  await enter(page, '/flashcards?topic=chuyen-de-7&mode=flashcard&section=section-1');
  await page.getByRole('button', { name: 'Lật thẻ xem lời giải', exact: true }).click();
  await expect(page.locator('.study-card-back')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('.study-card-back .study-condition')).toHaveCount(0);
  await page.locator('.study-card-conditions summary').click();
  await expect(page.locator('.study-card-conditions')).toHaveAttribute('open', '');
  await expect(page.locator('.study-card-back')).toHaveAttribute('aria-hidden', 'false');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const bounds = await page.locator('.study-flashcard').boundingBox();
    expect(bounds.width).toBeLessThanOrEqual(741);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator('.study-practice').screenshot({ path: testInfo.outputPath(`flashcard-${width}.png`) });
  }
});
