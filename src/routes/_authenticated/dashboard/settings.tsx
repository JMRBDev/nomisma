import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  staticData: {
    breadcrumb: "Settings",
  },
  component: SettingsPage,
})

function SettingsPage() {
  return null
}
