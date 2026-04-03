import { Outlet, createFileRoute } from "@tanstack/react-router"
import { AppShell } from "@/components/app-shell"

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: {
    breadcrumb: "Overview",
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </AppShell>
  )
}
