import { expect, test } from '@playwright/test';
import { PURCHASE_TERMS } from '../../backend/src/modules/commerce/config/purchaseTerms.js';

const courseId = 'tu-hoc-toan-cao-cap';
const student = { id: 'checkout-student-fixture', username: 'student@example.test', email: 'student@example.test', name: 'Học viên kiểm tra', role: 'Student' };
const pageErrors = new WeakMap();
test.beforeEach(({ page }) => {
  const errors = []; pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(({ page }) => expect(pageErrors.get(page)).toEqual([]));

async function installFixture(context, { user = student, reason = 'NOT_ENROLLED', unavailable = false, createFailsOnce = false } = {}) {
  const state = { user, reason, unavailable, orders: [], polls: 0, paid: false, contentRequests: 0, amount: 349000, selected: null, lastOrder: null, promotion: '', authUnavailable: false, access401: false, accessRequests: 0 };
  await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
  await context.route('https://accounts.google.com/**', route => route.abort());
  await context.route('https://challenges.cloudflare.com/**', route => route.abort());
  await context.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const access = () => ({ courseId, allowed: ['OWNER', 'ENROLLED'].includes(state.reason), reason: state.reason });
    const json = data => route.fulfill({ json: { success: true, data } });
    if (path === '/api/auth/providers') return route.fulfill({ json: { providers: { google: { enabled: false }, github: { enabled: false } } } });
    if (path === '/api/auth/me' && state.authUnavailable) return route.fulfill({ status: 503, json: { success: false, message: 'Fixture outage' } });
    if (path === '/api/auth/me') return route.fulfill(state.user
      ? { json: { success: true, user: state.user, enrollments: [] } }
      : { status: 401, json: { success: false, code: 'AUTH_REQUIRED', message: 'Vui lòng đăng nhập.' } });
    if (path === `/api/courses/${courseId}/access`) {
      state.accessRequests += 1;
      if (state.access401 || !state.user) return route.fulfill({ status: 401, json: { success: false, code: 'AUTH_REQUIRED' } });
      if (state.unavailable) return route.fulfill({ status: 503, json: { success: false, code: 'ENROLLMENT_STORE_UNAVAILABLE', message: 'Hệ thống khóa học đang tạm bảo trì.' } });
      return json(access());
    }
    const quote = code => ({ courseId, baseAmount: state.amount, amount: code ? state.amount - 2000 : state.amount, discountAmount: code ? 2000 : 0, promotionId: code ? 'fixture-promo' : null, promotionCode: code || null, promotionLabel: code || null, priceVersion: 2, currency: 'VND' });
    const checkout = () => {
      const selected = !state.orderOwner || state.orderOwner === state.user?.id ? state.selected : null;
      return { courseId, phase: selected ? 'PAYMENT' : 'DETAILS', order: selected, resumeAutomatically: Boolean(selected?.expiresAt), promotionCode: state.promotion };
    };
    if (path === '/api/course-commerce/terms') return json(PURCHASE_TERMS);
    if (path === '/api/course-commerce/catalog') return json([{ id: courseId, amount: state.amount, compareAtAmount: 799000, version: 2, isClosed: false }]);
    if (path === '/api/course-commerce/quote') return json(quote(request.postDataJSON().promotionCode));
    if (path === '/api/course-commerce/checkout-sessions') return json(checkout().order ? [checkout()] : []);
    if (path === `/api/course-commerce/checkout/${courseId}`) return json(checkout());
    if (path === `/api/course-commerce/checkout/${courseId}/draft`) { state.promotion = request.postDataJSON().promotionCode; return json(quote(state.promotion)); }
    if (path === `/api/course-commerce/checkout/${courseId}/dismiss`) { state.selected = null; return json(null); }
    if (/\/course-commerce\/orders\/\d+\/cancel$/.test(path)) {
      state.lastOrder.status = 'CANCELLED'; state.selected = null; state.promotion = ''; return json(state.lastOrder);
    }
    if (path === '/api/orders' && request.method() === 'POST') {
      state.orders.push({ body: request.postDataJSON(), key: request.headers()['idempotency-key'] });
      if (createFailsOnce && state.orders.length === 1) return route.fulfill({ status: 502, json: { success: false, code: 'PAYOS_UNAVAILABLE', message: 'Không thể tạo đơn thanh toán lúc này.' } });
      state.selected = { courseId, orderCode: 1712345678900 + state.orders.length, amount: request.postDataJSON().quote.amount, status: 'PENDING', qrCode: 'fixture-vietqr-payload-for-local-rendering', checkoutUrl: 'https://pay.payos.vn/web/fixture-only', expiresAt: new Date(Date.now() + 1800000).toISOString(), serverNow: new Date().toISOString(), pricingSnapshot: quote(state.promotion) };
      state.lastOrder = state.selected;
      return route.fulfill({ status: 201, json: { success: true, data: state.selected } });
    }
    if (/^\/api\/orders\/\d+$/.test(path)) {
      state.polls += 1;
      if (!state.user) return route.fulfill({ status: 401, json: { success: false, code: 'AUTH_REQUIRED' } });
      if (state.orderOwner && state.orderOwner !== state.user.id) return route.fulfill({ status: 403, json: { success: false, code: 'ORDER_FORBIDDEN' } });
      if (state.paid) state.reason = 'ENROLLED';
      const order = state.selected || state.lastOrder;
      return json({ ...order, status: state.paid ? 'PAID' : order?.status || 'PENDING', entitlement: access() });
    }
    if (path === '/api/flashcard-access/me') return route.fulfill({ json: { success: true, access: { allowed: false, status: 'NOT_GRANTED' } } });
    if (path.includes('/lessons/')) {
      state.contentRequests += 1;
      if (state.previewEnabled) return json({ courseId, lessonId: path.split('/lessons/')[1].split('/')[0], type: 'video', preview: true, media: { provider: 'youtube', videoId: 'fixture1234' } });
      return route.fulfill({ status: 403, json: { success: false, code: 'ENROLLMENT_REQUIRED', message: 'Bạn cần kích hoạt khóa học.' } });
    }
    if (path.includes('/course-access/admin/')) return json({ items: [], pagination: { page: 1, total: 0, pages: 1 } });
    return route.fulfill({ json: { success: true, data: [], posts: [], resources: [], notifications: [], stats: { trendingTags: [] }, leaderboard: [], members: [] } });
  });
  return state;
}

