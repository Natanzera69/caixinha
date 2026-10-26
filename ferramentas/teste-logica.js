// Testes das regras de dados do Caixinha, sem navegador e sem Firebase.
// Uso (raiz do projeto):  TZ=America/Sao_Paulo node ferramentas/teste-logica.js
// Extrai as funções do HTML pelo nome e roda em um sandbox com stubs.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync(require('path').resolve(__dirname, '../Planilha Financeiro.html'), 'utf8');
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
  'cartaoById', 'perfilTemDados', 'decidirSincronia', 'resumoPerfil', 'codigoErroSync', 'semAcento', 'filtrarLancamentos', 'totaisLancamentos', 'usosDe', 'sanearPerfilBackup', 'lerObjetoBackup', 'resumoBackup', 'aplicarBackupNoPerfil', 'escapeHtml', 'emailChave', 'iconeSeguro', 'corSegura', 'hashTexto', 'pinDoAparelho', 'definirPinAparelho', 'removerPinAparelho', 'bloqueioAoMinimizarAtivo','foraMuito', 'sessaoExpirada', 'fimDaSessao', 'mesCompetencia', 'recorrenciaDevidaNoMes', 'gerarTransacoesRecorrentesDoMes', 'mesclarEstadoEm', 'rotuloMes',
  'fmtMoney', 'fmtDate', 'validarTexto', 'validarValor', 'validarInteiro', 'validarData', 'nomeDuplicado', 'parcelasRestantes', 'validarParcelasPagas',
  'fmtCurto', 'tetoGrafico', 'distribuicaoDoMes', 'agruparOutros', 'serieMensal', 'compararCategorias', 'kpisDoMes', 'contaById', 'categoriaById', 'metodoInfo', 'metodosPagamento', 'transacoesEfetivasDoMes',
  'subcategoriaById', 'subcategoriasDe', 'subcategoriaValida', 'paraNuvem', 'ehMarcadorPJ', 'aplicarRemocaoPJ', 'storageKey', 'criarSubcategoria', 'mostrarErros', 'diaVirada', 'mesDaData', 'periodoDoMes', 'anoMesAtualPeriodo', 'mesNaLista', 'dicaPeriodo',
  'hashPin', 'pinConfere', 'enviarPinDaConta', 'aplicarPinDaConta', 'mesNoVerde','dataNoMes','calendarioParcelas','statusTransacao','validarParcelasAtraso','saldoConta'];
const ctx = { crypto: require('crypto'), state: null, salvarEstado() {}, CHAVES_SINCRONIZAVEIS: ['contas', 'cartoes', 'categorias', 'subcategorias', 'transacoes', 'financiamentos', 'investimentos', 'recorrencias'] };
const store = {};
ctx.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
ctx.window = ctx; ctx.matchMedia = () => ({ matches: false }); ctx.TextEncoder = TextEncoder; ctx.estados = { pessoal: null, pj: null }; ctx.salvarPerfilLocal = () => {};
vm.createContext(ctx);
const consts = script.match(/const SEG=\{[^\n]*\};/)[0] + '\n' + script.match(/const SESSAO_DIAS=\d+;/)[0] + '\n' + script.match(/const VALOR_MAX=[^\n]*\n/)[0] + script.match(/const TEXTO_PROIBIDO=[^\n]*\n/)[0] + script.match(/const PALETA=[^\n]*\n/)[0] + script.match(/const GRAF_OUTROS_COR=[^\n]*\n/)[0] + script.match(/const MESES_CURTOS=[^\n]*\n/)[0] +
  script.match(/const lsGet=[^\n]*\nconst lsSet=[^\n]*\nconst lsDel=[^\n]*\n/)[0];
