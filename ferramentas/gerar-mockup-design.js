// Gera o pacote para o Claude Design: um mockup ESTÁTICO com as telas reais do app (HTML renderizado com os dados de seed.js),
// o CSS real do site e as pastas de ícones. Não precisa de navegador: roda o script do app num sandbox com um "document" de mentira.
// Uso (raiz do projeto):  node ferramentas/gerar-mockup-design.js [pasta-de-saida]
// Saída padrão: design/pacotes/retoques/  (pasta ignorada pelo git)
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.resolve(__dirname, '..');
const saida = path.resolve(process.argv[2] || path.join(raiz, 'design', 'pacotes', 'retoques'));
const html = fs.readFileSync(path.join(raiz, 'Planilha Financeiro.html'), 'utf8');
const script = html.match(/<script>\n([\s\S]*?)<\/script>/)[1];
const estilo = html.match(/<style>\n([\s\S]*?)<\/style>/)[1];
const seed = fs.readFileSync(path.join(__dirname, 'seed.js'), 'utf8');
const bloco = (de, ate) => { const i = html.indexOf(de), j = html.indexOf(ate, i); if (i < 0 || j < 0) throw new Error('bloco não achado: ' + de); return html.slice(i, j); };
const semHidden = s => s.replace(/ class="hidden"/, '');

/* ---- "document" permissivo: guarda o innerHTML de cada id e aceita qualquer chamada ---- */
const guardado = {};
function permissivo(id) {
  const dados = { innerHTML: '', textContent: '', value: '', hidden: false };
  const alvo = function () {};
  const p = new Proxy(alvo, {
    get(_, k) {
      if (k === Symbol.toPrimitive) return () => '';
      if (k in dados) return dados[k];
      if (k === 'classList') return { add() {}, remove() {}, toggle() {}, contains: () => false };
      if (k === 'dataset' || k === 'style') return {};
      if (k === 'querySelectorAll' || k === 'getElementsByTagName') return () => [];
      if (k === 'children' || k === 'childNodes' || k === 'options') return [];
      if (k === 'then') return undefined;
      return permissivo();
    },
    set(_, k, v) { dados[k] = v; if (id && (k === 'innerHTML')) guardado[id] = v; return true; },
    apply() { return permissivo(); },
    construct() { return permissivo(); }
  });
  return p;
}
const elementos = {};
const documento = {
  getElementById: id => elementos[id] || (elementos[id] = permissivo(id)),
  querySelector: () => permissivo(), querySelectorAll: () => [],
  createElement: () => permissivo(), addEventListener() {}, removeEventListener() {},
  documentElement: permissivo(), body: permissivo(), head: permissivo(), activeElement: null, hidden: false
};
const memoria = {};
const ctx = {
  console, Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp, Error, Map, Set, Promise, parseInt, parseFloat, isNaN, isFinite,
  encodeURIComponent, decodeURIComponent, Intl, TextEncoder, URL, Blob: function () {}, FileReader: function () {},
  crypto: require('crypto').webcrypto, document: documento,
  localStorage: { getItem: k => (k in memoria ? memoria[k] : null), setItem: (k, v) => { memoria[k] = String(v); }, removeItem: k => { delete memoria[k]; } },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  history: { state: null, pushState() {}, back() {}, replaceState() {} },
  location: { href: 'file:///app.html', protocol: 'file:', hostname: '', reload() {}, search: '', hash: '' },
  navigator: { userAgent: 'node', serviceWorker: null, standalone: false },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0,
  addEventListener() {}, removeEventListener() {}, alert() {}, confirm: () => true, prompt: () => null, scrollTo() {},
  MutationObserver: function () { this.observe = () => {}; this.disconnect = () => {}; }, ResizeObserver: function () { this.observe = () => {}; }, IntersectionObserver: function () { this.observe = () => {}; },
  Event: function () {}, FormData: function () { return { get: () => '' }; }, innerWidth: 1024, innerHeight: 768
};
ctx.window = ctx; ctx.self = ctx; ctx.top = ctx;
vm.createContext(ctx);
// o script termina chamando init(); `state` precisa existir antes do seed
vm.runInContext(script, ctx);
vm.runInContext(seed, ctx);
const run = c => vm.runInContext(c, ctx);

