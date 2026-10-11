# Changelog

## 2026-10-11 (8) — Virada do mês, quadro vazio preenchendo o cartão e auditoria de alinhamento

- **Config → Virada do mês**: escolha o dia (1–28) em que o seu mês começa. Com dia 10, de 10/fev a 09/mar conta como **Fevereiro**. Vale para o que não entra em fatura de cartão e não é fixo (Pix, dinheiro, boleto, débito). Cartão de crédito continua pelo dia de fechamento do cartão; **fixos ficam no mês do calendário**. Segue em Início, Gráficos (incluindo média por dia, comparação e orçamento) e na lista de Lançamentos; o cabeçalho mostra o período ("de 10/10 a 09/11") e o "mês atual" respeita o dia (antes do dia 10 o mês atual ainda é o anterior). Por perfil (pessoal/PJ) e sincroniza entre aparelhos.
- **Quadro pontilhado**: em cartões lado a lado (Próximos vencimentos, Comparado com o mês anterior, Maiores gastos) o estado vazio agora preenche a altura toda do cartão.
- **Auditoria de alinhamento** (desktop 1280, tablet 768, celular 375; claro e escuro; todas as abas, seções da Config e janelas): corrigido o ícone da nova categoria (40 px ao lado de campos de 44 px) e a fonte dos filtros de Lançamentos no celular (texto encostava na seta). Ferramenta nova: `ferramentas/sonda-alinhamento.js` (botões fora do centro, irmãos desalinhados, estouro horizontal, cartões com alturas diferentes).
- Testes: 34 casos (3 novos). Cache do service worker v13.

## 2026-10-11 (7) — Gráficos em listas, PIN sem "salvar senha" e Subcategorias em Config

- **Painel de gráficos**: no lugar dos botões e chips, três listas com rótulo — **Mostrar** (Despesas/Receitas), **Agrupar por** (Categoria, Subcategoria, Banco, Pagamento, Evolução) e **Gráfico** (Rosca, Pizza, Barras, Colunas; na Evolução: Período e Colunas/Linha). Visão por subcategoria ganha a lista **Categoria**. A escolha continua salva no aparelho.
- **PIN**: os campos de PIN deixaram de ser `type="password"` (o navegador oferecia "salvar senha" no Google/Samsung Pass a cada PIN). Agora são texto numérico mascarado por CSS (`-webkit-text-security`) com atributos que gerenciadores de senha ignoram. A senha do **login** continua normal.
- **Subcategorias**: nova seção **Config → Subcategorias** (logo abaixo de Categorias) com formulário Categoria + Nome e a lista agrupada por categoria (renomear/excluir). Em Categorias, "+ sub"/"N subs" leva até lá com a categoria escolhida. No lançamento e no fixo o campo **Subcategoria (opcional)** aparece sempre (fora transferência), com **+ Nova** para criar na hora.
- Testes: 31 casos (2 novos). Cache do service worker v12.

## 2026-10-11 (6) — Reset geral da conta e ajustes para o modo escuro do navegador

- **Config → Zerar tudo → "Apagar tudo e recomeçar"**: apaga lançamentos, contas, cartões, categorias, subcategorias, fixos, parcelamentos, financiamentos, investimentos, o perfil PJ e as configurações, **em todos os aparelhos**; o login (e o PIN do aparelho) continuam. Pede para digitar APAGAR, oferece "Baixar backup antes" e só mexe no aparelho depois de conseguir zerar a nuvem.
  - Como funciona: a nuvem recebe um estado novo com `config.resetEm` (instante do reset). Qualquer aparelho que receba um `resetEm` mais novo esquece o que tinha; registros mais velhos que o `resetEm` nunca voltam (nem de aparelho desatualizado). O PJ vira um marcador `removerPerfil`. Sem mudança nas regras do Firestore.
  - Por que o apagar manual no console não adiantava: os aparelhos que já tinham os dados reenviavam tudo no próximo sync (a mescla junta, nunca apaga).
  - Restaurar um backup depois de um reset carimba os registros como novos (senão o corte os descartaria).
- **Versão do app** em Config → Sobre e botão **"Atualizar o app agora"** (limpa cache e service worker e recarrega).
- **Modo escuro do navegador (Samsung Internet)**: o app agora declara `color-scheme: only light` (+ `darkreader-lock`) para o navegador não escurecer por cima; no tema escuro o cartão "Patrimônio" ficou com fundo escuro e valor amarelo (sobrevive melhor a inversão de cor); aviso em Config → Aparência. Se o navegador ainda inverter, desligar "modo escuro em sites" para o Caixinha.
- Testes: 29 casos (3 novos). Cache do service worker v11.

## 2026-10-11 (5) — Tema automático e botões/ícones mais visíveis no escuro

