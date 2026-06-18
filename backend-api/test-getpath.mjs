// Teste isolado da função getPath — não depende de DynamoDB
// Simula eventos do API Gateway HTTP v2 e REST v1

function getPath(event) {
  let path = event.rawPath || event.path || "/";
  const stage = event.requestContext?.stage;
  if (stage && path.startsWith(`/${stage}`)) {
    path = path.slice(stage.length + 1) || "/";
  }
  return path;
}

const tests = [
  // [nome, evento, pathEsperado]
  [
    "HTTP v2 — POST /auth/register (sem stage no rawPath)",
    { rawPath: "/auth/register", requestContext: {} },
    "/auth/register",
  ],
  [
    "HTTP v2 — POST /prod/auth/register (stage 'prod' no rawPath)",
    { rawPath: "/prod/auth/register", requestContext: { stage: "prod" } },
    "/auth/register",
  ],
  [
    "HTTP v2 — GET /tasks (sem stage, stage null)",
    { rawPath: "/tasks", requestContext: { stage: null } },
    "/tasks",
  ],
  [
    "HTTP v2 — POST /prod/tasks (stage 'prod')",
    { rawPath: "/prod/tasks", requestContext: { stage: "prod" } },
    "/tasks",
  ],
  [
    "REST v1 — POST /auth/register (path sem stage, rawPath ausente)",
    { path: "/auth/register", httpMethod: "POST", requestContext: { stage: "prod" } },
    "/auth/register",
  ],
  [
    "REST v1 — GET /prod/auth/me (path inesperado com stage, rawPath ausente)",
    { path: "/prod/auth/me", httpMethod: "GET", requestContext: { stage: "prod" } },
    "/auth/me",
  ],
  [
    "Edge — rawPath vazio, path vazio, stage 'prod'",
    { rawPath: "", path: "", requestContext: { stage: "prod" } },
    "/",
  ],
  [
    "Edge — rawPath = /, stage 'dev'",
    { rawPath: "/", requestContext: { stage: "dev" } },
    "/",
  ],
  [
    "Edge — stage 'staging', path /staging/auth/login",
    { rawPath: "/staging/auth/login", requestContext: { stage: "staging" } },
    "/auth/login",
  ],
  [
    "Edge — stage name igual a path (ex: /prod/prod)",
    { rawPath: "/prod/prod", requestContext: { stage: "prod" } },
    "/prod",
  ],
];

let passed = 0;
let failed = 0;

console.log("=".repeat(72));
console.log("🧪  Testes da função getPath — Roteamento de eventos API Gateway");
console.log("=".repeat(72));
console.log();

for (const [name, event, expected] of tests) {
  const result = getPath(event);
  const ok = result === expected;
  const status = ok ? "✅ PASS" : "❌ FAIL";
  if (ok) passed++;
  else failed++;

  console.log(`${status}  ${name}`);
  console.log(`     Event:         ${JSON.stringify(event)}`);
  console.log(`     getPath →      "${result}"`);
  if (!ok) console.log(`     Esperado →     "${expected}"`);
  console.log();
}

console.log("=".repeat(72));
console.log(`Resultado: ${passed} passaram, ${failed} falharam de ${tests.length} testes`);
console.log("=".repeat(72));
