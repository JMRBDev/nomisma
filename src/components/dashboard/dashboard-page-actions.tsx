import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function DashboardPageActions({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />
}
