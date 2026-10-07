// Servidor estático mínimo pra testar o Caixinha em http://localhost:8766/ (sem criar conta no Firebase).
// Uso: node instrucoes/apuracao/serve.js   (a partir da raiz do projeto)
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };
http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/') p = '/Planilha Financeiro.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end('nf'); }
  s.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(s);
}).listen(8766, () => console.log('Caixinha em http://localhost:8766/'));
