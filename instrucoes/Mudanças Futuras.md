# Mudanças futuras

## Implementado em 2026-08-22

Hospedagem (GitHub Pages), PWA (manifest/ícones/service worker) e sincronização em tempo real (Firebase Auth + Firestore, login por e-mail/senha, um documento por pessoa). Detalhes em [03-changelog.md](03-changelog.md) e [01-arquitetura.md](01-arquitetura.md).

## Ainda por fazer

- **Testar "Adicionar à tela inicial" no Android** (S25 FE do usuário): abrir `https://natanzera69.github.io/caixinha/Planilha%20Financeiro.html` no Chrome do celular, menu ⋮ → "Adicionar à tela inicial", confirmar que abre em tela cheia sem barra de endereço.
- **Namorada criar a própria conta**: já é só ela abrir o link e clicar em "Criar conta nova" na tela de login — os dados dela ficam automaticamente isolados dos do usuário (documento separado por `uid` no Firestore). Nada a implementar, só usar.
