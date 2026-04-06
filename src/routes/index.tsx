import { createFileRoute } from "@tanstack/react-router"
import { APP_NAME, APP_TAGLINE } from "@/lib/money"
import { HomePage } from "@/components/home-page"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: `${APP_NAME} — ${APP_TAGLINE}` },
      {
        name: "description",
        content:
          "Track every account, stay on top of budgets, and never miss a bill. One place, zero chaos.",
      },
    ],
  }),
  component: function IndexPage() {
    const { isAuthenticated } = Route.useRouteContext()
    const search = Route.useSearch()
    return (
      <HomePage
        isAuthenticated={isAuthenticated}
        redirectTo={search.redirect}
      />
    )
  },
})
