import { StrictMode, startTransition } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

function renderApp() {
  const root = createRoot(document.getElementById("root") ?? document);
  root.render(
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
}

startTransition(() => {
  try {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  } catch (err) {
    console.error("[Nexus Client Init Error]", err);
    renderApp();
  }
});
