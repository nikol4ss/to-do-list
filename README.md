# To-Do List Advice

Aplicação web de gerenciamento de tarefas com autenticação, categorias, compartilhamento entre usuários, notificações por e-mail e testes automatizados.

## Visão Geral

O projeto foi construído com:

- `frontend`: React + TypeScript + Vite
- `backend`: Django + Django REST Framework + JWT
- `banco de dados`: PostgreSQL
- `orquestração`: Docker Compose
- `testes`: pytest no backend e Selenium para fluxos E2E do frontend
- `CI`: GitHub Actions

Principais funcionalidades:

- cadastro e login de usuários
- criação, edição, remoção e conclusão de tarefas
- criação e gerenciamento de categorias
- compartilhamento de tarefas com permissão de visualização ou edição
- envio de notificações por e-mail via SMTP
- filtros e paginação de tarefas
- quadro Kanban para organização visual

## Arquitetura

O projeto está organizado como um monorepo, com frontend, backend, automação E2E e infraestrutura versionados no mesmo repositório.

Essa abordagem foi escolhida para:

- centralizar a evolução do produto em um único lugar
- facilitar integração entre interface, API e testes
- simplificar o CI e o fluxo de execução local

Estrutura principal:

- [frontend](/Users/user/Workspaces/projects/to-do-list/frontend): aplicação React
- [backend](/Users/user/Workspaces/projects/to-do-list/backend): API Django REST
- [e2e](/Users/user/Workspaces/projects/to-do-list/e2e): testes end-to-end com Selenium
- [.github](/Users/user/Workspaces/projects/to-do-list/.github): automações do GitHub Actions
- [docker-compose.yml](/Users/user/Workspaces/projects/to-do-list/docker-compose.yml): orquestração local

### Frontend

Local: [frontend](/Users/user/Workspaces/projects/to-do-list/frontend)

Responsabilidades principais:

- interface do usuário
- gerenciamento de estado de autenticação e tarefas
- consumo da API REST
- tratamento de erros e feedback visual

Estrutura relevante:

- `src/features`: páginas e fluxos principais
- `src/components`: componentes reutilizáveis e UI
- `src/hooks`: regras compartilhadas do frontend
- `src/services`: camada de comunicação com a API
- `src/types`: contratos tipados

### Backend

Local: [backend](/Users/user/Workspaces/projects/to-do-list/backend)

Responsabilidades principais:

- autenticação com JWT
- regras de negócio
- persistência de dados
- permissões de acesso
- notificações por e-mail

Apps principais:

- `users`: cadastro, login, perfil e preferências de notificação
- `tasks`: tarefas, compartilhamento, conclusão e notificações
- `categories`: categorias do usuário

### Infraestrutura

Arquivos principais:

- [docker-compose.yml](/Users/user/Workspaces/projects/to-do-list/docker-compose.yml)
- [.github/workflows/ci.yml](/Users/user/Workspaces/projects/to-do-list/.github/workflows/ci.yml)

Responsabilidades:

- subir frontend, backend e banco via Docker Compose
- executar pipeline de testes no GitHub Actions
- padronizar a execução local e em CI

## Decisões De Design

O projeto foi mantido com foco em clareza e manutenção.

Principais decisões:

- `DRF + JWT`: simplifica autenticação stateless e integração com frontend SPA
- `React + services + hooks`: separa UI da lógica de consumo de API
- `TaskShare` com permissão `read/edit`: evita duplicação de tarefas compartilhadas
- `SMTP no backend`: protege credenciais e centraliza o envio de e-mails
- `settings_test.py`: desacopla os testes do ambiente Docker local
- `pytest + Selenium`: cobre regras de negócio no backend e fluxos reais de interface no frontend

Princípios aplicados:

- `KISS`: fluxo direto para autenticação, tarefas e categorias
- `DRY`: reaproveitamento de serviços, serializers e helpers
- `SOLID`: separação razoável entre camadas de UI, serviço, view e serializer

Observação:

