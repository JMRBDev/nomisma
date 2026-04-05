import { FilterIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/ui/button"

export function DashboardFilterButton({
  activeCount = 0,
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant"> & {
  activeCount?: number
  children?: ReactNode
}) {
  return (
    <Button variant={activeCount > 0 ? "secondary" : "outline"} {...props}>
      {activeCount || null}
      {children ?? <FilterIcon />}
    </Button>
  )
}
