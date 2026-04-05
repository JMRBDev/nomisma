import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function DashboardPageSection({
  className,
  ...props
}: ComponentProps<"section">) {
  return <section className={cn("space-y-6", className)} {...props} />
}
