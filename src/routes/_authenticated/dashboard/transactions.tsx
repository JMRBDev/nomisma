import { createFileRoute } from "@tanstack/react-router"
import { TransactionsPage } from "@/components/dashboard/transactions/transactions-page"

export const Route = createFileRoute("/_authenticated/dashboard/transactions")({
  staticData: {
    breadcrumb: "Transactions",
  },
  component: TransactionsPage,
})