- a maior concentração de regra no frontend está no provider de tarefas, o que ainda pode ser modularizado no futuro

## Requisitos

Para rodar localmente sem Docker:

- `Python 3.12+`
- `Node.js 22+`
- `pnpm`
- `PostgreSQL`

Para rodar com Docker:

- `Docker`
- `Docker Compose`

## Como Rodar Com Docker Compose

Na raiz do projeto:

```bash
docker compose up --build
```

Serviços esperados:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`
- postgres: `localhost:5433`

Observações:

- o backend aplica migrations automaticamente na inicialização
- o frontend em container é servido via Nginx

## Como Rodar Localmente Sem Docker

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

Crie um arquivo `.env` em `backend/` com base em:

- [backend/.env.example](/Users/user/Workspaces/projects/to-do-list/backend/.env.example)

Exemplo:

```env
DEBUG=True
SECRET_KEY=sua-chave-local
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

FRONTEND_URL=http://localhost:3000
```

Rode as migrations:

```bash
python manage.py migrate
```

Inicie o servidor:

```bash
python manage.py runserver
```

### 2. Frontend

Entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
pnpm install
```

Crie um arquivo `.env.local` com base em:

- [frontend/.env.example](/Users/user/Workspaces/projects/to-do-list/frontend/.env.example)

Exemplo:

```env
VITE_API_URL=http://localhost:8000/api
```

Inicie o frontend:

```bash
pnpm dev
```

## Como Rodar Os Testes

### Backend com pytest

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

### E2E com Selenium

A suíte E2E fica na raiz do projeto:

- [e2e](/Users/user/Workspaces/projects/to-do-list/e2e)

Ela foi mantida fora de `backend/` porque valida o sistema pela interface web completa, e não apenas a API.

Instalação:

```bash
pip install -r e2e/requirements.txt
```

Arquivo de exemplo:

- [e2e/.env.example](/Users/user/Workspaces/projects/to-do-list/e2e/.env.example)

Variáveis opcionais:

```env
E2E_FRONTEND_URL=http://127.0.0.1:3000
E2E_API_URL=http://127.0.0.1:8000/api
E2E_WAIT_SECONDS=15
```

Execução:

```bash
python -m pytest e2e/selenium -v
```

Pré-requisitos para os testes E2E:

- backend rodando
- frontend rodando
- Chrome ou Chromium instalado
- WebDriver compatível disponível no sistema

## Variáveis De Ambiente

### Backend

Arquivo de exemplo:

- [backend/.env.example](/Users/user/Workspaces/projects/to-do-list/backend/.env.example)

Variáveis principais:

- `DEBUG`
- `SECRET_KEY`
- `FRONTEND_URL`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USE_TLS`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`
- `EMAIL_REPLY_TO`

### Frontend

Arquivo de exemplo:

- [frontend/.env.example](/Users/user/Workspaces/projects/to-do-list/frontend/.env.example)

Variável principal:

- `VITE_API_URL`

### E2E

Arquivo de exemplo:

- [e2e/.env.example](/Users/user/Workspaces/projects/to-do-list/e2e/.env.example)

Variáveis principais:

- `E2E_FRONTEND_URL`
- `E2E_API_URL`
- `E2E_WAIT_SECONDS`

## CI

Workflow principal:

- [ci.yml](/Users/user/Workspaces/projects/to-do-list/.github/workflows/ci.yml)

O pipeline executa:

- job de backend com PostgreSQL, migrations, pytest e cobertura
- job E2E com Selenium para frontend

Para disparar no GitHub Actions:

1. faça `git push`
2. abra a aba `Actions` do repositório
3. acompanhe os jobs `Pytest` e `Frontend Selenium`

## Rotas Da API

Base da API:

```text
http://localhost:8000/api
```

### Autenticação e Perfil

Prefixo:

```text
/api/auth/
```

Rotas:

- `POST /auth/signup/`
  cria uma nova conta

- `POST /auth/signin/`
  autentica o usuário e retorna tokens JWT

