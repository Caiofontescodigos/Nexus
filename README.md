# Nexus

> **Nexus** — Organize. Conecte. Conclua.

Sistema distribuído de gerenciamento de tarefas desenvolvido como projeto final da disciplina de **Sistemas Distribuídos** — UFERSA.

## Objetivo

Nexus é um workspace moderno para produtividade pessoal. Permite que usuários criem, organizem e acompanhem tarefas com suporte a status, prioridades, estatísticas e gráficos de desempenho. O sistema adota uma arquitetura de três camadas (frontend, backend, banco de dados) com comunicação via REST API.

## Arquitetura — 3 Camadas

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│          (Web + Mobile React Native)             │
│              Porta 3000 / 80                     │
├─────────────────────────────────────────────────┤
│                   Backend                        │
│              Express + Prisma                    │
│              Porta 3001                          │
├─────────────────────────────────────────────────┤
│              PostgreSQL 16                       │
│              Porta 5432                          │
└─────────────────────────────────────────────────┘
```

- **Camada de Apresentação**: Aplicação web (React + TanStack Start) e mobile (React Native)
- **Camada de Lógica**: API REST em Express com arquitetura em camadas (routes → controllers → services → repositories)
- **Camada de Dados**: PostgreSQL 16 com Prisma ORM

## Tecnologias

### Frontend Web
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [TanStack Start](https://tanstack.com/start/latest) (SSR, router)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/) — gráficos do dashboard
- [i18next](https://www.i18next.com/) — internacionalização pt-BR/en
- [Axios](https://axios-http.com/) — cliente HTTP
- [Vite](https://vitejs.dev/) — bundler

### Frontend Mobile
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- React Navigation
- Axios

### Backend
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) ORM
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/) — autenticação
- [Zod](https://zod.dev/) — validação de schemas
- [Swagger](https://swagger.io/) — documentação da API

### Infraestrutura
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- Nginx — servindo o frontend em produção

## Estrutura do Projeto

```
Nexus-task/
├── backend-api/                  # API REST (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma         # Modelo de dados
│   │   └── migrations/           # Migrações do banco
│   ├── src/
│   │   ├── config/               # Configurações (DB, env)
│   │   ├── controllers/          # Controladores das rotas
│   │   ├── middlewares/          # Middlewares (auth, validate)
│   │   ├── repositories/         # Acesso a dados (Prisma)
│   │   ├── routes/               # Definição de rotas
│   │   ├── schemas/              # Schemas de validação (Zod)
│   │   ├── services/             # Lógica de negócio
│   │   ├── types/                # Tipos TypeScript
│   │   ├── utils/                # Utilitários (JWT, errors)
│   │   ├── server.ts             # Entry point
│   │   └── seed.ts               # Seed de dados
│   ├── Dockerfile
│   └── package.json
│
├── nexus-task-ui/                # Frontend Web (TanStack Start)
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   │   ├── ui/               # Componentes shadcn/ui
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskModal.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ...
│   │   ├── contexts/             # Contextos React (Auth, Tasks, Theme)
│   │   ├── i18n/                 # Traduções pt-BR / en
│   │   ├── lib/                  # Utilitários
│   │   ├── routes/               # Rotas TanStack Start
│   │   ├── services/             # API client (Axios)
│   │   ├── styles.css            # Estilos globais
│   │   └── types/                # Tipos TypeScript
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── mobile-app/                   # Frontend Mobile (React Native / Expo)
│   ├── src/
│   │   ├── contexts/
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── services/
│   ├── App.tsx
│   └── package.json
│
├── docker-compose.yml            # Orquestração Docker
├── .gitignore
└── README.md
```

## Como Executar Localmente

### Pré-requisitos

- Node.js ≥ 20
- PostgreSQL 16
- npm

### 1. Banco de Dados

```bash
# Crie o banco PostgreSQL
createdb nexusdb

# Ou via Docker
docker run -d --name nexus-postgres \
  -e POSTGRES_USER=nexus \
  -e POSTGRES_PASSWORD=nexus123 \
  -e POSTGRES_DB=nexusdb \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend

```bash
cd backend-api
cp .env.example .env        # Ajuste as credenciais
npm install
npx prisma migrate deploy   # Aplica migrações
npm run seed                # Dados iniciais (opcional)
npm run dev                 # Inicia em http://localhost:3001
```

### 3. Frontend Web

```bash
cd nexus-task-ui
npm install
npm run dev                 # Inicia em http://localhost:3000
```

### 4. Mobile (opcional)

```bash
cd mobile-app
npm install
npx expo start
```

## Como Executar com Docker

```bash
docker-compose up -d --build
```

Isso inicia três containers:
- **postgres** — banco de dados (porta 5432)
- **backend** — API Express (porta 3001)
- **frontend** — Nginx servindo o build (porta 3000)

> O backend executa `prisma migrate deploy` automaticamente na inicialização.

## Endpoints Principais

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Dados do usuário logado |

### Usuário

| Método | Rota | Descrição |
|--------|------|-----------|
| PUT | `/users/profile` | Atualizar nome do perfil |

### Tarefas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/tasks` | Listar tarefas |
| GET | `/tasks/:id` | Obter tarefa |
| POST | `/tasks` | Criar tarefa |
| PUT | `/tasks/:id` | Atualizar tarefa |
| DELETE | `/tasks/:id` | Excluir tarefa |
| PATCH | `/tasks/:id/complete` | Alternar conclusão |
| GET | `/tasks/stats` | Estatísticas |

### Saúde

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |

### Documentação

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api-docs` | Swagger UI |

## Funcionalidades Implementadas

### Web

- [x] Autenticação JWT (login/cadastro)
- [x] CRUD completo de tarefas
- [x] Filtros por status e busca textual
- [x] Dashboard com estatísticas e gráficos (Recharts)
- [x] Tema claro/escuro com persistência
- [x] Internacionalização pt-BR / English (i18next)
- [x] Avatar com iniciais e cores dinâmicas
- [x] Edição de perfil (nome)
- [x] Sidebar colapsável
- [x] Responsividade
- [x] Página de perfil com estatísticas
- [x] Página de configurações
- [x] Modal de criação/edição de tarefas

### Mobile (React Native)

- [x] Autenticação JWT
- [x] Listagem de tarefas
- [x] Criação de tarefas
- [x] Dashboard com estatísticas

### Backend

- [x] API RESTful
- [x] Arquitetura em camadas (routes → controllers → services → repositories)
- [x] Autenticação com JWT
- [x] Validação com Zod
- [x] Tratamento centralizado de erros
- [x] Documentação Swagger
- [x] Prisma ORM com migrations
- [x] Seed de dados
- [x] Docker multi-estágio

## Requisitos da Disciplina Atendidos

1. **Sistema Distribuído** — Arquitetura com frontend, backend e banco em camadas separadas, comunicando via REST
2. **API RESTful** — Endpoints seguindo padrões REST com métodos HTTP semânticos
3. **Autenticação Distribuída** — JWT com tokens armazenados no cliente
4. **Comunicação Cliente-Servidor** — Axios com interceptors para tratamento de tokens e erros
5. **Internacionalização** — Suporte a múltiplos idiomas (pt-BR e en)
6. **Conteinerização** — Docker Compose com 3 serviços
7. **Persistência** — PostgreSQL com Prisma ORM
8. **Frontend Múltiplo** — Web (TanStack Start) + Mobile (React Native) compartilhando a mesma API

---

Desenvolvido para a disciplina de **Sistemas Distribuídos** — UFERSA 2026.