- **Causa do "escuro demais" e da moeda estranha no celular**: o app estava no tema claro e o navegador do celular (modo escuro do Samsung Internet) escurecia a página por conta própria, invertendo cores e a moeda pixelada. O app não avisava o navegador de que tem tema escuro próprio.
- **Tema automático**: Config → Aparência agora tem **Claro / Escuro / Automático**. Automático segue o modo escuro do aparelho (padrão para quem nunca escolheu); a escolha sincroniza entre aparelhos, e "Automático" vale por aparelho.
- O app agora declara ao navegador qual tema está usando (`color-scheme`: "dark" no escuro, "only light" no claro), para ele não escurecer por cima.
- **Tema escuro**: bordas, botões, chips, abas e ícones da barra inferior com mais contraste (borda clara de detalhe, texto e ícones mais claros).

## 2026-10-11 (4) — Faxina e nova organização das pastas

Nomes antigos citados no histórico abaixo → onde estão hoje:
- `instrucoes/*.md` → `documentacao/` (`Mudanças Futuras.md` virou `documentacao/pendencias.md`; `apuracao/CHECKLIST.md` virou `documentacao/checklist-apuracao.md`)
- `instrucoes/apuracao/*.js` → `ferramentas/`
- `icones/Icone.jpg`, `icones/Logo.png` → `design/originais/` (o `LEIA-ME.txt` antigo foi removido)
- `para-design/` e `Redesign Caixinha minimalista/` (pacotes já usados) foram para a Lixeira; os pacotes novos saem em `design/pacotes/` (fora do git)
- Comandos: `node ferramentas/serve.js`, `node ferramentas/teste-logica.js`, `node ferramentas/gerar-mockup-design.js`.

## 2026-10-11 (3) — Retoques V2 do Claude Design: listas e desbloqueio

Só aparência (pacote "Redesign Caixinha minimalistaV2"):
- **Listas (`<select>`)**: seta 8-bit no lugar da nativa, nos dois temas; no Chrome/Edge/Android a lista aberta ganha o visual do site (borda e sombra "pixel", opção escolhida em verde com V 8-bit, rótulos de grupo em Pixelify). Safari/iOS e Firefox abrem a lista nativa. Campos de data/mês ganham o ícone de calendário 8-bit.
- **Desbloqueio do PIN**: ao acertar, as caixinhas ficam verdes, o cadeado abre e uma "íris" revela o app (~1,15 s; com "reduzir movimento" vira um fade). O app aparece por baixo e o aviso inicial só abre depois; PIN errado e o limite de 5 erros ficam iguais. Um temporizador de segurança (1,6 s) garante que a tela nunca fica presa.
- 6 ícones novos em `assets/icons/` (chevron, chevron-dark, check, lock-open, calendar-ind, calendar-ind-dark). Cache do service worker v9.

## 2026-10-11 (2) — Subcategorias opcionais e X dos modais centralizado

- **Subcategorias** (opcionais): cada categoria pode ter subcategorias (ex.: Alimentação › iFood, Besteira da namorada, Almoço do serviço). Nenhum lançamento é obrigado a ter uma; sem escolher, fica só na categoria.
  - Config → Categorias: botão "N subs" / "+ sub" em cada categoria abre a lista com adicionar, renomear e excluir (a busca também acha pelo nome da subcategoria).
  - Lançamento e fixo: campo "Subcategoria (opcional)" abaixo da categoria (só aparece se a categoria tem subs; trocar de categoria zera). Fixos geram lançamentos já com a subcategoria.
  - Lançamentos: aparece "Categoria › Sub" na linha e há filtro por subcategoria quando a categoria filtrada tem subs. Maiores gastos também mostram.
  - Gráficos: nova visão **Subcategoria** (aparece depois da 1ª criada), com filtro por categoria; o que não tem sub entra com o nome da categoria e o total continua batendo.
  - Excluir subcategoria em uso: os lançamentos ficam na categoria e só perdem a subcategoria. Excluir categoria leva as subs junto (pede confirmação).
  - Orçamento continua por categoria.
- **Regras do Firestore**: `subcategorias` entrou na lista de campos permitidos de `users/{docId}` — **republicar `firestore.rules` no console**. Enquanto ninguém criar subcategoria, a lista vazia nem é enviada, então quem não usa o recurso não depende da regra nova (`paraNuvem`).
- **X dos modais**: o ícone ficava deslocado por causa da margem de ícone de texto; agora o botão é flex e o ícone tem 14 px centralizado (conferido: desvio 0,00 px).
- Testes: 26 casos (1 novo). Cache do service worker v8.

## 2026-10-11 — Validação de campos, parcelas já pagas, gráficos e Config em sanfona

