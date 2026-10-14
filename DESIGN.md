# Design — Caixinha

> Registro do sistema visual **entregue** (Planilha Financeiro.html, versão 2026-10-14 · v18). Fonte da verdade: os tokens em `:root` e `html.dark` do `<style>` principal.

## Mundo
App de tarefa (Operate). **Pixel art de papel e moeda**: papel creme, verde de cédula, ouro da moeda, ícones 8-bit, sombras em "degrau" (blocos sem desfoque), bordas grossas. Personalidade nos detalhes (moeda, ícones, movimento curto), não em ornamento.

## Tokens
| Grupo | Claro | Escuro |
|---|---|---|
| Fundo / superfície / superfície-2 | `#f6f3ea` / `#fffdf7` / `#f1ede1` | `#11130e` / `#1b1f17` / `#2b3123` |
| Texto / suave / fraco | `#1d1f16` / `#5e604f` / `#666857` | `#f2f4e6` / `#c3c7b1` / `#a4a891` |
| Borda / borda forte | `#e3dcc9` / = borda | `#4d5742` / `#66714f` |
| Primária (verde) / profunda / suave | `#16842f` / `#0e5c20` / `#e2f2da` | `#3cbf57` / `#1f7a33` / `#1b3420` |
| Receita / despesa / aviso | `#117a37` / `#c4302b` / `#9a5500` | `#4ade80` / `#ff7466` / `#f5b63b` |
| Moeda | `#f6c22c` (sombra `#b97f08`) | igual |
| Hero (cartão de patrimônio) | fundo `#1d1f16`, valor `#f6c22c` | fundo `#3a2f0b`, valor `#f6c22c` |

Raios: 16 (cartão), 14 (linha), 12 (controle), 10–11 (botão pequeno). Camadas: nav 55, nav inferior 80, janela 200, aviso 300, bloqueio 999 (`--z-*`).

## Tipografia
Títulos e marca: **Pixelify Sans** (sem ligaduras: o "fi" desenhava errado). Texto, rótulos e valores: **Figtree** (400–800). Valores sempre `tabular-nums`; rótulos de cartão em caixa-alta pequena com 0,07em; escala fixa (Operate); `text-wrap: balance` em títulos e `pretty` em textos de apoio.

## Componentes
- **Cartão** (`.card`): borda 1,5 px, sombra `0 3px 0` na cor da borda. **Hero** (`.card.hero`): bloco escuro com moeda grande à direita.
- **Linha** (`.row-card`): ícone 40 px, texto em duas linhas, valor à direita, ações (editar/excluir; no toque, tocar na linha edita).
- **Botão** (`.btn`, `-primary`, `-danger`, `-ghost`, `.icon-btn`, `.seg`, `.chip`): degrau de 3 px que afunda 2 px ao apertar; `.chip`/`.seg` para escolhas curtas.
- **Lista** (`select`): seta 8-bit; no Chrome/Android a lista aberta usa o painel do site (V2).
- **Sanfona** (`.acc`): cabeçalho com ícone, título e resumo; corpo com altura animada (grade 0fr→1fr) e `inert` quando fechado.
- **Janela** (`#modalCard`): sheet no celular (sobe do rodapé), caixa no PC; entrada 260 ms, saída 150 ms.
- **Gráficos** (`.graf-painel`): 3 listas (Mostrar / Agrupar por / Gráfico) + SVG próprio (rosca, pizza, barras, colunas, linha).
- **Estado vazio** (`.empty-state`): quadro pontilhado que preenche o cartão e traz a ação seguinte.

## Movimento
`--ease-out: cubic-bezier(.23,1,.32,1)`, `--ease-in-out: cubic-bezier(.77,0,.175,1)`, `--ease-pixel: steps(3)` só para momentos de pixel art (moeda girando, desbloqueio em íris). Durações: apertar 120 ms, interface 200 ms, janela 260 ms, saída 150 ms. Nada em ação repetida ou por teclado; hover só com `(hover:hover) and (pointer:fine)`; `prefers-reduced-motion` troca deslocamento por fade curto.

## Regras duras
- Contraste AA nos dois temas; foco visível (`:focus-visible` 3 px); alvo de toque 44 px.
- Valores até R$ 999.999.999,99 nunca vazam do cartão (`encaixarValores`).
- O navegador não deve escurecer por cima: `color-scheme: only light` + tema próprio por classe `.dark`.
- Não usar: gradiente em texto, vidro decorativo, cartão dentro de cartão, ícone emoji como sistema (emoji só como ícone de categoria escolhido pela pessoa).

## Ferramentas de verificação
`ferramentas/capturar-telas.js` (antes × depois em 3 larguras × 2 temas), `ferramentas/sonda-alinhamento.js` (alinhamento, estouro, hover solto, foco), `ferramentas/teste-logica.js`.
