import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function OverviewMetricCard({
  title,
  value,
  description,
  icon,
  valueClassName,
}: {
  title: string
  value: string
  description: string
  icon: ReactNode
  valueClassName?: string
}) {
  return (
    <Card size="sm">
      <CardHeader className="grid-cols-[1fr_auto] items-start">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "font-heading text-2xl leading-none font-medium",
            valueClassName
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
