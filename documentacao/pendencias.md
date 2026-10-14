# Pendências e ideias

Atualizado em 2026-10-11. O que já foi feito está no [changelog](03-changelog.md).

## Para o usuário testar (precisa de aparelho real)
- **Android**: "Adicionar à tela inicial" no S25 FE (abrir `https://natanzera69.github.io/caixinha/Planilha%20Financeiro.html`, menu ⋮ → Adicionar à tela inicial) e conferir tela cheia e instalação.
- **Celular**: teclado nos formulários (a barra inferior some ao digitar?), botão Voltar fechando janelas, toque nas linhas de Lançamentos, 7 abas na barra inferior.
- **Convites**: criar conta com e-mails "+" (ex.: `voce+teste1@gmail.com`) e conferir os 5 testes de aceite de [04-seguranca.md](04-seguranca.md).
- **Subcategorias**: criar uma e conferir em Config → Sincronização que não deu erro (depende das regras publicadas).
- **PIN**: conferir no celular e no PC que o Google e o Samsung Pass não oferecem mais salvar senha ao digitar o PIN (o login continua oferecendo).
- **Virada do mês**: definir o dia em Config e conferir Início, Gráficos e Lançamentos (cartão de crédito e fixos não devem mudar de mês).
- **Retrofit visual**: abrir no celular real (Samsung Internet e iPhone) e conferir janelas, sanfona de Config, categorias e valores grandes; comparar com `design/pacotes/retrofit/antes` (gerar de novo com `ferramentas/capturar-telas.js`).
- **Reset geral**: usar "Apagar tudo e recomeçar" em um aparelho e conferir que os outros zeram sozinhos ao abrir (e que o PJ some).
- **Tema**: no Samsung Internet com modo escuro ligado, o app deve abrir no tema escuro próprio (Config → Aparência → Automático) sem cores invertidas e com a moeda nítida.
- **Retoques V2**: setas das listas no Chrome/Android e a animação de desbloqueio no celular.

## Ideias ainda não feitas
- **Criptografia ponta a ponta** (com código de recuperação): hoje o dono do projeto Firebase consegue ver os dados pelo console.
- Tolerância do bloqueio (na hora / 30 s / 2 min).
- Indicador de sincronização sempre visível (hoje só em Config → Sincronização).
- Listas em 2 colunas e largura maior em telas grandes.
- Texto de privacidade para amigos e família.
- E-mails do Firebase (verificação/redefinição) em português: o projeto bloqueia a edição do modelo; só com SMTP próprio.
