// Handler modificado com fallback mock para /auth/register
// Usa MOCK_DB=true para bypassar DynamoDB

const http = await import("node:http");

// --- Funções do handler original (cópia inline para teste isolado) ---

function getPath(event) {
  let path = event.rawPath || event.path || "/";
  const stage = event.requestContext?.stage;
  if (stage && path.startsWith(`/${stage}`)) {
    path = path.slice(stage.length + 1) || "/";
  }
  return path;
}
function getMethod(event) {
  return event.requestContext?.http?.method || event.httpMethod || "GET";
}
function getBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); }
  catch { return {}; }
}

// Handler modificado com flag de mock
async function mockHandler(event) {
  const MOCK = process.env.MOCK_DB === "true";

  if (getMethod(event) === "OPTIONS") {
    return { statusCode: 204, headers: { "Content-Type": "application/json" }, body: "" };
  }

  const method = getMethod(event);
  const path = getPath(event);
  const body = getBody(event);

  console.log(`[mockHandler] method=${method} path=${path} body=${JSON.stringify(body)} MOCK_DB=${MOCK}`);

  if (path === "/auth/register" && method === "POST") {
    if (MOCK) {
      console.log("[mockHandler] ✅ ROTA CASOU — retornando mock (bypass DynamoDB)");
      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "success_mock", message: "Registro mockado — DynamoDB não foi contactado" }),
      };
    }
    // Sem mock: tenta DynamoDB (vai falhar localmente)
    const { handler } = await import("./dist/handler.js");
    return handler(event);
  }

  // Delegar outras rotas para o handler real
  const { handler } = await import("./dist/handler.js");
  return handler(event);
}

// --- Servidor HTTP local ---
const PORT = 3456;

const server = http.createServer(async (req, res) => {
  // Monta o evento simulado
  const method = req.method;
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  let body = "";
  req.on("data", (chunk) => body += chunk);
  req.on("end", async () => {
    const event = {
      rawPath: path,
      requestContext: { http: { method }, stage: "prod" },
      body: body || undefined,
    };

    console.log(`\n[servidor] → ${method} ${path}`);
    const result = await mockHandler(event);
    const bodyStr = result.body;

    res.writeHead(result.statusCode, { "Content-Type": "application/json" });
    res.end(bodyStr);

    console.log(`[servidor] ← ${result.statusCode} ${bodyStr.slice(0, 100)}`);
  });
});

server.listen(PORT, () => {
  console.log("=".repeat(72));
  console.log("🧪  Servidor de teste com fallback mock para /auth/register");
  console.log(`     Rodando em http://localhost:${PORT}`);
  console.log(`     MOCK_DB=${process.env.MOCK_DB || "não definido (usando DynamoDB real)"}`);
  console.log("=".repeat(72));
  console.log();
  console.log("Teste com:");
  console.log(`  curl -X POST http://localhost:${PORT}/auth/register \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"name":"Teste","email":"teste@test.com","password":"123456"}'`);
  console.log();
  console.log("Pressione Ctrl+C para parar.");
});
