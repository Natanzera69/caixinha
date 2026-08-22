# Mudanças futuras — hospedagem, PWA e sincronização entre PC e celular

> Este arquivo documenta um plano discutido e **ainda não implementado**. Serve pra continuar a conversa/trabalho em outro computador ou numa sessão futura. Antes de implementar, revisar com o usuário se algo mudou de ideia.

## Contexto e objetivo

Hoje o app (`Planilha Financeiro.html`) roda 100% local: arquivo aberto direto do Google Drive, dados salvos no `localStorage` do navegador. Isso cria dois problemas que o usuário quer resolver:

1. **PC e celular têm "bancos" de dados separados** — mesmo abrindo o mesmo arquivo, o `localStorage` é por navegador/aparelho, não sincroniza sozinho (hoje a única forma de levar dados de um pro outro é o backup/import manual já implementado).
2. **Experiência de app no celular** — quer instalar na tela inicial do Android e abrir em tela cheia, sem parecer aba de navegador. No PC, quer continuar sendo um site normal.

## Decisão tomada (discutida e validada com o usuário, falta implementar)

Três mudanças independentes, nessa ordem de dependência:

### 1. Hospedagem: GitHub Pages
- Motivo: grátis, HTTPS, URL fixa, deploy é só `git push`, e o projeto é um HTML estático sem build step — GitHub Pages é o encaixe mais simples.
- Alternativa equivalente se um dia quiser trocar: Cloudflare Pages (CDN mais rápido, mesmo processo). Não há motivo pra isso agora.
- **Sem custo** — plano gratuito do GitHub Pages não tem limite de tempo nem risco de cobrança pro tamanho desse projeto.

### 2. PWA (Progressive Web App)
Independente da sincronização — resolve só a parte de "instalar como app" e funciona mesmo que a sincronização (item 3) demore mais pra sair.
- `manifest.json`: nome do app, ícones 192x192 e 512x512, `display: standalone`, cor de tema/fundo.
- `<link rel="manifest">` e `<meta name="theme-color">` no `<head>` do HTML.
- Service worker básico pra cachear o shell (HTML/CSS/JS) e funcionar offline também.
- No Android, abrir o link no Chrome → menu (⋮) → **"Adicionar à tela inicial"** → abre em tela cheia, sem barra de endereço, ícone próprio. No PC não muda nada (o manifest só age quando alguém instala explicitamente).
- **Sem custo** — é só código, não é um serviço.

### 3. Sincronização: Firebase Firestore (com Anonymous Auth)
Avaliamos três opções e a escolha foi Firestore:

- **Google Sheets como banco** — descartado. Exigiria Apps Script Web App (Sheets API não dá pra embutir com segurança num HTML estático, precisa de OAuth2 ou service account), mais lento, cold start, e o modelo de dados atual (objeto único com várias listas) não mapeia bem pra linhas de planilha.
- **Export/import manual de JSON** — já é o que o app faz hoje (backup + merge por `id`/`updatedAt`). Não resolve sincronização automática, continua sendo ação manual.
- **Firebase Firestore (escolhido)** — o estado inteiro do app já é um único objeto JSON (`state` com `contas`, `cartoes`, `transacoes`, `recorrencias`, `financiamentos`, `investimentos`, `categorias`, `config`). Isso mapeia quase 1:1 pra **um único documento do Firestore**: não precisa redesenhar o modelo de dados, só trocar onde ele é lido/escrito. E a lógica de merge por `id` + `updatedAt` que já existe pro import de backup (`mesclarEstado()`) **é reaproveitada** pra resolver conflito entre PC e celular em tempo real.

**Sobre "sem login"**: usar **Firebase Anonymous Auth** — cria uma sessão sozinho, silenciosamente, sem tela de login nenhuma pro usuário. A regra de segurança do Firestore restringe leitura/escrita a esse documento específico pra quem estiver autenticado (mesmo anonimamente). Na prática a privacidade vem da obscuridade (ninguém mais conhece o ID do projeto/documento) — mesmo nível de proteção que o PIN local já oferece hoje (deterrente, não criptografia de ponta a ponta). A "API key" do Firebase que aparece no código **não é secreta** — é feita pra ficar visível no client; a segurança real está nas regras do Firestore.

