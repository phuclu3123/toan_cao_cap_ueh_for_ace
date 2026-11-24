// Delivery encoding only: preserve alpha and artwork; retain generated originals separately.
import { chromium } from '@playwright/test';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
const names=['faker','rambo','ronaldo','lexus','jupiter'];
const assets=new URL('../public/images/community/collectibles/',import.meta.url);
const originals=new URL('../../artifacts/color-refinement/collectibles/originals/',import.meta.url);
await mkdir(originals,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const report=[];
try{
  await page.goto('http://localhost:5174/favicon.ico');
  for(const name of names){
    const source=new URL(`${name}-v2.png`,assets);
    const bytes=await readFile(source).catch(error=>{if(error.code!=='ENOENT')throw error;return readFile(new URL(`${name}-v2.png`,originals));});
    const result=await page.evaluate(async ({data})=>{
      const image=new Image();image.src=`data:image/png;base64,${data}`;await image.decode();
      const factor=Math.min(1,640/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*factor);canvas.height=Math.round(image.naturalHeight*factor);
      const context=canvas.getContext('2d');context.drawImage(image,0,0,canvas.width,canvas.height);
      return {width:canvas.width,height:canvas.height,data:canvas.toDataURL('image/webp',.9)};
    },{data:bytes.toString('base64')});
    if(!result.data.startsWith('data:image/webp;'))throw Error('WebP encoding unavailable');
    const encoded=Buffer.from(result.data.split(',')[1],'base64'),target=new URL(`${name}-v2.webp`,assets),temporary=new URL(`${name}-v2.webp.tmp`,assets);
    await writeFile(temporary,encoded);await rename(temporary,target);
    await writeFile(new URL(`${name}-v2.png`,originals),bytes);
    report.push({name,width:result.width,height:result.height,sourceBytes:bytes.length,deliveryBytes:encoded.length});
  }
}finally{await browser.close();}
await writeFile(new URL('../encoding.json',originals),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
