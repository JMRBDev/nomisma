import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { m } from "@/paraglide/messages"
import { handleSignIn } from "@/lib/auth"
import { APP_NAME } from "@/lib/money"
import { Button } from "@/components/ui/button"
import { LandingFeatures } from "@/components/landing-features"

export function HomePage({
  isAuthenticated,
  redirectTo,
}: {
  isAuthenticated: boolean
  redirectTo?: string
}) {
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
              <Link to="/dashboard">{m.home_go_to_dashboard()}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => handleSignIn(redirectTo)}>
              {m.home_get_started()}
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
            {m.home_hero_title()}
          </h1>
          <p
            className="mx-auto mt-6 max-w-md text-lg text-muted-foreground"
            style={{ animation: "fadeUp 0.7s ease-out 100ms both" }}
          >
            {m.home_hero_description()}
          </p>
          <div
            className="mt-10 flex flex-col items-center gap-3"
            style={{ animation: "fadeUp 0.7s ease-out 200ms both" }}
          >
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/dashboard">
                  {m.home_go_to_dashboard()}
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button size="lg" onClick={() => handleSignIn(redirectTo)}>
                {m.home_get_started_free()}
                <ArrowRight />
              </Button>
            )}
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                {m.home_sign_in_hint()}
              </p>
            )}
          </div>
        </div>
      </section>

      <LandingFeatures />

      <section className="py-24 text-center">
        <h2
          className="font-heading text-3xl tracking-tight"
          style={{ animation: "fadeUp 0.7s ease-out 700ms both" }}
        >
          {m.home_cta_title()}
        </h2>
        <div
          className="mt-8"
          style={{ animation: "fadeUp 0.7s ease-out 800ms both" }}
        >
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/dashboard">
                {m.home_go_to_dashboard()}
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button size="lg" onClick={() => handleSignIn(redirectTo)}>
              {m.home_get_started_free()}
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
