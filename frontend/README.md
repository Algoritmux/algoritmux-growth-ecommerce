# Frontend Algoritmux

Migração do site institucional para React, Vite e TypeScript. Esta etapa é
exclusivamente visual: o diagnóstico não envia nem armazena informações.

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior

## Execução

```powershell
npm.cmd install
npm.cmd run dev
```

O Vite informará o endereço local. As URLs históricas (`/index.html`,
`/metodologia.html`, `/equipe.html`, `/blog.html` e os três artigos) continuam
disponíveis pelo React Router.

## Validação

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```
