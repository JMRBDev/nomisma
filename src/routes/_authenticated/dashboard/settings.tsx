import { createFileRoute } from "@tanstack/react-router"
import { SettingsPage } from "@/components/dashboard/settings/settings-page"
import { ensureAuthenticatedQueryData } from "@/lib/convex-auth"
import { getUserSettingsQueryOptions } from "@/lib/dashboard-query-options"

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  staticData: {
    breadcrumb: "Settings",
  },
  loader: ({ context }) =>
    ensureAuthenticatedQueryData(
      context.queryClient,
      context.convexQueryClient,
      getUserSettingsQueryOptions()
    ),
  component: SettingsPage,
})
