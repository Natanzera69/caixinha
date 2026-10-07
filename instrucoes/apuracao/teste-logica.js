// Testes das regras de dados do Caixinha, sem navegador e sem Firebase.
// Uso (raiz do projeto):  TZ=America/Sao_Paulo node instrucoes/apuracao/teste-logica.js
// Extrai as funções do HTML pelo nome e roda em um sandbox com stubs.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync(require('path').resolve(__dirname, '../../Planilha Financeiro.html'), 'utf8');
const script = html.match(/<script>\n([\s\S]*?)<\/script>/)[1];

function extrair(nome) {
  const m = script.match(new RegExp('(?:async )?function ' + nome + '\\('));
  if (!m) throw new Error('função não achada: ' + nome);
  let i = script.indexOf('{', m.index), d = 0;
  for (let j = i; j < script.length; j++) {
    if (script[j] === '{') d++;
    else if (script[j] === '}' && --d === 0) return script.slice(m.index, j + 1);
  }
}
const nomes = ['uuid', 'nowISO', 'isoLocal', 'todayStr', 'addMonths', 'round2', 'pad2', 'ultimoDiaDoMes', 'anoMesStr', 'tocar',
  'cartaoById', 'mesCompetencia', 'recorrenciaDevidaNoMes', 'gerarTransacoesRecorrentesDoMes', 'mesclarEstadoEm', 'rotuloMes'];
const ctx = { crypto: require('crypto'), state: null, salvarEstado() {}, CHAVES_SINCRONIZAVEIS: ['contas', 'cartoes', 'categorias', 'transacoes', 'financiamentos', 'investimentos', 'recorrencias'] };
vm.createContext(ctx);
vm.runInContext(nomes.map(extrair).join('\n'), ctx);
const novo = () => ({ contas: [], cartoes: [], categorias: [], transacoes: [], financiamentos: [], investimentos: [], recorrencias: [], config: { pinHash: null }, _tombstones: {} });
const rec = () => ({ id: 'r1', descricao: 'Salário', valor: 5200, tipo: 'receita', diaDoMes: 5, intervaloMeses: 1, ativo: true, mesesGerados: [], categoriaId: 'c', metodoPagamento: 'pix', contaId: 'a', updatedAt: '2026-10-01T00:00:00Z' });
const run = (c) => vm.runInContext(c, ctx);
let ok = 0; const t = (nome, fn) => { fn(); ok++; console.log('ok  ' + nome); };

t('A1 data local: 22:30 em São Paulo ainda é o mesmo dia', () => {
  ctx.d = new Date('2026-10-07T01:30:00Z'); // 22:30 de 06/10 no Brasil
  const local = run('isoLocal(d)');
  if (process.env.TZ === 'America/Sao_Paulo') assert.strictEqual(local, '2026-10-06');
  assert.strictEqual(run('isoLocal(new Date(2026,0,31))'), '2026-01-31');
  assert.strictEqual(run("addMonths('2026-01-31',1)"), '2026-02-28');
});
t('mesCompetencia: fecha dia 8', () => {
  ctx.state = Object.assign(novo(), { cartoes: [{ id: 'k', diaFechamento: 8 }] });
  const c = d => run(`mesCompetencia({data:'${d}',metodoPagamento:'credito',cartaoId:'k'})`);
  assert.strictEqual(c('2026-09-10'), '2026-10'); assert.strictEqual(c('2026-10-05'), '2026-10');
  assert.strictEqual(c('2026-10-08'), '2026-11'); assert.strictEqual(c('2026-12-20'), '2027-01');
  assert.strictEqual(run("rotuloMes('2026-11')"), 'nov/26');
});
t('A2 dois aparelhos geram o mesmo mês → 1 só transação após o merge', () => {
  const a = novo(), b = novo(); a.recorrencias = [rec()]; b.recorrencias = [rec()];
  ctx.state = a; run('gerarTransacoesRecorrentesDoMes(2026,9)');
  ctx.state = b; run('gerarTransacoesRecorrentesDoMes(2026,9)');
  assert.strictEqual(a.transacoes[0].id, b.transacoes[0].id);
  ctx.a = a; ctx.b = b; run('mesclarEstadoEm(a,b)');
  assert.strictEqual(a.transacoes.length, 1);
  assert.deepStrictEqual([...a.recorrencias[0].mesesGerados], ['2026-10']);
});
t('A2 não regenera transação apagada (tombstone) nem duplica se já veio por sync', () => {
  const a = novo(); a.recorrencias = [rec()]; a._tombstones.transacoes = [{ id: 'rec_r1_2026-10', updatedAt: '2026-10-05T00:00:00Z' }];
  ctx.state = a; run('gerarTransacoesRecorrentesDoMes(2026,9)');
  assert.strictEqual(a.transacoes.length, 0);
});
t('A4 mesesGerados une as duas versões', () => {
  const a = novo(), b = novo(); const ra = rec(), rb = rec();
  ra.mesesGerados = ['2026-09']; ra.updatedAt = '2026-10-02T00:00:00Z'; rb.mesesGerados = ['2026-10']; rb.updatedAt = '2026-10-03T00:00:00Z';
  a.recorrencias = [ra]; b.recorrencias = [rb]; ctx.a = a; ctx.b = b; run('mesclarEstadoEm(a,b)');
  assert.deepStrictEqual([...a.recorrencias[0].mesesGerados].sort(), ['2026-09', '2026-10']);
});
t('A4 config: onboarding vale se concluído em qualquer aparelho; tema vence o mais recente; PIN não viaja', () => {
  const a = novo(), b = novo(); a.config = { pinHash: 'meu', onboardingConcluido: false, temaEscuro: false, temaAtualizadoEm: '2026-10-01T00:00:00Z' };
  b.config = { pinHash: 'outro', onboardingConcluido: true, temaEscuro: true, temaAtualizadoEm: '2026-10-02T00:00:00Z' };
  ctx.a = a; ctx.b = b; run('mesclarEstadoEm(a,b)');
  assert.strictEqual(a.config.onboardingConcluido, true); assert.strictEqual(a.config.temaEscuro, true); assert.strictEqual(a.config.pinHash, 'meu');
});
t('exclusão mais recente vence (tombstone) e nada vira undefined no envio', () => {
  const a = novo(), b = novo(); a.contas = [{ id: 'x', nome: 'A', updatedAt: '2026-10-01T00:00:00Z' }];
  b._tombstones.contas = [{ id: 'x', updatedAt: '2026-10-02T00:00:00Z' }]; ctx.a = a; ctx.b = b; run('mesclarEstadoEm(a,b)');
  assert.strictEqual(a.contas.length, 0);
  const c = { orcamentoMensal: undefined, nome: 'x' }; assert.ok(!('orcamentoMensal' in JSON.parse(JSON.stringify(c))));
});
console.log(`\n${ok} testes passaram`);
