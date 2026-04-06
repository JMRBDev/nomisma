import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function DashboardSummaryCard({
  title,
  value,
  description,
  toneClassName,
  loading,
}: {
  title: string
  value?: string
  description?: string
  toneClassName?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card size="sm">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
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
      </CardHeader>

      <CardContent className="flex flex-1 items-end">
        <p
          className={cn(
            "font-heading text-2xl leading-none font-medium",
            toneClassName
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
