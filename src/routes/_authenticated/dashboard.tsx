import { Outlet, createFileRoute } from "@tanstack/react-router"
import { DEFAULT_WEEK_STARTS_ON } from "../../../shared/settings"
import type { WeekStartsOnPreference } from "../../../shared/settings"
import { parseOverviewDateFilterSearch } from "@/components/dashboard/overview/overview-date-filter"
import { AppShell } from "@/components/app-shell"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getUserSettingsQueryOptions } from "@/lib/dashboard-query-options"

type UserSettings = {
  settings: {
    baseCurrency: string
    weekStartsOn: string
    theme: string
    colorTheme: string
  } | null
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: {
    breadcrumb: "Overview",
  },
  validateSearch: parseOverviewDateFilterSearch,
  loader: async ({ context }) => {
    const userSettings = (await ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getUserSettingsQueryOptions()
    )) as UserSettings
    return { userSettings }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { userSettings } = Route.useLoaderData()
  const weekStartsOn = (userSettings.settings?.weekStartsOn ??
    DEFAULT_WEEK_STARTS_ON) as WeekStartsOnPreference

  return (
    <AppShell weekStartsOn={weekStartsOn}>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </AppShell>
  )
}
