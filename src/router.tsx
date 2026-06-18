import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  try {
    const router = createRouter({
      routeTree,
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
    });

    return router;
  } catch (err) {
    console.error("[Nexus Router Init Error]", err);
    throw err;
  }
};
