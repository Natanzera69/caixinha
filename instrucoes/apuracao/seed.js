// Dados falsos pra conferir as telas sem login. Define window.__seed(aba).
// Uso (no navegador, com a página aberta em localhost:8766):
//   fetch('/instrucoes/apuracao/seed.js').then(r=>r.text()).then(eval).then(()=>__seed('dashboard'))
// Abas: dashboard | lancamentos | contas | parcelamentos | investimentos | config
// Só altera a memória da página; NÃO salva (nada vai pro Firebase nem pro localStorage de verdade).
// Datas fixas em outubro/2026 (fechamento do cartão = dia 8, vence dia 15).
window.__seed = (tab) => {
  const cats = state.categorias, c = n => (cats.find(x => x.nome === n) || cats[0]).id;
  state.contas = [
    { id: 'c1', nome: 'Nubank Físico', tipo: 'corrente', cor: '#8a5cf0', ativo: true },
    { id: 'c2', nome: 'Itaú', tipo: 'corrente', cor: '#ea7a1c', ativo: true }];
  state.cartoes = [
    { id: 'k1', nome: 'Nubank', tipo: 'credito', contaId: 'c1', limite: 5000, diaFechamento: 8, diaVencimento: 15 },
    { id: 'k2', nome: 'Nubank Débito', tipo: 'debito', contaId: 'c1' },
    { id: 'k3', nome: 'Cartão da Ana', tipo: 'credito', titular: 'Ana', pagamentosFeitos: 0 }];
  const T = (id, d, desc, v, tipo, cat, met, extra = {}) => ({ id, data: d, descricao: desc, valor: v, tipo, categoriaId: cat ? c(cat) : null, metodoPagamento: met, status: d <= '2026-10-06' ? 'pago' : 'pendente', ...extra });
  state.transacoes = [
    T('t1', '2026-10-05', 'Salário', 5200, 'receita', 'Salário', 'pix', { contaId: 'c2', recorrenciaId: 'r1' }),
    T('t2', '2026-10-05', 'Supermercado', 450, 'despesa', 'Mercado', 'credito', { cartaoId: 'k1' }),
    T('t3', '2026-10-10', 'Aluguel', 1200, 'despesa', 'Moradia', 'pix', { contaId: 'c1' }),
    T('t4', '2026-10-02', 'Uber', 280, 'despesa', 'Transporte', 'debito', { contaId: 'c1', cartaoId: 'k2' }),
    T('t5', '2026-10-03', 'Cinema', 190, 'despesa', 'Lazer', 'credito', { cartaoId: 'k1' }),
    T('t6', '2026-10-12', 'Celular', 120, 'despesa', 'Compras', 'credito', { cartaoId: 'k1', parcelaAtual: 3, parcelaTotal: 12, parcelaGrupoId: 'g1' }),
    T('t7', '2026-09-20', 'Mercado ana', 90, 'despesa', 'Mercado', 'credito', { cartaoId: 'k3' }),
    T('t8', '2026-10-08', 'Pagamento fatura Nubank', 300, 'transferencia', null, 'transferencia', { contaId: 'c2', cartaoId: 'k1', pagamentoFatura: true })];
  state.recorrencias = [
    { id: 'r1', descricao: 'Salário', valor: 5200, tipo: 'receita', categoriaId: c('Salário'), metodoPagamento: 'pix', contaId: 'c2', diaDoMes: 5, intervaloMeses: 1, ativo: true, mesesGerados: ['2026-10'] },
    { id: 'r2', descricao: 'Revisão do patinete', valor: 150, tipo: 'despesa', categoriaId: c('Transporte'), metodoPagamento: 'pix', contaId: 'c1', diaDoMes: 10, intervaloMeses: 3, mesInicio: '2026-10', ativo: false, mesesGerados: [] }];
  state.investimentos = [{ id: 'i1', nome: 'Tesouro Selic', tipo: 'Renda Fixa', instituicao: 'Nubank', valorAportado: 8000, valorAtual: 8250 }];
  state.categorias.forEach(x => { if (x.tipo === 'despesa' && ['Mercado', 'Lazer', 'Transporte'].includes(x.nome)) x.orcamentoMensal = { Mercado: 500, Lazer: 400, Transporte: 280 }[x.nome]; });
  estados.pj = estados.pj || { empresaNome: 'Minha Empresa' };
  ['loginScreen', 'loadingScreen'].forEach(i => document.getElementById(i).classList.add('hidden'));
  document.getElementById('app').classList.remove('hidden');
  if (!document.getElementById('noanim')) { const s = document.createElement('style'); s.id = 'noanim'; s.textContent = 'section.tab.active{animation:none!important}'; document.head.appendChild(s); }
  switchTab(tab); renderTudo(); window.scrollTo(0, 0); return tab;
};
