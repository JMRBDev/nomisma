import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"

export function OverviewEmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description: string
  icon: LucideIcon
  action?: ReactNode
}) {
  return (
    <FilteredResultsEmptyState
      title={title}
      description={description}
      icon={icon}
      action={action}
    />
  )
}
