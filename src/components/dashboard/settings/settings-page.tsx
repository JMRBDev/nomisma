import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { ColorThemeField } from "@/components/dashboard/settings/color-theme-field"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"
import { ThemePreferenceField } from "@/components/dashboard/settings/theme-preference-field"
import { createSettingsFormValues } from "@/components/dashboard/settings/settings-shared"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettingsPageData } from "@/hooks/use-money-dashboard"
import { Separator } from "@/components/ui/separator"

function SettingsFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full max-w-56" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-full max-w-56" />
      </div>
      <Separator />
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

export function SettingsPage() {
  const { data } = useSettingsPageData()

  const isLoading = !data
  const currentValues = data
    ? createSettingsFormValues(data.settings)
    : undefined

  return (
    <DashboardPageSection>
      <div className="flex flex-col gap-3">
        <DashboardPageHeader title="Settings" />
      </div>

      <div className="flex flex-col gap-4">
        <ThemePreferenceField />

        <ColorThemeField />

        <Separator />

        {isLoading ? (
          <SettingsFormSkeleton />
        ) : (
          <SettingsForm
            key={`${currentValues!.baseCurrency}-${currentValues!.weekStartsOn}`}
            initialValues={currentValues!}
          />
        )}
      </div>
    </DashboardPageSection>
  )
}
