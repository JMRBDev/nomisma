import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"
import { createSettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { useSettingsPageData } from "@/hooks/use-money-dashboard"

export function SettingsPage() {
  const { data } = useSettingsPageData()

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currentValues = createSettingsFormValues(data.settings)

  return (
    <DashboardPageSection className="gap-8">
      <div className="flex flex-col gap-3">
        <DashboardPageHeader title="Settings" />
      </div>

      <SettingsForm
        key={`${currentValues.baseCurrency}-${currentValues.monthStartsOn}`}
        initialValues={currentValues}
      />
    </DashboardPageSection>
  )
}
