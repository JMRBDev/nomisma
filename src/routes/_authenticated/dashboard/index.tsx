import { createFileRoute } from "@tanstack/react-router"
import { OverviewPage } from "@/components/dashboard/overview/overview-page"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  staticData: {
    breadcrumb: "Overview",
  },
  component: OverviewPage,
})
