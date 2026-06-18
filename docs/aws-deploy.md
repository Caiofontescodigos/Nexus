# Deploy Nexus no AWS Lambda

## 1. Pré-requisitos

- Conta AWS com acesso ao console
- AWS CLI instalado e configurado (`aws configure`)
- Node.js ≥ 20

## 2. Estrutura Serverless

```
Frontend (React + TanStack Start)
        |
        | HTTPS
        v
API Gateway (https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod)
        |
        | Proxy Integration (ANY /{proxy+})
        v
AWS Lambda (NexusApi)
        |
        v
DynamoDB (NexusUsers, NexusTasks)
```

## 3. Infraestrutura AWS Existente

| Recurso | Nome | Região |
|---------|------|--------|
| API Gateway | `w1xqigg0v8` | us-east-1 |
| Lambda | `NexusApi` | us-east-1 |
| DynamoDB | `NexusUsers` | us-east-1 |
| DynamoDB | `NexusTasks` | us-east-1 |

## 4. Tabelas DynamoDB

### NexusUsers

| Atributo | Tipo | Descrição |
|----------|------|-----------|
| userId | String (PK) | UUID do usuário |
| name | String | Nome do usuário |
| email | String | Email (único) |
| passwordHash | String | Hash bcrypt da senha |
| createdAt | String | ISO timestamp |

**GSI:** `email-index` (Partition Key: email)

### NexusTasks

| Atributo | Tipo | Descrição |
|----------|------|-----------|
| taskId | String (PK) | UUID da tarefa |
| userId | String | Dono da tarefa |
| title | String | Título |
| description | String | Descrição |
| completed | Boolean | Status de conclusão |
| status | String | pending / in_progress / completed |
| priority | String | low / medium / high |
| createdAt | String | ISO timestamp |
| updatedAt | String | ISO timestamp |

**GSI:** `userId-index` (Partition Key: userId, Sort Key: createdAt)

## 5. Deploy da Lambda

### 5.1 Build

```bash
cd backend-api
npm install
npm run build
```

Isso gera o diretório `dist/` com o código compilado.

### 5.2 Empacotar

```bash
cd backend-api
cp -r node_modules dist/
cd dist
zip -r ../nexus-api.zip .
```

### 5.3 Enviar para AWS

```bash
aws lambda update-function-code \
  --function-name NexusApi \
  --zip-file fileb://backend-api/nexus-api.zip \
  --region us-east-1
```

### 5.4 Configurar Handler

No console da Lambda, verificar se o handler está configurado como:

```
dist/handler.handler
```

A Lambda deve ter integração com API Gateway via proxy (`ANY /{proxy+}`).

## 6. Variáveis de Ambiente da Lambda

Configurar no console AWS Lambda > NexusApi > Environment variables:

| Variável | Valor |
|----------|-------|
| JWT_SECRET | nexus-jwt-secret-key-sd-ufersa-2026 |
| JWT_EXPIRES_IN | 7d |
| USERS_TABLE | NexusUsers |
| TASKS_TABLE | NexusTasks |

## 7. Atualizar a Lambda (Deploy Rápido)

```bash
cd backend-api
npm run build
cp -r node_modules dist/
cd dist && zip -r ../nexus-api.zip . && cd ..
aws lambda update-function-code \
  --function-name NexusApi \
  --zip-file fileb://nexus-api.zip \
  --region us-east-1
```

## 8. Testar Endpoints

### Health Check
```bash
curl -s https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod/health
# {"status":"ok","service":"nexus-api"}
```

### Cadastro
```bash
curl -s -X POST https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456"}'
```

### Login
```bash
curl -s -X POST https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}'
```

### Listar Tarefas
```bash
TOKEN="<token-do-login>"
curl -s https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Criar Tarefa
```bash
curl -s -X POST https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Nova tarefa","priority":"high"}'
```

### Estatísticas
```bash
curl -s https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod/tasks/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 9. Frontend

Não requer deploy separado para a API. O frontend já aponta para:
```
https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod
```

Para testar localmente:
```bash
cd nexus-task-ui
npm install
npm run dev
```
