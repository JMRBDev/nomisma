import { createFileRoute } from "@tanstack/react-router"
import { SettingsPage } from "@/components/dashboard/settings/settings-page"

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  staticData: {
    breadcrumb: "Settings",
  },
  component: SettingsPage,
})
