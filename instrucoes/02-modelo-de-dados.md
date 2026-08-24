# Modelo de dados

Estado inteiro é um objeto salvo em `localStorage['planilhaFinanceiro_v1']`. Toda entidade tem `id` (UUID) e `updatedAt` (ISO timestamp, usado no merge de backups).

## `contas[]`
Bancos, carteiras, poupanças.
- `nome`, `tipo` (`corrente`|`poupanca`|`dinheiro`|`investimento`), `saldoInicial`, `cor`, `ativo`

## `cartoes[]`
Cartões (débito ou crédito) — sempre vinculados a uma conta seguinte (dele), ou marcados como emprestados de terceiro.
- `tipo` (`credito`|`debito`), `nome`, `contaId` (a conta dona do cartão — obrigatório só se o cartão **não** for emprestado)
- `titular` (string ou null) — quando preenchido (ex: "Namorada"), é um cartão emprestado de terceiro: não precisa de `contaId`, e tudo gasto nele vira dívida com essa pessoa em vez de sair de uma conta dele
- `pagamentosFeitos` (número, default 0) — soma do que já foi pago de volta pra o titular; usado só em cartões emprestados
- Só cartões `credito` têm `limite`, `diaFechamento`, `diaVencimento` (opcionais mesmo assim quando emprestado — servem só de referência). Cartões `debito` não têm fatura — o dinheiro sai na hora, da `contaId` vinculada (ou vira dívida na hora, se emprestado).
- Fatura atual e dívida total **não são armazenadas** — calculadas em tempo real a partir de `transacoes` (ver `faturaAtualCartao()` / `divendaTotalCartao()` / `vocDeveNoCartao()` em [01-arquitetura.md](01-arquitetura.md))
- Migração: cartões salvos antes dessa mudança não tinham `tipo`/`contaId` — `carregarEstado()` marca os sem `tipo` como `credito`; sem `contaId` e sem `titular` aparecem com aviso "sem conta vinculada" em Contas até o usuário editar e linkar.

## `categorias[]`
- `nome`, `icone` (emoji), `tipo` (`receita`|`despesa`), `cor`
- `orcamentoMensal` (opcional, número) — teto mensal de gasto, definido em Config; usado pela seção "Orçamento por categoria" no Início
- Seed inicial em `categoriasDefault()` — 16 categorias de despesa + 6 de receita, em pt-BR

## `transacoes[]`
O lançamento individual — a entidade central do app.
- `descricao`, `data` (YYYY-MM-DD), `valor`, `tipo` (`receita`|`despesa`|`transferencia`)
- `categoriaId` (null em transferências)
- `metodoPagamento` (`dinheiro`|`debito`|`pix`|`credito`|`boleto`|`transferencia`)
- `contaId`: null se `metodoPagamento==='credito'`; se `metodoPagamento==='debito'`, é resolvida automaticamente a partir da conta vinculada ao cartão de débito escolhido no formulário (o usuário escolhe o **cartão**, não a conta, diretamente); nos demais métodos é a conta escolhida direto.
- `contaDestinoId` (só em transferências)
- `cartaoId` (se `metodoPagamento` for `credito` **ou** `debito` — em ambos os casos o formulário pede pra escolher o cartão, filtrado pelo `tipo` do cartão)
- `status` (`pago`|`pendente` — `pendente` se `data` é futura no momento da criação; hoje é só informativo/visual, não afeta cálculo de saldo)
- `parcelaGrupoId` / `parcelaAtual` / `parcelaTotal` — presentes só em compras parceladas; todas as parcelas de uma compra compartilham o mesmo `parcelaGrupoId`
- `recorrenciaId` — presente quando a transação foi gerada automaticamente por uma `recorrencia` (ver abaixo)
- `notas`

## `financiamentos[]`
Empréstimos/financiamentos de longo prazo (carro, casa...). Ao contrário de parcelamentos, não gera N transações de uma vez.
- `descricao`, `instituicao`, `valorParcela`, `parcelasTotal`, `parcelasPagas`, `contaId` (de onde sai o pagamento), `dataInicio`
- Saldo devedor = `(parcelasTotal - parcelasPagas) * valorParcela` (calculado, não armazenado)
- Clicar "Marcar parcela paga" incrementa `parcelasPagas` **e** cria uma `transacao` de despesa avulsa (categoria "Taxas & Juros", método débito na `contaId` do financiamento)

## `recorrencias[]`
Receitas/despesas fixas (salário, aluguel, telefone, revisão do carro, IPVA...) — template gerenciado na aba Fixos.
- `descricao`, `valor`, `diaDoMes` (1-31, ajustado pro último dia do mês quando não existe, ex: dia 31 em fevereiro), `tipo` (`receita`|`despesa`), `categoriaId`, `metodoPagamento`, `contaId`/`cartaoId`, `ativo` (pausável sem excluir)
- `intervaloMeses` (número, default 1) — de quantos em quantos meses repete: `1`=mensal, `3`=a cada 3 meses, `12`=anual (IPVA etc.). Recorrências antigas sem esse campo são migradas pra `1` no `carregarEstado()`.
- `mesInicio` (`"YYYY-MM"`, só quando `intervaloMeses>1`) — mês âncora a partir do qual a contagem começa; `recorrenciaDevidaNoMes()` calcula se um mês é "vez de gerar" comparando a distância em meses até essa âncora, módulo `intervaloMeses`.
- `mesesGerados[]` — lista de `"YYYY-MM"` já materializados como `transacao` real; evita duplicar o lançamento do mesmo mês (só entra nessa lista quando o mês era mesmo "devido")
- Ver "Como funciona" em [01-arquitetura.md](01-arquitetura.md)

## `investimentos[]`
- `nome`, `tipo` (Renda Fixa/Ações/Fundos/Cripto/Poupança/Outro), `instituicao`, `valorAportado`, `valorAtual`, `data`
- Rentabilidade = `(valorAtual - valorAportado) / valorAportado * 100` (calculada)

## `config`
- `pinHash` (string ou null) — hash SHA-256 (ou fallback) do PIN de acesso; ver [01-arquitetura.md](01-arquitetura.md)

## Cálculos globais (não armazenados, sempre derivados)
- `saldoConta(id)`, `saldoTotalContas()`, `faturaAtualCartao(id)`, `divendaTotalCartao(id)`, `totalDividaCartoes()`, `totalInvestimentos()`, `patrimonioLiquido()` = contas + investimentos − dívida em cartões
- `gastosPorBancoDoMes(doMes)` — soma as despesas do mês por conta/banco: despesas diretas (`t.contaId`) + despesas em cartão de crédito atribuídas via `cartaoById(t.cartaoId).contaId` (débito já cai direto em `contaId`, não precisa desse passo extra). Cartões emprestados (`titular` set) não têm `contaId`, então nunca entram nessa lista — o gasto neles some em "você deve" em vez de em algum banco.
- `vocDeveNoCartao(id)` — só faz sentido pra cartão emprestado: soma de todas as despesas nele (qualquer método) menos `pagamentosFeitos`. `divendaTotalCartao(id)` chama essa função automaticamente quando o cartão tem `titular`.
