// Captura as telas do Caixinha (servidor local + dados falsos do seed.js) em 3 larguras e 2 temas, para comparar antes × depois.
// Uso: no MCP do Playwright, "browser_run_code_unsafe" com filename "ferramentas/capturar-telas.js" (servidor: node ferramentas/serve.js).
// Troque DEST entre "antes" e "depois". Devolve a lista de arquivos e erros de console.
async (page) => {
  const DEST = 'design/pacotes/retrofit/depois';
  const tamanhos = [[1280, 800, 'desktop'], [768, 1024, 'tablet'], [375, 812, 'celular']];
  const abas = ['dashboard', 'lancamentos', 'graficos', 'contas', 'parcelamentos', 'investimentos'];
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => erros.push('pageerror: ' + String(e.message).slice(0, 160)));
  await page.goto('http://localhost:8766/');
  await page.waitForFunction(() => typeof window.fbAuth !== 'undefined' && typeof carregarEstado === 'function');
  // o Firebase responde "sem usuário" um instante depois: espera a tela de login aparecer para o seed não ser coberto
  await page.waitForFunction(() => !document.getElementById('loginScreen').classList.contains('hidden'), null, { timeout: 15000 }).catch(() => {});
  await page.addScriptTag({ url: '/ferramentas/seed.js?' + Date.now() });
  const arquivos = [];
  const foto = async (nome, cheia) => { const p = `${DEST}/${nome}.png`; await page.screenshot({ path: p, fullPage: !!cheia }); arquivos.push(p); };
  for (const [w, h, tam] of tamanhos) {
    await page.setViewportSize({ width: w, height: h });
    for (const tema of ['claro', 'escuro']) {
      const escuro = tema === 'escuro';
      await page.emulateMedia({ colorScheme: escuro ? 'dark' : 'light', reducedMotion: 'reduce' });
      const prefixo = `${tam}-${tema}`;
      const preparar = async (js) => { await page.evaluate(js); await page.evaluate(e => { document.documentElement.classList.toggle('dark', e); }, escuro); await page.evaluate(() => window.scrollTo(0, 0)); };
      for (const aba of abas) { await preparar(`window.__seed('${aba}')`); await foto(`${prefixo}-${aba}`, true); }
      for (const sec of ['geral', 'categorias', 'subs', 'virada']) {
        await preparar(`(()=>{ window.__seed('config'); secaoConfigAberta='${sec}'; catAbertos.despesa=true; renderConfig(); })()`);
        await foto(`${prefixo}-config-${sec}`, true);
      }
      const janelas = { 'lancamento': 'abrirFormTransacao()', 'conta': 'abrirFormConta()', 'reset': 'abrirReiniciarTudo()' };
      for (const [n, js] of Object.entries(janelas)) {
        await preparar(`(()=>{ window.__seed('dashboard'); ${js}; })()`);
        await foto(`${prefixo}-janela-${n}`, false);
        await page.evaluate(() => fecharModal(true));
      }
      await preparar(`(()=>{ window.__seed('dashboard'); document.getElementById('app').classList.add('hidden'); document.getElementById('loginScreen').classList.remove('hidden'); })()`);
      await foto(`${prefixo}-login`, false);
      await preparar(`(()=>{ document.getElementById('loginScreen').classList.add('hidden'); document.getElementById('lockScreen').classList.remove('hidden'); })()`);
      await foto(`${prefixo}-pin`, false);
      await page.evaluate(() => { document.getElementById('lockScreen').classList.add('hidden'); });
    }
  }
  return { total: arquivos.length, erros: [...new Set(erros)].slice(0, 12), exemplo: arquivos.slice(0, 3) };
}
