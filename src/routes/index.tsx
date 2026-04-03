import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { handleSignIn, handleSignOut } from "@/lib/auth"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Home | App Template" },
      {
        name: "description",
        content:
          "Minimal template with authentication and a protected dashboard shell.",
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const { isAuthenticated } = Route.useRouteContext()
  const search = Route.useSearch()
  const redirectTo = search.redirect

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>App Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Status: {isAuthenticated ? "Authenticated" : "Not authenticated"}
          </p>
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button asChild>
                  <Link to={redirectTo ?? "/dashboard"}>
                    {redirectTo ? "Continue" : "Go to dashboard"}
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button onClick={() => handleSignIn(redirectTo)}>
                Sign in with Google
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
