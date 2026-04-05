import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

export function DashboardIconButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button size="icon-sm" variant="outline" className={className} {...props} />
  )
}