/* ---- captura das telas ---- */
const telas = [];
const moldura = (titulo, nota, corpo, extra) => telas.push({ titulo, nota, corpo, extra: extra || '' });
const aba = (nome, seedTab) => { run(`window.__seed(${JSON.stringify(seedTab || nome)})`); return guardado['tab-' + nome]; };
const topo = '<div class="topbar"><div class="brand"><div class="brand-lockup"><img src="assets/logo-moeda.svg" alt=""><span>caixinha</span></div></div><div id="seletorPerfil"></div></div>';
const nav = ativa => bloco('<nav class="tabs">', '</nav>').replace(/<button data-tab="([^"]+)"/g, (m, t) => `<button data-tab="${t}"${t === ativa ? ' class="active"' : ''}`) + '</nav>';
const appFrame = (ativa, conteudo) => `<div class="app-frame">${topo}${nav(ativa)}<main><section class="tab active">${conteudo}</section></main></div>`;
const modal = conteudo => `<div class="modal-frame"><div class="modal-card">${conteudo}</div></div>`;

moldura('Carregamento', 'Fundo em gradiente + moeda girando (sprite de 12 quadros).', semHidden(bloco('<div id="loadingScreen">', '<div id="loginScreen"')));
moldura('Login', 'Entrar / criar conta / esqueci a senha.', semHidden(bloco('<div id="loginScreen"', '<div id="gateScreen"')));
moldura('PIN (tela trancada)', 'As caixinhas do PIN são preenchidas por JS (aqui, 2 de 4).', semHidden(bloco('<div id="lockScreen"', '<div id="app"'))
  .replace('<div class="pin-boxes" id="pinBoxes" aria-hidden="true"></div>', '<div class="pin-boxes" id="pinBoxes" aria-hidden="true"><span class="filled"><i class="px-dot"></i></span><span class="filled"><i class="px-dot"></i></span><span></span><span></span></div>'));
moldura('Início', 'Cards, painel de gráfico (botões trocam tipo e agrupamento), próximos vencimentos, orçamento e cartões.', appFrame('dashboard', aba('dashboard')));
moldura('Gráficos (aba nova)', 'KPIs do mês, 2 painéis interativos, comparação com o mês anterior, maiores gastos.', appFrame('graficos', aba('graficos')));
moldura('Lançamentos', 'Navegação de mês, filtros, totais e lista (no celular tocar na linha edita).', appFrame('lancamentos', aba('lancamentos')));
moldura('Contas e cartões', '', appFrame('contas', aba('contas')));
moldura('Fixos, parcelados e financiamentos', 'Aba chamada "Fixos" na barra.', appFrame('parcelamentos', aba('parcelamentos')));
moldura('Investimentos', '', appFrame('investimentos', aba('investimentos')));
run("window.__seed('config'); secaoConfigAberta=null;"); run('renderConfig()');
moldura('Config — tudo fechado', 'Sanfona: uma seção aberta por vez, resumo na própria linha.', appFrame('config', guardado['tab-config']));
run("secaoConfigAberta='categorias'; catAbertos.despesa=true; catSubAbertas.add(state.categorias.find(c=>c.nome==='Mercado').id); renderConfig();");
moldura('Config — Categorias e subcategorias', 'Grupos Despesas/Receitas recolhíveis, busca, botão "N subs" abre a lista de subcategorias.', appFrame('config', guardado['tab-config']));
run("secaoConfigAberta='seguranca'; renderConfig();");
moldura('Config — Segurança', 'PIN, bloqueio ao minimizar, sessão.', appFrame('config', guardado['tab-config']));

run("window.__seed('dashboard'); abrirFormTransacao();");
moldura('Modal — Novo lançamento', 'Seletor Despesa/Receita/Transferência; "Parcelas já pagas" e a prévia só aparecem no crédito com 2+ parcelas; subcategoria é opcional.', modal(guardado['modalCard']));
run('abrirFormConta()');
moldura('Modal — Nova conta', 'Botão de fechar (X) no canto, campos, cores.', modal(guardado['modalCard']));
run('abrirFormRecorrencia()');
moldura('Modal — Novo fixo', '', modal(guardado['modalCard']));
run('abrirFormFinanciamento()');
moldura('Modal — Novo financiamento', '', modal(guardado['modalCard']));
run('abrirFormCartao()');
moldura('Modal — Novo cartão', '', modal(guardado['modalCard']));