vm.runInContext(consts + '\n' + nomes.map(extrair).join('\n'), ctx);
const novo = () => ({ contas: [], cartoes: [], categorias: [], transacoes: [], financiamentos: [], investimentos: [], recorrencias: [], config: { pinHash: null }, _tombstones: {} });
const rec = () => ({ id: 'r1', descricao: 'Salário', valor: 5200, tipo: 'receita', diaDoMes: 5, intervaloMeses: 1, ativo: true, mesesGerados: [], categoriaId: 'c', metodoPagamento: 'pix', contaId: 'a', updatedAt: '2026-10-01T00:00:00Z' });
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
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
t('sessão de 30 dias: 29 dias vale, 31 expira, sem registro não expira', () => {
  const set = d => run(`localStorage.setItem(SEG.loginEm, String(Date.now() - ${d}*86400000))`);
  run('localStorage.removeItem(SEG.loginEm)'); assert.strictEqual(run('sessaoExpirada()'), false);
  set(29); assert.strictEqual(run('sessaoExpirada()'), false);
  set(31); assert.strictEqual(run('sessaoExpirada()'), true);
  set(0); assert.ok(run('fimDaSessao()').getTime() - Date.now() > 29.9 * 86400000);
});
t('bloqueio ao minimizar: ligado por padrão, "0" desliga', () => {
  run('localStorage.removeItem(SEG.lockMin)'); assert.strictEqual(run('bloqueioAoMinimizarAtivo()'), true);
  run("localStorage.setItem(SEG.lockMin,'0')"); assert.strictEqual(run('bloqueioAoMinimizarAtivo()'), false);
  run("localStorage.setItem(SEG.lockMin,'1')"); assert.strictEqual(run('bloqueioAoMinimizarAtivo()'), true);
});
t('bloqueio por ausência: só a partir de 10 minutos fora', () => {
  run('var BLOQUEIO_MIN=10'); const ag = Date.now();
  assert.strictEqual(run('foraMuito(' + (ag - 9 * 60000) + ')'), false);
  assert.strictEqual(run('foraMuito(' + (ag - 10 * 60000 - 50) + ')'), true);
  assert.strictEqual(run('foraMuito(' + (ag - 3600000) + ')'), true);
});
t('PIN antigo por perfil migra pro aparelho', () => {
  run('removerPinAparelho()');
  ctx.estados.pessoal = { config: { pinHash: 'hash_antigo' } }; ctx.estados.pj = { config: { pinHash: null } }; ctx.state = ctx.estados.pessoal;
  assert.strictEqual(run('pinDoAparelho()'), 'hash_antigo');
  assert.strictEqual(ctx.estados.pessoal.config.pinHash, null);
  assert.strictEqual(store.planilhaFinanceiro_pinLen, undefined); // tamanho desconhecido: sem auto-entrar
});
t('PIN novo: guarda hash (não o número) e o tamanho 4', () => {
  run('removerPinAparelho()');
  return run("definirPinAparelho('1234')").then(() => {
    assert.strictEqual(store.planilhaFinanceiro_pinLen, '4'); assert.notStrictEqual(store.planilhaFinanceiro_pin, '1234');
    assert.strictEqual(store.planilhaFinanceiro_pin.length, 64);
  });
});
t('convite: e-mail vira chave minúscula sem espaços; ícone e cor são escapados e limitados', () => {
  assert.strictEqual(run("emailChave('  Maria@X.COM ')"), 'maria@x.com');
  const x = run("iconeSeguro('<img src=x onerror=alert(1)>')");
  assert.ok(!x.includes('<') && !x.includes('>'));
  assert.ok(!run("iconeSeguro('<script>alert(1)</script>')").includes('<'));
  assert.strictEqual(run("iconeSeguro('🛒')"), '🛒');
  assert.ok(run("Array.from(iconeSeguro('abcdefghij')).length") <= 6);
  assert.strictEqual(run("corSegura('#ea7a1c')"), '#ea7a1c');
  assert.strictEqual(run("corSegura('red;background:url(x)')"), '#16842f');
});
t('tabela de emojis: grupos cheios, sem duplicados, sem tom de pele/bandeira de país, busca em português', () => {
  const src = fs.readFileSync(require('path').resolve(__dirname, '../assets/emojis-pt.js'), 'utf8');
  const d = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1)).grupos;
  assert.strictEqual(d[0].id, 'financas'); assert.ok(d.length >= 9);
  d.forEach(g => assert.ok(g.e.length > 20, g.id));
  const resto = d.slice(1).flatMap(g => g.e), vistos = new Set();
  resto.forEach(e => { assert.ok(!vistos.has(e[0]), 'duplicado ' + e[0]); vistos.add(e[0]); assert.ok(!/[\u{1F3FB}-\u{1F3FF}]/u.test(e[0]), 'tom de pele'); assert.ok(!/^[\u{1F1E6}-\u{1F1FF}]{2}$/u.test(e[0]), 'bandeira de país'); });
  assert.ok(resto.length > 1400);
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const acha = q => resto.filter(e => e[2].includes(norm(q))).map(e => e[0]);
  assert.ok(acha('carro').includes('🚗')); assert.ok(acha('cafe').includes('☕')); assert.ok(acha('dinheiro').includes('💰'));
  const curado = new Set(d[0].e.map(e => e[0].replace(/️/g, ''))); ['💰', '🛒', '🍔', '🏠', '💳'].forEach(e => assert.ok(curado.has(e), e));
});
const lancs = [
  { id: 'a', data: '2026-10-05', descricao: 'Supermercado Pão de Açúcar', valor: 100, tipo: 'despesa', categoriaId: 'cm', contaId: 'c1', metodoPagamento: 'pix' },
  { id: 'b', data: '2026-10-20', descricao: 'Salário', valor: 1000, tipo: 'receita', categoriaId: 'cs', contaId: 'c2', metodoPagamento: 'pix' },
  { id: 'c', data: '2026-09-28', descricao: 'Cinema', valor: 50, tipo: 'despesa', categoriaId: 'cl', cartaoId: 'k1', metodoPagamento: 'credito' },
  { id: 'd', data: '2026-10-10', descricao: 'Transf', valor: 200, tipo: 'transferencia', contaId: 'c1', contaDestinoId: 'c2', metodoPagamento: 'transferencia' },
  { id: 'e', data: '2026-08-01', descricao: 'Antigo', valor: 10, tipo: 'despesa', categoriaId: 'cm', contaId: 'c1', metodoPagamento: 'pix' },
];
const F0 = { q: '', tipo: '', conta: '', categoria: '', periodo: 'mes', mes: '2026-10' };
const filtra = (f) => { ctx.L = lancs; ctx.FF = { ...F0, ...f }; return run("filtrarLancamentos(L,FF,'2026-10-25')").map(t => t.id).join(''); };
t('Lançamentos: filtros por mês, 30 dias, tudo, tipo, conta, cartão, categoria e busca sem acento', () => {
  ctx.state = novo();
  assert.strictEqual(filtra({}), 'bda');                      // outubro, mais recente primeiro
  assert.strictEqual(filtra({ periodo: '30' }), 'bdac');      // 25/09 a 25/10 (28/09 entra)
  assert.strictEqual(filtra({ periodo: 'tudo' }), 'bdace');
  assert.strictEqual(filtra({ tipo: 'receita' }), 'b');
  assert.strictEqual(filtra({ conta: 'c:c2' }), 'bd');        // conta de origem OU destino
  assert.strictEqual(filtra({ conta: 'k:k1', periodo: 'tudo' }), 'c');
  assert.strictEqual(filtra({ categoria: 'cm', periodo: 'tudo' }), 'ae');
  assert.strictEqual(filtra({ q: 'pao de acucar' }), 'a');
  assert.strictEqual(filtra({ q: 'CINEMA', periodo: 'tudo' }), 'c');
});
t('Lançamentos: totais ignoram transferências', () => {
  ctx.L = lancs.filter(x => x.data.startsWith('2026-10'));
  const tt = run('totaisLancamentos(L)'); assert.deepStrictEqual([tt.receitas, tt.despesas, tt.saldo, tt.n], [1000, 100, 900, 3]);
});
t('Excluir: conta/cartão/categoria em uso por fixo, cartão ou financiamento é detectado', () => {
  ctx.ST = { transacoes: [{ contaId: 'c1' }], cartoes: [{ contaId: 'c1' }], recorrencias: [{ contaId: 'c1', cartaoId: 'k9', categoriaId: 'x' }], financiamentos: [{ contaId: 'c1' }] };
  assert.strictEqual(run("usosDe('conta','c1',ST).join(', ')"), '1 lançamento, 1 cartão, 1 fixo, 1 financiamento');
  assert.strictEqual(run("usosDe('cartao','k9',ST).join(', ')"), '1 fixo');
  assert.strictEqual(run("usosDe('categoria','x',ST).join(', ')"), '1 fixo');
  assert.strictEqual(run("usosDe('conta','livre',ST).length"), 0);
});
t('Restaurar backup: formatos, saneamento, resumo e junção sem apagar', () => {
  const reg = (id, extra = {}) => ({ id, updatedAt: '2026-10-01T00:00:00Z', ...extra });
  ctx.B2 = { formatoBackup: 2, pessoal: { contas: [reg('c1')], transacoes: [reg('t1'), reg('t2'), { sem: 'id' }, null], config: { pinHash: 'SEGREDO', temaEscuro: true }, intruso: 'x' }, pj: null };
  const bk = run('lerObjetoBackup(B2)');
  assert.strictEqual(bk.pessoal.transacoes.length, 2); assert.strictEqual(bk.pessoal.config.pinHash, null); assert.ok(!('intruso' in bk.pessoal));
  ctx.B1 = { contas: [reg('c1')], transacoes: [reg('t1')] }; assert.ok(run('lerObjetoBackup(B1)').pessoal);          // formato antigo
  assert.throws(() => run('lerObjetoBackup({ola:1})'), /não parece/); assert.throws(() => run('lerObjetoBackup({contas:[],transacoes:5})'));
  // estado atual: tem t1 e apagou t2 depois do backup
  const atual = novo(); atual.transacoes = [reg('t1', { descricao: 'editado', updatedAt: '2026-10-09T00:00:00Z' })]; atual._tombstones.transacoes = [{ id: 't2', updatedAt: '2026-10-05T00:00:00Z' }];
  ctx.AT = atual; ctx.BK = bk;
  const r = run('resumoBackup(AT,BK.pessoal)'); assert.deepStrictEqual([r.novos, r.apagados], [1, 1]);            // c1 novo; t2 apagado
  run('aplicarBackupNoPerfil(AT,BK.pessoal,false)');
  assert.deepStrictEqual([...atual.transacoes.map(x => x.id).sort()], ['t1']); assert.strictEqual(atual.transacoes[0].descricao, 'editado'); // versão mais nova vence, t2 continua apagado
  assert.deepStrictEqual([...atual.contas.map(x => x.id)], ['c1']);
  run('aplicarBackupNoPerfil(AT,BK.pessoal,true)');                                                               // "recuperar apagados"
  assert.deepStrictEqual([...atual.transacoes.map(x => x.id).sort()], ['t1', 't2']);
});
t('Sincronização: decide enviar/baixar/mesclar sem sobrescrever às cegas', () => {
  const dec = (nuvem, local, novo) => run(`decidirSincronia(${nuvem},${local},${novo})`);
  assert.strictEqual(dec(false, true, false), 'enviar');    // nuvem vazia + aparelho com dados: sobe (antes só subia na próxima edição)
  assert.strictEqual(dec(false, false, true), 'nada');      // nada em lugar nenhum: não grava o estado padrão
  assert.strictEqual(dec(true, false, true), 'baixar');     // aparelho novo + nuvem com dados: baixa
  assert.strictEqual(dec(true, true, false), 'mesclar');    // os dois têm: junta e devolve
  const padrao = novo(); padrao.contas = [{ id: 'carteira' }]; // estado criado ao abrir o app pela 1ª vez
  ctx.P0 = padrao; assert.strictEqual(run('perfilTemDados(P0)'), false);
  const comLanc = novo(); comLanc.transacoes = [{ id: 't' }]; ctx.P1 = comLanc; assert.strictEqual(run('perfilTemDados(P1)'), true);
  const onb = novo(); onb.config = { onboardingConcluido: true }; ctx.P2 = onb; assert.strictEqual(run('perfilTemDados(P2)'), true);
  assert.strictEqual(run('perfilTemDados(null)'), false);
  assert.match(run("codigoErroSync({code:'permission-denied'})"), /permissão negada/);
  assert.match(run("codigoErroSync({code:'unavailable'})"), /sem conexão/);
  assert.strictEqual(run('resumoPerfil(P1)'), '1 lançamentos, 0 contas, 0 cartões, 0 fixos');
});
t('Validação: texto — proibidos, tamanho, espaços e vazio', () => {
  const tx = (v, o) => run('validarTexto(' + JSON.stringify(v) + ',' + JSON.stringify(o || {}) + ')');
  assert.strictEqual(tx('  Mercado   do  João  ', { max: 60 }).valor, 'Mercado do João');
  assert.strictEqual(tx('Café & Pão (padaria) - 50% off', {}).valor, 'Café & Pão (padaria) - 50% off');
  ['<script>', 'a{b}', 'a\\b', 'a`b', 'a\u0007b', 'a​b'].forEach(x => assert.match(tx(x, {}).erro, /não use/));
  assert.match(tx('', { rotulo: 'Nome' }).erro, /Nome: preencha/); assert.strictEqual(tx('', { opcional: true }).valor, '');
  assert.match(tx('a'.repeat(61), { max: 60 }).erro, /no máximo 60/); assert.match(tx('a', { min: 2 }).erro, /pelo menos 2/);
  assert.strictEqual(tx('linha1\n\n\n\nlinha2', { multilinha: true, max: 300 }).valor, 'linha1\n\nlinha2');
});
t('Validação: valor — negativo, zero, NaN, máximo, vírgula', () => {
  const v = (x, o) => run('validarValor(' + JSON.stringify(x) + ',' + JSON.stringify(o || {}) + ')');
  assert.strictEqual(v('1250,90').valor, 1250.9);
  assert.match(v('-5').erro, /negativo/); assert.match(v('0').erro, /maior que zero/); assert.match(v('').erro, /informe/);
  assert.match(v('abc').erro, /só números/); assert.match(v('1e5').erro, /só números/); assert.match(v('Infinity').erro, /só números/);
  assert.match(v('1000000000').erro, /máximo/); assert.strictEqual(v('999999999.99').valor, 999999999.99);
  assert.strictEqual(v('0', { min: 0 }).valor, 0); assert.strictEqual(v('', { opcional: true, min: 0 }).valor, 0);
  assert.strictEqual(v('-50', { negativo: true, min: -999999999.99 }).valor, -50);
});
t('Validação: inteiro e data', () => {
  const n = (x, o) => run('validarInteiro(' + JSON.stringify(x) + ',' + JSON.stringify(o) + ')');
  assert.strictEqual(n('12', { min: 1, max: 120 }).valor, 12); assert.match(n('121', { min: 1, max: 120 }).erro, /de 1 a 120/);
  assert.match(n('1,5', { min: 1, max: 9 }).erro, /inteiro/); assert.match(n('0', { min: 1, max: 31 }).erro, /de 1 a 31/); assert.strictEqual(n('', { opcional: true }).valor, null);
  const d = x => run('validarData(' + JSON.stringify(x) + ')');
  assert.strictEqual(d('2026-02-28').valor, '2026-02-28'); assert.match(d('2026-02-31').erro, /não existe/); assert.match(d('').erro, /válida/);
  assert.match(d('1999-12-31').erro, /2000 e 2100/); assert.match(d('2101-01-01').erro, /2000 e 2100/);
  assert.ok(d('2099-01-01').aviso); assert.ok(!d(run('todayStr()')).aviso);
});
t('Validação: nome duplicado ignora acento, caixa e o próprio registro', () => {
  ctx.L = [{ id: '1', nome: 'Nubank' }, { id: '2', nome: 'Itaú', tipo: 'despesa' }];
  assert.strictEqual(run("nomeDuplicado(L,'  nubank ')"), true); assert.strictEqual(run("nomeDuplicado(L,'itau')"), true);
  assert.strictEqual(run("nomeDuplicado(L,'Nubank','1')"), false); assert.strictEqual(run("nomeDuplicado(L,'Inter')"), false);
  assert.strictEqual(run("nomeDuplicado(L,'itau',null,x=>x.tipo==='receita')"), false);
});
t('Parcelas: já pagas nunca passam do total; só as que faltam são criadas', () => {
  const pg = (x, tot) => run('validarParcelasPagas(' + JSON.stringify(x) + ',' + tot + ')');
  assert.strictEqual(pg('', 12).valor, 0); assert.strictEqual(pg('3', 12).valor, 3); assert.strictEqual(pg('11', 12).valor, 11);
  assert.match(pg('15', 12).erro, /não dá para ter pago 15 de 12/); assert.match(pg('12', 12).erro, /não há o que lançar/);
  assert.match(pg('-1', 12).erro, /sem sinal/); assert.match(pg('2,5', 12).erro, /inteiro/);
  const r = run("parcelasRestantes(1000,12,3,'2026-10-31')");
  assert.deepStrictEqual([r.length, r[0].n, r[8].n], [9, 4, 12]);
  assert.strictEqual(r[0].data, '2027-01-31'); assert.strictEqual(r[1].data, '2027-02-28');            // 31/10 + 3 meses; fevereiro vira 28
  assert.strictEqual(r[0].valor, 83.33); assert.strictEqual(r[8].valor, 83.37);                          // resto de centavos na última
  assert.strictEqual(run("parcelasRestantes(1000,12,0,'2026-10-05')").length, 12);
  assert.strictEqual(run("parcelasRestantes(600,6,2,'2026-10-05').reduce((s,p)=>s+p.valor,0)"), 400);   // 4 parcelas de 100
});
t('dívidas em atraso: calendário das parcelas, status e saldo', () => {
  const cal = (o) => JSON.parse(JSON.stringify(run('calendarioParcelas(' + JSON.stringify(o) + ')')));
  // 12 parcelas, 4 pagas, 2 em atraso, vence dia 10, hoje 22/10/2026: atrasadas 10/08 e 10/09; a vencer 10/11 em diante
  let c = cal({ total: 12, pagas: 4, atraso: 2, dia: 10, hoje: '2026-10-22' });
  assert.strictEqual(c.length, 8); assert.deepStrictEqual([c[0].n, c[0].data, c[0].emAberto], [5, '2026-09-10', true]);
  assert.deepStrictEqual([c[1].data, c[1].emAberto], ['2026-10-10', true]);
  assert.deepStrictEqual([c[2].n, c[2].data, c[2].emAberto], [7, '2026-11-10', false]); assert.strictEqual(c[7].data, '2027-04-10');
  // sem atraso: a primeira é a próxima ocorrência do dia; hoje = dia do vencimento conta como hoje
  c = cal({ total: 3, pagas: 0, atraso: 0, dia: 22, hoje: '2026-10-22' }); assert.strictEqual(c[0].data, '2026-10-22'); assert.strictEqual(c[2].data, '2026-12-22');
  // dia 31 vira o último dia do mês; virada de ano
  c = cal({ total: 4, pagas: 0, atraso: 0, dia: 31, hoje: '2026-12-05' }); assert.deepStrictEqual(c.map(p => p.data), ['2026-12-31', '2027-01-31', '2027-02-28', '2027-03-31']);
  // tudo em atraso e quitado
  c = cal({ total: 3, pagas: 1, atraso: 2, dia: 5, hoje: '2026-10-22' }); assert.deepStrictEqual(c.map(p => [p.data, p.emAberto]), [['2026-09-05', true], ['2026-10-05', true]].map(x => x).slice(0, 0).concat([['2026-09-05', true], ['2026-10-05', true]]));
  assert.strictEqual(cal({ total: 3, pagas: 3, atraso: 0, dia: 5, hoje: '2026-10-22' }).length, 0);
  // validação do atraso
  const va = (x, tot, pg) => run('validarParcelasAtraso(' + JSON.stringify(x) + ',' + tot + ',' + pg + ')');
  assert.strictEqual(va('', 12, 4).valor, 0); assert.strictEqual(va('8', 12, 4).valor, 8);
  assert.match(va('9', 12, 4).erro, /só restam 8/); assert.match(va('-1', 12, 4).erro, /sem sinal/);
  // status e saldo: em aberto não sai da conta; paga volta a valer
  assert.strictEqual(run("statusTransacao({data:'2026-10-01',emAberto:true},'2026-10-22')"), 'atrasado');
  assert.strictEqual(run("statusTransacao({data:'2026-11-01',emAberto:true},'2026-10-22')"), 'pendente');
  assert.strictEqual(run("statusTransacao({data:'2026-10-01'},'2026-10-22')"), 'pago');
  ctx.state = Object.assign(novo(), { contas: [{ id: 'a', nome: 'A', saldoInicial: 1000 }], transacoes: [
    { id: '1', tipo: 'despesa', contaId: 'a', valor: 100, data: '2020-01-01', metodoPagamento: 'pix' },
    { id: '2', tipo: 'despesa', contaId: 'a', valor: 300, data: '2020-02-01', metodoPagamento: 'boleto', emAberto: true }] });
  assert.strictEqual(run("saldoConta('a')"), 900);
  ctx.state.transacoes[1].emAberto = false; assert.strictEqual(run("saldoConta('a')"), 600);
});
const eq = (a, b) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), b); // arrays do vm são de outro 'realm'
t('Gráficos: distribuição por categoria/banco/pagamento, Outros, comparação e KPIs', () => {
  ctx.state = Object.assign(novo(), {
    categorias: [{ id: 'm', nome: 'Mercado', cor: '#16842f', icone: 'x' }, { id: 'l', nome: 'Lazer', cor: '#3f8ae0', icone: 'y' }],
    contas: [{ id: 'a', nome: 'Itaú', cor: '#ea7a1c' }], cartoes: [{ id: 'k', nome: 'Nu', contaId: 'a' }]
  });
  const T = (tipo, v, extra) => Object.assign({ tipo, valor: v, data: '2026-10-05', categoriaId: 'm', metodoPagamento: 'pix', contaId: 'a' }, extra);
  ctx.M = [T('despesa', 100), T('despesa', 50, { categoriaId: 'l', metodoPagamento: 'credito', cartaoId: 'k', contaId: null }), T('despesa', 25.5),
    T('receita', 3000, { categoriaId: 'l' }), T('transferencia', 999)];
  const cat = run("distribuicaoDoMes(M,'categoria','despesa')");
  eq(cat.map(x => [x.nome, x.valor]), [['Mercado', 125.5], ['Lazer', 50]]);
  eq(run("distribuicaoDoMes(M,'banco','despesa')").map(x => [x.nome, x.valor]), [['Itaú', 175.5]]); // crédito cai na conta do cartão
  eq(run("distribuicaoDoMes(M,'pagamento','despesa')").map(x => [x.nome, x.valor]), [['Pix', 125.5], ['Crédito', 50]]);
  eq(run("distribuicaoDoMes(M,'categoria','receita')").map(x => x.valor), [3000]);                 // transferência nunca entra
  ctx.G = Array.from({ length: 9 }, (_, i) => ({ nome: 'c' + i, valor: 100 - i, cor: '#111111' }));
  const g = run('agruparOutros(G,7)');
  assert.strictEqual(g.length, 7); assert.strictEqual(g[6].nome, 'Outros'); assert.strictEqual(g[6].valor, 94 + 93 + 92); assert.strictEqual(g[6].n, 3);
  assert.strictEqual(run('agruparOutros(G.slice(0,3),7)').length, 3);
  const cmp = run("compararCategorias([{nome:'A',valor:150,cor:'#1'},{nome:'B',valor:40,cor:'#2'}],[{nome:'A',valor:100,cor:'#1'},{nome:'C',valor:70,cor:'#3'}])");
  eq(cmp.map(x => [x.nome, x.delta, x.pct]), [['C', -70, -100], ['A', 50, 50], ['B', 40, null]]);
  const k = run("kpisDoMes(M,2026,9,'2026-10-10')");
  eq([k.receitas, k.despesas, k.saldo, k.taxaPoupanca, k.mediaDia, k.maior.valor], [3000, 175.5, 2824.5, 94, 17.55, 100]);
  assert.strictEqual(run("kpisDoMes(M,2026,10,'2026-10-10')").mediaDia, null);                                              // mês futuro
  assert.strictEqual(run("kpisDoMes([],2026,9,'2026-10-10')").taxaPoupanca, null);                                           // sem receita
  eq([run('fmtCurto(950)'), run('fmtCurto(1250)'), run('fmtCurto(12500)'), run('fmtCurto(1500000)')], ['950', '1,3 mil', '13 mil', '1,5 mi']);
  eq([run('tetoGrafico(0)'), run('tetoGrafico(730)'), run('tetoGrafico(1200)'), run('tetoGrafico(4100)')], [100, 1000, 2000, 5000]);
});
t('Gráficos: série mensal soma receitas e despesas de cada mês (do mais antigo ao mais novo)', () => {
  ctx.state = Object.assign(novo(), { transacoes: [
    { id: '1', tipo: 'despesa', valor: 10, data: '2026-08-10', metodoPagamento: 'pix' }, { id: '2', tipo: 'receita', valor: 100, data: '2026-09-10', metodoPagamento: 'pix' },
    { id: '3', tipo: 'despesa', valor: 30, data: '2026-09-11', metodoPagamento: 'pix' }, { id: '4', tipo: 'despesa', valor: 5, data: '2026-10-01', metodoPagamento: 'pix' }] });
  const s = run('serieMensal(3,2026,9)');
  eq(s.map(x => [x.ym, x.receitas, x.despesas, x.saldo]), [['2026-08', 0, 10, -10], ['2026-09', 100, 30, 70], ['2026-10', 0, 5, -5]]);
  eq(s.map(x => x.curto), ['ago', 'set', 'out']);
  assert.strictEqual(run('serieMensal(12,2026,0)').length, 12);                                                              // atravessa o ano
  assert.strictEqual(run('serieMensal(12,2026,0)')[0].ym, '2025-02');
});
t('Subcategorias: opcionais, validadas contra a categoria e sem quebrar a regra antiga do Firestore', () => {
  ctx.state = Object.assign(novo(), {
    categorias: [{ id: 'm', nome: 'Alimentação', cor: '#16842f' }, { id: 'l', nome: 'Lazer', cor: '#3f8ae0' }],
    subcategorias: [{ id: 's1', categoriaId: 'm', nome: 'iFood' }, { id: 's2', categoriaId: 'm', nome: 'Almoço do serviço' }, { id: 's3', categoriaId: 'l', nome: 'Cinema' }]
  });
  eq(run("subcategoriasDe('m').map(x=>x.nome)"), ['Almoço do serviço', 'iFood']);                                   // ordem alfabética
  assert.strictEqual(run("subcategoriaValida('m','s1')").nome, 'iFood');
  assert.strictEqual(run("subcategoriaValida('l','s1')"), null);                                                    // sub de outra categoria não vale
  assert.strictEqual(run("subcategoriaValida('m','sumiu')"), null); assert.strictEqual(run("subcategoriaValida('m',null)"), null);
  // gráfico: fatias "Categoria › Sub"; o que não tem sub entra com o nome da categoria; total preservado; filtro por categoria
  const T = (v, c, sub) => ({ tipo: 'despesa', valor: v, categoriaId: c, subcategoriaId: sub || null, metodoPagamento: 'pix', data: '2026-10-05' });
  ctx.M = [T(100, 'm', 's1'), T(40, 'm', 's1'), T(60, 'm', 's2'), T(30, 'm'), T(20, 'l', 's3'), T(10, 'm', 's3')];       // último: sub de outra categoria → só Alimentação
  const todas = run("distribuicaoDoMes(M,'subcategoria','despesa')");
  eq(todas.map(x => [x.nome, x.valor]), [['Alimentação › iFood', 140], ['Alimentação › Almoço do serviço', 60], ['Alimentação', 40], ['Lazer › Cinema', 20]]);
  assert.strictEqual(todas.reduce((a, x) => a + x.valor, 0), 260);
  eq(run("distribuicaoDoMes(M,'subcategoria','despesa','m')").map(x => x.nome), ['Alimentação › iFood', 'Alimentação › Almoço do serviço', 'Alimentação']);
  eq(run("distribuicaoDoMes(M,'categoria','despesa')").map(x => [x.nome, x.valor]), [['Alimentação', 240], ['Lazer', 20]]);   // a visão por categoria não muda
  // usosDe
  ctx.state.transacoes = [{ id: 't1', subcategoriaId: 's1' }, { id: 't2', subcategoriaId: 's1' }, { id: 't3' }];
  ctx.state.recorrencias = [{ id: 'r1', subcategoriaId: 's1' }];
  eq(run("usosDe('subcategoria','s1')"), ['2 lançamentos', '1 fixo']); eq(run("usosDe('subcategoria','s2')"), []);
  // nuvem: lista vazia nem é enviada (regra antiga continua aceitando); com itens é enviada
  const vazio = novo(); vazio.subcategorias = []; ctx.V = vazio;
  assert.ok(!('subcategorias' in run('paraNuvem(V)'))); assert.strictEqual(run('paraNuvem(V)').config.pinHash, null);
  assert.strictEqual(run('paraNuvem(state)').subcategorias.length, 3);
  // merge entre aparelhos: união por id, exclusão mais recente vence
  const a = novo(), b = novo();
  a.subcategorias = [{ id: 's1', categoriaId: 'm', nome: 'iFood', updatedAt: '2026-10-01T00:00:00Z' }];
  b.subcategorias = [{ id: 's1', categoriaId: 'm', nome: 'iFood!', updatedAt: '2026-10-02T00:00:00Z' }, { id: 's9', categoriaId: 'm', nome: 'Padaria', updatedAt: '2026-10-02T00:00:00Z' }];
  b._tombstones = { subcategorias: [{ id: 's7', updatedAt: '2026-10-03T00:00:00Z' }] };
  a.subcategorias.push({ id: 's7', categoriaId: 'm', nome: 'Velha', updatedAt: '2026-10-01T00:00:00Z' });
  ctx.A = a; ctx.B = b; run('mesclarEstadoEm(A,B)');
  eq(a.subcategorias.map(x => x.id).sort(), ['s1', 's9']); assert.strictEqual(a.subcategorias.find(x => x.id === 's1').nome, 'iFood!');
  // backup: aceita a lista nova, backup antigo sem ela vira lista vazia
  ctx.BK = { formatoBackup: 2, pessoal: { contas: [], transacoes: [], subcategorias: [{ id: 'x', categoriaId: 'm', nome: 'ok' }, { nome: 'sem id' }, 5] } };
  eq(run('lerObjetoBackup(BK).pessoal.subcategorias.map(x=>x.id)'), ['x']);
  eq(run('lerObjetoBackup({contas:[],transacoes:[]}).pessoal.subcategorias'), []);
});
t('Reset geral: resetEm mais novo zera o aparelho; registros velhos não voltam; novos sobrevivem', () => {
  const reg = (id, upd) => ({ id, updatedAt: upd, valor: 1 });
  // aparelho antigo (sem resetEm) com dados
  const velho = novo(); velho.transacoes = [reg('t1', '2026-10-01T10:00:00.000Z'), reg('t2', '2026-10-02T10:00:00.000Z')];
  velho.contas = [reg('c1', '2026-09-01T00:00:00.000Z')]; velho._tombstones = { transacoes: [{ id: 'x', updatedAt: '2026-10-01T00:00:00.000Z' }] };
  velho.config = { pinHash: 'meuPin', onboardingConcluido: true, temaEscuro: true, temaAtualizadoEm: '2026-10-01T00:00:00.000Z' };
  // nuvem depois do reset: estado novo com marcador
  const nuvem = novo(); nuvem.contas = [reg('c9', '2026-10-11T12:00:01.000Z')]; nuvem.config = { pinHash: null, onboardingConcluido: false, resetEm: '2026-10-11T12:00:00.000Z' };
  ctx.V = velho; ctx.N = nuvem; run('mesclarEstadoEm(V,N)');
  eq(velho.transacoes, []); eq(velho.contas.map(x => x.id), ['c9']); assert.strictEqual(Object.values(velho._tombstones).reduce((n, l) => n + l.length, 0), 0);
  assert.strictEqual(velho.config.resetEm, '2026-10-11T12:00:00.000Z');
  assert.strictEqual(velho.config.pinHash, 'meuPin');                       // PIN é do aparelho
  assert.ok(!velho.config.onboardingConcluido);                              // volta ao assistente inicial
  // aparelho velho manda dados antigos de novo (cliente desatualizado): o corte descarta; o novo fica
  const reenvio = novo(); reenvio.transacoes = [reg('t1', '2026-10-01T10:00:00.000Z'), reg('t7', '2026-10-11T13:00:00.000Z')];
  ctx.RE = reenvio; run('mesclarEstadoEm(V,RE)');
  eq(velho.transacoes.map(x => x.id), ['t7']);
  // sem resetEm em lugar nenhum: nada muda (comportamento antigo)
  const a = novo(), b = novo(); a.transacoes = [reg('a', '2020-01-01T00:00:00Z')]; b.transacoes = [reg('b', '2020-01-02T00:00:00Z')];
  ctx.A = a; ctx.B = b; run('mesclarEstadoEm(A,B)'); eq(a.transacoes.map(x => x.id).sort(), ['a', 'b']);
  // resetEm antigo vindo de aparelho que ainda não zerou não apaga quem já zerou
  const zerado = novo(); zerado.config = { pinHash: null, resetEm: '2026-10-11T12:00:00.000Z' }; zerado.transacoes = [reg('n', '2026-10-11T12:30:00.000Z')];
  const antigo = novo(); antigo.config = { pinHash: null, resetEm: '2026-09-01T00:00:00.000Z' };
  ctx.Z = zerado; ctx.AN = antigo; run('mesclarEstadoEm(Z,AN)'); eq(zerado.transacoes.map(x => x.id), ['n']);
});
t('Reset geral: marcador do perfil PJ remove o PJ, a menos que tenha sido recriado depois', () => {
  const marcador = { config: { removerPerfil: true, resetEm: '2026-10-11T12:00:00.000Z' } };
  assert.strictEqual(run('ehMarcadorPJ(null)'), false); ctx.M = marcador; assert.strictEqual(run('ehMarcadorPJ(M)'), true);
  ctx.estados.pj = Object.assign(novo(), { config: { pinHash: null } }); ctx.perfilAtivo = 'pj'; ctx.state = ctx.estados.pj; ctx.estados.pessoal = novo();
  ctx.renderSeletorPerfil = () => {}; ctx.renderTudo = () => {};
  run("localStorage.setItem(storageKey('pj'),'{}')");
  assert.strictEqual(run('aplicarRemocaoPJ(M)'), true);
  assert.strictEqual(ctx.estados.pj, null); assert.strictEqual(run('perfilAtivo'), 'pessoal'); assert.strictEqual(run("localStorage.getItem(storageKey('pj'))"), null);
  // PJ recriado depois do reset (herda o mesmo resetEm): vale o local
  ctx.estados.pj = Object.assign(novo(), { config: { pinHash: null, resetEm: '2026-10-11T12:00:00.000Z' } });
  assert.strictEqual(run('aplicarRemocaoPJ(M)'), false); assert.ok(ctx.estados.pj);
});
t('Versão do app no HTML bate com o cache do service worker', () => {
  const v = html.match(/const APP_VERSAO='[^']*· v(\d+)'/)[1];
  const c = fs.readFileSync(require('path').resolve(__dirname, '../sw.js'), 'utf8').match(/caixinha-v(\d+)/)[1];
  assert.strictEqual(v, c);
});
t('Subcategoria: criada ligada a uma categoria (mesmo sem subs antes); recusa duplicada, inválida e categoria inexistente', () => {
  ctx.state = Object.assign(novo(), { categorias: [{ id: 'm', nome: 'Alimentação' }], subcategorias: [] });
  const raiz = { querySelectorAll: () => [] };
  const campo = v => ({ value: v, closest: () => null, parentNode: { appendChild() {} }, setAttribute() {}, removeAttribute() {}, focus() {}, scrollIntoView() {} });
  ctx.RZ = raiz; ctx.I1 = campo('iFood');
  const a = run("criarSubcategoria('m',I1,RZ)");
  assert.ok(a && a.categoriaId === 'm' && a.nome === 'iFood' && a.id); assert.strictEqual(ctx.state.subcategorias.length, 1);
  ctx.I2 = campo('IFOOD'); ctx.document = { createElement: () => ({ setAttribute() {}, set textContent(v) {} }) };
  assert.strictEqual(run("criarSubcategoria('m',I2,RZ)"), null);                                  // duplicada na mesma categoria
  ctx.I3 = campo('<b>'); assert.strictEqual(run("criarSubcategoria('m',I3,RZ)"), null);          // caractere proibido
  ctx.I4 = campo('Qualquer'); assert.strictEqual(run("criarSubcategoria('nao-existe',I4,RZ)"), null);
  assert.strictEqual(ctx.state.subcategorias.length, 1);
});
t('Painel de gráficos usa listas e PIN não usa type=password', () => {
  const corpo = html.slice(html.indexOf('function htmlPainelGrafico'), html.indexOf('function grafSet'));
  assert.ok(corpo.includes('<select') && !/class="chip|seg seg-sm/.test(corpo));
  const senhas = html.match(/<input[^>]*type="password"[^>]*>/g) || [];
  assert.strictEqual(senhas.length, 1); assert.ok(senhas[0].includes('id="loginSenha"'));        // só a senha do login
  ['lockInput', 'promptPin1', 'promptPin2', 'wizPin1', 'wizPin2', 'novoPin', 'confPin'].forEach(id => {
    const tag = html.match(new RegExp('<input[^>]*id="' + id + '"[^>]*>'))[0];
    assert.ok(tag.includes('type="text"') && tag.includes('pin-masked'), id);
  });
});
t('Virada do mês: dia 10 move o que não é fatura nem fixo; cartão e fixos não mudam', () => {
  ctx.state = Object.assign(novo(), { cartoes: [{ id: 'k', diaFechamento: 8 }, { id: 'sem', diaFechamento: null }, { id: 'ter', diaFechamento: 8, titular: 'Ana' }] });
  const mc = (d, extra, dia) => run('mesCompetencia(' + JSON.stringify(Object.assign({ data: d, metodoPagamento: 'pix' }, extra || {})) + ',' + dia + ')');
  assert.strictEqual(mc('2026-03-05', {}, 10), '2026-02');                      // antes do dia 10 → mês anterior
  assert.strictEqual(mc('2026-03-09', {}, 10), '2026-02');
  assert.strictEqual(mc('2026-03-10', {}, 10), '2026-03');                      // a partir do dia 10 → o próprio mês
  assert.strictEqual(mc('2026-01-05', {}, 10), '2025-12');                      // atravessa o ano
  assert.strictEqual(mc('2026-03-05', {}, 1), '2026-03');                       // dia 1 = calendário
  assert.strictEqual(mc('2026-03-05', { recorrenciaId: 'r' }, 10), '2026-03');  // fixo fica no mês do calendário
  assert.strictEqual(mc('2026-03-05', { metodoPagamento: 'credito', cartaoId: 'k' }, 10), '2026-03'); // fatura (fecha dia 8): 05/mar → mar
  assert.strictEqual(mc('2026-03-09', { metodoPagamento: 'credito', cartaoId: 'k' }, 10), '2026-04'); // fatura: 09/mar → abr (a virada não interfere)
  assert.strictEqual(mc('2026-03-05', { metodoPagamento: 'credito', cartaoId: 'sem' }, 10), '2026-02'); // crédito sem fechamento conta como comum
  assert.strictEqual(mc('2026-03-05', { metodoPagamento: 'credito', cartaoId: 'ter' }, 10), '2026-02'); // cartão emprestado também
  assert.strictEqual(mc('2026-03-05', { metodoPagamento: 'debito' }, 10), '2026-02');
  // padrão vem da config; valores inválidos viram 1
  ctx.state.config.diaVirada = 10; assert.strictEqual(run('diaVirada()'), 10);
  ctx.state.config.diaVirada = 40; assert.strictEqual(run('diaVirada()'), 1);
  ctx.state.config.diaVirada = 'x'; assert.strictEqual(run('diaVirada()'), 1);
  ctx.state.config.diaVirada = 10;
  assert.strictEqual(run("mesCompetencia({data:'2026-03-05',metodoPagamento:'pix'})"), '2026-02');
});
t('Virada do mês: período, mês atual, KPIs e lista', () => {
  const per = (a, m, d) => JSON.parse(JSON.stringify(run('periodoDoMes(' + a + ',' + m + ',' + d + ')')));
  eq(per(2026, 1, 10), ['2026-02-10', '2026-03-09']);                          // fevereiro = 10/fev a 09/mar
  eq(per(2026, 11, 10), ['2026-12-10', '2027-01-09']);                         // dezembro atravessa o ano
  eq(per(2026, 1, 1), ['2026-02-01', '2026-02-28']);                           // dia 1 = calendário
  eq(per(2024, 1, 28), ['2024-02-28', '2024-03-27']);
  ctx.state = Object.assign(novo(), { config: { pinHash: null, diaVirada: 10 } });
  ctx.hojeFake = run('todayStr()');
  const ym = run("mesDaData('2026-03-05',10)"); assert.strictEqual(ym, '2026-02');
  // KPIs: média por dia conta desde o início do período
  ctx.D = [{ tipo: 'despesa', valor: 300, descricao: 'x' }];
  assert.strictEqual(run("kpisDoMes(D,2026,1,'2026-02-19',10).mediaDia"), 30);   // 10..19/fev = 10 dias
  assert.strictEqual(run("kpisDoMes(D,2026,1,'2026-03-20',10).mediaDia"), round(300 / 28));  // período fechado: 28 dias
  assert.strictEqual(run("kpisDoMes(D,2026,1,'2026-02-05',10).mediaDia"), null);   // ainda não começou
  assert.strictEqual(run("kpisDoMes(D,2026,9,'2026-10-10').mediaDia"), 30);        // sem o 5º argumento = calendário
  // lista: filtro de mês segue a virada (cartão com fatura continua pela data da compra)
  ctx.state.cartoes = [{ id: 'k', diaFechamento: 8 }];
  ctx.L = [{ id: 'a', data: '2026-03-05', metodoPagamento: 'pix', tipo: 'despesa', valor: 1 }, { id: 'b', data: '2026-03-10', metodoPagamento: 'pix', tipo: 'despesa', valor: 1 },
    { id: 'c', data: '2026-03-05', metodoPagamento: 'credito', cartaoId: 'k', tipo: 'despesa', valor: 1 }, { id: 'd', data: '2026-03-05', metodoPagamento: 'pix', recorrenciaId: 'r', tipo: 'despesa', valor: 1 }];
  const ids = (mes, dia) => run('filtrarLancamentos(L,{periodo:"mes",mes:"' + mes + '",diaVirada:' + dia + '},"2026-03-20").map(x=>x.id).sort().join("")');
  assert.strictEqual(ids('2026-02', 10), 'a');          // 05/mar (pix) entra em fevereiro
  assert.strictEqual(ids('2026-03', 10), 'bcd');        // b: 10/mar; c: compra no cartão; d: fixo
  assert.strictEqual(ids('2026-03', 1), 'abcd');        // dia 1: tudo em março, como antes
  assert.strictEqual(run('dicaPeriodo(2026,1)'), '<div class="mes-periodo">de 10/02 a 09/03</div>');
  ctx.state.config.diaVirada = 1; assert.strictEqual(run('dicaPeriodo(2026,1)'), '');
});
t('Virada do mês: o dia converge entre aparelhos pelo carimbo', () => {
  const a = novo(), b = novo();
  a.config = { pinHash: 'p', diaVirada: 5, diaViradaEm: '2026-10-01T00:00:00.000Z' };
  b.config = { pinHash: null, diaVirada: 10, diaViradaEm: '2026-10-02T00:00:00.000Z' };
  ctx.A = a; ctx.B = b; run('mesclarEstadoEm(A,B)');
  assert.strictEqual(a.config.diaVirada, 10); assert.strictEqual(a.config.pinHash, 'p');
  b.config.diaViradaEm = '2026-09-01T00:00:00.000Z'; b.config.diaVirada = 3; run('mesclarEstadoEm(A,B)');
  assert.strictEqual(a.config.diaVirada, 10);                                    // carimbo mais velho não vence
});
t('PIN da conta: vale em todos os aparelhos, converge pelo carimbo e some junto com a remoção', async () => {
  const limpar = () => { run('lsDel(SEG.pin); lsDel(SEG.pinLen)'); };
  limpar(); store.planilhaFinanceiro_uid = 'uidA';
  ctx.estados.pessoal = Object.assign(novo(), { config: { pinHash: null } }); ctx.estados.pj = null; ctx.state = ctx.estados.pessoal;
  await run("definirPinAparelho('4321')");
  const c = ctx.estados.pessoal.config.pinConta;
  assert.strictEqual(c.len, 4); assert.strictEqual(c.hash.length, 64); assert.ok(c.em);
  assert.strictEqual(c.hash, store.planilhaFinanceiro_pin);                                   // cópia local = PIN da conta
  assert.ok(!JSON.stringify(c).includes('4321'));
  assert.strictEqual(await run("pinConfere('4321')"), true); assert.strictEqual(await run("pinConfere('1234')"), false);
  // tempero: outro usuário (outro uid) gera outro hash para o mesmo PIN
  store.planilhaFinanceiro_uid = 'uidB'; assert.notStrictEqual(await run("hashPin('4321')"), c.hash); store.planilhaFinanceiro_uid = 'uidA';
  // aparelho novo: recebe a conta com PIN e passa a travar com ele
  limpar(); assert.strictEqual(run('pinDoAparelho()'), null);
  const remoto = novo(); remoto.config = { pinHash: null, pinConta: c };
  run('mesclarEstadoEm(estados.pessoal,{config:{}})');
  ctx.R = remoto; ctx.estados.pessoal = Object.assign(novo(), { config: { pinHash: null } }); ctx.state = ctx.estados.pessoal;
  run('mesclarEstadoEm(estados.pessoal,R)');
  assert.strictEqual(store.planilhaFinanceiro_pin, c.hash); assert.strictEqual(store.planilhaFinanceiro_pinLen, '4');
  assert.strictEqual(await run("pinConfere('4321')"), true);
  // outro aparelho remove o PIN depois: a remoção (carimbo mais novo) apaga a cópia local
  const remocao = novo(); remocao.config = { pinHash: null, pinConta: { hash: null, len: null, em: new Date(Date.now() + 1000).toISOString() } };
  ctx.R2 = remocao; run('mesclarEstadoEm(estados.pessoal,R2)');
  assert.strictEqual(run('pinDoAparelho()'), null);
  // carimbo mais velho não desfaz a remoção
  ctx.R3 = remoto; run('mesclarEstadoEm(estados.pessoal,R3)'); assert.strictEqual(run('pinDoAparelho()'), null);
  // PIN antigo só deste aparelho sobe para a conta (uma vez) e o PIN antigo sem tempero ainda confere
  limpar(); ctx.estados.pessoal = Object.assign(novo(), { config: { pinHash: null } }); ctx.state = ctx.estados.pessoal;
  const antigo = await run("hashTexto('9999')"); store.planilhaFinanceiro_pin = antigo; store.planilhaFinanceiro_pinLen = '4';
  run('aplicarPinDaConta(true)'); assert.strictEqual(ctx.estados.pessoal.config.pinConta.hash, antigo);
  assert.strictEqual(await run("pinConfere('9999')"), true);
});
t('Backup nunca leva o PIN da conta', () => {
  ctx.BKP = { formatoBackup: 2, pessoal: { contas: [], transacoes: [], config: { pinConta: { hash: 'x', em: 'y' }, temaEscuro: true } } };
  assert.ok(!('pinConta' in run('lerObjetoBackup(BKP).pessoal.config')));
});
t('Mês no verde: receitas cobrem despesas e nenhum orçamento estourou', () => {
  const cats = [{ id: 'm', orcamentoMensal: 500 }, { id: 'l' }];
  const T = (tipo, v, c) => ({ tipo, valor: v, categoriaId: c });
  const v = (lista, c) => { ctx.ML = lista; ctx.MC = c || cats; return run('mesNoVerde(ML,MC)'); };
  assert.strictEqual(v([T('receita', 3000, 'x'), T('despesa', 450, 'm'), T('despesa', 100, 'l')]), true);
  assert.strictEqual(v([T('receita', 3000, 'x'), T('despesa', 501, 'm')]), false);          // orçamento de Mercado estourou
  assert.strictEqual(v([T('receita', 100, 'x'), T('despesa', 200, 'l')]), false);           // gastou mais do que entrou
  assert.strictEqual(v([T('receita', 100, 'x'), T('despesa', 100, 'l')]), true);            // empate conta como verde
  assert.strictEqual(v([]), false);                                                          // mês vazio não comemora
  assert.strictEqual(v([T('transferencia', 999, null)]), false);                             // só transferência = sem movimento
});
console.log(`\n${ok} testes passaram`);
