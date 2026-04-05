import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export function DashboardFilterSummary({
  icon: Icon,
  children,
  action,
}: {
  icon: LucideIcon
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/60 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {children}
      </div>
      {action}
    </div>
  )
}
