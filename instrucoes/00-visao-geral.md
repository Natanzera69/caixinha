# Planilha Financeiro — visão geral

## O que é

App de controle financeiro pessoal, **Caixinha** (`Planilha Financeiro.html`, na raiz da pasta `Economia`). Roda tanto local (aberto direto do Google Drive) quanto hospedado em `https://natanzera69.github.io/caixinha/Planilha%20Financeiro.html` (GitHub Pages) — é o mesmo arquivo. Cobre: lançamentos (receita/despesa/transferência, com método de pagamento e conta/cartão), contas bancárias, cartões de débito e crédito (sempre vinculados a uma conta — nunca soltos), compras parceladas, financiamentos, investimentos, receitas/despesas fixas mensais (aba Fixos), orçamento por categoria, e um Início navegável por mês com saldo projetado e gastos por banco/categoria.

Cada pessoa entra com seu próprio login (e-mail/senha, via Firebase Auth) — os dados de cada uma ficam completamente isolados. Pensado hoje pro usuário, com plano de a namorada dele criar a própria conta e usar o mesmo app pras finanças dela, sem ver os dados um do outro.

Modelo de pagamento: ao lançar em Débito ou Crédito, o app pede pra escolher o **cartão** (não a conta direto) — cada cartão já sabe a qual conta pertence, então o app resolve sozinho de onde o dinheiro sai (débito) ou em qual fatura entra (crédito). Cartão emprestado de terceiro (ex: da namorada) é marcado como tal no cadastro do cartão — em vez de puxar de uma conta sua, tudo gasto nele vira "você deve pra fulano", que dá pra quitar (total ou parcialmente) com o botão "Registrar pagamento".

## Como abrir

Pelo link `https://natanzera69.github.io/caixinha/Planilha%20Financeiro.html` (qualquer navegador, PC ou celular — no Android dá pra "Adicionar à tela inicial" pra abrir como app) ou dando duplo clique em `Planilha Financeiro.html` dentro da pasta `Economia`. Pede login (e-mail/senha) na primeira vez em cada aparelho; depois disso a sessão fica salva. A tela de Config (backup, PIN, categorias, orçamento, sincronização) não fica na barra de abas — é acessada só pelo ícone ⚙️ no canto superior direito.

## Como os dados funcionam (importante)

- Cada aparelho guarda uma cópia no `localStorage` do navegador (abrir, adicionar lançamentos, editar, tudo salva sozinho na hora) **e** sincroniza automaticamente em tempo real com o Firestore, na nuvem — editar em um aparelho aparece nos outros sozinho, sem precisar fazer nada, desde que logado na mesma conta.
- Funciona offline: continua editando sem internet, e sincroniza sozinho quando a conexão volta.
- O backup manual (**Config → Fazer backup / Importar backup**) continua existindo como cópia extra independente da nuvem — gera um `.json` na pasta `Economia/backups/`. A importação **mescla** os dados por id + data de atualização (o registro mais recente de cada um vence).

## PIN, bloqueio ao minimizar e validade do login

- **PIN de 4 dígitos**, um por aparelho (vale para o perfil pessoal e o empresarial). Fica no `localStorage` do aparelho (hash SHA-256), **nunca** vai para a nuvem nem para o backup. É só um deterrente local: não criptografa nada; a segurança de verdade é a senha da conta.
- **Bloquear ao minimizar** (Config → Segurança, vem **ligado** por padrão): ao minimizar ou trocar de app/aba, a tela trava e pede o PIN. O 4º dígito entra sozinho. Só trava com login ativo e PIN criado. "Esqueci o PIN" faz sair e entrar de novo com e-mail e senha (login recém-feito não pede PIN em seguida).
- **Login lembrado por 30 dias fixos** desde o último login com e-mail e senha; depois pede de novo (como app de banco). 5 PINs errados seguidos também pedem e-mail e senha. Sem login o PIN não abre o app.
- Quem ainda não tem PIN recebe um aviso para criar (pode escolher "Agora não").

## Estrutura de pastas

```
Economia/
  Planilha Financeiro.html   <- o app em si
  manifest.json, sw.js       <- suporte a PWA (instalar como app no Android)
  assets/                    <- logo, ícones 8-bit (assets/icons), moeda girando e ícones do app (PNG 192/512)
  icones/                    <- só os originais enviados pelo usuário (Icone.jpg, Logo.png)
  backups/                   <- snapshots .json gerados pelo botão "Fazer backup" (fora do git)
  instrucoes/                <- esta pasta, mantida pelo Claude entre sessões
```

Também é um repositório git, publicado em `github.com/Natanzera69/caixinha` e hospedado via GitHub Pages — qualquer alteração pedida ao Claude já sai publicada no site também (não é preciso repetir configuração nenhuma).

Veja também: [01-arquitetura.md](01-arquitetura.md) (decisões técnicas), [02-modelo-de-dados.md](02-modelo-de-dados.md) (campos de cada entidade), [03-changelog.md](03-changelog.md) (histórico do que foi feito).
