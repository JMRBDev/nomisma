/// <reference types="vite/client" />
import { createRouter } from "@tanstack/react-router"
import { QueryClient, notifyManager } from "@tanstack/react-query"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { ConvexQueryClient } from "@convex-dev/react-query"
import { routeTree } from "./routeTree.gen"
import { ErrorPage } from "@/components/error-page"
import { NotFoundPage } from "@/components/not-found-page"

const LIVE_QUERY_GC_TIME = 2 * 60_000
const ROUTE_PRELOAD_STALE_TIME = 30_000

export function getRouter() {
  if (typeof document !== "undefined") {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  const convexUrl = import.meta.env.VITE_CONVEX_URL!
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not set")
  }
  const convexQueryClient = new ConvexQueryClient(convexUrl, {
    expectAuth: true,
  })

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: LIVE_QUERY_GC_TIME,
        refetchOnWindowFocus: false,
      },
    },
  })
  convexQueryClient.connect(queryClient)
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadDelay: 0,
    defaultPreloadStaleTime: ROUTE_PRELOAD_STALE_TIME,
    defaultStaleReloadMode: "background",
    defaultPendingMs: 150,
    defaultPendingMinMs: 250,
    context: { queryClient, convexQueryClient },
    scrollRestoration: true,
    defaultErrorComponent: ErrorPage,
    defaultNotFoundComponent: NotFoundPage,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
