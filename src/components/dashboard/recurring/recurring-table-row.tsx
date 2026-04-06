import { PencilIcon, PowerIcon, PowerOffIcon } from "lucide-react"
import type {RecurringRecord} from "@/components/dashboard/recurring/recurring-shared";
import {
  
  canConfirmRecurringItem,
  getRecurringStatusLabel
} from "@/components/dashboard/recurring/recurring-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  formatDateLabel,
  formatSignedAmount,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

export function RecurringTableRow({
  item,
  currency,
  pendingRuleId,
  today,
  onConfirm,
  onEdit,
  onToggle,
}: {
  item: RecurringRecord
  currency?: string | null
  pendingRuleId: RecurringRecord["_id"] | null
  today: string
  onConfirm: (ruleId: RecurringRecord["_id"]) => void
  onEdit: (rule: RecurringRecord) => void
  onToggle: (ruleId: RecurringRecord["_id"], active: boolean) => void
}) {
  const canConfirm = canConfirmRecurringItem(item, today)
  const pending = pendingRuleId === item._id
  return (
    <TableRow>
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
            {item.endDate ? ` · Ends ${formatDateLabel(item.endDate)}` : ""}
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
          variant={item.status === "overdue" ? "destructive" : "outline"}
          className={cn(
            item.status !== "overdue" && getRecurringTone(item.status)
          )}
        >
          {getRecurringStatusLabel(item.status)}
        </Badge>
      </TableCell>
      <TableCell
        className={cn("text-right font-medium", getTransactionTone(item.type))}
      >
        {formatSignedAmount(item.amount, currency, item.type)}
      </TableCell>
      <TableCell>
        <DashboardTableActions>
          <DashboardIconButton
            onClick={() => onEdit(item)}
            aria-label="Edit recurring item"
          >
            <PencilIcon />
          </DashboardIconButton>
          <DashboardIconButton
            onClick={() => onToggle(item._id, !item.active)}
            aria-label={
              item.active
                ? "Deactivate recurring item"
                : "Activate recurring item"
            }
          >
            {item.active ? <PowerOffIcon /> : <PowerIcon />}
          </DashboardIconButton>
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
            <span className="text-sm text-muted-foreground">Due later</span>
          )}
        </DashboardTableActions>
      </TableCell>
    </TableRow>
  )
}
