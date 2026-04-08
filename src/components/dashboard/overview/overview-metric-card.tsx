import type { ReactNode } from "react"
import {
  Card,
  CardAction,
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
  value?: string
  description?: string
  icon?: ReactNode
  valueClassName?: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        <CardAction>
          <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            {icon}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 items-end">
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
