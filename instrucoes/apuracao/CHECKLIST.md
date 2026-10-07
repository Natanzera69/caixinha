# Apuração do redesign — checklist (preparado, ainda NÃO executado)

Contexto: o redesign "moeda 8-bit" foi aplicado em 2026-10-06 (ver `../03-changelog.md`). Esta pasta prepara a 2ª rodada:
**caçar erros e ajustes finos**, sem refazer o que já ficou bom. Nada abaixo foi verificado ainda, a não ser onde marcado.

## Como testar sem criar conta no Firebase
1. `node instrucoes/apuracao/serve.js` (a partir da raiz) → http://localhost:8766/
2. No navegador: `fetch('/instrucoes/apuracao/seed.js').then(r=>r.text()).then(eval).then(()=>__seed('dashboard'))`
3. Alternar tema: `document.documentElement.classList.toggle('dark')`. Mobile: viewport 375px.
4. Login/sincronização reais só dá pra conferir no site publicado, com a conta do usuário.
5. Console mostra erro de ServiceWorker no preview do Claude — é do ambiente, não do app.

## Já conferido na rodada do redesign (claro/escuro, desktop/mobile)
Login, carregamento, PIN, Início, Lançamentos, Contas, Fixos, Config (topo), modal de lançamento, modal Pagar fatura.

## Ainda NÃO conferido visualmente (prioridade da apuração)
- [ ] Modais: nova/editar Conta, Cartão (crédito, débito, emprestado), Fixo (com "De X em X meses"/ano), Parcelado, Financiamento, Investimento, Registrar pagamento (cartão emprestado).
- [ ] Onboarding (wizard do 1º login) e criação do perfil PJ — todas as telas.
- [ ] Config abaixo de "Sincronização": Backup, Segurança (PIN), Categorias (ícone editável), Orçamento por categoria.
- [ ] Troca de perfil pessoal ↔ empresarial (passa pela tela de carregamento).
- [ ] Lançamentos com filtros, busca (ícone de lupa nos dois temas), muitos itens, parcela/fixo/transferência.
- [ ] Tabs: Invest. (gráfico), Início em mês passado/futuro, estados vazios (sem dados) de cada aba.
- [ ] Toast (cor, posição acima da barra mobile) e `confirm()/alert()` nativos (não seguem o tema).
- [ ] Contraste AA nos dois temas (texto muted, badges, hero amarelo no escuro, barra warn/danger).
- [ ] Teclado do celular abrindo no login/modais (a moeda do login fica cortada?), safe-area em iPhone/Android.
- [ ] Tela pequena (320px) e tablet (768px): grid do Início, nav, topbar com botão de perfil que quebra em 2 linhas.

## Pendências conhecidas (decididas na rodada anterior)
- [ ] Bolinhas 8-bit no campo de PIN (opcional do pacote; precisa de JS que só espelha o `#lockInput`).
- [ ] Textos do mockup (ex.: "Oi de novo!", "Caixinha trancada", "sincronizar suas moedinhas") não foram aplicados — decidir se entram.
- [ ] Cores já salvas em contas/categorias continuam na paleta antiga (índigo etc.); só itens novos usam a `PALETA` nova. Migrar mexe em dados → pedir OK.
- [ ] Ícones do PWA: PNG tem cantos transparentes; no Android pode aparecer com fundo branco. Avaliar versão "maskable" (fundo cheio).
- [ ] Botões só com ícone (editar/excluir/pagar/pausar) têm `title`, mas não `aria-label`.
- [ ] Peso: `assets/moeda-girando.svg` ≈ 82 KB (só no loading) e Google Fonts bloqueando render; offline cai nas fontes do sistema.
- [ ] `metodosPagamento()` ainda guarda emoji em `icone` (não é mais exibido); limpar se ninguém usar.
- [ ] Pastas `Redesign Caixinha minimalista/` e `para-design/` ficam locais (no `.gitignore`).

## Pendências de funcionalidade anteriores (não são do redesign)
- [ ] Fatura por fechamento + "Pagar fatura": nunca testado de ponta a ponta na interface (só a lógica de competência).
- [ ] "Adicionar à tela inicial" no Android (S25 FE) + confirmar que o service worker v4 atualiza sozinho.
- [ ] Namorada criar a própria conta (nada a codar).

## Regras da apuração
- Corrigir erros e inconsistências visuais; **não** mudar lógica/cálculos/ids sem avisar.
- Qualquer mudança que toque dados salvos ou Firestore → pedir OK antes (usuário não quer reset de contas).
- Registrar achados no changelog e publicar só depois do OK.
