import { createFileRoute } from "@tanstack/react-router"
import { TransactionsPage } from "@/components/dashboard/transactions/transactions-page"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getTransactionsPageDataQueryOptions } from "@/lib/dashboard-query-options"

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
  loader: ({ context }) =>
    ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getTransactionsPageDataQueryOptions()
    ),
  component: TransactionsPage,
})
