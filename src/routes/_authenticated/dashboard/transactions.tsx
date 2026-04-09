import { createFileRoute } from "@tanstack/react-router"
import { TransactionsPage } from "@/components/dashboard/transactions/transactions-page"

function parseTransactionsSearch(search: Record<string, unknown>) {
  if (typeof search.transactionId === "string") {
    return {
      transactionId: search.transactionId,
    }
  }

  return {}
}

export const Route = createFileRoute("/_authenticated/dashboard/transactions")({
  staticData: {
    breadcrumb: "Transactions",
  },
  validateSearch: parseTransactionsSearch,
  component: TransactionsPage,
})