**Validação (todos os formulários e assistentes)**
- Funções puras testadas: `validarTexto`, `validarValor`, `validarInteiro`, `validarData`, `nomeDuplicado`; erro vermelho embaixo do campo, com foco (no lugar dos `alert`).
- Texto: 2–60 caracteres na descrição (40 em nomes, 300 em notas), sem `< > { } \ `` nem caracteres invisíveis/de controle, espaços repetidos viram um.
- Valores: maior que zero (investimento aceita 0; saldo inicial de conta aceita negativo, com confirmação), máximo R$ 999.999.999,99, só números.
- Dias 1–31 (DAS 1–28), meses do fixo 1–11, parcelas 1–120, financiamento até 600; datas reais entre 2000 e 2100 (aviso se mais de 1 ano à frente).
- Nome repetido bloqueado em contas, cartões, investimentos e categorias (do mesmo tipo). Pagamento de fatura/ao terceiro nunca passa da dívida.

**Compra parcelada com parcelas já pagas**
- Novo campo "Parcelas já pagas" (0 a total−1; 15 de 12 é recusado). Cria só as parcelas que faltam, a partir da data da compra, com prévia ("12x de R$ 83,33 · 3 já pagas · restam 9 · próxima 4/12 em …").
- Fixos mostra o progresso certo (3/12) mesmo quando o grupo começa na parcela 4.

**Gráficos**
- Início: um painel com Despesas/Receitas, agrupamento por Categoria, Banco, Pagamento ou Evolução (6/12 meses) e tipo Rosca, Pizza, Barras, Colunas ou Linha. A escolha fica salva no aparelho.
- Nova aba **Gráficos**: KPIs (receitas, despesas, saldo, taxa de poupança, média por dia, maior gasto), painel de distribuição, evolução receitas × despesas, comparação com o mês anterior, maiores gastos e orçamento × gasto.
- SVG próprio (sem biblioteca): total no centro da rosca, destaque ao passar o mouse/tocar, legenda ligada ao gráfico, "Outros" agrupa as fatias pequenas, animação (respeita "reduzir movimento").

**Config**
- Seções recolhíveis (uma aberta por vez) com resumo na própria linha. Categorias com busca e grupos Despesas/Receitas recolhíveis; renomear categoria; "Sair da conta" fica sempre visível no topo.

Testes: 25 casos (7 novos). Cache do service worker v7.

## 2026-10-10 — Sincronização verificável e à prova de "conta zerada"

Motivo: conta aberta em outro PC apareceu vazia. A nuvem (Firestore) é o que um aparelho novo baixa; ela estava vazia porque os documentos do usuário foram apagados a pedido (limpeza de testes) e o aparelho com os dados só reenviava na **próxima edição**; além disso erros de leitura/gravação eram engolidos em silêncio.

- **Reenvio imediato**: ao conectar, se a nuvem está vazia e o aparelho tem dados, sobe na hora (`decidirSincronia`); se há dados dos dois lados, junta e devolve. Antes só subia na próxima edição.
- **Regra de ouro**: nunca grava na nuvem sem ter conseguido LER o documento antes (um aparelho novo, com o estado padrão, não consegue sobrescrever dados reais se a leitura falhar). A leitura é refeita antes de cada envio.
- **Sem erro silencioso**: falhas viram aviso ("Não consegui sincronizar — seus dados estão salvos neste aparelho") e ficam no painel.
- **Config → Sincronização**: estado por perfil (neste aparelho × nuvem, último envio, último erro) e botões **Verificar agora**, **Enviar deste aparelho** e **Baixar da nuvem** (juntam, nunca apagam).
- Última edição não fica mais presa no atraso de 1,5 s: grava ao sair da aba (`visibilitychange`/`pagehide`).
- Testes: 18 casos (inclui a decisão de sincronia); cenários simulados: nuvem vazia × aparelho cheio, aparelho novo × nuvem cheia, leitura que falha, gravação negada.

## 2026-10-07 — Apuração 3 de 3 (tablet): layout e paridade com o mobile

- **Início sem card órfão** em qualquer largura: até 999 px o painel usa hero em linha cheia + cards em 2 colunas (se sobrar um, ele ocupa a linha inteira; no celular também). Antes, entre 700 e 799 px a grade automática gerava 3 colunas com o "Saldo projetado" sozinho. A grade com hero 2×2 + 4 colunas passa a valer só a partir de 1000 px (no iPad Air 820 px os cards eram pequenos demais). "Investimentos"/"Cartões" também não deixam card sozinho no celular.
- Gráfico + Próximos vencimentos lado a lado a partir de 700 px; janela de formulário de 560 px a partir de 768 px.
- Reservas de CSS para navegadores sem container queries (iPadOS 15 e WebViews antigos): os valores e a moeda do hero mantêm o tamanho anterior.
- **Paridade com o mobile em aparelhos de toque (`pointer:coarse`)**: em Lançamentos, tocar na linha edita (com Excluir no formulário) também no tablet; as outras listas mantêm os ícones na linha, com 44 px. Já valiam em qualquer largura: login/PIN que rolam, botão Voltar, sem puxar-para-atualizar, instalar o app, teclado decimal.
- Conferido no preview em 690, 744 (toque), 768, 800, 820, 999, 1000 e 1024 px. As três apurações (desktop, mobile, tablet) estão concluídas.

## 2026-10-07 — Apuração 2 de 3 (mobile): design, toque e 2 features

**Design / toque**
- **Login, PIN e tela de espera rolam** quando não cabem (teclado aberto, paisagem): antes o cartão ficava cortado no topo (campos de e-mail inalcançáveis em 420 px de altura).
- **Linhas das listas**: em Lançamentos, tocar na linha abre a edição (os ícones somem no celular; o formulário de edição ganhou o botão **Excluir**; pagamento de fatura pede exclusão ao tocar). Contas, Cartões, Fixos, Investimentos e Financiamentos: as ações vão para uma faixa embaixo da linha. Nomes deixam de ser cortados.
- Alvos de toque de 44 px (ícones das linhas, botões pequenos, seg, fechar, abas do seletor, cores, orçamento); fontes mínimas de 11,2 px; topo mais leve ("Empresa"/"Pessoal" no celular); card "Saldo projetado" mais curto.
- Janela de formulário com `dvh`; `interactive-widget=resizes-content` e barra inferior escondida enquanto digita; `theme-color` acompanha o tema manual; metas do iPhone.

**Comportamento**
- Botão **Voltar** do Android fecha a janela aberta (formulários, seletor de ícones, wizard) sem acumular histórico.
- **Puxar para atualizar desligado**; sem atraso de toque duplo; teclado decimal nos valores e `autocomplete=off` nos campos livres.
- **Config → Instalar o app**: botão que abre o convite de instalação (Android/Chrome) ou mostra o passo a passo (iPhone/outros); some quando já está instalado.
- Conferido no preview com emulação de celular (375×812, 320×640, 375×420); o que depende de teclado real, iPhone e do S25 está na lista de teste do usuário.

## 2026-10-07 — Apuração 1 de 3 (desktop): design, lógica e 2 features

**Design**
- Início: sem buraco no painel nos meses que não são o atual (o último card ocupa 2 colunas); valores grandes não estouram o card em janelas estreitas (tamanho da fonte acompanha a largura do card via container query); moeda do hero escala com o card.
- Estados de hover (botões, linhas, abas do seletor, etc.), só em dispositivos com mouse; aba "Investimentos" por extenso fora do celular.
- Acessibilidade: foco preso no modal (Tab/Shift+Tab); rótulos automáticos nos campos (aria-label a partir do label) e nos filtros/orçamento; filtros do Lançamentos mais largos.

**Lógica**
- Excluir conta/cartão/categoria agora é bloqueado se ainda estiver em uso por **fixos, cartões ou financiamentos** (não só lançamentos), com a lista do que usa.
- Transferência com a mesma conta de origem e destino é recusada.
- Lançamentos: lista mostra 200 por vez ("Mostrar mais").

**Features**
- **Lançamentos**: navegação por mês (‹ ›), períodos Mês / Últimos 30 dias / Tudo, filtros por conta ou cartão e por categoria (além de tipo e busca sem acento) e faixa de totais do filtro (receitas, despesas, saldo, quantidade).
- **Restaurar backup** (Config → Backup): lê o .json do "Fazer backup" (formato novo e antigo), valida e mostra um resumo; **junta** com os dados atuais sem apagar nada (vale a versão mais recente) e tem a opção "Recuperar também o que apaguei depois do backup". O PIN do arquivo é ignorado.
- Testes: `teste-logica.js` com 17 casos (filtros, totais, usos, restauração).

## 2026-10-07 — Seletor de ícones (emojis) nas categorias

- Em Config → Categorias o ícone deixou de ser um campo de texto: agora é um botão que abre uma **tabela de emojis** (busca por nome em português, abas por grupo, aba **Finanças e casa** com os mais usados e aba **Recentes** guardada no aparelho). Vale também para "Nova categoria".
- Dados em `assets/emojis-pt.js` (1.551 emojis até a versão 13.1, sem tom de pele nem bandeiras de países), carregados só quando o seletor abre; gerado por `instrucoes/apuracao/gerar-emojis.js` a partir do Unicode e do CLDR (nomes em pt). Sem dependência externa, CSP intacta; `sw.js` v6 guarda o arquivo para uso offline.
- Ícones já salvos (inclusive digitados antes) continuam como estão. Testes de dados em `teste-logica.js` (13 passam).

## 2026-10-07 — Acesso só por convite + endurecimento de segurança

- **Convite**: `convites/{email}` (só o admin escreve) + e-mail verificado; as regras do Firestore (`firestore.rules`) negam leitura/escrita de `users/...` a quem não foi liberado. Tela "Confirme seu e-mail" / "Aguardando liberação" (com "Pedir acesso"); painel **Config → Convites** só para o admin (liberar, remover, pedidos, "Copiar convite").
- Cadastro envia e-mail de verificação, senha mínima de 8; "Esqueci a senha" no login (resposta genérica).
- "Sair da conta" pergunta se apaga os dados deste aparelho (localStorage + cache offline do Firestore).
- **Hardening**: CSP no `<head>`; anti-clickjacking; ícone e cor de categoria/conta escapados e limitados (antes iam crus ao HTML); regra do Firestore valida os campos do documento.
- Verificado sem criar contas: com a CSP o Firebase carrega, o Auth responde (`auth/invalid-credential`) e o Firestore nega leitura anônima (`permission-denied`); fluxos do gate/painel testados com stubs. Testes de lógica: 12 passam.
- **Pendente (console, feito pelo dono)**: publicar `firestore.rules` e demais itens de `04-seguranca.md`. Contas antigas (rickgoomes99, felipeunieuro, saidhenrique) ficam bloqueadas até serem convidadas.

## 2026-10-07 — Bloqueio ao minimizar + login de 30 dias (estilo app de banco)

- **Opção "Bloquear ao minimizar"** em Config → Segurança, ligada por padrão; ao minimizar/trocar de app trava e pede o PIN. Só trava com login ativo e PIN criado.
- **PIN de 4 dígitos, por aparelho** (antes: 4 a 8, por perfil — o perfil PJ sem PIN escapava do bloqueio). O PIN antigo é migrado sozinho. O 4º dígito entra automaticamente; "Esqueci o PIN" leva ao login; 5 erros seguidos pedem e-mail e senha.
- **Login lembrado por 30 dias fixos** (`planilhaFinanceiro_loginEm`); expirou → desloga e mostra "Sua sessão expirou". Quem já estava logado antes da atualização ganha 30 dias a partir do primeiro acesso. Login recém-feito não pede o PIN em seguida.
- **Bug corrigido**: o PIN abria o app mesmo deslogado; agora sem login leva à tela de login.
- Pedido de criar PIN (modal "Proteja seu Caixinha") para quem ainda não tem; "Agora não" não volta a insistir.
- Trocar de conta no mesmo navegador também limpa PIN, opção e sessão da conta anterior.
- Testes: `instrucoes/apuracao/teste-logica.js` (11 passam); fluxo completo (trava, auto-entrada, erro, 5 erros, expiração 29/31 dias, login manual, outra conta) conferido no preview com stubs do Firebase.

## 2026-10-07 — Apuração (2ª rodada): erros de dados, acessibilidade e extras

Leitura completa do código. Nenhum dado salvo foi apagado ou migrado. Testes de lógica em `instrucoes/apuracao/teste-logica.js` (7 passam com `TZ=America/Sao_Paulo`).

**Erros corrigidos**
- **Data em UTC**: `todayStr()` e outras usavam `toISOString()`, que vira o dia seguinte depois das ~21h no Brasil (pago/pendente, saldo, parcelas, fatura). Agora `isoLocal()` (data local).
- **Fixo duplicado entre aparelhos**: lançamento gerado por recorrência agora tem id determinístico `rec_<id>_<YYYY-MM>`; não regenera se foi apagado (tombstone). `mesesGerados` passa a ser união no merge.
- **Vazamento entre contas**: se entra uma conta diferente da última neste navegador (`planilhaFinanceiro_uid`), a cópia local da anterior é descartada antes de sincronizar. A nuvem não é tocada.
- **Config sincroniza**: `onboardingConcluido` (OR), `empresaNome` (se faltar) e tema (`config.temaAtualizadoEm`, vence o mais recente). PIN segue por aparelho.
- **Firestore e `undefined`**: remover orçamento deixava `undefined` e o `setDoc` falhava em silêncio; agora `delete` + envio via `JSON.parse(JSON.stringify())`.
- Badge pago/pendente calculado pela data (não mais congelado); editar fixo pausado não reativa; salário do wizard usa Pix (o formulário não oferece "transferência"); perfil PJ sempre tem ao menos uma conta ("Caixa PJ") e lançamento sem conta avisa; texto de Config → Sobre corrigido (há nuvem); modal "fixo" sem "mensal".
- **sw.js v5**: só intercepta GET do próprio site e das fontes (Firebase passa direto); a atualização do app não recarrega a página com modal aberto.

**Acessibilidade / PWA**: `role="dialog"`, `Esc` fecha, foco volta ao botão de origem, `aria-label` automático nos botões só com ícone, `aria-current` nas abas; contraste AA (`--text-faint` claro #6f7060 e escuro #8f937d, `--income` #117a37); ícone **maskable** (`assets/icon-maskable-512.png`).

**Extras**: bolinhas 8-bit no PIN (só espelham o `#lockInput`); textos do mockup (login "Oi de novo!", PIN "Caixinha trancada"); lista de Lançamentos mostra `fatura nov/26` nas compras no crédito; "Próximos vencimentos" no Início mostra a fatura fechada do cartão (vence/vencida em…) e deixa de listar as compras no crédito soltas desses cartões.

