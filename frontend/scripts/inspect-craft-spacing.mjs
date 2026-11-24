import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../../artifacts/color-refinement/craft/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto('https://www.craft.do/',{waitUntil:'domcontentloaded'});
  const quote=page.getByText('I can make my notes',{exact:false}).first();
  await quote.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({path:fileURLToPath(new URL('spacing-quote.png',output))});
  const metrics=await quote.evaluate(node=>{
    const result=[];
    for(let i=0;node&&i<5;i++,node=node.parentElement) {
      const style=getComputedStyle(node),box=node.getBoundingClientRect();
      result.push({tag:node.tagName,class:node.className,width:box.width,height:box.height,padding:style.padding,margin:style.margin,font:style.font,lineHeight:style.lineHeight,gap:style.gap});
    }
    return result;
  });
  await writeFile(new URL('spacing.json',output),JSON.stringify(metrics,null,2));
  console.log(JSON.stringify(metrics,null,2));
} finally {await browser.close();}
