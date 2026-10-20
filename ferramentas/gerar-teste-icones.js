// Gera ferramentas/teste-icones/index.html (+ PNGs): maneiras de desenhar os ícones 8-bit e a caixa dourada do cadeado
// para achar as que o Samsung Internet (modo escuro ligado) NÃO escurece. Uso: node ferramentas/gerar-teste-icones.js
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const raiz = path.resolve(__dirname, '..'), out = path.resolve(__dirname, 'teste-icones');
fs.mkdirSync(out, { recursive: true });

const rects = nome => [...fs.readFileSync(path.join(raiz, 'assets/icons', nome + '.svg'), 'utf8').matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/g)].map(m => m.slice(1).map(Number));
const svgRect = (nome, cor, tam) => `<svg viewBox="0 0 12 12" width="${tam}" height="${tam}" fill="${cor}" shape-rendering="crispEdges">${rects(nome).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</svg>`;
const svgPath = (nome, cor, tam) => `<svg viewBox="0 0 12 12" width="${tam}" height="${tam}" shape-rendering="crispEdges"><path fill="${cor}" d="${rects(nome).map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h-${w}z`).join('')}"/></svg>`;

// PNG simples (RGBA) feito à mão: grade 12×12 ampliada ×8, cor sólida onde há retângulo.
function png(nome, [r, g, b]) {
  const E = 8, N = 12 * E, buf = Buffer.alloc(N * (N * 4 + 1));
  const g2 = Array.from({ length: 12 }, () => Array(12).fill(0));
  rects(nome).forEach(([x, y, w, h]) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g2[j][i] = 1; });
  for (let y = 0; y < N; y++) {
    buf[y * (N * 4 + 1)] = 0;
    for (let x = 0; x < N; x++) { const on = g2[Math.floor(y / E)][Math.floor(x / E)], o = y * (N * 4 + 1) + 1 + x * 4; buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = on ? 255 : 0; }
  }
  const crc = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const v of b) c = t[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
  const chunk = (tipo, dados) => { const l = Buffer.alloc(4); l.writeUInt32BE(dados.length); const td = Buffer.concat([Buffer.from(tipo), dados]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(buf)), chunk('IEND', Buffer.alloc(0))]);
}
fs.writeFileSync(path.join(out, 'home-claro.png'), png('home', [212, 216, 194]));
fs.writeFileSync(path.join(out, 'lock-preto.png'), png('lock', [29, 31, 22]));

const ico = (nome, extra = '') => `<span class="px-ico" style="--i:url(../../assets/icons/${nome}.svg);${extra}"></span>`;
const A = [
  ['A1', 'máscara + background-color (como é hoje)', ico('home')],
  ['A2', 'SVG inline com rect', svgRect('home', 'currentColor', 28)],
  ['A3', 'SVG inline com path', svgPath('home', 'currentColor', 28)],
  ['A4', 'PNG claro (img)', '<img src="home-claro.png" width="28" height="28" alt="">'],
  ['A5', 'máscara + gradiente (sem background-color)', `<span class="px-ico" style="--i:url(../../assets/icons/home.svg);background:linear-gradient(currentColor,currentColor)"></span>`],
  ['A6', 'fundo preto + filter invert', `<span class="px-ico" style="--i:url(../../assets/icons/home.svg);background-color:#000;filter:invert(.83)"></span>`],
  ['A7', 'máscara + box-shadow inset', `<span class="px-ico" style="--i:url(../../assets/icons/home.svg);background:none;box-shadow:inset 0 0 0 20px currentColor"></span>`],
  ['A8', 'máscara + border grossa', `<span class="px-ico" style="--i:url(../../assets/icons/home.svg);background:none;box-sizing:border-box;border:14px solid currentColor"></span>`]
];
const caixa = (interior, estilo = '') => `<div class="caixa" style="${estilo}">${interior}</div>`;
const trava = `<span class="px-ico" style="--i:url(../../assets/icons/lock.svg);width:36px;height:36px;background-color:#1d1f16"></span>`;
const B = [
  ['B1', 'background-color (como é hoje)', caixa(trava, 'background:#f6c22c')],
  ['B2', 'gradiente (background-image)', caixa(trava, 'background:linear-gradient(#f6c22c,#f6c22c)')],
  ['B3', 'box-shadow inset', caixa(trava, 'box-shadow:inset 0 0 0 40px #f6c22c')],
  ['B4', 'border dourada grossa', `<div class="caixa" style="border:0;box-shadow:none"><div style="width:0;height:0;border:32px solid #f6c22c;border-radius:16px"></div><span style="position:absolute">${trava}</span></div>`],
  ['B5', 'SVG inline como fundo', `<div class="caixa" style="border:0;box-shadow:none"><svg width="64" height="64" viewBox="0 0 64 64" style="position:absolute;inset:0"><rect width="64" height="64" rx="16" fill="#f6c22c"/></svg>${trava}</div>`],
  ['B6', 'PNG dourado de fundo', caixa(trava, 'background:url(coin-fundo.png) center/100% 100%')],
  ['B7', 'fundo preto + filter (inverte p/ azul-ouro?)', caixa(trava, 'background:#000;filter:invert(1) sepia(1) saturate(4) hue-rotate(-10deg)')]
];

