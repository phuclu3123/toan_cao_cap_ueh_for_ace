import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
  await context.route('https://accounts.google.com/**', route => route.abort());
  await context.route('**/api/**', route => route.fulfill({ json: { success: true, resources: {}, data: [], posts: [], notifications: [], stats: { trendingTags: [] }, leaderboard: [] } }));
});

test('inline and display LaTeX answers start at the same left inset', async ({ page }, info) => {
  await page.goto('/exam/k51-tonghop');
  await expect(page.locator('.answer-option')).toHaveCount(4);
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const offsets = await page.locator('.option-text').evaluateAll(items => items.map(item => {
      const formula = item.querySelector('.katex-html');
      return formula.getBoundingClientRect().left - item.getBoundingClientRect().left;
    }));
    for (const offset of offsets) expect(Math.abs(offset)).toBeLessThan(5);
    await page.screenshot({ path: info.outputPath(`exam-left-${width}.png`) });
  }
});

test('a single PDF page fits vertically and can zoom below fifty percent', async ({ page }, info) => {
  await page.goto('/document/k51-2-dot');
  await expect(page.locator('.pdf-sheet[data-rendered-page="1"]')).toBeVisible({ timeout: 30000 });
  await page.selectOption('#pdf-layout', '1');
  await expect(page.getByRole('button', { name: 'Vừa toàn trang', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole('button', { name: 'Vừa toàn trang', exact: true }).click();
    await expect.poll(async () => page.locator('.pdf-sheet[data-rendered-page="1"]').count()).toBe(1);
    await page.waitForTimeout(400);
    const sheet = await page.locator('.pdf-sheet').boundingBox(), stage = await page.locator('.pdf-stage').boundingBox();
    expect(sheet.height).toBeLessThanOrEqual(stage.height - 30);
    expect(sheet.width).toBeLessThanOrEqual(stage.width);
    expect(sheet.y + sheet.height).toBeLessThanOrEqual(1000);
    await page.screenshot({ path: info.outputPath(`reader-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Vừa chiều ngang', exact: true }).click();
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Thu nhỏ', exact: true }).click();
  await expect(page.locator('.pdf-zoom-reset')).toHaveText('30%');
  await page.getByRole('button', { name: 'Vừa toàn trang', exact: true }).click();
  await page.getByRole('button', { name: 'Xoay trang', exact: true }).click();
  await page.waitForTimeout(500);
  expect((await page.locator('.pdf-sheet').boundingBox()).height).toBeLessThan((await page.locator('.pdf-stage').boundingBox()).height);
});

test('blog comments and reactions wait for the server, preserve failed text and survive reload', async ({ page, context }, info) => {
  let fail = true;
  const engagement = { reactions: { clear: 0, useful: 0, insightful: 0, love: 0 }, viewerReaction: null, comments: [] };
  await context.route('**/api/blog/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (request.method() === 'POST' && fail) return route.fulfill({ status: 503, json: { success: false, message: 'Máy chủ chưa sẵn sàng. Vui lòng thử lại.' } });
    if (path.endsWith('/comments') && request.method() === 'POST') {
      const body = request.postDataJSON(); engagement.comments.push({ ...body, commentId: 'confirmed-comment', createdAt: new Date().toISOString(), likes: 0 });
    }
    if (path.endsWith('/reactions') && request.method() === 'POST') { engagement.reactions.useful = 1; engagement.viewerReaction = 'useful'; }
    return route.fulfill({ json: { success: true, engagement } });
  });
  await page.goto('/blog/lo-trinh-on-toan-cao-cap');
  const discussion = page.locator('.blog-engagement');
  await discussion.scrollIntoViewIfNeeded();
  await page.fill('#blog-comment-name', 'Người đọc kiểm tra');
  await page.fill('#blog-comment-content', 'Mình đã hiểu bài và muốn hỏi thêm một bước giải.');
  await page.getByRole('button', { name: 'Đăng bình luận', exact: true }).click();
  await expect(discussion.getByRole('status')).toContainText('Máy chủ chưa sẵn sàng');
  await expect(page.locator('#blog-comment-content')).not.toHaveValue('');
  await expect(page.locator('.blog-comment-item')).toHaveCount(0);
  await discussion.getByRole('button', { name: /Hữu ích/ }).first().click();
  await expect(page.locator('.blog-reaction-list .is-selected')).toHaveCount(0);
  fail = false;
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('ueh_tcc_blog_engagement:')) throw new DOMException('Fixture storage quota', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Đăng bình luận', exact: true }).click();
  await expect(page.locator('.blog-comment-item')).toHaveCount(1);
  await expect(page.locator('#blog-comment-content')).toHaveValue('');
  await page.reload();
  await expect(page.locator('.blog-comment-item')).toHaveCount(1);
  await discussion.getByRole('button', { name: /Hữu ích/ }).first().click();
  await expect(page.locator('.blog-reaction-list .is-selected')).toHaveCount(1);
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 }); await discussion.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`blog-comments-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
});