async function openCourse(page) {
  await page.goto(`/course/${courseId}`);
  await expect(page.locator('#app-boot')).toHaveCount(0);
  await expect(page.locator('.cd-enrollment button').first()).toBeEnabled({ timeout: 20_000 });
}

test('student checkout retries with the same idempotency key, shows QR, then unlocks only after confirmation', async ({ page, context }, testInfo) => {
  const state = await installFixture(context, { createFailsOnce: true });
  await openCourse(page);
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(2);
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục thanh toán', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Họ và tên')).toHaveValue(student.name);
  await expect(dialog.getByLabel('Email tài khoản nhận quyền học')).toHaveValue(student.email);
  await dialog.getByLabel('Số điện thoại (Zalo)').fill('0900000000');
  const submit = dialog.getByRole('button', { name: /Tiếp tục với PayOS/ });
  await dialog.locator('.checkout-agree input').check();
  await dialog.locator('#purchase-confirmation').fill(PURCHASE_TERMS.confirmation);
  await submit.click();
  await expect(dialog.getByRole('alert')).toContainText('Không thể tạo đơn');
  await submit.click();
  await expect(dialog.getByRole('img', { name: 'Mã QR thanh toán PayOS' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Mở trang PayOS' })).toHaveAttribute('href', 'https://pay.payos.vn/web/fixture-only');
  await page.screenshot({ path: testInfo.outputPath('checkout-qr.png') });
  expect(state.orders).toHaveLength(2);
  expect(state.orders[0].key).toBeTruthy();
  expect(state.orders[1].key).toBe(state.orders[0].key);
  expect(state.orders[1].body).toMatchObject({ courseId, buyerName: student.name, buyerEmail: student.email, buyerPhone: '0900000000', quote: { amount: 349000 }, purchaseConsent: { accepted: true, version: PURCHASE_TERMS.version } });
  await expect.poll(() => state.polls).toBeGreaterThan(0);
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(2);
  state.paid = true;
  await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Vào học ngay', exact: true })).toBeVisible();
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(0);
});

test('database outage blocks order creation and retry recovers without reloading the page', async ({ page, context }, testInfo) => {
  const state = await installFixture(context, { unavailable: true });
  await openCourse(page);
  await expect(page.locator('.cd-notice')).toContainText('Chưa kết nối');
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('alert')).toContainText('Chưa tạo đơn thanh toán mới');
  await page.screenshot({ path: testInfo.outputPath('checkout-retry.png') });
  await expect(dialog.getByRole('button', { name: 'Tiếp tục thanh toán' })).toHaveCount(0);
  expect(state.orders).toHaveLength(0);
  state.unavailable = false;
  await dialog.getByRole('button', { name: 'Thử lại kết nối', exact: true }).click();
  await dialog.getByRole('button', { name: 'Tiếp tục thanh toán', exact: true }).click();
  await expect(dialog.getByLabel('Họ và tên')).toBeVisible();
  expect(state.orders).toHaveLength(0);
});

