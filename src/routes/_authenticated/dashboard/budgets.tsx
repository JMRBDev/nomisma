import { createFileRoute } from "@tanstack/react-router"
import { BudgetsPage } from "@/components/dashboard/budgets/budgets-page"

export const Route = createFileRoute("/_authenticated/dashboard/budgets")({
  staticData: {
    breadcrumb: "Budgets",
  },
  component: BudgetsPage,
})
