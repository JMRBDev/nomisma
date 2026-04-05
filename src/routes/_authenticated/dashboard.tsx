import { Outlet, createFileRoute } from "@tanstack/react-router"
import { parseOverviewDateFilterSearch } from "@/components/dashboard/overview/overview-date-filter"
import { AppShell } from "@/components/app-shell"

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: {
    breadcrumb: "Overview",
  },
  validateSearch: parseOverviewDateFilterSearch,
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </AppShell>
  )
}