## 2026-10-06 — Redesign visual completo ("moeda 8-bit")

Pacote do Claude Design (`Redesign Caixinha minimalista/handoff/`) aplicado **só na aparência**: nenhuma função, cálculo, id usado pelo JS ou chave de localStorage foi alterada.

- `<style>` principal substituído por `caixinha-novo.css` (paleta creme/verde/moeda, sombra "dura", barra de progresso segmentada, tema escuro). Fontes Figtree (textos e valores) + Pixelify Sans (títulos) via Google Fonts, com fallback offline do sistema.
- Logo nova (moeda 8-bit + "caixinha") em `assets/`; mascote removido (topbar, login, hero do Início, loading, favicon, manifest). Ícone do PWA: `assets/icon-192.png` / `icon-512.png` (gerados do `icon-moeda-512.svg` sem suavização). `manifest.json` com `theme_color #16842f`; `sw.js` cache `caixinha-v4`.
- Emojis de sistema trocados por ícones 8-bit (`assets/icons/*.svg`, classe `.px-ico`, cor herdada do texto). Emojis de categoria (escolhidos pelo usuário) continuam. Criados `play.svg` e `pause.svg` (não vieram no pacote) para o botão Pausar/Reativar dos Fixos.
- Início: card "Patrimônio líquido" virou `.card.hero` com a moeda; cartões de resumo com bolinha colorida; "Saldo projetado" em destaque tracejado (`.card.projetado`). Donut mais grosso e `PALETA` nova (só afeta itens novos; cores já salvas ficam como estão).
- Ajustes além do pacote: `.row-actions button:not(.btn)` (o CSS novo achatava o botão "Registrar pagamento"); moeda do hero menor no mobile; `.lock-card{position:relative}`.
- Pendente (próxima rodada): bolinhas no campo de PIN (exige JS), revisão fina de espaçamentos/textos.

