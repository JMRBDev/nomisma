import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { ColorThemeField } from "@/components/dashboard/settings/color-theme-field"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"
import { ThemePreferenceField } from "@/components/dashboard/settings/theme-preference-field"
import { createSettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { useSettingsPageData } from "@/hooks/use-money-dashboard"
import { Separator } from "@/components/ui/separator"

export function SettingsPage() {
  const { data } = useSettingsPageData()

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currentValues = createSettingsFormValues(data.settings)

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