- `POST /auth/refresh/`
  renova o token de acesso

- `GET /auth/profile/`
  retorna os dados do usuário autenticado

- `PATCH /auth/profile/`
  atualiza parcialmente o perfil e preferências de notificação

- `PUT /auth/profile/`
  atualiza completamente o perfil

- `POST /auth/profile/test-notification/`
  dispara um e-mail de teste usando a configuração SMTP

Campos relevantes de perfil:

- `username`
- `email`
- `first_name`
- `last_name`
- `notifications_enabled`
- `notify_on_task_shared`
- `notify_on_task_completed`

### Tarefas

Prefixo:

```text
/api/tasks/
```

Rotas principais:

- `GET /tasks/`
  lista tarefas do usuário autenticado

- `POST /tasks/`
  cria uma tarefa

- `GET /tasks/{id}/`
  detalha uma tarefa do proprietário

- `PATCH /tasks/{id}/`
  atualiza parcialmente uma tarefa do proprietário

- `PUT /tasks/{id}/`
  atualiza totalmente uma tarefa do proprietário

- `DELETE /tasks/{id}/`
  remove uma tarefa do proprietário

- `PATCH /tasks/{id}/toggle/`
  alterna o status entre concluída e não concluída

- `GET /tasks/shared-with-me/`
  lista tarefas compartilhadas com o usuário autenticado

- `PATCH /tasks/{id}/shared-edit/`
  permite editar tarefa compartilhada quando a permissão for `edit`

Filtros suportados em `GET /tasks/` e `GET /tasks/shared-with-me/`:

- `search`
- `category`
- `is_done`
- `ordering`

Exemplo:

```text
/api/tasks/?search=estudo&is_done=false&ordering=-created_at
```

Ordenações aceitas:

- `created_at`
- `-created_at`
- `due_date`
- `-due_date`
- `title`
- `-title`
- `updated_at`
- `-updated_at`

Paginação:

- a API usa paginação global do DRF na configuração principal
- no ambiente de testes há ajustes específicos para simplificar asserts

Campos principais de tarefa:

- `id`
- `title`
- `description`
- `isDone`
- `dueDate`
- `ownerId`
- `ownerName`
- `categoryId`
- `categoryName`
- `shared`
- `sharedWith`
- `sharePermission`
- `createdAt`
- `updatedAt`

### Compartilhamento de Tarefas

Rotas:

- `GET /tasks/{id}/shares/`
  lista compartilhamentos da tarefa

- `POST /tasks/{id}/shares/`
  compartilha tarefa com outro usuário

- `DELETE /tasks/{id}/shares/{shareId}/`
  remove um compartilhamento específico

Formato esperado para compartilhar:

```json
{
  "shared_with_username": "usuario_destino",
  "permission": "read"
}
```

Permissões suportadas:

- `read`
- `edit`

Regras:

- somente o proprietário pode compartilhar ou remover compartilhamentos
- quem recebe com `read` pode apenas visualizar
- quem recebe com `edit` pode editar e concluir a tarefa

### Categorias

Prefixo:

```text
/api/categories/
```

Rotas:

- `GET /categories/`
  lista categorias do usuário autenticado

- `POST /categories/`
  cria categoria

- `GET /categories/{id}/`
  detalha categoria

- `PATCH /categories/{id}/`
  atualiza parcialmente categoria

- `PUT /categories/{id}/`
  atualiza totalmente categoria

- `DELETE /categories/{id}/`
  remove categoria

Campos principais:

- `id`
- `owner`
- `name`
- `color`
- `created_at`
- `updated_at`

## Integração Externa

O projeto possui integração externa de envio de e-mail via SMTP.

Uso atual:

- notificar quando uma tarefa é compartilhada
- notificar quando uma tarefa compartilhada é concluída
- enviar e-mail de teste a partir da tela de perfil

Implementação principal:

- [notifications.py](/Users/user/Workspaces/projects/to-do-list/backend/tasks/notifications.py)
