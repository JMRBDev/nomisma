import { createFileRoute } from "@tanstack/react-router"
import { BudgetsPage } from "@/components/dashboard/budgets/budgets-page"
import { getBudgetsPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/budgets")({
  staticData: {
    breadcrumb: "Budgets",
  },
  loader: ({ context }) => {
    if (typeof document === "undefined") {
      return null
    }

    return context.queryClient.ensureQueryData(getBudgetsPageDataQueryOptions())
  },
  component: BudgetsPage,
})
