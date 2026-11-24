// Original deterministic texture, not a downloaded Craft asset. Generated once.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output = new URL('../public/textures/',import.meta.url);
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage();
const textures = await page.evaluate(() => {
  const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const context=canvas.getContext('2d'),image=context.createImageData(size,size);
  let seed=751396;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const grids=[4,16,64].map(step=>{const side=size/step;return{step,side,values:Array.from({length:side*side},()=>random())};});
  const noise=(x,y,grid)=>{
    const fx=x/grid.step,fy=y/grid.step,ix=Math.floor(fx),iy=Math.floor(fy);
    const u=(fx-ix)**2*(3-2*(fx-ix)),v=(fy-iy)**2*(3-2*(fy-iy));
    const at=(dx,dy)=>grid.values[((iy+dy)%grid.side)*grid.side+((ix+dx)%grid.side)];
    return (at(0,0)*(1-u)+at(1,0)*u)*(1-v)+(at(0,1)*(1-u)+at(1,1)*u)*v;
  };
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const cloud=grids.reduce((sum,grid,index)=>sum+(noise(x,y,grid)-.5)*[.5,.3,.2][index],0);
    const signal=(random()-.5)*.9+cloud*.12;
    const i=(y*size+x)*4,value=signal>0?255:0;
    image.data[i]=image.data[i+1]=image.data[i+2]=value;
    image.data[i+3]=Math.round(Math.min(32,Math.abs(signal)*60+random()*4)/4)*4;
  }
  context.putImageData(image,0,0);
  const grain=canvas.toDataURL('image/webp',.8);
  const fibers=document.createElement('canvas');fibers.width=fibers.height=512;
  const fiberContext=fibers.getContext('2d'),fiberData=fiberContext.createImageData(512,512);
  // A neutral, opaque luminance map for overlay blending: clouds plus fine fibers.
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const xx=x/2,yy=y/2;
    const cloud=grids.reduce((sum,grid,index)=>sum+(noise(xx,yy,grid)-.5)*[.45,.35,.2][index],0);
    const fine=(random()-.5)*24;
    const i=(y*512+x)*4,value=Math.round(128+cloud*18+fine);
    fiberData.data[i]=fiberData.data[i+1]=fiberData.data[i+2]=value;fiberData.data[i+3]=255;
  }
  fiberContext.putImageData(fiberData,0,0);
  return {grain,fibers:fibers.toDataURL('image/webp',.72)};
});
for (const [name,url] of Object.entries(textures)) {
  const bytes=Buffer.from(url.split(',')[1],'base64');
  await writeFile(new URL(`paper-${name}.webp`,output),bytes);
  console.log(`Original paper ${name}: ${bytes.length} bytes.`);
}
await browser.close();
