// Extract the written lesson region from captured video frames, with no generated content.
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
const captures = new URL('../../artifacts/color-refinement/course-frames/',import.meta.url);
const output = new URL('../public/images/courses/',import.meta.url);
await mkdir(output,{recursive:true});
const sources = JSON.parse(await readFile(new URL('sources.json',captures),'utf8'));
const crops = {
  'lesson-partial-derivatives':[250,143,930,620],
  'lesson-lagrange':[176,150,939,620],
  'lesson-differential-equations':[219,168,936,620]
};
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage();
const report=[];
try {
  for(const source of sources) {
    const bytes=await readFile(new URL(`${source.name}.png`,captures));
    const encoded=await page.evaluate(async ({data,crop})=>{
      const photo=new Image();photo.src=`data:image/png;base64,${data}`;await photo.decode();
      const [x,y,right,bottom]=crop, width=right-x, height=bottom-y;
      const canvas=document.createElement('canvas');canvas.width=768;canvas.height=488;
      const context=canvas.getContext('2d'),scale=Math.min(canvas.width/width,canvas.height/height);
      context.fillStyle='#171717';context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(photo,x,y,width,height,(canvas.width-width*scale)/2,(canvas.height-height*scale)/2,width*scale,height*scale);
      return canvas.toDataURL('image/webp',.92);
    },{data:bytes.toString('base64'),crop:crops[source.name]});
    const delivered=Buffer.from(encoded.split(',')[1],'base64');
    const temporary=new URL(`${source.name}.webp.tmp`,output);await writeFile(temporary,delivered);await rename(temporary,new URL(`${source.name}.webp`,output));
    report.push({asset:`${source.name}.webp`,video:source.source,seconds:source.time,crop_pixels:crops[source.name],original_size:[1280,720],output_size:[768,488],bytes:delivered.length});
  }
} finally {await browser.close();}
await writeFile(new URL('sources.json',output),JSON.stringify({sources:report},null,2));console.log(JSON.stringify(report));
