# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
HTML, CSS e JavaScript puros em um único arquivo (`Planilha Financeiro.html`), PWA com service worker, Firebase (Auth e Firestore) para login e sincronização. Hospedado no GitHub Pages. Sem framework nem bibliotecas de interface.

## Users
Pessoas que controlam as próprias finanças no dia a dia, principalmente pelo **celular** (PWA instalado) e também no computador. Hoje: o dono do projeto e familiares/amigos convidados, cada um com a sua conta e os seus dados. Quem usa tem MEI ou empresa pequena às vezes (perfil PJ separado).

## Product Purpose
Registrar e entender para onde vai o dinheiro: contas, cartões de crédito (com fatura por dia de fechamento), lançamentos, despesas e receitas fixas, parcelamentos, financiamentos, investimentos, orçamento por categoria e subcategoria, gráficos. Sucesso = lançar uma despesa em poucos toques e ter, no início do mês, um retrato confiável e rápido de ler.

## Positioning
Feito sob medida para o jeito brasileiro de usar dinheiro: fatura por fechamento do cartão, Pix, "mês que vira no dia do salário", MEI/PJ separado, tudo em português e com a cara de um jogo antigo (moedas pixeladas) em vez de um banco.

## Operating Context
Uso rápido e frequente no celular, muitas vezes com uma mão; também sessões mais longas no computador para revisar o mês. Dados vivem na nuvem da própria conta, com cópia no aparelho para funcionar sem internet. Acesso por convite.

## Capabilities and Constraints
- Login por e-mail e senha com convite; PIN de 4 dígitos que vale para a conta toda; bloqueio ao minimizar; sessão de 30 dias.
- Sincronização por mesclagem (id + data de atualização, com marcadores de exclusão) e reset geral por `config.resetEm`.
- Sem criptografia ponta a ponta (decisão adiada); o dono do projeto Firebase consegue ver os dados.
- Tema claro/escuro/automático; precisa funcionar em navegadores com "modo escuro em sites" forçado.
- Alvos de toque de 44 px, contraste AA nos dois temas, `prefers-reduced-motion` respeitado.
- Valores até R$ 999.999.999,99; nomes de até 40 caracteres.

## Brand Commitments
- Nome: **Caixinha**. Texto sempre em português do Brasil, tom amigável e direto.
- Identidade **pixel art** é obrigatória: moeda pixelada como logo, ícones 8-bit (`assets/icons`), títulos em Pixelify Sans, texto em Figtree, sombras "degrau", papel creme + verde + dourado da moeda.
- O usuário gosta dessa identidade e pediu para **mantê-la** em qualquer retrofit.

## Evidence on Hand
Sem depoimentos, métricas ou casos reais: não inventar. Artes originais em `design/originais/`. Telas de referência antes do retrofit em `design/pacotes/retrofit/antes/` (fora do git).

## Product Principles
1. Lançar rápido vence enfeitar: o caminho de registrar uma despesa nunca ganha passos.
2. Números primeiro: valores são sempre legíveis, alinhados e nunca vazam do cartão.
3. Os dados nunca são perdidos nem sobrescritos por engano: confirmar o que apaga e mostrar o que sincroniza.
4. A personalidade fica nos detalhes (moeda, ícones, movimento curto), não em ornamento que atrasa a tarefa.
5. Funciona bem no pior caso: tela pequena, internet ruim, texto grande, modo escuro forçado.

## Accessibility & Inclusion
Contraste mínimo AA, foco visível por teclado, rótulos em todos os campos, alvos de toque de 44 px, movimento reduzido com alternativa que preserva o estado.

## Notas de origem
Escrito sem entrevista interativa a pedido do dono ("fazer todas as etapas sem pausas"); os fatos vêm de `documentacao/00-visao-geral.md`, do histórico do projeto e das decisões registradas em `documentacao/03-changelog.md`.
