import { createFileRoute } from "@tanstack/react-router"
import { m } from "@/lib/i18n-client"
import { APP_NAME } from "@/lib/money"
import { HomePage } from "@/components/home-page"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: `${APP_NAME} — ${m.app_tagline()}` },
      {
        name: "description",
        content: m.home_hero_description(),
      },
    ],
  }),
  component: function IndexPage() {
    const { isAuthenticated, locale } = Route.useRouteContext()
    const search = Route.useSearch()
    return (
      <HomePage
        isAuthenticated={isAuthenticated}
        locale={locale}
        redirectTo={search.redirect}
      />
    )
  },
})
