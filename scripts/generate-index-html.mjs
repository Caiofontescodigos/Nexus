import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(import.meta.dirname, "..", "dist", "client");
const assets = resolve(dist, "assets");

if (!existsSync(assets)) {
  console.error("dist/client/assets not found — skipping index.html generation");
  process.exit(0);
}

const files = readdirSync(assets);
const jsEntry = files.find((f) => /^index-.+\.js$/.test(f));
const cssEntry = files.find((f) => /^styles-.+\.css$/.test(f));

if (!jsEntry) {
  console.error("No index-*.js entry found in dist/client/assets");
  process.exit(1);
}

const html = `<!doctype html>
<html lang="en" translate="no" class="notranslate">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="google" content="notranslate" />
    <title>Nexus — Organize. Conecte. Conclua.</title>
    <meta name="description" content="Nexus é um workspace moderno para produtividade pessoal — organize tarefas, conecte ideias e conclua o que importa." />
    <meta property="og:title" content="Nexus — Organize. Conecte. Conclua." />
    <meta property="og:description" content="A modern task management app for personal productivity." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    ${cssEntry ? `<link rel="stylesheet" href="/assets/${cssEntry}" />` : ""}
  </head>
  <body class="notranslate">
    <div id="root"></div>
    <script type="module" src="/assets/${jsEntry}"></script>
  </body>
</html>`;

writeFileSync(resolve(dist, "index.html"), html, "utf-8");
console.log("Generated dist/client/index.html");
