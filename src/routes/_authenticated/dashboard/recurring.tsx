import { createFileRoute } from "@tanstack/react-router"
import { RecurringPage } from "@/components/dashboard/recurring/recurring-page"
import { getRecurringPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/recurring")({
  staticData: {
    breadcrumb: "Recurring",
  },
  loader: ({ context }) => {
    if (typeof document === "undefined") {
      return null
    }

    return context.queryClient.ensureQueryData(
      getRecurringPageDataQueryOptions()
    )
  },
  component: RecurringPage,
})
