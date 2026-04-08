import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { Skeleton } from "@/components/ui/skeleton"

export function OverviewChartsRowFallback() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)]">
      <OverviewPanelCard
        title="Spending over time"
        description="Loading chart data."
      >
        <Skeleton className="h-70 w-full rounded-xl" />
      </OverviewPanelCard>
      <div className="grid gap-4">
        <OverviewPanelCard
          title="Income vs expenses"
          description="Loading chart data."
        >
          <Skeleton className="h-33 w-full rounded-xl" />
        </OverviewPanelCard>
        <OverviewPanelCard
          title="Expense breakdown"
          description="Loading chart data."
        >
          <Skeleton className="h-33 w-full rounded-xl" />
        </OverviewPanelCard>
      </div>
    </div>
  )
}
