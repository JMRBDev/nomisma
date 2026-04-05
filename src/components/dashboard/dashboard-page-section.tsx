import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function DashboardPageSection({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col gap-6 *:min-w-0",
        className
      )}
      {...props}
    />
  )
}
