import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('https://www.craft.do/', { waitUntil: 'domcontentloaded' });
  const heading = page.locator('h2,h3').filter({ hasText: 'Imagine the possibilities' }).first();
  await heading.scrollIntoViewIfNeeded();
  const data = await heading.evaluate(node => {
    const panel = node.closest('.shadow-block');
    return Array.from(panel.querySelectorAll('*')).flatMap(element => {
      const style = getComputedStyle(element);
      if (element.tagName !== 'IMG' && style.backgroundImage === 'none') return [];
      return [{ tag: element.tagName, class: element.className, src: element.currentSrc || '',
        background: style.backgroundImage, opacity: style.opacity, blend: style.mixBlendMode,
        position: style.position, size: [element.clientWidth, element.clientHeight] }];
    });
  });
  await writeFile(new URL('../../artifacts/color-refinement/craft/materials.json', import.meta.url), JSON.stringify(data,null,2));
  console.log(JSON.stringify(data.filter(item => item.position === 'absolute' || item.background !== 'none'),null,2));
} finally { await browser.close(); }
