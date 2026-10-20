// Gera ferramentas/teste-escuro/p1..p5.html: cópias mínimas do app no tema escuro, cada uma com uma declaração
// diferente de tema no <head>/CSS, para descobrir (no Samsung Internet com modo escuro ligado) qual delas
// faz o navegador PARAR de escurecer a página por cima. Uso: node ferramentas/gerar-teste-escuro.js
const fs = require('fs'), path = require('path');
const out = path.resolve(__dirname, 'teste-escuro');
fs.mkdirSync(out, { recursive: true });

const CLARO = '--bg:#f6f3ea;--surface:#fffdf7;--surface-2:#f1ede1;--border:#e3dcc9;--text:#1d1f16;--text-muted:#5e604f;--primary:#16842f;--primary-ink:#fff;--coin:#f6c22c;--icon-nav:#5e604f;';
const ESCURO = '--bg:#11130e;--surface:#1b1f17;--surface-2:#2b3123;--border:#4d5742;--text:#f2f4e6;--text-muted:#c3c7b1;--primary:#3cbf57;--primary-ink:#0b1709;--coin:#f6c22c;--icon-nav:#d4d8c2;';

const VARIANTES = {
  p1: { nome: 'P1 — como o app é hoje', desc: 'meta "only light"; tema escuro aplicado por JavaScript depois do carregamento.',
    head: '<meta name="color-scheme" content="only light">',
    css: `:root{${CLARO}color-scheme:light;} html.dark{${ESCURO}color-scheme:dark;}`,
    htmlAttr: '', js: 'window.addEventListener("load",()=>setTimeout(()=>document.documentElement.classList.add("dark"),300));' },
  p2: { nome: 'P2 — escuro desde o primeiro byte', desc: '<html class="dark"> já no HTML, meta "dark" e color-scheme: dark.',
    head: '<meta name="color-scheme" content="dark">',
    css: `:root{${CLARO}color-scheme:light;} html.dark{${ESCURO}color-scheme:dark;}`,
    htmlAttr: ' class="dark"', js: '' },
  p3: { nome: 'P3 — claro e escuro declarados + regra do sistema', desc: 'meta "light dark" e @media (prefers-color-scheme: dark) com as cores escuras (sem classe, sem JavaScript).',
    head: '<meta name="color-scheme" content="light dark">',
    css: `:root{${CLARO}color-scheme:light dark;} @media (prefers-color-scheme:dark){:root{${ESCURO}}}`,
    htmlAttr: '', js: '' },
  p4: { nome: 'P4 — sem declarar color-scheme, só a regra do sistema', desc: 'nenhuma meta color-scheme e nenhum color-scheme no CSS; só @media (prefers-color-scheme: dark).',
    head: '',
    css: `:root{${CLARO}} @media (prefers-color-scheme:dark){:root{${ESCURO}}}`,
    htmlAttr: '', js: '' },
  p5: { nome: 'P5 — controle sem nenhuma declaração', desc: 'sem meta, sem color-scheme, sem @media; tema escuro por JavaScript depois do carregamento.',
    head: '',
    css: `:root{${CLARO}} html.dark{${ESCURO}}`,
    htmlAttr: '', js: 'window.addEventListener("load",()=>setTimeout(()=>document.documentElement.classList.add("dark"),300));' }
};

