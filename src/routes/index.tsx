import { createFileRoute } from "@tanstack/react-router"
import { APP_NAME } from "@/lib/money"
import { HomePage } from "@/components/home-page"

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
