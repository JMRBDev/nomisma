import { createFileRoute } from "@tanstack/react-router"
import { OverviewPage } from "@/components/dashboard/overview/overview-page"
import {
  getOverviewDateFilterQuery,
  resolveOverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import { getOverviewDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  staticData: {
    breadcrumb: "Overview",
  },
  loaderDeps: ({ search }) => getOverviewDateFilterQuery(resolveOverviewDateFilterValues(search)),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      getOverviewDataQueryOptions(context.calendarContext, deps)
    ),
  component: OverviewPage,
})
