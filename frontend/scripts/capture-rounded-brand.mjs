import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/student-brand/rounded/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await page.addInitScript(()=>localStorage.setItem('ueh_tcc_theme','light'));
try {
 await page.goto('http://localhost:5174/');
 await page.locator('.navbar-logo .brand-math').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.navbar-logo').screenshot({path:fileURLToPath(new URL('header-logo.png',output)),scale:'css'});
 await page.screenshot({path:fileURLToPath(new URL('header-1440.png',output))});
 await page.locator('#footer').scrollIntoViewIfNeeded();
 await page.locator('.footer-logo').screenshot({path:fileURLToPath(new URL('footer-logo.png',output))});
 const samples=await page.locator('.brand-wordmark').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,font:getComputedStyle(node).fontFamily,mathFont:getComputedStyle(node.querySelector('.brand-math')).fontFamily,coinyLoaded:document.fonts.check('20px "Coiny Brand"','M4A')})));
 await page.setViewportSize({width:390,height:900});
 await page.goto('http://localhost:5174/');
 await page.locator('.navbar-logo .brand-math').waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:fileURLToPath(new URL('header-390.png',output))});
 await writeFile(new URL('fonts.json',output),JSON.stringify(samples,null,2));
 console.log(JSON.stringify(samples));
} finally {await browser.close();}