fs.writeFileSync(path.join(out, 'index.html'), `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste: ícones e caixa dourada no Samsung</title>
<meta name="color-scheme" content="only light">
<style>
:root{--bg:#11130e;--surface:#1b1f17;--border:#4d5742;--text:#f2f4e6;--muted:#c3c7b1;--icon:#d4d8c2;--primary:#3cbf57;color-scheme:dark;}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.4 system-ui,sans-serif;padding:14px;}
h1{font-size:1.1rem;margin:0 0 6px;} h2{font-size:.95rem;margin:18px 0 8px;} p{margin:4px 0;color:var(--muted);font-size:.9rem;}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;}
.v{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:10px;text-align:center;font-size:.74rem;color:var(--muted);}
.v b{display:block;font-size:1.3rem;color:var(--text);line-height:1.1;margin-bottom:6px;}
.alvo{height:72px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--icon);}
.px-ico{display:inline-block;width:28px;height:28px;background-color:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat;flex:none;}
.caixa{position:relative;width:64px;height:64px;border-radius:16px;border:2px solid #1d1f16;box-shadow:0 3px 0 #1d1f16;display:flex;align-items:center;justify-content:center;box-sizing:border-box;}
.nota{margin-top:14px;padding:10px;border:1.5px dashed var(--border);border-radius:12px;font-size:.85rem;color:var(--muted);}
a{color:var(--primary);}
</style>
</head>
<body>
<h1>Teste: ícones e caixa dourada</h1>
<p>Abra no Samsung Internet com o <b>modo escuro ligado</b>. Quais letras mostram o ícone <b>claro e visível</b> (seção A) e a caixa <b>dourada</b> com cadeado preto (seção B)?</p>
<h2>A — ícone claro (deve aparecer bege-claro sobre o cartão escuro)</h2>
<div class="grade">${A.map(([l, n, h]) => `<div class="v"><b>${l}</b><div class="alvo">${h}</div>${n}</div>`).join('')}</div>
<h2>B — caixa dourada do cadeado (deve ser dourada, cadeado preto)</h2>
<div class="grade">${B.map(([l, n, h]) => `<div class="v"><b>${l}</b><div class="alvo">${h}</div>${n}</div>`).join('')}</div>
<div class="nota"><b>Como deve ficar:</b> fundo quase preto esverdeado; ícones da seção A em bege-claro; caixas da seção B douradas com o cadeado preto.</div>
</body>
</html>
`);
// PNG dourado liso (para o B6)
{
  const N = 8, buf = Buffer.alloc(N * (N * 4 + 1));
  for (let y = 0; y < N; y++) { buf[y * (N * 4 + 1)] = 0; for (let x = 0; x < N; x++) { const o = y * (N * 4 + 1) + 1 + x * 4; buf[o] = 246; buf[o + 1] = 194; buf[o + 2] = 44; buf[o + 3] = 255; } }
  const crc = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const v of b) c = t[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
  const chunk = (tipo, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(tipo), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(path.join(out, 'coin-fundo.png'), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(buf)), chunk('IEND', Buffer.alloc(0))]));
}
console.log('ok');
