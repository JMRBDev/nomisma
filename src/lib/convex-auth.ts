import type { ConvexQueryClient } from "@convex-dev/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

let pendingTokenSync: Promise<boolean> | null = null

function isConvexUnauthenticatedError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("ConvexError: Unauthenticated")
  )
}

async function syncClientConvexAuth(convexQueryClient: ConvexQueryClient) {
  if (typeof window === "undefined") {
    return false
  }

  if (!pendingTokenSync) {
    pendingTokenSync = authClient.convex
      .token({
        fetchOptions: {
          throw: false,
        },
      })
      .then(({ data }) => {
        const token = data?.token ?? null

        if (!token) {
          return false
        }

        convexQueryClient.convexClient.setAuth(() => Promise.resolve(token))
        convexQueryClient.serverHttpClient?.setAuth(token)
        return true
      })
      .catch(() => false)
      .finally(() => {
        pendingTokenSync = null
      })
  }

  return pendingTokenSync
}

export async function ensureAuthenticatedQueryData(
  queryClient: QueryClient,
  convexQueryClient: ConvexQueryClient,
  options: any
) {
  try {
    return await queryClient.ensureQueryData(options)
  } catch (error) {
    if (!isConvexUnauthenticatedError(error)) {
      throw error
    }

    const synced = await syncClientConvexAuth(convexQueryClient)

    if (!synced) {
      throw error
    }

    return queryClient.ensureQueryData(options)
  }
}