## 2026-10-06 — Fatura do cartão por fechamento + Pagar fatura

Pedido do usuário: compras no cartão devem seguir o fechamento da fatura (fecha dia 8 → de 08 do mês anterior a 07 do mês atual é uma fatura e conta como conta do mês).

- `mesCompetencia(t)` + `transacoesEfetivasDoMes` agora agrupam compras de crédito pelo mês do fechamento (Despesas do mês, Gastos por categoria/banco e Orçamento seguem isso). Antes tudo usava o mês do calendário da compra.
- Dívida do cartão próprio = todas as compras no crédito − pagamentos de fatura (antes: só compras do ciclo aberto, então fatura fechada e não paga sumia da dívida). Compras antigas de ciclos passados passam a aparecer como dívida até serem pagas.
- Novo botão 💸 **Pagar fatura** na aba Contas (cartão de crédito próprio) + linha "Fatura fechada a pagar". Registra uma transferência (`pagamentoFatura`) que debita a conta escolhida e abate a dívida, sem contar como despesa.
- Lógica de competência testada isoladamente (incluindo virada de dezembro). Teste de ponta a ponta na interface ainda pendente.

## 2026-08-22 — Hospedagem, PWA e sincronização via Firebase

Pedido do usuário: levar o app pra fora do Google Drive local — hospedar num link fixo, dar pra instalar como app no Android, e sincronizar de verdade entre PC e celular (sem depender de backup manual). Também quer, mais pra frente, um perfil separado pra namorada.

