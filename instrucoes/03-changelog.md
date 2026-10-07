# Changelog

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
