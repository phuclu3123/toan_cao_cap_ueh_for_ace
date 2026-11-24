import { mkdir, writeFile } from 'node:fs/promises';
const directory=new URL('../public/fonts/brand-math/',import.meta.url);
await mkdir(directory,{recursive:true});
for(const [family,weight,folder] of [['Comfortaa',700,'comfortaa']]) {
 const source=`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap&text=${encodeURIComponent('α∫')}`;
 const response=await fetch(source,{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'}});
 if(!response.ok)throw Error(`${family}: ${response.status}`);
 const css=await response.text();
 const url=/url\((https:[^)]+)\)/.exec(css)?.[1];
 if(!url||new URL(url).hostname!=='fonts.gstatic.com')throw Error('Unexpected font host');
 const font=await fetch(url);if(!font.ok)throw Error('Font unavailable');
 await writeFile(new URL(`${folder}.woff2`,directory),new Uint8Array(await font.arrayBuffer()));
 const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`);
 if(!license.ok)throw Error('License unavailable');
 await writeFile(new URL(`${folder}-OFL.txt`,directory),await license.text());
 console.log(`${family}: saved alpha/integral subset.`);
}
