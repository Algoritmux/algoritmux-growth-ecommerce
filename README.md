# Algoritmux Growth E-commerce

Monorepositório do site institucional Algoritmux e da API de captação de leads
de diagnóstico.

O site estático legado em HTML, CSS e JavaScript foi removido. O projeto atual
é composto por frontend React e backend Laravel.

## Estrutura

```text
/
├── frontend/  # React + Vite + TypeScript
├── backend/   # Laravel API REST
└── README.md
```

## Requisitos locais

- Node.js e npm;
- PHP 8.2 ou superior;
- Composer;
- MariaDB ou MySQL.

## Configuração

### Frontend

Crie `frontend/.env` a partir de `frontend/.env.example` e informe a URL pública
da API local:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Backend

Crie `backend/.env` a partir de `backend/.env.example` e configure a conexão
local com MariaDB/MySQL. O banco utilizado no ambiente local é:

```text
algoritmux_growth_local
```

Exemplo de variáveis necessárias, sem credenciais reais:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=algoritmux_growth_local
DB_USERNAME=<usuário-local>
DB_PASSWORD=<senha-local>
```

## Execução local

Em terminais separados:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

```powershell
cd backend
composer install
php artisan serve
```

O frontend utiliza a API configurada em `VITE_API_BASE_URL`.

## API atual

```text
POST /api/v1/leads/diagnostic
```

O endpoint valida e armazena leads de diagnóstico no banco local, com rate
limiting e respostas JSON para sucesso e erro de validação.

## Validação

Frontend:

```powershell
cd frontend
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Backend:

```powershell
cd backend
php artisan test
```

## Segurança de arquivos

Não versione arquivos sensíveis ou gerados localmente, incluindo `.env`,
`.env.*` (exceto `.env.example`), `node_modules`, `vendor`, `dist`, logs,
cache, sessões, views compiladas e bancos SQLite locais. As regras de
`.gitignore` do repositório, frontend e backend cobrem esses casos.
