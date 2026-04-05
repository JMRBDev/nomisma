import { createFileRoute } from "@tanstack/react-router"
import { parseOverviewDateFilterSearch } from "@/components/dashboard/overview/overview-date-filter"
import { OverviewPage } from "@/components/dashboard/overview/overview-page"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  staticData: {
    breadcrumb: "Overview",
  },
  validateSearch: parseOverviewDateFilterSearch,
  component: OverviewPage,
})
