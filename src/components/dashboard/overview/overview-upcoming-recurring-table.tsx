import type { OverviewUpcomingRecurringRecord } from "@/components/dashboard/overview/overview-shared"
import { getRecurringStatusLabel } from "@/components/dashboard/recurring/recurring-shared"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatDateLabel,
  formatSignedAmount,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

export function OverviewUpcomingRecurringTable({
  recurringItems,
  currency,
}: {
  recurringItems: Array<OverviewUpcomingRecurringRecord>
  currency?: string | null
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Next due</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recurringItems.map((item) => (
          <TableRow key={item._id}>
            <TableCell>
              <p className={cn("font-medium", getRecurringTone(item.status))}>
                {formatDateLabel(item.nextDueDate)}
              </p>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.accountName} • {item.categoryName}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge variant="outline">{item.frequency}</Badge>
                <Badge
                  variant={
                    item.status === "overdue" ? "destructive" : "outline"
                  }
                  className={cn(
                    item.status !== "overdue" && getRecurringTone(item.status)
                  )}
                >
                  {getRecurringStatusLabel(item.status)}
                </Badge>
              </div>
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium",
                getTransactionTone(item.type)
              )}
            >
              {formatSignedAmount(item.amount, currency, item.type)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
