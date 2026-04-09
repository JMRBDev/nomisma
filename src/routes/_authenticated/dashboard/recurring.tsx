import { createFileRoute } from "@tanstack/react-router"
import { RecurringPage } from "@/components/dashboard/recurring/recurring-page"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getRecurringPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/recurring")({
  staticData: {
    breadcrumb: "Recurring",
  },
  loader: ({ context }) =>
    ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getRecurringPageDataQueryOptions(context.calendarContext)
    ),
  component: RecurringPage,
})
