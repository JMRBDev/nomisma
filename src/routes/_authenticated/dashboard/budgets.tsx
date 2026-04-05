import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/budgets")({
  staticData: {
    breadcrumb: "Budgets",
  },
  component: BudgetsPage,
})

function BudgetsPage() {
  return null
}
