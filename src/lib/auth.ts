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

export async function handleSignOut() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        location.href = "/"
      },
    },
  })
}