/* ---- montagem ---- */
const mockCss = `
/* ===== SÓ DO MOCKUP (não faz parte do site) ===== */
body{padding-bottom:40px !important;background:var(--bg);}
.mock-top{position:sticky;top:0;z-index:200;display:flex;gap:12px;align-items:center;justify-content:space-between;padding:10px 20px;background:var(--surface);border-bottom:1.5px solid var(--border);}
.mock-top b{font-size:.95rem;} .mock-top button{padding:8px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface-2);font-weight:700;}
.mock-sec{max-width:1120px;margin:34px auto;padding:0 20px;}
.mock-sec h2{margin:0 0 4px;font-family:var(--font-pixel);font-size:1.4rem;}
.mock-sec .nota{margin:0 0 12px;color:var(--text-muted);font-size:.9rem;}
.app-frame{border:1.5px dashed var(--border);border-radius:18px;padding:0 20px 24px;background:var(--bg);}
.app-frame nav.tabs{position:static;}
.modal-frame{max-width:560px;margin:0 auto;padding:30px 20px;background:rgba(0,0,0,.35);border-radius:18px;}
.modal-frame .modal-card{border-radius:22px;border:2px solid var(--line);box-shadow:var(--shadow-pop);max-height:none;}
.hidden{display:revert !important;} .modal-frame .hidden,.app-frame .hidden{display:none !important;}
#loadingScreen,#loginScreen,#lockScreen{position:relative !important;inset:auto !important;min-height:560px;border-radius:18px;z-index:0;}
.fatia,.bh-fill,.col-bar,.linha-dr{animation:none !important;} .linha-dr{stroke-dashoffset:0 !important;}
section.tab{animation:none !important;}
`;
const tema = `<script>/* só do mockup: alterna claro/escuro */
document.getElementById('tema').onclick=function(){document.documentElement.classList.toggle('dark');};</script>`;
// seções fechadas da Config vêm com o corpo montado (escondido): tira para o mockup ficar leve e sem confusão
const semCorposFechados = h => h.replace(/(<div class="acc-body"[^>]*\bhidden>)[\s\S]*?(<\/div>\s*<\/section>)/g, '$1$2');
const secoes = telas.map((t, i) => `
<section class="mock-sec" id="tela-${i + 1}">
  <h2>${i + 1}. ${t.titulo}</h2>${t.nota ? `<p class="nota">${t.nota}</p>` : ''}
  ${semCorposFechados(t.corpo)}
</section>`).join('\n');
const saidaHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Caixinha — mockup para retoques de design</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Pixelify+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
${estilo}
${mockCss}
</style>
</head>
<body>
<div class="mock-top"><b>Caixinha — ${telas.length} telas (CSS real do site)</b><button id="tema" type="button">Alternar claro/escuro</button></div>
${secoes}
${tema}
</body>
</html>
`;
fs.mkdirSync(saida, { recursive: true });
fs.writeFileSync(path.join(saida, 'caixinha-design.html'), saidaHtml);
// ícones e imagens que o CSS/HTML referenciam (mesmos caminhos relativos do site)
const copiar = (de, para) => { fs.mkdirSync(path.dirname(para), { recursive: true }); fs.copyFileSync(de, para); };
for (const f of fs.readdirSync(path.join(raiz, 'assets', 'icons'))) copiar(path.join(raiz, 'assets', 'icons', f), path.join(saida, 'assets', 'icons', f));
for (const f of ['logo-moeda.svg', 'moeda-girando.svg', 'icon-512.png', 'logo-web.png']) {
  const o = path.join(raiz, 'assets', f); if (fs.existsSync(o)) copiar(o, path.join(saida, 'assets', f));
}
console.log(`${telas.length} telas -> ${path.join(saida, 'caixinha-design.html')} (${Math.round(saidaHtml.length / 1024)} KB)`);
telas.forEach((t, i) => console.log(`  ${i + 1}. ${t.titulo} (${t.corpo.length} car.)`));
