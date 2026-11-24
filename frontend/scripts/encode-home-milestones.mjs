// Web delivery encoding only. Original photographs remain unchanged in artifacts.
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
const names = ['provincial-2022','commendation-2023','exam-card-2024','commendation-2022'];
const originals = new URL('../../artifacts/color-refinement/milestones/originals/', import.meta.url);
const assets = new URL('../public/images/home/milestones/', import.meta.url);
await mkdir(assets, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage();
const results = [];
try {
  for (const name of names) {
    const bytes = await readFile(new URL(`${name}.jpg`, originals));
    const encoded = await page.evaluate(async data => {
      const photo = new Image();
      photo.src = `data:image/jpeg;base64,${data}`;
      await photo.decode();
      const scale = Math.min(1,960/photo.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(photo.naturalWidth*scale);
      canvas.height = Math.round(photo.naturalHeight*scale);
      canvas.getContext('2d').drawImage(photo,0,0,canvas.width,canvas.height);
      return {width:canvas.width,height:canvas.height,data:canvas.toDataURL('image/webp',.9)};
    },bytes.toString('base64'));
    if (!encoded.data.startsWith('data:image/webp;')) throw Error('WebP encoder unavailable');
    const output = Buffer.from(encoded.data.split(',')[1],'base64');
    const temporary = new URL(`${name}.webp.tmp`,assets);
    await writeFile(temporary,output);
    await rename(temporary,new URL(`${name}.webp`,assets));
    results.push({name,width:encoded.width,height:encoded.height,originalBytes:bytes.length,deliveryBytes:output.length});
  }
} finally { await browser.close(); }
await writeFile(new URL('../encoding.json',originals),JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
