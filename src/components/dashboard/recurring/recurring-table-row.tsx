import {
  CheckCircle2Icon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
} from "lucide-react"
import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import {
  canConfirmRecurringItem,
  getRecurringStatusLabel,
} from "@/components/dashboard/recurring/recurring-shared"
import { AccountNameCell } from "@/components/dashboard/account-name-cell"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  capitalizeFirstLetter,
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
  isColumnVisible,
  onConfirm,
  onEdit,
  onToggle,
}: {
  item: RecurringRecord
  currency?: string | null
  pendingRuleId: RecurringRecord["_id"] | null
  today: string
  isColumnVisible: (columnId: string) => boolean
  onConfirm: (ruleId: RecurringRecord["_id"]) => void
  onEdit: (rule: RecurringRecord) => void
  onToggle: (ruleId: RecurringRecord["_id"], active: boolean) => void
}) {
  const canConfirm = canConfirmRecurringItem(item, today)
  const pending = pendingRuleId === item._id

  return (
    <TableRow>
      {isColumnVisible("nextDueDate") && (
        <TableCell>
          <p className={cn("font-medium", getRecurringTone(item.status))}>
            {formatDateLabel(item.nextDueDate)}
          </p>
        </TableCell>
      )}
      {isColumnVisible("description") && (
        <TableCell>
          <p className="font-medium">{item.description}</p>
        </TableCell>
      )}
      {isColumnVisible("accountName") && (
        <TableCell>
          <AccountNameCell
            name={item.accountName}
            icon={item.accountIcon}
            color={item.accountColor}
          />
        </TableCell>
      )}
      {isColumnVisible("categoryName") && (
        <TableCell>{item.categoryName}</TableCell>
      )}
      {isColumnVisible("frequency") && (
        <TableCell>{capitalizeFirstLetter(item.frequency)}</TableCell>
      )}
      {isColumnVisible("status") && (
        <TableCell>
          <span className={cn(getRecurringTone(item.status))}>
            {getRecurringStatusLabel(item.status)}
          </span>
        </TableCell>
      )}
      {isColumnVisible("amount") && (
        <TableCell
          className={cn(
            "text-right font-medium",
            getTransactionTone(item.type)
          )}
        >
          {formatSignedAmount(item.amount, currency, item.type)}
        </TableCell>
      )}
      {isColumnVisible("actions") && (
        <TableCell>
          <DashboardTableActions
            actions={[
              {
                id: "edit",
                label: "Edit",
                icon: PencilIcon,
                onSelect: () => onEdit(item),
              },
              {
                id: "toggle",
                label: item.active ? "Deactivate" : "Activate",
                icon: item.active ? PowerOffIcon : PowerIcon,
                onSelect: () => onToggle(item._id, !item.active),
              },
              ...(canConfirm
                ? [
                    {
                      id: "confirm",
                      label: pending ? "Saving..." : "Confirm",
                      icon: CheckCircle2Icon,
                      disabled: pending,
                      onSelect: () => onConfirm(item._id),
                    },
                  ]
                : []),
            ]}
          />
        </TableCell>
      )}
    </TableRow>
  )
}
