// Embute os ícones 8-bit (assets/icons/*.svg) em "Planilha Financeiro.html" como caminhos de SVG inline.
// Por quê: o Samsung Internet com modo escuro ligado escurece ícones feitos com máscara + background-color
// (tratados como "fundo"); SVG inline com <path fill=currentColor> resiste (teste A3). Uso: node ferramentas/gerar-icones-inline.js
const fs = require('fs'), path = require('path');
const raiz = path.resolve(__dirname, '..'), arq = path.join(raiz, 'Planilha Financeiro.html');
const NOMES = ['alert', 'bank', 'bill', 'building', 'calendar', 'card', 'chart', 'close', 'edit', 'gear', 'home', 'info', 'lock-open', 'lock', 'moon', 'pause', 'pie', 'play', 'receipt', 'repeat', 'sun', 'trash'];
const mapa = {};
for (const n of NOMES) {
  const rs = [...fs.readFileSync(path.join(raiz, 'assets/icons', n + '.svg'), 'utf8').matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/g)];
  if (!rs.length) throw new Error('sem retângulos em ' + n);
  mapa[n] = rs.map(m => `M${m[1]} ${m[2]}h${m[3]}v${m[4]}h-${m[3]}z`).join('');
}
const bloco = `/*PXICONES:INICIO (gerado por ferramentas/gerar-icones-inline.js; não editar à mão)*/
const ICONES_PX=${JSON.stringify(mapa)};
/* Ícones 8-bit como SVG inline (path, fill=currentColor): o Samsung Internet com modo escuro escurece máscara+background-color. */
function subirIcone(el){
  if(el.classList.contains('ok')) return;
  const m=/icons\\/([\\w-]+)\\.svg/.exec(el.style.getPropertyValue('--i')||''), d=m&&ICONES_PX[m[1]];
  if(!d) return; // sem mapa: continua o ícone por máscara (CSS)
  el.innerHTML='<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true"><path d="'+d+'"/></svg>';
  el.classList.add('ok');
}
document.querySelectorAll('.px-ico').forEach(subirIcone);
new MutationObserver(ms=>{ for(const r of ms) for(const n of r.addedNodes){ if(n.nodeType!==1) continue; if(n.classList.contains('px-ico')) subirIcone(n); n.querySelectorAll('.px-ico:not(.ok)').forEach(subirIcone); } }).observe(document.documentElement,{childList:true,subtree:true});
/*PXICONES:FIM*/
`;
let h = fs.readFileSync(arq, 'utf8');
const a = h.indexOf('/*PXICONES:INICIO'), b = h.indexOf('/*PXICONES:FIM*/');
if (a >= 0 && b > a) h = h.slice(0, a) + bloco.trimEnd() + h.slice(b + '/*PXICONES:FIM*/'.length);
else { const i = h.indexOf('function renderAba(nome){'); if (i < 0) throw new Error('ponto de inserção não achado'); h = h.slice(0, i) + bloco + h.slice(i); }
fs.writeFileSync(arq, h);
console.log('ícones embutidos:', Object.keys(mapa).length, '· bytes:', JSON.stringify(mapa).length);
