import { useSuspenseQuery } from "@tanstack/react-query"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { ColorThemeField } from "@/components/dashboard/settings/color-theme-field"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"
import { ThemePreferenceField } from "@/components/dashboard/settings/theme-preference-field"
import { createSettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { Separator } from "@/components/ui/separator"
import { getUserSettingsQueryOptions } from "@/lib/dashboard-query-options"
import { getLocale, t  } from "@/lib/i18n"

export function SettingsPage() {
  const { data: userSettings } = useSuspenseQuery(getUserSettingsQueryOptions())
  const currentValues = createSettingsFormValues({
    ...userSettings.settings,
    locale: userSettings.savedLocale ?? getLocale(),
  })

  return (
    <DashboardPageSection>
      <div className="flex flex-col gap-3">
        <DashboardPageHeader title={t("nav_settings")} />
      </div>

      <div className="flex flex-col gap-4">
        <ThemePreferenceField />

        <ColorThemeField />

        <Separator />

        <SettingsForm
          key={`${currentValues.baseCurrency}-${currentValues.locale}-${currentValues.weekStartsOn}`}
          initialValues={currentValues}
        />
      </div>
    </DashboardPageSection>
  )
}
