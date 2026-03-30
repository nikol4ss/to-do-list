# To-Do List Advice

Aplicação web de gerenciamento de tarefas com autenticação, categorias, compartilhamento entre usuários, notificações por e-mail, testes automatizados e CI.

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Estrutura Do Projeto](#estrutura-do-projeto)
- [Pré-Requisitos](#pré-requisitos)
- [Instalação Com Docker](#instalação-com-docker)
- [Instalação Local Sem Docker](#instalação-local-sem-docker)
- [Arquivos De Ambiente](#arquivos-de-ambiente)
- [Como Rodar Os Testes](#como-rodar-os-testes)
- [Arquitetura E Decisões De Design](#arquitetura-e-decisões-de-design)
- [Rotas Da API](#rotas-da-api)
- [CI E Automação](#ci-e-automação)

## Visão Geral

Este projeto foi construído como uma aplicação full stack para organizar tarefas pessoais e colaborativas. O objetivo não foi apenas criar um CRUD simples, mas entregar um fluxo completo com autenticação, categorias, compartilhamento com permissões, notificações por e-mail, testes e automação de CI.

## Funcionalidades

- cadastro e login de usuários
- edição de perfil
- criação, edição, exclusão e conclusão de tarefas
- categorização de tarefas
- compartilhamento com permissão de leitura ou edição
- listagem de tarefas compartilhadas comigo
- filtros e paginação de tarefas na API
- organização visual em quadro Kanban
- notificações por e-mail via SMTP
- testes automatizados no backend e E2E no frontend

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Django, Django REST Framework, JWT |
| Banco de dados | PostgreSQL |
| E-mail | SMTP |
| Testes backend | pytest, pytest-django |
| Testes E2E | Selenium |
| Infraestrutura local | Docker Compose |
| CI | GitHub Actions |

## Estrutura Do Projeto

O repositório segue uma estrutura de `monorepo`, centralizando frontend, backend, testes E2E e automações no mesmo lugar.

```text
to-do-list/
├── backend/     # API Django REST, regras de negócio e integração SMTP
├── frontend/    # Aplicação React
├── e2e/         # Testes end-to-end com Selenium
├── .github/     # Workflows do GitHub Actions
└── docker-compose.yml
```

Pastas principais:

- [backend](/Users/user/Workspaces/projects/to-do-list/backend): autenticação, tarefas, categorias, compartilhamento, notificações e testes
- [frontend](/Users/user/Workspaces/projects/to-do-list/frontend): interface, componentes, hooks, services e tipos
- [e2e](/Users/user/Workspaces/projects/to-do-list/e2e): cenários automatizados pela interface web
- [.github/workflows](/Users/user/Workspaces/projects/to-do-list/.github/workflows): CI e release

## Pré-Requisitos

### Para rodar com Docker

- Docker
- Docker Compose

### Para rodar sem Docker

- Python `3.12+`
- Node.js `22+`
- `pnpm`
- PostgreSQL

## Instalação Com Docker

Esta é a forma mais simples de subir o projeto.

### 1. Criar o arquivo de ambiente do backend

Use como base:

- [backend/.env.example](/Users/user/Workspaces/projects/to-do-list/backend/.env.example)

Exemplo mínimo:

```env
DEBUG=True
SECRET_KEY=change-me-in-development
FRONTEND_URL=http://localhost:3000

DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=2004
DB_HOST=db
DB_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_de_app
DEFAULT_FROM_EMAIL=seu_email@gmail.com
EMAIL_REPLY_TO=seu_email@gmail.com
```

Crie o arquivo real:

```bash
cp backend/.env.example backend/.env
```

### 2. Subir os containers

Na raiz do projeto:

```bash
docker compose up --build
```

### 3. Acessar a aplicação

| Serviço | URL |
| --- | --- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend | [http://localhost:8000](http://localhost:8000) |
| PostgreSQL | `localhost:5433` |

### Observações importantes

- o backend executa `migrate` ao iniciar
- no Docker, o banco deve ser acessado pelo host `db`
- o frontend em container é servido via Nginx

## Instalação Local Sem Docker

Se você preferir rodar cada parte manualmente, siga a ordem abaixo.

### 1. Backend

Entre na pasta:

```bash
cd backend
```

Crie e ative a virtualenv:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

Edite o `backend/.env` com seus dados locais. Exemplo:

```env
DEBUG=True
SECRET_KEY=sua-chave-local
FRONTEND_URL=http://localhost:3000

DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=2004
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_de_app
DEFAULT_FROM_EMAIL=seu_email@gmail.com
EMAIL_REPLY_TO=seu_email@gmail.com
```

Aplique as migrations:

```bash
python manage.py migrate
```

Inicie a API:

```bash
python manage.py runserver
```

### 2. Frontend

Em outro terminal:

```bash
cd frontend
pnpm install
cp .env.example .env.local
```

Arquivo esperado:

```env
VITE_API_URL=http://localhost:8000/api
```

Inicie o frontend:

```bash
pnpm dev
```

### 3. E2E

Se quiser rodar os testes Selenium localmente:

```bash
pip install -r e2e/requirements.txt
cp e2e/.env.example e2e/.env
```

Arquivo esperado:

```env
E2E_FRONTEND_URL=http://127.0.0.1:3000
E2E_API_URL=http://127.0.0.1:8000/api
E2E_WAIT_SECONDS=15
```

Pré-requisitos adicionais:

- backend rodando
- frontend rodando
- Chrome ou Chromium instalado
- WebDriver compatível disponível no sistema

## Arquivos De Ambiente

Cada parte do projeto possui seu próprio contexto de configuração.

### Backend

Arquivo de exemplo:

- [backend/.env.example](/Users/user/Workspaces/projects/to-do-list/backend/.env.example)

Variáveis principais:

| Variável | Finalidade |
| --- | --- |
| `SECRET_KEY` | chave interna do Django |
| `DEBUG` | modo de desenvolvimento |
| `FRONTEND_URL` | base usada em links e e-mails |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | conexão com o PostgreSQL |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS` | configuração SMTP |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | autenticação SMTP |
| `DEFAULT_FROM_EMAIL`, `EMAIL_REPLY_TO` | remetente e resposta dos e-mails |

### Frontend

Arquivo de exemplo:

- [frontend/.env.example](/Users/user/Workspaces/projects/to-do-list/frontend/.env.example)

Variável principal:

| Variável | Finalidade |
| --- | --- |
| `VITE_API_URL` | URL base da API usada pelo React |

### E2E

Arquivo de exemplo:

- [e2e/.env.example](/Users/user/Workspaces/projects/to-do-list/e2e/.env.example)

Variáveis principais:

| Variável | Finalidade |
| --- | --- |
| `E2E_FRONTEND_URL` | endereço aberto pelo navegador automatizado |
| `E2E_API_URL` | API auxiliar usada pelos testes |
| `E2E_WAIT_SECONDS` | timeout máximo de espera |

### Regras importantes

- arquivos reais de ambiente não devem ser versionados
- o frontend só deve usar variáveis com prefixo `VITE_`
- segredos e credenciais ficam apenas no backend
- para Gmail, use senha de app em vez da senha normal da conta

## Como Rodar Os Testes

### Backend

Na pasta `backend`:

```bash
./.venv/bin/python -m pytest
```

Com cobertura:

```bash
./.venv/bin/python -m pytest --cov=users --cov=tasks --cov=categories --cov-report=term-missing --cov-report=xml
```

### Frontend

Na pasta `frontend`:

```bash
pnpm exec tsc --noEmit
pnpm exec eslint src --ext .ts,.tsx
pnpm build
```

### E2E

Na raiz do projeto:

```bash
python -m pytest e2e/selenium -v
```

## Arquitetura E Decisões De Design

### Backend

O backend foi separado em apps com responsabilidades claras:

- `users`: cadastro, login, perfil e preferências de notificação
- `tasks`: regras de tarefas, compartilhamento, permissões e notificações
- `categories`: organização das tarefas por categoria

### Frontend

O frontend foi dividido em camadas para reduzir acoplamento:

- `features`: páginas e fluxos principais
- `components`: componentes visuais e reutilizáveis
- `hooks`: estado compartilhado e regras de uso
- `services`: consumo da API
- `types`: contratos tipados

### Decisões principais

- `DRF + JWT`: autenticação stateless simples para SPA
- `TaskShare` com permissão `read/edit`: compartilhamento sem duplicar tarefa
- `SMTP no backend`: protege credenciais e centraliza o envio
- `settings_test.py`: separa ambiente de teste do ambiente local
- `pytest + Selenium`: cobre backend e fluxo real de interface

### Princípios adotados

- `KISS`: fluxo direto para autenticação, tarefas e categorias
- `DRY`: reaproveitamento de serviços, helpers e serializers
- `SOLID`: separação entre camada visual, serviço e regra de negócio

## Rotas Da API

Base local:

```text
http://localhost:8000/api
```

### Autenticação e perfil

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/signup/` | cria conta |
| `POST` | `/auth/signin/` | autentica usuário |
| `POST` | `/auth/refresh/` | renova token |
| `GET` | `/auth/profile/` | retorna perfil autenticado |
| `PATCH` | `/auth/profile/` | atualiza parcialmente o perfil |
| `PUT` | `/auth/profile/` | atualiza completamente o perfil |
| `POST` | `/auth/profile/test-notification/` | envia e-mail de teste |

### Categorias

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/categories/` | lista categorias do usuário |
| `POST` | `/categories/` | cria categoria |
| `GET` | `/categories/{id}/` | detalha categoria |
| `PUT` | `/categories/{id}/` | atualiza categoria |
| `PATCH` | `/categories/{id}/` | atualiza parcialmente |
| `DELETE` | `/categories/{id}/` | remove categoria |

### Tarefas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/tasks/` | lista tarefas do usuário |
| `POST` | `/tasks/` | cria tarefa |
| `GET` | `/tasks/{id}/` | detalha tarefa |
| `PUT` | `/tasks/{id}/` | atualiza tarefa |
| `PATCH` | `/tasks/{id}/` | atualiza parcialmente |
| `DELETE` | `/tasks/{id}/` | remove tarefa |
| `PATCH` | `/tasks/{id}/toggle/` | alterna concluída / não concluída |

Filtros suportados em `/tasks/`:

- `search`
- `category`
- `is_done`
- `ordering`

### Compartilhamento

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/tasks/{id}/shares/` | lista compartilhamentos da tarefa |
| `POST` | `/tasks/{id}/shares/` | compartilha tarefa com outro usuário |
| `DELETE` | `/tasks/{id}/shares/{share_id}/` | remove compartilhamento |
| `GET` | `/tasks/shared-with-me/` | lista tarefas compartilhadas comigo |
| `PATCH` | `/tasks/{id}/shared-edit/` | edita tarefa compartilhada quando permitido |

## CI E Automação

Workflows disponíveis:

- [ci.yml](/Users/user/Workspaces/projects/to-do-list/.github/workflows/ci.yml): pytest, cobertura e Selenium
- [release.yml](/Users/user/Workspaces/projects/to-do-list/.github/workflows/release.yml): release por tag e publicação de imagens no GHCR

Fluxo de CI:

1. sobe PostgreSQL no GitHub Actions
2. instala dependências
3. aplica migrations
4. roda `pytest` com cobertura
5. sobe backend e frontend no job E2E
6. roda Selenium

Fluxo de release:

1. criar uma tag como `v1.0.0`
2. enviar a tag para o GitHub
3. a workflow cria a release
4. as imagens Docker são publicadas no GitHub Packages (`ghcr.io`)