- **GitHub Pages**: repositório `Natanzera69/caixinha` público, publicado em `https://natanzera69.github.io/caixinha/Planilha%20Financeiro.html`. `.gitignore` protege a pasta `backups/` (nunca vai pro repositório público).
- **PWA**: `manifest.json`, `sw.js` (cache do shell pra funcionar offline) e ícones (`icones/icon-192.png`, `icon-512.png`, gerados a partir da arte fornecida pelo usuário com fundo removido). Logo (`icones/logo-web.png`) substituiu o "dot + texto" no topo do app. App renomeado de "Planilha Financeiro" pra **Caixinha** em todo o HTML (title, topbar, rodapé de Config).
- **Login por e-mail/senha (Firebase Auth)**: substituiu a auth anônima cogitada inicialmente — necessário porque o usuário quer perfis separados (dele e da namorada), e auth anônima identifica o *aparelho*, não a *pessoa*. Tela de login (`#loginScreen`) com Entrar/Criar conta nova, aparece quando não há sessão válida. Sessão persiste entre aberturas (não pede login toda vez).
- **Sincronização em tempo real (Firestore)**: cada usuário tem um documento próprio em `users/{uid}` (regra de segurança do Firestore restringe leitura/escrita ao dono do uid). `salvarEstado()` agora também dispara `sincronizarComFirestore()` (debounce de 1.5s) além de gravar no `localStorage` como sempre fez. Listener `onSnapshot` aplica mudanças vindas de outro aparelho via `mesclarEstado()` (mesma função já usada no import de backup) e re-renderiza. Firestore com persistência offline habilitada (`enableIndexedDbPersistence`) — o app continua funcionando sem internet, sincroniza sozinho quando a conexão volta.
- **PIN nunca sincroniza**: igual já acontecia no backup manual, `pinHash` sempre vai `null` pro Firestore — cada aparelho mantém o próprio PIN local.
- Corrigido durante o teste: no primeiro login de um aparelho "novo" (localStorage vazio) que já tinha dado na nuvem, o app criava a conta "Carteira" padrão local E trazia a da nuvem, duplicando. Agora, se o aparelho nunca teve dado local e já existe algo na nuvem, usa a nuvem direto em vez de mesclar com os defaults recém-criados.
- **Perfis separados (namorada)**: registrado como decisão pra próxima etapa em [Mudanças Futuras.md](Mudanças%20Futuras.md) — hoje cada login (e-mail/senha) já isola completamente os dados por `uid`, então criar uma segunda conta já resolve; falta só ela criar a própria conta quando quiser começar a usar.
- Testado via automação: criação de conta, sincronização de uma conta bancária nova pro Firestore em ~2s, sessão persistindo após reload com localStorage limpo (simulando "segundo aparelho"), dados chegando via `onSnapshot` sem duplicar.
- **Nota de arquitetura**: o app deixou de ser "100% offline, zero dependência externa" — agora carrega o SDK do Firebase via CDN. Ver [01-arquitetura.md](01-arquitetura.md).

