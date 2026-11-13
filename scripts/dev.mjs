import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const preview = process.argv.includes('--preview');
const base = preview ? path.join(root, 'dist') : root;
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || (preview ? 4173 : 5173));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    const route = path.posix.normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (route !== '/' && route !== '/index.html' && route !== '/character-preview.html' && route !== '/style.css' && !route.startsWith('/src/') && !route.startsWith('/assets/')) {
      response.writeHead(404).end('Not found'); return;
    }
    const location = path.resolve(base, '.' + (route === '/' ? '/index.html' : route));
    if (!location.startsWith(base + path.sep)) { response.writeHead(403).end(); return; }
    if (!(await stat(location)).isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(location)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(location));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(preview ? 'Not found. Run npm run build before npm run preview.' : 'Not found');
  }
});
server.listen(port, () => console.log(`${preview ? 'Preview' : 'Development'}: http://localhost:${port}/`));
