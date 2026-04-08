import { createFileRoute } from "@tanstack/react-router"
import { RecurringPage } from "@/components/dashboard/recurring/recurring-page"
import { getRecurringPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/recurring")({
  staticData: {
    breadcrumb: "Recurring",
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      getRecurringPageDataQueryOptions(context.calendarContext)
    ),
  component: RecurringPage,
})
