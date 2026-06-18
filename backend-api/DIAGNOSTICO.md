# Diagnóstico — Rota `/auth/register` retornando 404 em produção

## Resumo

O roteamento do handler **funciona localmente em TODOS os cenários testados**. A rota `/auth/register` casa corretamente com e sem stage prefix (`/prod`), com e sem mock de banco. O erro 404 em produção **não é causado pela lógica de roteamento do código**.

---

## Teste 1 — `getPath()` isolado (10 cenários)

Arquivo: `backend-api/test-getpath.mjs`

| # | Cenário | Evento | Resultado | Esperado |
|---|---------|--------|-----------|----------|
| 1 | HTTP v2 — POST /auth/register (sem stage) | `rawPath: "/auth/register"` | `/auth/register` ✅ | `/auth/register` |
| 2 | HTTP v2 — POST /prod/auth/register (stage prod) | `rawPath: "/prod/auth/register"`, `stage: "prod"` | `/auth/register` ✅ | `/auth/register` |
| 3 | HTTP v2 — GET /tasks (stage null) | `rawPath: "/tasks"`, `stage: null` | `/tasks` ✅ | `/tasks` |
| 4 | HTTP v2 — POST /prod/tasks (stage prod) | `rawPath: "/prod/tasks"`, `stage: "prod"` | `/tasks` ✅ | `/tasks` |
| 5 | REST v1 — POST /auth/register (path sem stage) | `path: "/auth/register"`, `stage: "prod"` | `/auth/register` ✅ | `/auth/register` |
| 6 | REST v1 — GET /prod/auth/me (path com stage inesperado) | `path: "/prod/auth/me"`, `stage: "prod"` | `/auth/me` ✅ | `/auth/me` |
| 7 | Edge — rawPath vazio, path vazio | `rawPath: ""`, `path: ""` | `/` ✅ | `/` |
| 8 | Edge — rawPath = / | `rawPath: "/"` | `/` ✅ | `/` |
| 9 | Edge — stage "staging", path /staging/auth/login | `rawPath: "/staging/auth/login"`, `stage: "staging"` | `/auth/login` ✅ | `/auth/login` |
| 10 | Edge — /prod/prod | `rawPath: "/prod/prod"`, `stage: "prod"` | `/prod` ✅ | `/prod` |

**Resultado: 10/10 PASSARAM**

---

## Teste 2 — Handler completo (9 cenários)

Arquivo: `backend-api/test-handler.mjs`

O handler foi alimentado com eventos simulados. Se a rota casa, o handler tenta executar o serviço (DynamoDB), que falha localmente por falta de credenciais AWS — **essa falha PROVA que o `if` da rota foi satisfeito**.

| # | Cenário | Resultado | Evidência |
|---|---------|-----------|-----------|
| 1 | POST /auth/register (HTTP v2, sem stage) | ✅ ROTA CASOU | Erro `CredentialsProviderError` veio de `authService.register()` — linha 73 do handler |
| 2 | POST /auth/register (HTTP v2, stage prod) | ✅ ROTA CASOU | Idem — stage stripping funcionou |
| 3 | POST /auth/register (HTTP v2, stage dev) | ✅ ROTA CASOU | Idem — stage stripping funcionou para stage diferente |
| 4 | POST /prod/auth/register (REST v1, sem rawPath) | ✅ ROTA CASOU | `getPath()` usou `event.path` com stage stripping |
| 5 | POST /auth/register (REST v1, path sem stage) | ✅ ROTA CASOU | `getPath()` usou `event.path` direto |
| 6 | OPTIONS /auth/register | ✅ CASOU (204) | CORS preflight |
| 7 | GET /health | ✅ CASOU (200) | Rota de health check |
| 8 | GET /prod/health (stage prod) | ✅ CASOU (200) | Stage stripping + health |
| 9 | POST /rota-inexistente | ❌ 404 NÃO CASOU | Comportamento esperado |

### Stack trace que PROVA o casamento da rota (cenário 1):

