import { createFileRoute } from "@tanstack/react-router"
import { BudgetsPage } from "@/components/dashboard/budgets/budgets-page"
import { getBudgetsPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/budgets")({
  staticData: {
    breadcrumb: "Budgets",
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      getBudgetsPageDataQueryOptions(context.calendarContext)
    ),
  component: BudgetsPage,
})
