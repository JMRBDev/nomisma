import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/recurring")({
  staticData: {
    breadcrumb: "Recurring",
  },
  component: RecurringPage,
})

function RecurringPage() {
  return null
}