test('locked lesson opens the same payment/key dialog for a student', async ({ page, context }) => {
  const state = await installFixture(context);
  await openCourse(page);
  await page.getByRole('button', { name: /Buổi 02.*Hệ phương trình/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Tiếp tục thanh toán' })).toBeVisible();
  await dialog.getByRole('tab', { name: 'Nhập key' }).click();
  await expect(dialog.getByLabel('Mã do admin cung cấp')).toBeVisible();
  expect(state.contentRequests).toBe(1);
  expect(state.orders).toHaveLength(0);
});

test('revoked enrollment offers admin restoration instead of another payment or key', async ({ page, context }) => {
  const state = await installFixture(context, { reason: 'REVOKED' });
  await openCourse(page);
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('alert')).toContainText('Quyền học đã bị thu hồi');
  await expect(dialog.getByRole('tab')).toHaveCount(0);
  expect(state.orders).toHaveLength(0);
});

for (const reason of ['OWNER', 'ENROLLED']) test(`${reason} can enter without checkout`, async ({ page, context }) => {
  const state = await installFixture(context, { reason, user: reason === 'OWNER' ? { ...student, username: 'luphuc321@gmail.com', role: 'Admin' } : student });
  await openCourse(page);
  await expect(page.getByRole('button', { name: 'Vào học ngay', exact: true })).toBeVisible();
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(0);
  expect(state.orders).toHaveLength(0);
});

test('signed out visitor is asked to sign in before payment', async ({ page, context }) => {
  const state = await installFixture(context, { user: null });
  await openCourse(page);
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Đăng nhập để tiếp tục' })).toBeVisible();
  expect(state.orders).toHaveLength(0);
});

test('closed zero-price courses cannot enter checkout', async ({ page, context }) => {
  const state = await installFixture(context);
  for (const id of ['lop-tu-hoc-sql', 'thuc-chien-k46-k50', 'thuc-chien-k51']) {
    await page.goto(`/course/${id}`);
    await expect(page.getByRole('button', { name: 'Tạm đóng đăng ký', exact: true })).toBeDisabled();
    await expect(page.locator('.cd-price')).toHaveText('0đ');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  expect(state.orders).toHaveLength(0);
});

test('switching from owner to student during an outage clears the previous access', async ({ page, context }) => {
  const state = await installFixture(context, { reason: 'OWNER', user: { ...student, id: 'fixture-owner', username: 'luphuc321@gmail.com', role: 'Admin' } });
  await openCourse(page);
  await expect(page.getByRole('button', { name: 'Vào học ngay', exact: true })).toBeVisible();
  state.user = student;
  state.reason = 'NOT_ENROLLED';
  state.unavailable = true;
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await expect(page.getByRole('button', { name: 'Đăng ký khóa học', exact: true })).toBeEnabled();
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(2);
  await expect(page.locator('.course-admin-panel')).toHaveCount(0);
});

async function openCheckout(page) {
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục thanh toán', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('#purchase-confirmation')).toBeVisible();
  return dialog;
}
async function confirmCheckout(dialog) {
  await dialog.getByLabel('Số điện thoại (Zalo)').fill('0900000000');
  await expect(dialog.getByRole('button', { name: /Tiếp tục với PayOS/ })).toBeDisabled();
  await dialog.locator('.checkout-agree input').check();
  await dialog.locator('#purchase-confirmation').fill(PURCHASE_TERMS.confirmation);
  await dialog.getByRole('button', { name: /Tiếp tục với PayOS/ }).click();
  await expect(dialog.getByRole('img', { name: 'Mã QR thanh toán PayOS' })).toBeVisible();
}

test('refreshed course, player and auth remain usable across screen sizes', async ({ page, context }, info) => {
  test.setTimeout(120_000);
  const state = await installFixture(context, { user: null });
  await context.addInitScript(() => {
    window.fixtureTurnstileThemes = [];
    window.turnstile = { render(_node, options) { window.fixtureTurnstileThemes.push(options.theme); queueMicrotask(() => options.callback('ui-fixture-token')); return 1; }, remove() {}, reset() {} };
  });
  await openCourse(page);
  await expect(page).toHaveTitle('α∫M4A - Math for all • Aim for A');
  await expect(page.locator('.cd-notebook-page')).toHaveCount(4);
  for (const sheet of await page.locator('.cd-notebook-page').all()) {
    await expect(sheet).toHaveCSS('object-fit', 'contain');
    expect(await sheet.evaluate(node => node.complete && node.naturalHeight > node.naturalWidth)).toBeTruthy();
    expect(await sheet.getAttribute('src')).toMatch(/-page\.webp$/);
  }

  const icon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(icon).toBe('/images/brand/aim4a-round.svg');
  const pixels = await page.evaluate(async src => {
    const image = new Image(); image.src = src; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, 128, 128);
    return { corner: ctx.getImageData(0, 0, 1, 1).data[3], center: ctx.getImageData(64, 64, 1, 1).data[3] };
  }, icon);
  expect(pixels).toEqual({ corner: 0, center: 255 });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: info.outputPath(`course-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator('#curriculum').scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`curriculum-${width}.png`) });
    await page.evaluate(() => scrollTo(0, 0));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ colorScheme: 'dark' }); // App stays light even on a dark OS.
  await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).first().click();
  await expect(page.locator('.auth-modal-panel')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.fixtureTurnstileThemes.at(-1))).toBe('light');
  await page.locator('#username').fill('student@example.test');
  await page.locator('#password').fill('fixture-password');
  const session = await context.newCDPSession(page);
  await session.send('DOM.enable'); await session.send('CSS.enable');
  const { root } = await session.send('DOM.getDocument');
  for (const selector of ['#username', '#password']) {
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    await session.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['autofill'] });
    const ink = await page.locator(selector).evaluate(node => ({ ink: getComputedStyle(node).webkitTextFillColor, cover: getComputedStyle(node).boxShadow, scheme: getComputedStyle(node).colorScheme }));
    expect(ink.ink).toBe('rgb(32, 39, 32)');
    expect(ink.scheme).toBe('light');
    // Chromium reserves its autofill background; the inset paint is the visible surface.
    expect(ink.cover).toContain('rgb(255, 255, 255)');
    expect(ink.cover).toContain('inset');
  }
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: info.outputPath(`auth-${width}.png`) });
    const box = await page.locator('.auth-modal-panel').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  await session.detach(); await page.keyboard.press('Escape');
  state.user = student; state.previewEnabled = true; state.reason = 'ENROLLED';
  await page.reload();
  await expect(page.locator('.cd-price')).toHaveCount(0);
  await page.getByRole('button', { name: 'Xem bài học đầu tiên', exact: true }).click();
  const player = page.locator('.learning-player');
  await expect(player).toBeVisible();
  const playlistToggle = player.getByRole('button', { name: 'Bài học', exact: true });
  if (await playlistToggle.getAttribute('aria-expanded') === 'false') await playlistToggle.click();
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const playerBox = await player.boundingBox();
    expect(playerBox.x).toBeGreaterThanOrEqual(0);
    expect(playerBox.x + playerBox.width).toBeLessThanOrEqual(width);
    if (width === 1440) {
      expect(playerBox.width).toBeGreaterThan(1200);
      expect(playerBox.height).toBeLessThan(800);
      const stage = await player.locator('.learning-player__stage').boundingBox();
      expect(stage.height).toBeLessThanOrEqual(521);
    }
    const bounds = await player.evaluate(node => {
      const main = node.querySelector('.learning-player__main').getBoundingClientRect();
      const workspace = node.querySelector('.learning-player__workspace').getBoundingClientRect();
      const list = node.querySelector('.learning-player__playlist').getBoundingClientRect();
      return { mainBottom: main.bottom, workspaceBottom: workspace.bottom, listBottom: list.bottom, listTop: list.top, mainRight: main.right, listLeft: list.left, scrollWidth: node.scrollWidth, width: node.clientWidth };
    });
    expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
    if (width > 850) {
      expect(Math.abs(bounds.mainBottom - bounds.workspaceBottom)).toBeLessThan(2);
      expect(Math.abs(bounds.listBottom - bounds.workspaceBottom)).toBeLessThan(2);
      expect(bounds.mainRight).toBeLessThanOrEqual(bounds.listLeft + 1);
    } else expect(bounds.listTop).toBeGreaterThanOrEqual(bounds.mainBottom - 1);
    await page.screenshot({ path: info.outputPath(`player-playlist-${width}.png`) });
    if (width === 1440 || width === 390) {
      await player.getByRole('button', { name: 'Toàn màn hình', exact: true }).click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement?.classList.contains('learning-player'))).toBe(true);
      const fullBounds = await player.evaluate(node => {
        const stage = node.querySelector('.learning-player__stage').getBoundingClientRect();
        const controls = node.querySelector('.learning-player__controls');
        return { height:node.getBoundingClientRect().height, stage:stage.height, viewport:innerHeight, ink:getComputedStyle(controls).color };
      });
      expect(Math.abs(fullBounds.height - fullBounds.viewport)).toBeLessThan(2);
      expect(fullBounds.stage).toBeGreaterThan(fullBounds.viewport * (width === 1440 ? .65 : .4));
      expect(fullBounds.ink).toBe('rgb(242, 246, 242)');
      await page.screenshot({ path: info.outputPath(`player-fullscreen-${width}.png`) });
      await player.getByRole('button', { name: 'Thoát toàn màn hình', exact: true }).click();
      await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
    }
  }
});

test('checkout countdown does not restart polling and donate stays isolated in the same browser', async ({ page, context }) => {
  const state = await installFixture(context);
  const support = { payment: null, creates: 0, reads: 0 };
  await context.addInitScript(() => {
    let callback;
    window.turnstile = { render(_node, options) { callback = options.callback; queueMicrotask(() => callback('fixture-token')); return 1; }, remove() {}, reset() { queueMicrotask(() => callback?.('fixture-token')); } };
  });
  await context.route('**/api/support/payments**', route => {
    const request = route.request();
    if (request.method() === 'POST') {
      support.creates++;
      support.payment = { orderCode: 8179480000000101, amount: request.postDataJSON().amount, status: 'PENDING', qrCode: 'donation-only-qr', checkoutUrl: 'https://pay.payos.vn/web/donation-only', expiresAt: new Date(Date.now() + 1800000).toISOString() };
    } else support.reads++;
    return route.fulfill({ json: { success: true, data: support.payment } });
  });
  await openCourse(page);
  const checkout = await openCheckout(page);
  await confirmCheckout(checkout);
  await expect.poll(() => state.polls).toBeGreaterThan(0);
  const start = state.polls;
  await page.waitForTimeout(8100);
  expect(state.polls - start).toBeLessThanOrEqual(3);
  expect(state.polls - start).toBeGreaterThanOrEqual(1);
  const orderCode = state.selected.orderCode;
  await page.keyboard.press('Escape');
  await page.locator('.footer-support').click();
  const donation = page.locator('.support-dialog');
  await donation.getByRole('button', { name: /^Ủng hộ 50/ }).click();
  await expect(donation.locator('.support-qr img')).toBeVisible();
  await expect(donation.getByRole('link', { name: 'Mở PayOS' })).toHaveAttribute('href', 'https://pay.payos.vn/web/donation-only');
  support.payment.status = 'PAID';
  await donation.getByRole('button', { name: 'Kiểm tra giao dịch', exact: true }).click();
  await expect(donation.getByRole('heading', { name: 'Đã nhận được ủng hộ.' })).toBeVisible();
  expect(state.paid).toBe(false);
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(2);
  await donation.getByRole('button', { name: 'Hoàn tất', exact: true }).click();
  await page.locator('.checkout-session-dock__open').click();
  await expect(page.getByRole('dialog').getByRole('img', { name: 'Mã QR thanh toán PayOS' })).toBeVisible();
  expect(state.selected.orderCode).toBe(orderCode);
  expect(state.orders).toHaveLength(1);
  expect(support.creates).toBe(1);
  state.paid = true;
  await expect(page.getByRole('heading', { name: 'Quyền học đã sẵn sàng', exact: true })).toBeVisible({ timeout: 10000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(0);
  await page.locator('.footer-support').click();
  await expect(donation.getByRole('heading', { name: 'Đã nhận được ủng hộ.' })).toBeVisible();
  expect(support.payment.orderCode).not.toBe(orderCode);
});

test('donate storage failure unlocks the amount and retry starts a fresh receipt', async ({ page, context }) => {
  await installFixture(context);
  const tokens = [];
  await context.addInitScript(() => {
    let callback;
    window.turnstile = { render(_node, options) { callback = options.callback; queueMicrotask(() => callback('fixture-token')); return 1; }, remove() {}, reset() { queueMicrotask(() => callback?.('fixture-token')); } };
  });
  await context.route('**/api/support/payments**', route => {
    tokens.push(route.request().headers()['x-support-token']);
    return route.fulfill({ status: 503, json: { success: false, code: 'SUPPORT_STORE_UNAVAILABLE', message: 'Kho lưu ủng hộ tạm gián đoạn.' } });
  });
  await openCourse(page);
  await page.locator('.footer-support').click();
  const dialog = page.locator('.support-dialog');
  await dialog.getByRole('button', { name: /^Ủng hộ 50/ }).click();
  await expect(dialog.getByRole('alert')).toContainText('tạm gián đoạn');
  await expect(dialog.locator('#support-amount')).toBeEnabled();
  await dialog.locator('#support-amount').fill('20000');
  await dialog.getByRole('button', { name: /^Ủng hộ 20/ }).click();
  await expect.poll(() => tokens.length).toBe(2);
  expect(tokens[1]).not.toBe(tokens[0]);
});

test('valid session stays signed in through course and Flashcard gates', async ({ page, context }) => {
  const state = await installFixture(context); await openCourse(page);
  await openCheckout(page);
  await page.goto('/flashcards');
  await expect(page.locator('#fc-lock-title')).not.toHaveText('Đăng nhập để tiếp tục');
  await expect(page.locator('.fc-lock-panel form')).toBeVisible();
  expect(state.orders).toHaveLength(0);
});

test('a real session expiry clears the account menu and changes the gate together', async ({ page, context }) => {
  const state = await installFixture(context); await openCourse(page);
  state.user = null; state.access401 = true;
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Đăng nhập để tiếp tục' })).toBeVisible();
  await expect(page.locator('.user-profile-pill-btn')).toHaveCount(0);
  expect(state.orders).toHaveLength(0);
});

test('feature 401 with a valid /me does not cause an access request loop', async ({ page, context }) => {
  const state = await installFixture(context, { user: student }); state.access401 = true;
  await openCourse(page);
  await expect(page.locator('.cd-notice')).toBeVisible();
  await page.waitForTimeout(1200);
  expect(state.accessRequests).toBeLessThan(6);
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Chưa kết nối');
  await expect(page.getByRole('button', { name: 'Đăng nhập để tiếp tục' })).toHaveCount(0);
});

test('account service outage retains the verified identity and offers retry', async ({ page, context }) => {
  const state = await installFixture(context); await openCourse(page);
  state.authUnavailable = true;
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Thử lại kết nối', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đăng nhập để tiếp tục' })).toHaveCount(0);
});

test('cancel legacy order then coupon checkout resumes the new QR and countdown after reload', async ({ page, context }) => {
  const state = await installFixture(context);
  state.amount = 10000;
  state.selected = { courseId, orderCode: 1710000000000, amount: 349000, status: 'PENDING', checkoutUrl: 'https://pay.payos.vn/web/old' };
  state.lastOrder = state.selected;
  await openCourse(page); const dialog = await openCheckout(page);
  await dialog.getByRole('button', { name: 'Hủy đơn cũ để dùng giá / mã mới' }).click();
  await expect(dialog.locator('.checkout-pending')).toHaveCount(0);
  await dialog.getByPlaceholder('Ví dụ: TCC2026').fill('TCC');
  await dialog.getByRole('button', { name: 'Áp dụng', exact: true }).click();
  await expect(dialog.locator('.checkout-coupon__success')).toBeVisible();
  await confirmCheckout(dialog);
  expect(state.selected.amount).toBe(8000); const code = state.selected.orderCode;
  await page.reload(); await expect(page.locator('.checkout-session-dock')).toBeVisible();
  await page.locator('.checkout-session-dock__open').click();
  await expect(page.getByRole('dialog').getByRole('img', { name: 'Mã QR thanh toán PayOS' })).toBeVisible();
  await expect(page.getByRole('dialog').locator('.checkout-deadline')).toBeVisible();
  expect(state.selected.orderCode).toBe(code); expect(state.orders).toHaveLength(1);
});

test('expired deadline hides QR without claiming a failed or successful transaction', async ({ page, context }) => {
  const state = await installFixture(context);
  state.selected = { courseId, orderCode: 1712345678901, amount: 10000, status: 'PENDING', qrCode: 'fixture-qr', checkoutUrl: 'https://pay.payos.vn/web/fixture-only', expiresAt: new Date(Date.now() - 1000).toISOString(), serverNow: new Date().toISOString() };
  state.lastOrder = state.selected;
  await openCourse(page); await page.locator('.checkout-session-dock__open').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('img', { name: 'Mã QR thanh toán PayOS' })).toHaveCount(0);
  await expect(dialog.getByRole('link', { name: 'Mở trang PayOS' })).toHaveCount(0);
  await expect(page.locator('.cd-lesson__state.is-locked')).toHaveCount(2);
  expect(state.orders).toHaveLength(0);
});

test('restarting a failed payment persists dismissal before returning to the form', async ({ page, context }) => {
  const state = await installFixture(context);
  state.selected = { courseId, orderCode: 1712345678901, amount: 349000, status: 'FAILED', expiresAt: new Date(Date.now() + 1800000).toISOString() };
  state.lastOrder = state.selected;
  await openCourse(page); await page.locator('.checkout-session-dock__open').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Tạo đơn PayOS mới' }).click();
  await expect(dialog.locator('#purchase-confirmation')).toBeVisible();
  expect(state.selected).toBeNull();
  await page.reload();
  await expect(page.locator('.checkout-session-dock')).toHaveCount(0);
  const reopened = await openCheckout(page);
  await expect(reopened.locator('#purchase-confirmation')).toBeVisible();
  expect(state.orders).toHaveLength(0);
});

test('switching accounts removes the previous account QR and checkout state', async ({ page, context }) => {
  const state = await installFixture(context); await openCourse(page);
  const dialog = await openCheckout(page); await confirmCheckout(dialog);
  state.user = { ...student, id: 'other-account', username: 'other@example.test', email: 'other@example.test', name: 'Tài khoản khác' };
  state.selected = null;
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await expect(page.getByRole('img', { name: 'Mã QR thanh toán PayOS' })).toHaveCount(0);
  await expect(page.locator('.checkout-session-dock')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const newDialog = await openCheckout(page);
  await expect(newDialog.getByLabel('Email tài khoản nhận quyền học')).toHaveValue('other@example.test');
  expect(state.orders).toHaveLength(1);
});

test('payment result is cleared when switching away from the purchaser account', async ({ page, context }) => {
  const state = await installFixture(context);
  state.selected = { courseId, orderCode: 1712345678901, amount: 10000, status: 'PAID' };
  state.lastOrder = state.selected; state.orderOwner = student.id; state.paid = true;
  await page.goto('/payment/result?orderCode=1712345678901');
  await expect(page.getByRole('heading', { name: 'Quyền học đã được kích hoạt' })).toBeVisible({ timeout: 20_000 });
  state.user = { ...student, id: 'other-account', username: 'other@example.test' };
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await expect(page.getByRole('heading', { name: 'Cần xác thực tài khoản' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Vào khóa học', exact: true })).toHaveCount(0);
  await expect(page.locator('.checkout-session-dock')).toHaveCount(0);
  expect(state.orders).toHaveLength(0);
});

test('logout in another tab updates the course gate and header in this tab', async ({ page, context }) => {
  const state = await installFixture(context); await openCourse(page);
  const other = await context.newPage(); await openCourse(other);
  state.user = null;
  await other.evaluate(() => localStorage.setItem('ueh_tcc_session_signal', `${Date.now()}:logout-fixture`));
  await expect(page.locator('.user-profile-pill-btn')).toHaveCount(0);
  await page.getByRole('button', { name: 'Đăng ký khóa học', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Đăng nhập để tiếp tục' })).toBeVisible();
  expect(state.orders).toHaveLength(0);
});

test('player canvas toggles playback, settings work, resume is account scoped and expiry closes it', async ({ page, context }) => {
  const state = await installFixture(context); state.previewEnabled = true;
  await page.addInitScript(() => {
    window.YT = { PlayerState: { PLAYING: 1, PAUSED: 2, BUFFERING: 3, ENDED: 0 }, Player: class {
      constructor(target, options) {
        this.options = options; this.time = 0; this.state = 2;
        this.frame = document.createElement('iframe'); target.replaceWith(this.frame);
        window.__fixturePlayer = this;
        setTimeout(() => options.events.onReady({ target: this }), 0);
      }
      getIframe() { return this.frame; }
      getDuration() { return 600; }
      getCurrentTime() { return this.time; }
      getPlayerState() { return this.state; }
      playVideo() { this.state = 1; this.options.events.onStateChange({ data: 1 }); }
      pauseVideo() { this.state = 2; this.options.events.onStateChange({ data: 2 }); }
      seekTo(value) { this.time = value; }
      setVolume() {} mute() {} unMute() {}
      setPlaybackRate(value) { this.speed = value; }
      destroy() { this.frame.remove(); }
    } };
  });
  await openCourse(page);
  await page.getByRole('button', { name: /Buổi 01.*Định thức/ }).click();
  const player = page.locator('.learning-player');
  await expect(player.getByRole('button', { name: 'Tạm dừng', exact: true })).toBeEnabled();
  await player.locator('.learning-player__canvas-action').click();
  await expect(player.getByRole('button', { name: 'Phát video', exact: true })).toBeVisible();
  await player.getByRole('button', { name: 'Cài đặt trình phát' }).click();
  await player.getByRole('button', { name: '1.5×', exact: true }).click();
  expect(await page.evaluate(() => window.__fixturePlayer.speed)).toBe(1.5);
  await player.getByRole('button', { name: 'Đóng cài đặt' }).click();
  await player.getByRole('button', { name: 'Phát video', exact: true }).click();
  await page.evaluate(() => { window.__fixturePlayer.time = 123; });
  await player.getByRole('button', { name: 'Đóng bài học' }).click();
  await page.getByRole('button', { name: /Buổi 01.*Định thức/ }).click();
  await expect(player.locator('.learning-player__resume')).toContainText('02:03');
  await player.getByRole('button', { name: 'Xem tiếp', exact: true }).click();
  expect(await page.evaluate(() => window.__fixturePlayer.time)).toBe(123);
  state.user = null;
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-auth-check-required')));
  await expect(player).toHaveCount(0);
});
