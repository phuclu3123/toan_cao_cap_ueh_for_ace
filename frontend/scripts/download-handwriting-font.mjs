// Reproducible local font assets; only the three Latin subsets used by this site.
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
const directory=new URL('../public/fonts/oooh-baby/',import.meta.url);
await mkdir(directory,{recursive:true});
const atomic=async(path,data)=>{
  const bytes=Buffer.from(data),old=await readFile(path).catch(()=>null);
  if(old?.equals(bytes)) return;
  const temporary=new URL(`${path.href}.tmp`);await writeFile(temporary,bytes);await rename(temporary,path);
};
const cssURL='https://fonts.googleapis.com/css2?family=Oooh+Baby&display=swap';
const response=await fetch(cssURL,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok) throw new Error(`Font stylesheet: ${response.status}`);
const source=await response.text(),faces=[];
for(const match of source.matchAll(/\/\*\s*(vietnamese|latin-ext|latin)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)) {
  const [,subset,block]=match,style=/font-style:\s*(\w+)/.exec(block)?.[1];
  const remote=/url\((https:[^)]+)\)/.exec(block)?.[1];
  if(!style||!remote||new URL(remote).hostname!=='fonts.gstatic.com') throw new Error('Unexpected font source.');
  const font=await fetch(remote);if(!font.ok) throw new Error(`Font download: ${font.status}`);
  const name=`${style}-${subset}.woff2`;
  await atomic(new URL(name,directory),new Uint8Array(await font.arrayBuffer()));
  faces.push(`/* ${subset} */\n${block.replace(remote,`/fonts/oooh-baby/${name}`)}`);
}
if(faces.length!==3) throw new Error(`Expected three font subsets, received ${faces.length}.`);
await atomic(new URL('../src/assets/styles/HandwritingType.css',import.meta.url),`${faces.join('\n')}\n`);
const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/ooohbaby/OFL.txt');
if(!license.ok) throw new Error('Font license unavailable.');
await atomic(new URL('OFL.txt',directory),await license.text());
console.log('Stored original Oooh Baby handwriting font with Vietnamese and OFL license.');
