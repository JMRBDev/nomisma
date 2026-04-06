import type { ReactNode } from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function OverviewMetricCard({
  title,
  value,
  description,
  icon,
  valueClassName,
  loading,
}: {
  title: string
  value?: string
  description?: string
  icon?: ReactNode
  valueClassName?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card size="sm">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
          <CardAction>
            <Skeleton className="size-9 rounded-2xl" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 items-end">
          <Skeleton className="h-7 w-24" />
        </CardContent>
      </Card>
    )
  }

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
