// Code-native artwork from the site's original mark; no remote renderer or image API.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const logo = await readFile(new URL('../public/images/brand/aim4a-mark.png',import.meta.url));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#faf8f5"/>
<defs><clipPath id="mark"><circle cx="142" cy="135" r="64"/></clipPath></defs>
<image href="data:image/png;base64,${logo.toString('base64')}" x="46" y="71" width="192" height="128" clip-path="url(#mark)"/>
<g font-family="Segoe UI,Arial,sans-serif" fill="#202720">
<text x="237" y="157" font-size="62" font-weight="700">α∫M4A</text>
<text x="82" y="300" font-size="70" font-weight="650">Math for all</text>
<text x="82" y="385" font-size="60">• Aim for A</text>
<text x="86" y="492" font-size="30">Học hiểu. Làm được.</text>
<text x="86" y="555" font-size="23" fill="#65715b">toancaocapueh.id.vn</text>
</g>
<g stroke="#26382c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
<path d="M806 253q64-23 124 9 62-31 129-9l-2 166q-67-16-127 17-62-33-124-17Z" fill="#c2dfbb"/>
<path d="m930 262 1 174m-97-142q33-5 65 8m-65 29 63 9m64-38 64-10m-64 45 63-11"/>
<path d="m1042 152 10-24 10 25 25 7-25 10-10 24-11-24-25-9Z" fill="#f8e6a4"/>
<path d="M766 475c54 44 101-6 150 26s109 26 164-15" stroke="#edc4b0" stroke-width="9"/>
<path d="m784 178-11-11m-5 30-18-1m333 191 15-3m-7-6 2 16"/>
</g></svg>`;
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.setContent(`<style>body{margin:0}svg{display:block}</style>${svg}`);
  await page.locator('image').evaluate(async image => {
    const probe = new Image(); probe.src = image.getAttribute('href'); await probe.decode();
  });
  await page.screenshot({path:fileURLToPath(new URL('../public/images/brand/aim4a-social-20261125.png',import.meta.url))});
  await writeFile(new URL('../public/images/brand/aim4a-social.svg',import.meta.url),svg);
} finally { await browser.close(); }
console.log('Generated original 1200 × 630 social preview.');
