import { readFile, writeFile, rename } from 'node:fs/promises';
import { lightPalette, darkPalette } from '../src/design/colorPalette.js';
const declarations = palette => Object.entries(palette).map(([name,value]) => `  --ui-${name}: ${value};`).join('\n');
const aliases = {
  canvas: 'canvas', 'canvas-subtle': 'soft', surface: 'paper', 'surface-raised': 'soft',
  text: 'ink', 'text-muted': 'muted', 'text-subtle': 'subtle', border: 'line',
  brand: 'accent', 'brand-hover': 'accent-hover', 'brand-active': 'accent-hover', 'on-brand': 'on-accent',
  champagne: 'copper', focus: 'focus', info: 'info', success: 'success', warning: 'warning', danger: 'danger'
};
const css = `/* Generated from src/design/colorPalette.js. Original publication artwork is unchanged. */\n:root {\n  color-scheme: light;\n${declarations(lightPalette)}\n}\n:root[data-theme='dark'] {\n  color-scheme: dark;\n${declarations(darkPalette)}\n}\n:root, :root[data-theme='dark'] {\n${Object.entries(aliases).map(([alias,role]) => `  --color-${alias}: var(--ui-${role});`).join('\n')}\n  --color-border-strong: color-mix(in srgb,var(--ui-ink) 24%,transparent);\n}\n`;
const target = new URL('../src/assets/styles/theme.css', import.meta.url);
if (await readFile(target,'utf8').catch(()=>'') !== css) {
  const temporary = new URL(`${target.href}.tmp`);
  await writeFile(temporary,css,'utf8');
  await rename(temporary,target);
}
console.log('Generated shared light/dark colors.');
