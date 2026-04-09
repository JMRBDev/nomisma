import { createFileRoute } from "@tanstack/react-router"
import { RecurringPage } from "@/components/dashboard/recurring/recurring-page"

export const Route = createFileRoute("/_authenticated/dashboard/recurring")({
  staticData: {
    breadcrumb: "Recurring",
  },
  component: RecurringPage,
})
