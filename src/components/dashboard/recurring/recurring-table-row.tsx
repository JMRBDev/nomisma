import {
  CheckCircle2Icon,
  EllipsisIcon,
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
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
        <p className="font-medium">{item.description}</p>
      </TableCell>
      <TableCell>
        <AccountNameCell
          name={item.accountName}
          icon={item.accountIcon}
          color={item.accountColor}
        />
      </TableCell>
      <TableCell>{item.categoryName}</TableCell>
      <TableCell>{capitalizeFirstLetter(item.frequency)}</TableCell>
      <TableCell>
        <span className={cn(getRecurringTone(item.status))}>
          {getRecurringStatusLabel(item.status)}
        </span>
      </TableCell>
      <TableCell
        className={cn("text-right font-medium", getTransactionTone(item.type))}
      >
        {formatSignedAmount(item.amount, currency, item.type)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DashboardIconButton aria-label="Actions">
              <EllipsisIcon />
            </DashboardIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(item._id, !item.active)}>
              {item.active ? <PowerOffIcon /> : <PowerIcon />}
              {item.active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            {canConfirm && (
              <DropdownMenuItem
                onClick={() => onConfirm(item._id)}
                disabled={pending}
              >
                <CheckCircle2Icon />
                {pending ? "Saving..." : "Confirm"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
