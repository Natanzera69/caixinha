# Planilha Financeiro — visão geral

## O que é

App de controle financeiro pessoal em um único arquivo HTML (`Planilha Financeiro.html`, na raiz da pasta `Economia`), sem servidor, sem internet, aberto direto do Google Drive no PC e no celular/tablet. Cobre: lançamentos (receita/despesa/transferência, com método de pagamento e conta/cartão), contas bancárias, cartões de débito e crédito (sempre vinculados a uma conta — nunca soltos), compras parceladas, financiamentos, investimentos, receitas/despesas fixas mensais (aba Fixos), orçamento por categoria, e um Início navegável por mês com saldo projetado e gastos por banco/categoria.

Modelo de pagamento: ao lançar em Débito ou Crédito, o app pede pra escolher o **cartão** (não a conta direto) — cada cartão já sabe a qual conta pertence, então o app resolve sozinho de onde o dinheiro sai (débito) ou em qual fatura entra (crédito). Cartão emprestado de terceiro (ex: da namorada) é marcado como tal no cadastro do cartão — em vez de puxar de uma conta sua, tudo gasto nele vira "você deve pra fulano", que dá pra quitar (total ou parcialmente) com o botão "Registrar pagamento".

## Como abrir

Dar duplo clique em `Planilha Financeiro.html` dentro da pasta `Economia` (sincronizada pelo Google Drive). Funciona offline, em qualquer navegador moderno, desktop ou mobile. A tela de Config (backup, PIN, categorias, orçamento) não fica na barra de abas — é acessada só pelo ícone ⚙️ no canto superior direito.

## Como os dados funcionam (importante)

- Cada aparelho guarda os dados sozinho no `localStorage` do navegador — abrir, adicionar lançamentos, editar, tudo salva sozinho na hora, sem precisar clicar em nada.
- **Não existe sincronização automática entre PC e celular** (é um arquivo estático, sem backend). Para levar os dados de um aparelho para o outro:
  1. No aparelho com os dados mais recentes, ir em **Config → Fazer backup**. Isso gera um `.json` na pasta `Economia/backups/` (no Chrome do PC, depois da primeira vez, o próprio diálogo já abre nessa pasta).
  2. No outro aparelho, ir em **Config → Importar backup** e escolher esse arquivo.
  3. A importação **mescla** os dados por id + data de atualização (o registro mais recente de cada um vence) — não apaga nada do aparelho que está recebendo o import.
- Recomenda-se fazer backup com uma certa regularidade (ex: sempre que for trocar de aparelho), já que é o único mecanismo de sincronia.

## PIN de acesso

Em **Config**, dá pra configurar um PIN simples que a tela pede toda vez que o app abre ou é bloqueado. É só um deterrente local (hash SHA-256 guardado no navegador) — **não criptografa** os dados nem os arquivos de backup, que continuam em JSON legível. Não serve como segurança forte, só evita abrir o arquivo sem querer e cair de cara nos dados.

## Estrutura de pastas

```
Economia/
  Planilha Financeiro.html   <- o app em si
  backups/                   <- snapshots .json gerados pelo botão "Fazer backup"
  instrucoes/                <- esta pasta, mantida pelo Claude entre sessões
```

Veja também: [01-arquitetura.md](01-arquitetura.md) (decisões técnicas), [02-modelo-de-dados.md](02-modelo-de-dados.md) (campos de cada entidade), [03-changelog.md](03-changelog.md) (histórico do que foi feito).
