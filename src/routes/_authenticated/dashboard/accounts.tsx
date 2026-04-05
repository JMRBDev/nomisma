import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/accounts")({
  staticData: {
    breadcrumb: "Accounts",
  },
  component: AccountsPage,
})

function AccountsPage() {
  return null
}
