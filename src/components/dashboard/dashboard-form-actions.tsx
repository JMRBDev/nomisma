import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardFormActions({
  submitLabel,
  pendingLabel = "Saving...",
  pending,
  disabled,
  formError,
  secondaryAction,
  className,
}: {
  submitLabel: string
  pendingLabel?: string
  pending: boolean
  disabled?: boolean
  formError?: string
  secondaryAction?: ReactNode
  className?: string
}) {
  return (
    <>
      {formError ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}
      <div className={cn("flex flex-wrap gap-3", className)}>
        <Button type="submit" disabled={disabled || pending} className="flex-1">
          {pending ? pendingLabel : submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </>
  )
}