const ICONES = ['home', 'receipt', 'pie', 'bank', 'gear'];
const pagina = (id, v) => `<!DOCTYPE html>
<html lang="pt-BR"${v.htmlAttr}>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.nome}</title>
${v.head}
<style>
${v.css}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.4 system-ui,sans-serif;padding-bottom:90px;}
.topo{display:flex;align-items:center;gap:10px;padding:14px 16px;font-weight:800;font-size:1.4rem;}
.topo img{width:36px;height:auto;image-rendering:pixelated;}
.info{margin:0 16px 12px;padding:12px;border:1.5px dashed var(--border);border-radius:12px;font-size:.85rem;color:var(--text-muted);}
.info b{color:var(--text);}
.card{margin:0 16px 12px;padding:16px;background:var(--surface);border:1.5px solid var(--border);border-radius:16px;box-shadow:0 3px 0 var(--border);}
.card h3{margin:0 0 6px;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;color:var(--text-muted);}
.card .v{font-size:1.6rem;font-weight:800;}
.lock{margin:0 16px 12px;padding:16px;background:var(--surface);border:1.5px solid var(--border);border-radius:16px;display:flex;align-items:center;gap:14px;}
.lock .emoji{width:64px;height:64px;border-radius:16px;background:var(--coin);border:2px solid #1d1f16;box-shadow:0 3px 0 #1d1f16;display:flex;align-items:center;justify-content:center;flex:none;}
.px-ico{display:inline-block;width:24px;height:24px;background-color:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat;}
.lock .emoji .px-ico{width:36px;height:36px;color:#1d1f16;}
nav{position:fixed;left:0;right:0;bottom:0;display:flex;background:var(--surface);border-top:1.5px solid var(--border);padding:8px 4px calc(8px + env(safe-area-inset-bottom));}
nav span{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:.7rem;color:var(--text-muted);}
nav .px-ico{color:var(--icon-nav);}
nav span.on{color:var(--primary);font-weight:800;} nav span.on .px-ico{color:var(--primary);}
a{color:var(--primary);}
</style>
<script>${v.js}</script>
</head>
<body>
<div class="topo"><img src="../../assets/logo-moeda.png" alt="">caixinha</div>
<div class="info"><b>${v.nome}</b><br>${v.desc}<br><br><b>Como deve ficar:</b> fundo quase preto esverdeado, cartões um pouco mais claros, ícones <b>claros e bem visíveis</b> na barra de baixo, caixa do cadeado <b>dourada</b> com cadeado preto, moeda com contorno <b>preto</b>.</div>
<div class="card"><h3>Saldo em contas</h3><div class="v">R$ 1.234,56</div></div>
<div class="lock"><div class="emoji"><span class="px-ico" style="--i:url(../../assets/icons/lock.svg)"></span></div><div><b>Caixinha trancada</b><br><span style="color:var(--text-muted)">Digite seu PIN para continuar</span></div></div>
<div class="card"><h3>Ícones</h3><div style="display:flex;gap:14px;color:var(--text)">${ICONES.map(i => `<span class="px-ico" style="--i:url(../../assets/icons/${i}.svg)"></span>`).join('')}</div></div>
<p style="margin:0 16px"><a href="./index.html">← voltar à lista de testes</a></p>
<nav>${ICONES.map((i, k) => `<span${k === 0 ? ' class="on"' : ''}><span class="px-ico" style="--i:url(../../assets/icons/${i}.svg)"></span>${['Início', 'Lanç.', 'Gráf.', 'Contas', 'Config'][k]}</span>`).join('')}</nav>
</body>
</html>
`;

for (const [id, v] of Object.entries(VARIANTES)) fs.writeFileSync(path.join(out, id + '.html'), pagina(id, v));
fs.writeFileSync(path.join(out, 'index.html'), `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Testes de tema escuro</title>
<style>body{font:17px/1.5 system-ui,sans-serif;margin:0;padding:20px;max-width:560px;}li{margin:10px 0;}small{color:#555}</style></head>
<body><h1>Testes de tema escuro</h1>
<p>Abra cada página no Samsung Internet com o <b>modo escuro do celular ligado</b>. Em cada uma, confira se os ícones da barra de baixo ficam claros, se a caixa do cadeado é dourada e se a moeda tem contorno preto. Mande um print de cada (ou diga quais estão certas).</p>
<ol>${Object.entries(VARIANTES).map(([id, v]) => `<li><a href="./${id}.html">${v.nome}</a><br><small>${v.desc}</small></li>`).join('')}</ol>
</body></html>
`);
console.log('geradas:', Object.keys(VARIANTES).join(', '));