## 2026-08-21 — Criação do app

- Criado `Planilha Financeiro.html` do zero: dashboard, lançamentos (com quick-add e parcelamento automático), contas & cartões (com cálculo de fatura/dívida), parcelamentos & financiamentos, investimentos, config (backup/import com merge, PIN, categorias).
- Criadas as pastas `backups/` e `instrucoes/` dentro de `Economia/`.
- Testado via automação de navegador: cálculos de saldo/fatura/dívida, geração de parcelas (3x de uma compra), pagamento de parcela de financiamento, investimentos e rentabilidade, proteção contra exclusão de categoria/conta/cartão em uso, definição de PIN + bloqueio/desbloqueio (PIN certo e errado), merge de backup (registro mais antigo não sobrescreve o mais novo, registro exclusivo do outro aparelho é incorporado), layout em viewport mobile (375px).
- Corrigido durante o teste: `salvarEstado()` não tinha tratamento de erro — se o `localStorage` falhar (ex: modo anônimo, cota excedida), agora mostra um aviso claro pro usuário em vez de falhar silenciosamente.
- Decisões registradas em [01-arquitetura.md](01-arquitetura.md); campos de cada entidade em [02-modelo-de-dados.md](02-modelo-de-dados.md).

## 2026-08-21 — Ajustes pedidos pelo usuário

- Adicionado botão "+ Novo" na seção "Compras parceladas em aberto" (aba Parcelas), que abre o formulário de lançamento já com método "Crédito" selecionado e o campo de parcelas em foco (`abrirFormParcelamento()`).
- Reforçado o bloqueio automático: além de já bloquear ao abrir o arquivo (quando há PIN configurado), agora também bloqueia sozinho sempre que a aba/app fica em segundo plano (`visibilitychange` → `bloquearApp()`) — trocar de app no celular, minimizar a janela ou trocar de aba já deixa a tela travada quando você volta.
- O PIN nunca mais viaja nos backups: `fazerBackup()` exporta o JSON com `config.pinHash` sempre `null`, e `mesclarEstado()` não importa PIN de outro aparelho. Cada aparelho guarda seu próprio PIN só no `localStorage` local — abrir um arquivo de backup em `backups/` não revela nem o hash do PIN.

## 2026-08-21 — Planejamento mensal, saldo projetado e recorrências (Fixos)

Pedido do usuário: navegar entre meses no Início, ver quanto vai sobrar até o fim do mês, e cadastrar receitas/despesas fixas (salário, telefone, etc.) que se repetem todo mês sem precisar lançar na mão.

- Nova entidade `recorrencias[]` (aba **Fixos**, antes "Parcelas" — renomeada porque agora reúne parcelamentos, financiamentos e recorrências): template de receita/despesa fixa com valor, dia do mês, categoria, forma de pagamento e conta/cartão. Editável, pausável (sem excluir) e excluível.
- `gerarTransacoesRecorrentesDoMes()` materializa cada recorrência ativa em uma transação real do mês assim que o app abre (ou assim que ela é criada) — o mês inteiro já aparece completo, sem esperar o dia da fatura/salário chegar. Não duplica: cada recorrência guarda em `mesesGerados[]` quais meses já foram gerados.
- Início ganhou **navegação entre meses** (‹ Mês Ano ›) com botão "Voltar para o mês atual". Todos os números do dashboard (receitas, despesas, gastos por categoria) passaram a respeitar o mês selecionado.
- Meses futuros mostram uma **projeção** das recorrências ainda não materializadas (sem criar nada de verdade); meses passados nunca mostram projeção, só o que realmente aconteceu.
- Novo card **"Saldo projetado (fim do mês)"**, visível só no mês atual: saldo de hoje + tudo que já está lançado pro resto do mês.
- Nova seção **"Orçamento por categoria"** no Início (aparece quando algum limite é definido em Config → Orçamento por categoria) com barra de progresso por categoria de despesa.
- `mesclarEstado()` passou a incluir `recorrencias` no merge de backups; `importarBackup()` materializa o mês atual logo após importar, pra uma recorrência trazida de outro aparelho não ficar só "virtual".
- Testado via automação: recorrência de receita e de despesa criadas via formulário materializam a transação do mês na hora; navegação para o mês seguinte mostra projeção sem criar transação real; mês passado não mostra nada fantasma; card de saldo projetado some fora do mês atual; orçamento por categoria calcula e mostra a barra corretamente; pausar/reativar recorrência; merge trazendo uma recorrência nova de "outro aparelho".

