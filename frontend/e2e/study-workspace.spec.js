import { mockStudyContent } from './study-api.fixture.js';
import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const screenshots = '../artifacts/study-workspace';

test.beforeEach(async ({ context }) => {
  await context.route('https://accounts.google.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { success: true, user: null, data: [], posts: [], notifications: [], members: [], stats: { trendingTags: [] }, leaderboard: [] } }));
  await mockStudyContent(context);
});
const enter = async page => { await page.goto('/flashcards'); await expect(page.locator('.study-heading h1')).toHaveText('Ma trận & Định thức'); };
const essential = async page => { await page.getByRole('button', { name: 'Chỉ dùng cần thiết', exact: true }).click(); };

test('Consent sits bottom left, remembers essential choice and can be revised', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await enter(page);
  const banner = page.getByRole('region', { name: 'Lựa chọn cookie' });
  await expect(banner).toBeVisible(); const bounds = await banner.boundingBox();
  expect(bounds.x).toBeLessThan(40); expect(bounds.width).toBeLessThan(500);
  await mkdir(screenshots, { recursive: true }); await page.screenshot({ path: `${screenshots}/cookie-desktop.png` });
  await essential(page); await page.reload(); await expect(banner).not.toBeVisible();
  await page.getByRole('button', { name: 'Thay đổi cách lưu dữ liệu học tập' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tùy chọn cookie và lưu trữ' });
  await expect(dialog).toBeVisible(); await dialog.getByRole('checkbox').check(); await dialog.getByRole('button', { name: 'Lưu lựa chọn' }).click();
  await expect(page.locator('.study-storage')).toContainText('Lưu trên thiết bị');
});

test('Floating glass header hides down, reveals up and is scoped to flashcards', async ({ page }) => {
  await enter(page); await essential(page);
  const header = page.locator('.header-wrapper');
  expect(await header.evaluate(element => getComputedStyle(element).top)).toBe('16px');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(page.locator('.app-container')).toHaveClass(/study-header-hidden/);
  await page.evaluate(() => window.scrollTo(0, 450));
  await expect(page.locator('.app-container')).not.toHaveClass(/study-header-hidden/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toBeVisible();
  await page.goto('/courses');
  await expect(page.locator('.app-container')).not.toHaveClass(/study-route/);
  expect(await header.evaluate(element => getComputedStyle(element).top)).toBe('0px');
});
test('Theory links to related cards, rates and undoes a review', async ({ page }) => {
  await enter(page); await essential(page);
  await page.locator('.study-article-actions .study-primary').click();
  await expect(page.locator('.study-filter-note')).toBeVisible();
  const answerFace = page.locator('.study-card-back');
  await expect(answerFace).toHaveAttribute('aria-hidden', 'true');
  expect(await answerFace.evaluate(element => element.inert)).toBe(true);
  await page.getByRole('button', { name: 'Lật thẻ xem lời giải' }).click();
  await expect(answerFace).toHaveAttribute('aria-hidden', 'false');
  expect(await answerFace.evaluate(element => element.inert)).toBe(false);
  await expect(page.getByText('Lời giải và lập luận', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Đã hiểu và nhớ/ }).click();
  await page.getByRole('button', { name: 'Hoàn tác đánh giá', exact: true }).click();
  await expect(page.getByText('Lời giải và lập luận', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ueh_tcc_study_v2'))).toBeNull();
  await page.goBack(); await expect(page.locator('.study-article')).toBeVisible();
});
test('Unmarking a card from the starred filter leaves a valid empty state', async ({ page }) => {
  await enter(page); await essential(page);
  await page.getByRole('link', { name: 'Thẻ ghi nhớ', exact: true }).click();
  const progress = page.getByRole('progressbar', { name: 'Tiến độ bộ thẻ' });
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: 'Thẻ tiếp theo' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.getByRole('button', { name: 'Đánh dấu thẻ', exact: true }).click();
  await page.getByLabel('Lọc thẻ').selectOption('starred');
  await expect(page.locator('.study-card-toolbar [role="status"]')).toHaveText('Thẻ 1 / 1');
  await page.getByRole('button', { name: 'Bỏ đánh dấu thẻ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chưa có thẻ trong lựa chọn này' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xem tất cả thẻ', exact: true })).toBeVisible();
});
test('Personal cards persist only with permission and can be edited and deleted', async ({ page }) => {
  await enter(page); await page.getByRole('button', { name: 'Cho phép lưu', exact: true }).click();
  await page.getByRole('link', { name: 'Thẻ của tôi', exact: true }).click();
  await page.getByRole('button', { name: 'Tạo thẻ mới', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Biên soạn thẻ ghi nhớ' });
  await dialog.getByLabel('Câu hỏi', { exact: false }).fill('Khi nào A khả nghịch?');
  await dialog.getByLabel('Lời giải và lập luận', { exact: false }).fill('$\\det A \\ne 0$ với A vuông.');
  await dialog.getByRole('button', { name: 'Xem trước công thức' }).click(); await expect(dialog.locator('.katex')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Thêm vào bộ thẻ' }).click();
  await expect(page.locator('.study-personal-list')).toContainText('Khi nào A khả nghịch?');
  await page.reload(); await expect(page.locator('.study-personal-list')).toContainText('Khi nào A khả nghịch?');
  await page.getByRole('button', { name: 'Sửa thẻ', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Câu hỏi', { exact: false }).fill('Điều kiện khả nghịch của A?');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.locator('.study-personal-list')).toContainText('Điều kiện khả nghịch của A?');
  await page.getByRole('button', { name: 'Xóa thẻ', exact: true }).click();
  await page.locator('.study-delete-confirm').getByRole('button', { name: 'Xóa thẻ', exact: true }).click();
  await expect(page.locator('.study-personal-list')).toHaveCount(0);
});
test('Quiz explains wrong answers, computes results and retries incorrect items', async ({ page }) => {
  await enter(page); await essential(page); await page.getByRole('link', { name: 'Tự kiểm tra', exact: true }).click();
  await page.getByRole('radio').nth(0).check(); await page.getByRole('button', { name: 'Kiểm tra đáp án', exact: true }).click();
  await expect(page.locator('.study-explanation h3')).toContainText('Chưa chính xác');
  await page.getByRole('button', { name: 'Câu tiếp theo', exact: true }).click();
  await page.getByRole('radio').nth(2).check(); await page.getByRole('button', { name: 'Kiểm tra đáp án', exact: true }).click();
  await page.getByRole('button', { name: 'Câu tiếp theo', exact: true }).click();
  await page.getByRole('radio').nth(1).check(); await page.getByRole('button', { name: 'Kiểm tra đáp án', exact: true }).click();
  await page.getByRole('button', { name: 'Xem kết quả', exact: true }).click();
  await expect(page.locator('.study-quiz-results>h2')).toHaveText('2 / 3');
  await page.getByRole('button', { name: 'Luyện các câu chưa đúng' }).click();
  await expect(page.locator('.study-panel-heading')).toContainText('Câu 1 / 1');
});
test('Responsive screenshots, all topic explorers and no horizontal overflow', async ({ page }) => {
  test.setTimeout(90_000);
  await enter(page); await essential(page); await mkdir(screenshots, { recursive: true });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.math-explorer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `${screenshots}/theory-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (let topic = 1; topic <= 10; topic++) {
    await page.goto(`/flashcards?topic=chuyen-de-${topic}&mode=lesson`);
    await expect(page.locator('.math-explorer')).toBeVisible();
    await expect(page.locator('.study-sheet .katex')).not.toHaveCount(0);
    await page.locator('.math-explorer').screenshot({ path: `${screenshots}/explorer-${topic}.png` });
  }
  await page.goto('/flashcards?topic=chuyen-de-1&mode=lesson&section=determinant');
  await page.goto('/flashcards?topic=chuyen-de-1&mode=lesson&section=matrix-triangle');
  await expect(page.locator('.triangle-gallery-item')).toHaveCount(3);
  await page.locator('.math-explorer').screenshot({ path: `${screenshots}/triangle.png` });
  await page.goto('/flashcards?topic=chuyen-de-1&mode=flashcard');
  await page.getByRole('button', { name: 'Lật thẻ xem lời giải' }).click(); await page.screenshot({ path: `${screenshots}/cards-desktop.png`, fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.setViewportSize({ width: 390, height: 1000 }); await page.screenshot({ path: `${screenshots}/cards-mobile-dark.png`, fullPage: true });
});
