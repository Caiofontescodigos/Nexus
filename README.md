# Nexus

> **Nexus** — Organize. Conecte. Conclua.

Sistema distribuído de gerenciamento de tarefas desenvolvido como projeto final da disciplina de **Sistemas Distribuídos** — UFERSA.

## Objetivo

Nexus é um workspace moderno para produtividade pessoal. Permite que usuários criem, organizem e acompanhem tarefas com suporte a status, prioridades, estatísticas e gráficos de desempenho. O sistema adota arquitetura serverless na AWS com comunicação via REST API.

## Arquitetura — Serverless

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│          (Web + Mobile React Native)             │
│              Porta 3000 / 80                     │
├─────────────────────────────────────────────────┤
│           API Gateway (HTTP API)                 │
│   https://w1xqigg0v8.execute-api.us-east-1       │
│            .amazonaws.com/prod                   │
├─────────────────────────────────────────────────┤
│              AWS Lambda (NexusApi)                │
│           ANY /{proxy+} → handler.ts             │
├─────────────────────────────────────────────────┤
│              Amazon DynamoDB                      │
│         NexusUsers + NexusTasks                  │
└─────────────────────────────────────────────────┘
```

- **Camada de Apresentação**: Aplicação web (React + TanStack Start) e mobile (React Native)
- **Camada de Lógica**: AWS Lambda com TypeScript, roteamento interno via API Gateway Proxy
- **Camada de Dados**: Amazon DynamoDB (NoSQL) com tabelas NexusUsers e NexusTasks

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
- [AWS Lambda](https://aws.amazon.com/lambda/) — computação serverless
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/) — HTTP API
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) — banco NoSQL
- [AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) — acesso DynamoDB
- [TypeScript](https://www.typescriptlang.org/)
- [JWT](https://jwt.io/) — autenticação
- [Zod](https://zod.dev/) — validação de schemas

### Infraestrutura
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/)
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
- [AWS CLI](https://aws.amazon.com/cli/) — deploy via linha de comando

## Estrutura do Projeto

```
Nexus-task/
├── backend-api/                  # AWS Lambda (API Gateway + DynamoDB)
│   ├── src/
│   │   ├── config/               # Configurações (env, tabelas)
│   │   ├── middlewares/          # Middleware JWT para Lambda
│   │   ├── repositories/         # Acesso a dados (DynamoDB)
│   │   ├── schemas/              # Schemas de validação (Zod)
│   │   ├── services/             # Lógica de negócio
│   │   ├── types/                # Tipos TypeScript
│   │   ├── utils/                # Utilitários (DynamoDB, JWT, errors)
│   │   └── handler.ts            # Entry point Lambda
│   ├── deploy.sh                 # Script de deploy
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

## Como Executar

### Pré-requisitos

- Node.js ≥ 20
- npm
- AWS CLI (para deploy)

### 1. Backend (Lambda)

O backend roda como uma função AWS Lambda. Para desenvolvimento local:

```bash
cd backend-api
npm install
npm run build               # Compila TypeScript
```

Para fazer deploy na Lambda existente:

```bash
cd backend-api
chmod +x deploy.sh
./deploy.sh NexusApi us-east-1
```

### 2. Frontend Web

```bash
cd nexus-task-ui
npm install
npm run dev                 # Inicia em http://localhost:3000
```

O frontend aponta para a API Gateway em:
```
https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod
```

### 3. Mobile (opcional)

```bash
cd mobile-app
npm install
npx expo start
```

> A API não requer Docker ou PostgreSQL — toda a camada de dados utiliza Amazon DynamoDB.

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

A documentação OpenAPI está disponível em `docs/swagger.yaml`.

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

- [x] API RESTful serverless (AWS Lambda + API Gateway)
- [x] Armazenamento NoSQL (Amazon DynamoDB)
- [x] Autenticação com JWT
- [x] Validação com Zod
- [x] Tratamento centralizado de erros

## Requisitos da Disciplina Atendidos

1. **Sistema Distribuído** — Arquitetura serverless com frontend, API Gateway, Lambda e DynamoDB
2. **API RESTful** — Endpoints seguindo padrões REST com métodos HTTP semânticos
3. **Autenticação Distribuída** — JWT com tokens armazenados no cliente
4. **Comunicação Cliente-Servidor** — Axios com interceptors para tratamento de tokens e erros
5. **Internacionalização** — Suporte a múltiplos idiomas (pt-BR e en)
6. **Computação Serverless** — AWS Lambda sem gerenciamento de servidores
7. **Persistência NoSQL** — Amazon DynamoDB com tabelas NexusUsers e NexusTasks
8. **Frontend Múltiplo** — Web (TanStack Start) + Mobile (React Native) compartilhando a mesma API

---

Desenvolvido para a disciplina de **Sistemas Distribuídos** — UFERSA 2026.
