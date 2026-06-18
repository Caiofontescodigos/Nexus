import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    client: { entry: "client" },
    server: { entry: "server" },
  },
  vite: {
    base: "/",
    server: { port: 3000 },
  },
});
