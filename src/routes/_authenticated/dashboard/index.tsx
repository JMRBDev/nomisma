import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  staticData: {
    breadcrumb: "Overview",
  },
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  return <section className="min-h-[calc(100vh-12rem)]" />
}