## 2026-08-21 — Cartão vinculado a conta, débito por cartão, ícone livre, limpeza de UI

Pedido do usuário: simplificar a navegação (tirar Config e o botão de cadeado do menu, tirar o "+" flutuante), deixar escolher qualquer ícone de categoria, e — o pedido mais estrutural — fazer débito também pedir "Cartão" (não só Conta) e obrigar todo cartão a estar vinculado a uma conta, pra que o gasto no cartão apareça no banco certo.

- **Nav horizontal**: removida a aba "Config" (só acessível pelo ícone ⚙️ no topo) e o botão "🔒 Bloquear" manual do topbar. O FAB "+" flutuante foi removido — "Novo lançamento" continua disponível pelo botão "+ Novo" da aba Lançamentos. O bloqueio automático ao abrir o arquivo com PIN configurado **não mudou**, só a forma manual de acionar o bloqueio antes de fechar a aba.
- **Ícone de categoria livre**: o ícone de cada categoria (em Config → Categorias) virou um campo de texto clicável — o usuário digita ou cola qualquer emoji (teclado de emojis do sistema, ex. Win+.) tanto ao criar quanto ao editar uma categoria já existente.
- **Cartões agora têm `tipo` (débito/crédito) e são obrigatoriamente vinculados a uma conta** (`contaId`), escolhida no próprio formulário do cartão em Contas. Cartão de débito não pede limite/fechamento/vencimento (não tem fatura). `abrirFormCartao()` bloqueia a criação se ainda não existir nenhuma conta cadastrada.
- **Lançamento e Fixo mensal com método Débito agora pedem "Cartão"** (filtrado aos cartões de débito), do mesmo jeito que Crédito já fazia — não pedem mais "Conta" diretamente. A conta debitada é resolvida sozinha a partir do cartão escolhido, então o saldo da conta continua descontando certinho sem o usuário precisar escolher a conta duas vezes. Se não existir cartão do tipo certo, o formulário avisa e bloqueia o envio.
- **Nova seção "Gastos por banco" no Início**: soma as despesas do mês por conta, já juntando débito (que cai direto na conta) com crédito (atribuído via `cartaoById(...).contaId`) — assim o gasto no cartão de crédito Nubank aparece dentro do total "Nubank", não como algo solto.
- Corrigido durante o teste: o resumo de "Cartões" no Início ainda mostrava "fatura R$0 de R$0" pra cartões de débito (que não têm fatura) — agora esse resumo só lista cartões de crédito.
- Testado via automação: conta "Nubank" com um cartão de débito e um de crédito, ambos vinculados a ela; lançamento em débito só oferece o cartão de débito e desconta certo da conta (saldo 1000→950); lançamento em crédito só oferece o cartão de crédito; "Gastos por banco" soma os R$50 (débito) + R$120 (crédito) como R$170 no Nubank; resumo de cartões do Início não mostra mais o cartão de débito com fatura fictícia; troca de ícone de categoria persiste; nav mobile sem Config/cadeado/FAB.

## 2026-08-21 — Cartão emprestado (de terceiro)

Pedido do usuário: ele também usa cartões emprestados da namorada e queria rastrear isso — decidi colocar no cartão (não no lançamento avulso), porque um cartão emprestado é reutilizado em vários lançamentos diferentes, então faz mais sentido marcar isso uma vez só, no cadastro do cartão.

- Cartão de crédito ou débito agora pode ser marcado como **"Emprestado"** no formulário (em vez de "Meu cartão"), com um campo "De quem é o cartão?". Nesse caso não precisa vincular a nenhuma conta própria.
- Tudo que é gasto num cartão emprestado vira **"Você deve"** pra aquela pessoa — soma automática de todas as despesas nele (`vocDeveNoCartao()`), que entra na dívida total e por isso **reduz o patrimônio líquido** (é uma dívida real, mesmo que informal).
- Botão **"Registrar pagamento"** (só aparece quando há dívida): registra quanto você já pagou de volta. Se você indicar de qual conta sua saiu o dinheiro, o app também lança uma despesa real "Pagamento a {pessoa}" nela — seu saldo desconta de verdade. Se não indicar conta (ex: pagou em espécie fora do controle), só abate o "você deve" sem mexer em nenhuma conta.
- Cartão emprestado nunca entra em "Gastos por banco" (não é dinheiro de nenhum banco seu) nem no resumo de fatura/limite do Início — aparece à parte, com "🤝 Emprestado" e "Você deve: R$X".
- Testado via automação: cartão "Cartão da Namorada" criado sem exigir conta; lançamento de R$90 nele soma certo no "você deve" e derruba o patrimônio líquido em R$90; não aparece em gastos por banco; pagamento parcial de R$40 sem conta só abate o "deve" pra R$50 sem criar lançamento; pagamento de R$50 com conta escolhida zera o "deve", cria a despesa "Pagamento a Namorada" e desconta o saldo da conta certinho; botão de pagamento some quando a dívida chega a zero.
