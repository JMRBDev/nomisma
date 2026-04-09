import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { Skeleton } from "@/components/ui/skeleton"
import { m } from "@/paraglide/messages"

export function OverviewChartsRowFallback() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)]">
      <OverviewPanelCard
        title={m.overview_charts_spending_title()}
        description={m.overview_charts_loading()}
      >
        <Skeleton className="h-70 w-full rounded-xl" />
      </OverviewPanelCard>
      <div className="grid gap-4">
        <OverviewPanelCard
          title={m.overview_charts_comparison_title()}
          description={m.overview_charts_loading()}
        >
          <Skeleton className="h-33 w-full rounded-xl" />
        </OverviewPanelCard>
        <OverviewPanelCard
          title={m.overview_charts_breakdown_title()}
          description={m.overview_charts_loading()}
        >
          <Skeleton className="h-33 w-full rounded-xl" />
        </OverviewPanelCard>
      </div>
    </div>
  )
}
