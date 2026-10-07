# Segurança do Caixinha

## Quem acessa o quê
- **GitHub (público)**: só o código. Não tem dados de ninguém. A `apiKey` do Firebase no código é pública por desenho: só identifica o projeto; quem protege os dados são as regras do Firestore.
- **Firestore**: guarda os dados de cada pessoa em `users/{uid}` (pessoal) e `users/{uid}_pj` (empresa), em texto legível. **O dono do projeto Firebase (console) ainda consegue ver tudo** — isso só muda com a criptografia ponta a ponta (etapa 2, ainda não feita).
- **Pelo app/regras**: nenhum usuário (nem o admin) lê dados de outra pessoa.

## Acesso por convite
Regras em [`../firestore.rules`](../firestore.rules) (fonte da verdade; para valer, colar no console e Publicar).
- `convites/{email}` — lista de e-mails liberados (minúsculos). Só o admin escreve/lista; cada pessoa só lê o próprio.
- `pedidos/{uid}` — "Pedir acesso" (só e-mail + data). Só o admin lê/apaga.
- `users/...` — só o dono, com **e-mail verificado** e e-mail na lista de convites. Campos permitidos limitados (`hasOnly`).
- Admin = UID `NhPFnx6kkrcYhmveMiyodO9fApW2` (Natan). No app aparece Config → **Convites** só para ele.
- Remover o convite corta o acesso na hora; os dados continuam no Firestore até serem apagados no console.

### Como convidar
1. Config → Convites → digitar o e-mail → **Liberar** → **Copiar convite** → mandar por WhatsApp.
2. A pessoa abre o link, toca em **Criar conta nova** com esse e-mail (senha de 8+ caracteres) e confirma o e-mail que chega (olhar o spam).
3. Se ela criar a conta antes de você liberar, aparece "Aguardando liberação" e ela pode tocar em **Pedir acesso** — o pedido aparece em Convites para você liberar.

## Dentro do app
- Login lembrado por 30 dias; PIN de 4 dígitos por aparelho; bloqueio ao minimizar (ligado por padrão); 5 PINs errados pedem a senha (ver `00-visao-geral.md`).
- "Sair da conta" pergunta se apaga os dados deste aparelho (cópia local + cache offline do Firestore).
- "Esqueci a senha" no login manda e-mail de redefinição (resposta igual exista a conta ou não).
- CSP no `<head>` (só código do próprio site, gstatic, Firebase/Google e fontes), anti-clickjacking, ícone/cor de categoria escapados.
- O PIN é só uma trava local; a segurança real é a senha da conta. Backups em arquivo continuam legíveis (JSON).

## Checklist do console (quem executa: o dono do projeto)
1. **Firestore → Regras**: colar `firestore.rules` e **Publicar**. (Antes: "Fazer backup" no app.)
2. **Authentication → Configurações**: ligar a proteção contra enumeração de e-mail; revisar domínios autorizados (`natanzera69.github.io`, `localhost`, `caixinha-531d2.firebaseapp.com`); política de senha (mín. 8) se existir.
3. **Authentication → Modelos**: e-mail de verificação e de redefinição em português, remetente "Caixinha".
4. **Authentication → Usuários**: revisar a lista (contas antigas ficam bloqueadas sem convite).
5. **Google Cloud → APIs e serviços → Credenciais → chave "Browser"**: restringir por referenciador HTTP (`https://natanzera69.github.io/*`, `http://localhost/*`) e às APIs Identity Toolkit, Cloud Firestore e Token Service.
6. App Check: adiado (exige reCAPTCHA e pode derrubar o app se mal configurado).

## Testes de aceite (contas reais, com e-mails "+")
Use `seu.email+teste1@gmail.com` (chega na sua caixa): (a) conta sem convite → "Aguardando liberação", nada aparece em `users`; (b) liberar → confirmar e-mail → entra; (c) remover → bloqueia; (d) uma das contas antigas → bloqueada; (e) o admin continua entrando.

## Limites conhecidos
- Dono do projeto vê os dados pelo console (até a criptografia ponta a ponta).
- Quem tem acesso técnico ao navegador do aparelho vê o `localStorage`.
- Cadastro de contas continua aberto no Firebase Auth (sem convite a conta não lê nada); dá para ficar limpando contas sem uso.
