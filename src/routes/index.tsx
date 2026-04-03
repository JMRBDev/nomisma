import { Link, createFileRoute } from "@tanstack/react-router"
import { LandmarkIcon, ReceiptTextIcon, TargetIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { handleSignIn, handleSignOut } from "@/lib/auth"
import { APP_NAME } from "@/lib/money"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Home | ${APP_NAME}` },
      {
        name: "description",
        content:
          "A simple personal money app for tracking accounts, transactions, budgets, and recurring items.",
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,109,75,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-6 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            Personal money control
          </p>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-heading text-5xl leading-tight font-medium md:text-6xl">
              See what you have, what you spent, and what is coming next.
            </h1>
            <p className="max-w-xl text-base leading-7 text-neutral-300">
              {APP_NAME} keeps everyday money tracking simple enough for real
              life: one place for balances, transactions, monthly limits, and
              recurring bills.
            </p>
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            <Card className="bg-card/70">
              <CardHeader>
                <LandmarkIcon className="size-5 text-primary" />
                <CardTitle>Accounts</CardTitle>
                <CardDescription>
                  Keep every money balance in one view.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/70">
              <CardHeader>
                <ReceiptTextIcon className="size-5 text-primary" />
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Track income, spending, and transfers.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/70">
              <CardHeader>
                <TargetIcon className="size-5 text-primary" />
                <CardTitle>Budgets</CardTitle>
                <CardDescription>Stay aware of monthly limits.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <Card className="w-full max-w-md justify-self-center bg-card/90">
          <CardHeader>
            <CardTitle>{APP_NAME}</CardTitle>
            <CardDescription>
              Status: {isAuthenticated ? "Authenticated" : "Sign in to start"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              The first release focuses on personal money only: one person, one
              base currency, manual transactions, clear budgets, and recurring
              reminders.
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
      </div>
    </main>
  )
}
