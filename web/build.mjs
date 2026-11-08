import { cp, mkdir, rm, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['index.html', 'style.css', 'game.js', 'telemetry.js'];
const assets = ['favicon.svg', 'hamster.svg', 'courier.svg', 'share.png'];
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const file of files) await cp(resolve(root, file), resolve(root, 'dist', file), { recursive: true });
await mkdir(resolve(root, 'dist/assets'), { recursive: true });
for (const file of assets) await cp(resolve(root, 'assets', file), resolve(root, 'dist/assets', file));
const html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
if (/\b(?:src|href)=["']\//.test(html)) throw new Error('Static assets must use relative URLs');
for (const file of ['game.js', 'telemetry.js', 'style.css', 'assets/favicon.svg', 'assets/share.png']) {
  if (!html.includes('./' + file)) throw new Error('Missing relative reference: ' + file);
}
console.log('Built dist/: complete static game, telemetry and local assets; relative URLs verified.');
