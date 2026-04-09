import { useSuspenseQuery } from "@tanstack/react-query"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { parseOverviewDateFilterSearch } from "@/components/dashboard/overview/overview-date-filter"
import { AppShell } from "@/components/app-shell"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getUserSettingsQueryOptions } from "@/lib/dashboard-query-options"
import { getLocale, setLocale } from "@/paraglide/runtime"
import { useMountEffect } from "@/hooks/use-mount-effect"
import { DEFAULT_WEEK_STARTS_ON } from "../../../shared/settings"

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: {
    breadcrumb: "Overview",
  },
  validateSearch: parseOverviewDateFilterSearch,
  loader: ({ context }) =>
    ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getUserSettingsQueryOptions()
    ),
  component: DashboardLayout,
})

function DashboardLayout() {
  const { data: userSettings } = useSuspenseQuery(getUserSettingsQueryOptions())
  const savedLocale = userSettings.savedLocale
  const weekStartsOn =
    userSettings.settings?.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON

  useMountEffect(() => {
    if (savedLocale && savedLocale !== getLocale()) {
      void setLocale(savedLocale, { reload: false })
    }
  })

  return (
    <AppShell weekStartsOn={weekStartsOn}>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </AppShell>
  )
}
