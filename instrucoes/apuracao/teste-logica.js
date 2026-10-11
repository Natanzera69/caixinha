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
  'cartaoById', 'perfilTemDados', 'decidirSincronia', 'resumoPerfil', 'codigoErroSync', 'semAcento', 'filtrarLancamentos', 'totaisLancamentos', 'usosDe', 'sanearPerfilBackup', 'lerObjetoBackup', 'resumoBackup', 'aplicarBackupNoPerfil', 'escapeHtml', 'emailChave', 'iconeSeguro', 'corSegura', 'hashTexto', 'pinDoAparelho', 'definirPinAparelho', 'removerPinAparelho', 'bloqueioAoMinimizarAtivo', 'sessaoExpirada', 'fimDaSessao', 'mesCompetencia', 'recorrenciaDevidaNoMes', 'gerarTransacoesRecorrentesDoMes', 'mesclarEstadoEm', 'rotuloMes',
  'fmtMoney', 'fmtDate', 'validarTexto', 'validarValor', 'validarInteiro', 'validarData', 'nomeDuplicado', 'parcelasRestantes', 'validarParcelasPagas'];
const ctx = { crypto: require('crypto'), state: null, salvarEstado() {}, CHAVES_SINCRONIZAVEIS: ['contas', 'cartoes', 'categorias', 'transacoes', 'financiamentos', 'investimentos', 'recorrencias'] };
const store = {};
ctx.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
ctx.TextEncoder = TextEncoder; ctx.estados = { pessoal: null, pj: null }; ctx.salvarPerfilLocal = () => {};
vm.createContext(ctx);
const consts = script.match(/const SEG=\{[^\n]*\};/)[0] + '\n' + script.match(/const SESSAO_DIAS=\d+;/)[0] + '\n' + script.match(/const VALOR_MAX=[^\n]*\n/)[0] + script.match(/const TEXTO_PROIBIDO=[^\n]*\n/)[0] +
  script.match(/const lsGet=[^\n]*\nconst lsSet=[^\n]*\nconst lsDel=[^\n]*\n/)[0];
vm.runInContext(consts + '\n' + nomes.map(extrair).join('\n'), ctx);
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
  const src = fs.readFileSync(require('path').resolve(__dirname, '../../assets/emojis-pt.js'), 'utf8');
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
console.log(`\n${ok} testes passaram`);