```
at Object.findByEmail (userRepository.js:10:24)
at Object.register (authService.js:14:26)    ← chamou authService.register
at handler (handler.js:65:34)                 ← chamou handler
```

A stack trace mostra `handler.js:65` → `authService.register()` → `userRepository.findByEmail()`. O handler só chega na linha 65 (`authService.register`) se a condição `path === "/auth/register" && method === "POST"` na linha 71 do source for **verdadeira**.

---

## Teste 3 — Fallback mock MOCK_DB=true

Arquivo: `backend-api/test-mock-register.mjs`

Servidor HTTP local na porta 3456 com handler modificado: quando `MOCK_DB=true`, `/auth/register` retorna mock em vez de chamar DynamoDB.

```
$ MOCK_DB=true node test-mock-register.mjs
```

| # | Request | Resposta | Prova |
|---|---------|----------|-------|
| 1 | `POST /auth/register` corpo válido | **201** `{"status":"success_mock"}` | Mock bypassou DynamoDB |
| 2 | `POST /auth/register` corpo vazio | **201** `{"status":"success_mock"}` | Mock ignora validação (rota casou) |
| 3 | `POST /rota-inexistente` | **404** `{"error":"Route not found"}` | Rota não casou |
| 4 | `GET /health` | **200** `{"status":"ok"}` | Health intacto |
| 5 | `OPTIONS /auth/register` | **204** | CORS funcional |
| 6 | `POST /prod/auth/register` (stage prod) | **201** `{"status":"success_mock"}` | Stage stripping + mock → rota casou |
| 7 | `POST /prod/tasks` (stage prod) | **401** `{"error":"Token not provided"}` | Stage stripping funcionou, rota casou, auth middleware exigiu token |

---

## Conclusão

O handler **está correto**. O `getPath()` com stage stripping funciona em todos os cenários (HTTP v2 com/sem stage, REST v1, casos de borda). A rota `/auth/register` casa e chega até o `authService.register()`. O mock bypassa o DynamoDB e retorna sucesso.

**O erro 404 em produção NÃO é causado pelo código do handler.** As causas possíveis, em ordem de probabilidade:

1. ⚠️ **O deploy da Lambda pode não ter sido efetivado.** O comando `aws lambda update-function-code` pode ter falhado silenciosamente (nome da função errado, região errada, permissão negada). Verifique no console AWS:
   - Lambda > Funções > NexusApi > "Código fonte" → veja a data do último update
   - Faça um teste com `aws lambda invoke --function-name NexusApi --payload '{"rawPath":"/health","requestContext":{"http":{"method":"GET"}}}' response.json`

2. ⚠️ **O API Gateway pode estar apontando para uma versão/alias específica da Lambda.** Se o alias `prod` estiver travado em uma versão anterior (ex: `v1` em vez de `$LATEST`), o novo código não será usado mesmo após o `update-function-code`.

3. ⚠️ **O formato do evento pode ser diferente do esperado.** Se o API Gateway for REST API v1 com integração não-proxy (mapeamento de template personalizado), os campos `rawPath`, `requestContext.http.method`, etc. podem não existir. O handler então cairia nos fallbacks e ainda assim funcionaria (via `event.path` e `event.httpMethod`) — a menos que o template de mapeamento transforme o evento em um formato completamente diferente.

## Recomendação

Verifique no console AWS:
```
Lambda > NexusApi > Qualificador: $LATEST
```
Clique em **Test** e cole este evento de teste:
```json
{
  "rawPath": "/auth/register",
  "requestContext": { "http": { "method": "POST" }, "stage": "prod" },
  "body": "{\"name\":\"Teste\",\"email\":\"teste@test.com\",\"password\":\"123456\"}"
}
```

Se retornar 404 → o Lambda ainda tem código antigo (redeploy necessário).
Se retornar 500 (erro DynamoDB) → código novo está no ar, problema é nas credenciais/tabelas da Lambda.

Arquivos de teste criados (não commitados):
- `backend-api/test-getpath.mjs`
- `backend-api/test-handler.mjs`
- `backend-api/test-mock-register.mjs`
- `backend-api/DIAGNOSTICO.md`
