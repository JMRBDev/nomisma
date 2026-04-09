import { createFileRoute } from "@tanstack/react-router"
import { BudgetsPage } from "@/components/dashboard/budgets/budgets-page"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getBudgetsPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/budgets")({
  staticData: {
    breadcrumb: "Budgets",
  },
  loader: ({ context }) =>
    ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getBudgetsPageDataQueryOptions(context.calendarContext)
    ),
  component: BudgetsPage,
})
