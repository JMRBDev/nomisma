import { EllipsisIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type DashboardTableAction = {
  id: string
  label: string
  onSelect: () => void
  icon?: LucideIcon
  disabled?: boolean
  variant?: "default" | "destructive"
}

export function DashboardTableActions({
  actions,
  triggerLabel = "Actions",
  className,
}: {
  actions: Array<DashboardTableAction>
  triggerLabel?: string
  className?: string
}) {
  if (actions.length === 0) return null

  return (
    <div className={cn("flex justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DashboardIconButton aria-label={triggerLabel}>
            <EllipsisIcon />
          </DashboardIconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onSelect}
                disabled={action.disabled}
                variant={action.variant}
              >
                {Icon ? <Icon /> : null}
                {action.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
