import { expect, test } from '@playwright/test';

const routes = [
  ['home', '/'],
  ['courses', '/courses'],
  ['course', '/course/tu-hoc-toan-cao-cap'],
  ['resources', '/resources'],
  ['exams', '/exams'],
  ['blog', '/blog']
];

const viewports = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

const safeArtifactName = (value) => value.replace(/[^a-z0-9-]/gi, '-');

test('priority routes render cleanly across production viewports', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const [routeName, path] of routes) {
      pageErrors.length = 0;
      consoleErrors.length = 0;

      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${path} should return an HTML document`).toBeLessThan(400);
      await expect(page.locator('#main-content')).toBeVisible();
      await expect(page.locator('body')).not.toContainText('ERR_NETWORK_ACCESS_DENIED');
      await page.waitForTimeout(250);

      const overflow = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
      }));
      expect(
        Math.max(overflow.document, overflow.body),
        `${path} overflows horizontally at ${viewport.width}px`
      ).toBeLessThanOrEqual(overflow.viewport + 1);

      expect(pageErrors, `${path} emitted page errors`).toEqual([]);
      expect(
        consoleErrors.filter((message) => (
          !message.includes('/api/')
          && !message.includes('Firebase')
          && !message.includes('ERR_CONNECTION_REFUSED')
        )),
        `${path} emitted unexpected console errors`
      ).toEqual([]);

      if (['mobile-360', 'tablet-768', 'desktop-1440'].includes(viewport.name)) {
        await page.screenshot({
          path: `../artifacts/playwright/screens/${safeArtifactName(routeName)}-${viewport.name}.png`,
          fullPage: routeName === 'home'
        });
      }
    }
  }
});

test('home has no dead zone before the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const gap = await page.evaluate(() => {
    const cta = document.querySelector('.enterprise-cta');
    const footer = document.querySelector('#footer');
    if (!cta || !footer) return null;
    const ctaBottom = cta.getBoundingClientRect().bottom + window.scrollY;
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    return footerTop - ctaBottom;
  });

  expect(gap, 'Home CTA and footer must both exist').not.toBeNull();
  expect(gap, 'Unexpected blank space exists before the footer').toBeLessThan(240);
});

test('login dialog is accessible and fits the desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const loginButton = page.locator('.btn-login-nav').first();
  await loginButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.locator('.auth-provider-button')).toHaveCount(2);
  await expect(dialog).not.toContainText('Facebook');

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box.height).toBeLessThanOrEqual(620);
  expect(box.y).toBeGreaterThanOrEqual(12);

  await page.screenshot({
    path: '../artifacts/playwright/screens/auth-dialog-desktop-1440.png'
  });

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(loginButton).toBeFocused();
});
