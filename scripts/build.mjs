import { mkdir, readFile, readdir, rm, writeFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const names = (await readdir(path.join(root, 'src'))).filter(name => name.endsWith('.js')).sort();
const files = await Promise.all(names.map(async name => [name, await readFile(path.join(root, 'src', name))]));
const require=createRequire(import.meta.url),E=require('../src/engine.js'),D=require('../src/threats.js');
const bootMaps=[];for(const seed of [1,127301,999999,11]){const s=E.makeSegment(seed,0,null,null,0,200);if(!s)throw Error('No certified boot map '+seed);D.populate(s,null,seed);s.terrainSeed=seed;s.tiles=s.tiles.map(row=>Array.from(row).join(''));s.fluid=[];for(let y=0;y<E.H;y++)for(let x=0;x<E.W;x++){let w=s.water[y][x];if(w)s.fluid.push([y,x,w.pool?1:0,w.run,w.strength,w.lava?1:0])}delete s.water;bootMaps.push(s)}
const bootJSON=JSON.stringify(bootMaps).replaceAll('<','\\u003c');
const originalHTML = await readFile(path.join(root, 'index.html'), 'utf8');
const previewHTML=await readFile(path.join(root,'character-preview.html'),'utf8');
const artFolder=path.join(root,'assets/characters/idle-studies');
const artFiles=await Promise.all((await readdir(artFolder)).sort().map(async name=>[name,await readFile(path.join(artFolder,name))]));
const css = await readFile(path.join(root, 'style.css'));
const digest = createHash('sha256').update(originalHTML).update(previewHTML).update(css).update(bootJSON).update(await readFile(fileURLToPath(import.meta.url)));
for (const [name, content] of files) digest.update(name).update(content);
for (const [name, content] of artFiles) digest.update(name).update(content);
const buildId = digest.digest('hex').slice(0, 16);
const prefix = `./assets/${buildId}/`;
await rm(output, { recursive: true, force: true });
const assets = path.join(output, 'assets', buildId);
await mkdir(assets, { recursive: true });
await cp(artFolder,path.join(assets,'characters/idle-studies'),{recursive:true});
await Promise.all(files.map(([name, content]) => writeFile(path.join(assets, name), content)));
await writeFile(path.join(assets, 'style.css'), css);
const appNames=['engine.js','visuals.js','threats.js','systems.js','homestead.js','animals.js','surface.js','game.js'];
await writeFile(path.join(assets,'app.js'),appNames.map(name=>files.find(([n])=>n===name)[1].toString()).join('\n;\n'));
const workerBundle=['engine.js','threats.js','generator.js'].map(name=>{let source=files.find(([n])=>n===name)[1].toString();return name==='generator.js'?source.replace(/^importScripts\([^;]+\);\s*/,''):source}).join('\n;\n');
await writeFile(path.join(assets,'generator.js'),workerBundle);
const html = originalHTML
  .replace(/<script src="\.\/src\/(?:engine|visuals|threats|systems|homestead|animals|surface|game)\.js"><\/script>/g,'')
  .replace(/href="(?:\.\/)?style\.css"/,`href="${prefix}style.css"`)
  .replace('</body>',`<script type="application/json" id="boot-maps">${bootJSON}</script><script src="${prefix}app.js"></script></body>`)
  .replace('</head>', `<meta name="app-build" content="${buildId}"></head>`);
for (const [, asset] of html.matchAll(/(?:src|href)="(\.\/assets\/[^"?]+)"/g)) await readFile(path.join(output, asset));
await writeFile(path.join(output, 'index.html'), html);
await writeFile(path.join(output,'character-preview.html'),previewHTML.replaceAll('./assets/characters/idle-studies/',prefix+'characters/idle-studies/'));
await writeFile(path.join(output, '_headers'),
  '/\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n/character-preview.html\n  Cache-Control: no-cache\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log(`Built static website → dist/ (build ${buildId}; scripts, CSS and worker share one version).`);
