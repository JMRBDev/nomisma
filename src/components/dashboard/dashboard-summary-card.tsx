import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function DashboardSummaryCard({
  title,
  value,
  description,
  toneClassName,
}: {
  title: string
  value: string
  description: string
  toneClassName?: string
}) {
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
