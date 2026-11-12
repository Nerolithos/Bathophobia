import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all([
  cp(path.join(root, 'src'), path.join(output, 'src'), { recursive: true }),
  cp(path.join(root, 'style.css'), path.join(output, 'style.css')),
  cp(path.join(root, 'index.html'), path.join(output, 'index.html'))
]);
// Fail the build on a missing browser entry rather than ship a broken static page.
const html = await readFile(path.join(output, 'index.html'), 'utf8');
for (const [, asset] of html.matchAll(/(?:src|href)="(\.\/(?:src\/[^"?]+|style\.css))"/g)) {
  await readFile(path.join(output, asset));
}
await writeFile(path.join(output, '_headers'), '/src/*\n  Cache-Control: public, max-age=0, must-revalidate\n');
console.log('Built static website → dist/ (HTML, CSS, JavaScript and worker; no runtime server).');
