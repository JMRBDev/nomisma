import { createFileRoute } from "@tanstack/react-router"
import { AccountsPage } from "@/components/dashboard/accounts/accounts-page"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getAccountsPageDataQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/accounts")({
  staticData: {
    breadcrumb: "Accounts",
  },
  loader: ({ context }) =>
    ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getAccountsPageDataQueryOptions()
    ),
  component: AccountsPage,
})