> **Atualização (2026-08-22)**: usuário quer, mais pra frente, que a namorada tenha um perfil **totalmente separado** (contas/cartões/lançamentos próprios, sem ver os dados dele). Auth anônima não serve pra isso — ela identifica o *aparelho*, não a *pessoa*, então não dá pra logar como "ela" de um aparelho diferente. Precisa virar **Firebase Auth com email/senha** (ainda simples, sem redesenhar UI de login complexa): cada pessoa loga com um email/senha próprio, e o documento no Firestore passa a viver em `users/{uid}/state` em vez de um documento fixo único — a regra de segurança troca "autenticado" por "autenticado E dono desse uid". O resto do plano (Firestore, merge por id/updatedAt, debounce) não muda. Login vira uma tela nova no app (ainda não desenhada) — decidir na hora: email/senha simples, ou Google Sign-In (mais rápido de implementar, sem gerenciar senha).

**Custo**: plano gratuito (Spark) — 50.000 leituras/dia, 20.000 escritas/dia, 20.000 exclusões/dia, 1 GiB de armazenamento. Uso pessoal de uma pessoa fica muito abaixo disso. Não há cobrança automática ao estourar limite (só passa a recusar requisição até o dia seguinte) — cobrança só existiria se o usuário mudasse manualmente pro plano pago (Blaze).

## O que muda na estrutura do código atual

- **Perde a garantia de "arquivo 100% offline, zero dependência externa"** que o projeto tinha até aqui — vai precisar carregar o SDK do Firebase (via CDN ou bundlado). É uma concessão real ao design atual (documentado em [01-arquitetura.md](01-arquitetura.md)), o usuário está ciente e topou.
- `salvarEstado()` precisa de **debounce** — hoje escreve a cada alteração no `localStorage` (grátis e instantâneo); no Firestore isso tem custo de quota e latência de rede, então não dá pra manter "salvar a cada tecla".
- Precisa de um **listener em tempo real** (`onSnapshot`) que recebe mudanças feitas no outro aparelho, aplica via `mesclarEstado()` (já existe) e dispara `renderTudo()`.
- Firestore tem **persistência offline nativa** — o usuário continua editando sem internet, e sincroniza sozinho quando a conexão volta. Não perde a resiliência offline que o app tem hoje, só ganha uma dependência de rede pra sincronizar de fato entre aparelhos.
- PIN, backup manual (export/import), tudo isso **continua existindo como está** — vira um "cinto de segurança" extra (cópia local independente da nuvem), não fica obsoleto. O PIN continua nunca viajando pro Firestore, mesma lógica de hoje (nunca sai do aparelho).
- `localStorage` deixa de ser a fonte de verdade única — passa a ser mais um cache local, com o Firestore como fonte de verdade compartilhada entre aparelhos.

## Fluxo final esperado (depois de tudo implementado)

- PC: abre o link do GitHub Pages normalmente em qualquer navegador, como um site comum.
- Celular (Android/Chrome): abre o mesmo link, "Adicionar à tela inicial", abre em tela cheia como um app nativo.
- Os dois apontam pro mesmo documento no Firestore — editar em um reflete no outro automaticamente (tempo real quando online, sincroniza na volta quando offline).

## Próximos passos (ainda não feitos)

1. Criar repositório no GitHub e publicar via GitHub Pages.
2. Criar projeto no Firebase (console.firebase.google.com, mesma conta Google do usuário), ativar Firestore e Anonymous Auth.
3. Adicionar SDK do Firebase ao HTML, trocar `carregarEstado()`/`salvarEstado()` pra ler/escrever no Firestore (com debounce) e adicionar o listener `onSnapshot` reaproveitando `mesclarEstado()`.
4. Adicionar `manifest.json`, ícones (192x192 e 512x512), meta tags e service worker básico.
5. Testar instalação no Android (S25 FE do usuário) via "Adicionar à tela inicial" e validar que abre em tela cheia.
6. Atualizar [00-visao-geral.md](00-visao-geral.md), [01-arquitetura.md](01-arquitetura.md) e [02-modelo-de-dados.md](02-modelo-de-dados.md) refletindo a nova arquitetura (deixar de descrever o app como "sem servidor, sem internet, só localStorage").

## Perguntas em aberto pra quando for implementar

- Nome/ícone do app pro manifest (o que aparecer na tela inicial do Android)?
- Cor de tema/fundo do manifest (pode seguir a paleta indigo já usada no app: `--primary:#4f46e5`).
- Nome do repositório GitHub / se o usuário já tem conta GitHub configurada localmente (git credentials).
