import { mkdir, writeFile } from 'node:fs/promises';
import { courseCoverPalette } from '../src/design/colorPalette.js';
import { readFile, rename } from 'node:fs/promises';
const output = new URL('../public/images/courses/', import.meta.url);
await mkdir(output, { recursive: true });
const covers = [
  { file: 'calculus', label: 'TOÁN CAO CẤP', code: 'f(x)', caption: 'TỪ NỀN TẢNG ĐẾN ỨNG DỤNG', art: '<path d="M360 268H584M381 278V82" opacity=".4"/><path d="M382 254C417 254 429 219 449 169S498 119 577 91" stroke-width="3"/><path d="M410 256L557 104" stroke-dasharray="5 8" opacity=".5"/><circle cx="469" cy="149" r="7" fill="currentColor"/>' },
  { file: 'sql', label: 'DỮ LIỆU / TRUY VẤN', code: 'SQL', caption: 'KẾT NỐI · TRUY VẤN · KHÁM PHÁ', art: '<rect x="365" y="93" width="94" height="160" rx="8"/><rect x="497" y="93" width="94" height="160" rx="8"/><path d="M365 133H459M365 173H459M365 213H459M497 133H591M497 173H591M497 213H591M402 133V253M534 133V253" opacity=".3"/><path d="M460 192C478 192 480 152 496 152" stroke-width="3"/><circle cx="460" cy="192" r="4" fill="currentColor"/><circle cx="496" cy="152" r="4" fill="currentColor"/>' },
  { file: 'practice', label: 'LUYỆN ĐỀ K46 — K50', code: 'A → Z', caption: 'NHẬN DIỆN DẠNG · HIỂU CÁCH GIẢI', art: '<rect x="378" y="80" width="180" height="200" rx="8" transform="rotate(9 468 180)" opacity=".2"/><rect x="363" y="70" width="180" height="200" rx="8"/><path d="M391 103H491M391 124H462M414 161H507M414 199H507M414 237H483" opacity=".4"/><path d="M386 156L392 163L403 150M386 194L392 201L403 188M386 232L392 239L403 226" stroke-width="2.5"/>' },
  { file: 'k51', label: 'TOÁN ỨNG DỤNG', code: 'K51', caption: 'ĐỌC ĐỀ · CHỌN CÁCH · GIẢI CHẮC', art: '<circle cx="475" cy="172" r="94" opacity=".35"/><circle cx="475" cy="172" r="62" opacity=".35"/><path d="M381 172H569M475 78V266" opacity=".3"/><path d="M397 217L446 113L550 203Z" stroke-width="2.5"/><circle cx="446" cy="113" r="5" fill="currentColor"/><circle cx="550" cy="203" r="5" fill="currentColor"/>' }
];
for (const c of covers) {
  Object.assign(c, courseCoverPalette[c.file]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="${c.bg}"/><g fill="none" stroke="${c.muted}" stroke-width=".5" opacity=".15">${Array.from({length:17},(_,i)=>`<path d="M${i*40} 0V360"/>`).join('')}${Array.from({length:10},(_,i)=>`<path d="M0 ${i*40}H640"/>`).join('')}</g><g font-family="Arial,sans-serif" fill="${c.ink}"><text x="596" y="36" text-anchor="end" font-weight="700" font-size="12" letter-spacing="1">α∫M4A</text><text x="36" y="136" font-size="12" font-weight="600" letter-spacing="1.2">${c.label}</text><text x="30" y="229" font-size="84" font-weight="700" letter-spacing="-4">${c.code.replaceAll('&','&amp;')}</text><text x="36" y="319" font-size="10" letter-spacing="1.2">${c.caption}</text></g><g fill="none" stroke="${c.ink}" color="${c.ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${c.art}</g></svg>`;
  const target=new URL(`${c.file}.svg`,output);
  const grain='<filter id="paper-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="3" stitchTiles="stitch" seed="19"/><feColorMatrix type="saturate" values="0"/></filter>';
  const textured=svg.replace('<rect width="640"',`<defs>${grain}</defs><rect width="640"`).replace('<g fill="none"', '<rect width="640" height="360" opacity=".12" filter="url(#paper-grain)" style="mix-blend-mode:soft-light"/><g fill="none"');
  if(await readFile(target,'utf8').catch(()=>'')!==textured) {const temporary=new URL(`${target.href}.tmp`);await writeFile(temporary,textured,'utf8');await rename(temporary,target);}
}
console.log('Wrote four original α∫M4A course covers.');
