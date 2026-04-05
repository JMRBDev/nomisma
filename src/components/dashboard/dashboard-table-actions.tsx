import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function DashboardTableActions({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("flex justify-end gap-2", className)} {...props} />
}
