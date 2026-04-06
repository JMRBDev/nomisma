import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useCallback } from "react"
import { authClient } from "./auth-client"

function normalizeRedirectPath(redirectTo?: string) {
  if (!redirectTo) return "/dashboard"
  if (!redirectTo.startsWith("/")) return "/dashboard"
  if (redirectTo.startsWith("//")) return "/dashboard"
  return redirectTo
}

export async function handleSignIn(redirectTo?: string) {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: normalizeRedirectPath(redirectTo),
  })
}

export function useSignOut() {
  const navigate = useNavigate()
  return useCallback(async () => {
    try {
      await authClient.signOut()
      navigate({ to: "/", search: { redirect: undefined } })
    } catch {
      toast.error("Failed to sign out. Please try again.")
    }
  }, [navigate])
}
