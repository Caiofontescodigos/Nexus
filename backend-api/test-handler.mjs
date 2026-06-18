// Teste do handler com roteamento — verifica se a rota casa ANTES do DynamoDB
// Se cair no catch com erro diferente de "Route not found", a rota casou ✓
// Se retornar 404 "Route not found", a rota NÃO casou ✗

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Carrega o handler compilado
const { handler } = require("./dist/handler.js");

// Lista de eventos simulados
const scenarios = [
  {
    name: "POST /auth/register (HTTP v2, sem stage no rawPath)",
    event: {
      rawPath: "/auth/register",
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({ name: "Teste", email: "teste@teste.com", password: "123456" }),
    },
  },
  {
    name: "POST /auth/register (HTTP v2, stage 'prod' no rawPath)",
    event: {
      rawPath: "/prod/auth/register",
      requestContext: { http: { method: "POST" }, stage: "prod" },
      body: JSON.stringify({ name: "Teste", email: "teste@teste.com", password: "123456" }),
    },
  },
  {
    name: "POST /auth/register (HTTP v2, stage 'dev' no rawPath)",
    event: {
      rawPath: "/dev/auth/register",
      requestContext: { http: { method: "POST" }, stage: "dev" },
      body: JSON.stringify({ name: "Teste", email: "teste@teste.com", password: "123456" }),
    },
  },
  {
    name: "POST /prod/auth/register (REST v1, sem rawPath)",
    event: {
      path: "/prod/auth/register",
      httpMethod: "POST",
      requestContext: { stage: "prod" },
      body: JSON.stringify({ name: "Teste", email: "teste@teste.com", password: "123456" }),
    },
  },
  {
    name: "POST /auth/register (REST v1, sem rawPath, path sem stage)",
    event: {
      path: "/auth/register",
      httpMethod: "POST",
      requestContext: { stage: "prod" },
      body: JSON.stringify({ name: "Teste", email: "teste@teste.com", password: "123456" }),
    },
  },
  {
    name: "OPTIONS /auth/register (CORS preflight)",
    event: {
      rawPath: "/auth/register",
      requestContext: { http: { method: "OPTIONS" } },
    },
  },
  {
    name: "GET /health (HTTP v2)",
    event: {
      rawPath: "/health",
      requestContext: { http: { method: "GET" } },
    },
  },
  {
    name: "GET /prod/health (HTTP v2, stage prod)",
    event: {
      rawPath: "/prod/health",
      requestContext: { http: { method: "GET" }, stage: "prod" },
    },
  },
  {
    name: "POST /rota-inexistente",
    event: {
      rawPath: "/rota-inexistente",
      requestContext: { http: { method: "POST" } },
    },
  },
];

console.log("=".repeat(80));
console.log("🧪  Testes do Handler — Roteamento de rotas do API Gateway");
console.log("=".repeat(80));
console.log();
console.log("Legenda:");
console.log("  ✅ ROTA CASOU  → handler tentou executar (erro DynamoDB é esperado pois não temos credenciais locais)");
console.log("  ❌ ROTA NÃO CASOU → handler retornou 'Route not found' (404)");
console.log("  ⚠️  Outro erro  → imprevisto (timeout, etc)");
console.log();

let passed = 0;
let failed = 0;

for (const { name, event } of scenarios) {
  process.stdout.write(`▶  ${name} ... `);

  try {
    const result = await handler(event);
    const body = result.body ? JSON.parse(result.body) : {};

    if (result.statusCode === 404 && body.error === "Route not found") {
      console.log(`❌ NÃO CASOU  (404 — "${body.error}")`);
      console.log(`   Status: ${result.statusCode} | Body: ${result.body}`);
      failed++;
    } else if (result.statusCode === 204) {
      console.log(`✅ CASOU  (204 — CORS OPTIONS)`);
      passed++;
    } else if (body.error && body.error.includes("credentials") || body.error === "Internal server error") {
      // Erro de credenciais AWS significa que a ROTA CASOU mas o DynamoDB falhou
      console.log(`✅ ROTA CASOU  (status ${result.statusCode} — erro esperado: DynamoDB sem credenciais)`);
      console.log(`   Body: ${JSON.stringify(body).slice(0, 120)}`);
      passed++;
    } else if (result.statusCode >= 200 && result.statusCode < 500) {
      console.log(`✅ CASOU  (${result.statusCode})`);
      console.log(`   Body: ${JSON.stringify(body).slice(0, 120)}`);
      passed++;
    } else {
      console.log(`⚠️  Resposta inesperada: ${result.statusCode}`);
      console.log(`   Body: ${JSON.stringify(body).slice(0, 200)}`);
      failed++;
    }
  } catch (err) {
    console.log(`⚠️  Exceção lançada — ${err.message?.slice(0, 100)}`);
    failed++;
  }

  console.log();
}

console.log("=".repeat(80));
console.log(`Resultado: ${passed} passaram, ${failed} falharam de ${scenarios.length} cenários`);
console.log("=".repeat(80));
