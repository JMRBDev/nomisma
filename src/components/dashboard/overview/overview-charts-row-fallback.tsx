import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { Skeleton } from "@/components/ui/skeleton"
import { t } from "@/lib/i18n"

export function OverviewChartsRowFallback() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)]">
      <OverviewPanelCard
        title={t("overview_charts_spending_title")}
        description={t("overview_charts_loading")}
      >
        <Skeleton className="h-70 w-full rounded-xl" />
      </OverviewPanelCard>
      <div className="grid gap-4">
        <OverviewPanelCard
          title={t("overview_charts_comparison_title")}
          description={t("overview_charts_loading")}
        >
          <Skeleton className="h-33 w-full rounded-xl" />
        </OverviewPanelCard>
        <OverviewPanelCard
          title={t("overview_charts_breakdown_title")}
          description={t("overview_charts_loading")}
        >
          <Skeleton className="h-33 w-full rounded-xl" />
        </OverviewPanelCard>
      </div>
    </div>
  )
}
