import { createFileRoute } from "@tanstack/react-router"
import { AccountsPage } from "@/components/dashboard/accounts/accounts-page"

export const Route = createFileRoute("/_authenticated/dashboard/accounts")({
  staticData: {
    breadcrumb: "Accounts",
  },
  component: AccountsPage,
})
