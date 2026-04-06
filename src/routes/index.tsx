import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, CalendarDays, PieChart, Wallet } from "lucide-react"

import { handleSignIn } from "@/lib/auth"
import { APP_NAME } from "@/lib/money"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: `${APP_NAME} — Simple Money Control` },
      {
        name: "description",
        content:
          "Track accounts, transactions, and budgets in one clean place. Know where every dollar goes.",
      },
    ],
  }),
  component: HomePage,
})

const features = [
  {
    icon: Wallet,
    title: "All your accounts, one view",
    description:
      "Checking, savings, cash, and digital wallets. See your total balance at a glance.",
  },
  {
    icon: PieChart,
    title: "Budgets that keep you honest",
    description:
      "Set monthly limits by category and know where you stand before the month ends.",
  },
  {
    icon: CalendarDays,
    title: "Never miss a recurring bill",
    description:
      "Track subscriptions and upcoming bills so nothing surprises you at the end of the month.",
  },
]

function HomePage() {
  const { isAuthenticated } = Route.useRouteContext()
  const search = Route.useSearch()
  const redirectTo = search.redirect

  return (
    <div className="flex min-h-screen flex-col">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            to="/"
            search={{ redirect: undefined }}
            className="font-heading text-xl tracking-tight"
          >
            {APP_NAME}
          </Link>
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => handleSignIn(redirectTo)}>
              Get started
            </Button>
          )}
        </div>
      </header>

      <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h1
            className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl"
            style={{ animation: "fadeUp 0.7s ease-out 0ms both" }}
          >
            Know where every dollar goes.
          </h1>
          <p
            className="mx-auto mt-6 max-w-md text-lg text-muted-foreground"
            style={{ animation: "fadeUp 0.7s ease-out 100ms both" }}
          >
            Track accounts, transactions, and budgets in one clean place. No
            complexity, just clarity.
          </p>
          <div
            className="mt-10 flex flex-col items-center gap-3"
            style={{ animation: "fadeUp 0.7s ease-out 200ms both" }}
          >
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Go to dashboard
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button size="lg" onClick={() => handleSignIn(redirectTo)}>
                Get started for free
                <ArrowRight />
              </Button>
            )}
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Free to use. Sign in with Google.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="text-center font-heading text-3xl tracking-tight"
            style={{ animation: "fadeUp 0.7s ease-out 300ms both" }}
          >
            Everything you need to stay on top of your money
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-shadow duration-300 hover:shadow-md"
                style={{
                  animation: `fadeUp 0.7s ease-out ${400 + i * 100}ms both`,
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <h2
          className="font-heading text-3xl tracking-tight"
          style={{ animation: "fadeUp 0.7s ease-out 700ms both" }}
        >
          Start taking control of your money today.
        </h2>
        <div
          className="mt-8"
          style={{ animation: "fadeUp 0.7s ease-out 800ms both" }}
        >
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/dashboard">
                Go to dashboard
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button size="lg" onClick={() => handleSignIn(redirectTo)}>
              Get started for free
              <ArrowRight />
            </Button>
          )}
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </div>
      </footer>
    </div>
  )
}
