import { getRouteApi } from "@tanstack/react-router"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { ColorThemeField } from "@/components/dashboard/settings/color-theme-field"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"
import { ThemePreferenceField } from "@/components/dashboard/settings/theme-preference-field"
import { createSettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { Separator } from "@/components/ui/separator"

const dashboardRouteApi = getRouteApi("/_authenticated/dashboard")

export function SettingsPage() {
  const { userSettings } = dashboardRouteApi.useRouteContext()
  const currentValues = createSettingsFormValues(userSettings.settings)

  return (
    <DashboardPageSection>
      <div className="flex flex-col gap-3">
        <DashboardPageHeader title="Settings" />
      </div>

      <div className="flex flex-col gap-4">
        <ThemePreferenceField />

        <ColorThemeField />

        <Separator />

        <SettingsForm
          key={`${currentValues.baseCurrency}-${currentValues.weekStartsOn}`}
          initialValues={currentValues}
        />
      </div>
    </DashboardPageSection>
  )
}
