import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    client: { base: "/" },
    server: { entry: "server" },
  },
  vite: {
    base: "/",
    server: { port: 3000 },
  },
});
