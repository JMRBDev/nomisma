import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  staticData: {
    breadcrumb: "Settings",
  },
  component: SettingsPage,
})

function SettingsPage() {
  return <section className="min-h-[calc(100vh-12rem)]" />
}
