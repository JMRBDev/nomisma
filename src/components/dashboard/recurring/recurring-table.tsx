import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import {
  canConfirmRecurringItem,
  getRecurringStatusLabel,
} from "@/components/dashboard/recurring/recurring-shared"
import {
  formatDateLabel,
  formatSignedAmount,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

export function RecurringTable({
  recurringItems,
  currency,
  pendingRuleId,
  today,
  onConfirm,
}: {
  recurringItems: Array<RecurringRecord>
  currency?: string | null
  pendingRuleId: RecurringRecord["_id"] | null
  today: string
  onConfirm: (ruleId: RecurringRecord["_id"]) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Next due</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recurringItems.map((item) => {
          const canConfirm = canConfirmRecurringItem(item, today)
          const pending = pendingRuleId === item._id

          return (
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
                    Starts {formatDateLabel(item.startDate)}
                    {item.endDate
                      ? ` • Ends ${formatDateLabel(item.endDate)}`
                      : ""}
                  </p>
                </div>
              </TableCell>
              <TableCell>{item.accountName}</TableCell>
              <TableCell>{item.categoryName}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.frequency}</Badge>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  getTransactionTone(item.type)
                )}
              >
                {formatSignedAmount(item.amount, currency, item.type)}
              </TableCell>
              <TableCell>
                <DashboardTableActions>
                  {canConfirm ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onConfirm(item._id)}
                      disabled={pending}
                    >
                      {pending ? "Saving..." : "Confirm"}
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Due later
                    </span>
                  )}
                </DashboardTableActions>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
