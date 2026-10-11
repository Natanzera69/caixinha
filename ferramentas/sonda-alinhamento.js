// Sonda de alinhamento/proporção: percorre todas as abas, seções da Config e janelas e lista o que está torto.
// Uso (servidor local em http://localhost:8766/ e dados falsos do seed.js):
//   no navegador: carregue /ferramentas/seed.js e /ferramentas/sonda-alinhamento.js (tags <script>) e rode  __varrer('desktop '+innerWidth)
// Só lê a tela (não salva nada). Repita em 1280, 1024, 768 e 375 px. Devolve [[contexto, problema, elemento, detalhe], ...].
// Falsos positivos conhecidos: cartão "Patrimônio líquido" (ocupa 2 linhas de propósito) e títulos de seção com botão ao lado (centrados).
(function () {
  const visivel = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const nome = e => (e.id ? '#' + e.id : '') + '.' + [...e.classList].slice(0, 3).join('.') + ' "' + (e.textContent || '').trim().slice(0, 22) + '"';

  window.__sonda = function (rotulo) {
    const ach = [];
    const modal = document.querySelector('#modalRoot:not(.hidden) #modalCard');
    const alvos = [document.querySelector('section.tab.active') || document.body, ...(modal ? [modal] : [])];
    alvos.forEach(R => {
      // 1) botões: conteúdo centrado na caixa
      R.querySelectorAll('button,.btn,.icon-btn,.chip,.mini,.close-x,.seg button').forEach(b => {
        if (!visivel(b)) return;
        const cs = getComputedStyle(b); if (cs.display === 'none') return;
        const br = b.getBoundingClientRect(), rng = document.createRange(); rng.selectNodeContents(b);
        const cr = rng.getBoundingClientRect(); if (cr.width === 0) return;
        const dx = (cr.left + cr.width / 2) - (br.left + br.width / 2), dy = (cr.top + cr.height / 2) - (br.top + br.height / 2);
        if (Math.abs(dx) > 1.5 && Math.abs(br.width - cr.width) > 3 && cs.textAlign !== 'left' && !/start/.test(cs.justifyContent)) ach.push([rotulo, 'botão fora do centro (x)', nome(b), dx.toFixed(1)]);
        if (Math.abs(dy) > 2) ach.push([rotulo, 'botão fora do centro (y)', nome(b), dy.toFixed(1)]);
      });
      // 2) irmãos na mesma linha com altura/centro diferentes
      R.querySelectorAll('.row2,.sub-line,.sub-nova,.toolbar,.modal-actions,.graf-filtros,.section-title,.mes-nav,.cat-row,.sub-row,.nova-cat>div').forEach(c => {
        const f = [...c.children].filter(visivel); if (f.length < 2) return;
        const rs = f.map(x => x.getBoundingClientRect());
        const linha = f.filter((x, i) => Math.abs(rs[i].top - rs[0].top) < 6); if (linha.length < 2) return;
        const hs = linha.map(x => x.getBoundingClientRect().height), cy = linha.map(x => { const r = x.getBoundingClientRect(); return r.top + r.height / 2; });
        const dh = Math.max(...hs) - Math.min(...hs), dcy = Math.max(...cy) - Math.min(...cy);
        if (dh > 3 && !c.matches('.toolbar,.cat-row,.sub-row,.section-title')) ach.push([rotulo, 'irmãos com alturas diferentes', nome(c), 'dh=' + dh.toFixed(1)]);
        if (dcy > 3) ach.push([rotulo, 'irmãos desalinhados na vertical', nome(c), 'dcy=' + dcy.toFixed(1)]);
      });
      // 3) estouro horizontal
      R.querySelectorAll('*').forEach(e => {
        if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0 && !e.closest('svg') && e.tagName !== 'BUTTON') {
          const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 || r.left < -1) ach.push([rotulo, 'estoura a tela', nome(e), Math.round(e.scrollWidth - e.clientWidth)]);
        }
      });
      // 4) cartões da mesma linha com alturas diferentes
      R.querySelectorAll('.grid,.two-col').forEach(g => {
        const por = new Map();
        [...g.children].filter(visivel).forEach(x => { const t = Math.round(x.getBoundingClientRect().top); (por.get(t) || por.set(t, []).get(t)).push(x); });
        por.forEach(l => { if (l.length > 1 && !l.some(x => x.matches('.hero'))) { const hs = l.map(x => x.getBoundingClientRect().height); if (Math.max(...hs) - Math.min(...hs) > 2) ach.push([rotulo, 'cartões da linha com alturas diferentes', nome(g), hs.map(Math.round).join('/')]); } });
      });
    });
    if (document.documentElement.scrollWidth > innerWidth + 1) ach.push([rotulo, 'página com rolagem horizontal', '', document.documentElement.scrollWidth + '>' + innerWidth]);
    return ach;
  };

  window.__varrer = function (tam) {
    const todos = [];
    for (const tema of [false, true]) {
      document.documentElement.classList.toggle('dark', tema);
      const T = tam + (tema ? ' escuro' : ' claro');
      for (const aba of ['dashboard', 'lancamentos', 'graficos', 'contas', 'parcelamentos', 'investimentos']) {
        window.__seed(aba); window.scrollTo(0, 0); todos.push(...window.__sonda(T + ' · ' + aba));
      }
      window.__seed('config');
      for (const sec of ['geral', 'virada', 'sync', 'backup', 'seguranca', 'categorias', 'subs', 'orcamentos', 'zerar', 'sobre']) {
        secaoConfigAberta = sec; if (sec === 'categorias') { catAbertos.despesa = true; catAbertos.receita = true; }
        renderConfig(); todos.push(...window.__sonda(T + ' · config/' + sec));
      }
      const modais = [
        ['lançamento', () => abrirFormTransacao()],
        ['lançamento-crédito', () => { abrirFormTransacao(); const f = document.getElementById('formTransacao'); f.metodoPagamento.value = 'credito'; f.metodoPagamento.dispatchEvent(new Event('change')); f.parcelas.value = '6'; f.parcelas.dispatchEvent(new Event('input')); f.parcelasPagas.value = '2'; f.parcelasPagas.dispatchEvent(new Event('input')); }],
        ['conta', () => abrirFormConta()], ['cartão', () => abrirFormCartao()], ['fixo', () => abrirFormRecorrencia()],
        ['financiamento', () => abrirFormFinanciamento()], ['investimento', () => abrirFormInvestimento()],
        ['pagar fatura', () => pagarFaturaCartao(state.cartoes.find(c => c.tipo === 'credito' && !c.titular).id)],
        ['reset', () => abrirReiniciarTudo()], ['sair', () => abrirSair()]
      ];
      modais.forEach(([n, fn]) => { try { fn(); todos.push(...window.__sonda(T + ' · modal ' + n)); } catch (e) { todos.push([T, 'erro ao abrir modal', n, e.message]); } fecharModal(true); });
    }
    document.documentElement.classList.remove('dark');
    return todos;
  };
})();
