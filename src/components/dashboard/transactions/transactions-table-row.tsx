import { PencilIcon, Trash2Icon } from "lucide-react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { AccountNameCell } from "@/components/dashboard/account-name-cell"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  capitalizeFirstLetter,
  formatDateLabel,
  formatSignedAmount,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

export function TransactionsTableRow({
  transaction,
  currency,
  isColumnVisible,
  onEdit,
  onDelete,
}: {
  transaction: TransactionRecord
  currency?: string | null
  isColumnVisible: (columnId: string) => boolean
  onEdit: (transaction: TransactionRecord) => void
  onDelete: (transactionId: TransactionRecord["_id"]) => void
}) {
  return (
    <TableRow>
      {isColumnVisible("date") && (
        <TableCell>
          <span className="text-muted-foreground">
            {formatDateLabel(transaction.date)}
          </span>
        </TableCell>
      )}
      {isColumnVisible("description") && (
        <TableCell>
          <p
            className="max-w-xs truncate font-medium"
            title={transaction.description}
          >
            {transaction.description}
          </p>
        </TableCell>
      )}
      {isColumnVisible("accountName") && (
        <TableCell>
          <AccountNameCell
            name={transaction.accountName}
            icon={transaction.accountIcon}
            color={transaction.accountColor}
          />
        </TableCell>
      )}
      {isColumnVisible("categoryName") && (
        <TableCell>{transaction.categoryName ?? "Transfer"}</TableCell>
      )}
      {isColumnVisible("type") && (
        <TableCell>
          <span className={cn(getTransactionTone(transaction.type))}>
            {capitalizeFirstLetter(transaction.type)}
          </span>
        </TableCell>
      )}
      {isColumnVisible("status") && (
        <TableCell>
          <span className="text-muted-foreground">
            {capitalizeFirstLetter(transaction.status)}
          </span>
        </TableCell>
      )}
      {isColumnVisible("amount") && (
        <TableCell
          className={cn(
            "text-right font-medium",
            getTransactionTone(transaction.type)
          )}
        >
          {formatSignedAmount(transaction.amount, currency, transaction.type)}
        </TableCell>
      )}
      {isColumnVisible("actions") && (
        <TableCell>
          <DashboardTableActions>
            <DashboardIconButton
              onClick={() => onEdit(transaction)}
              aria-label="Edit transaction"
            >
              <PencilIcon />
            </DashboardIconButton>
            <DashboardIconButton
              onClick={() => onDelete(transaction._id)}
              aria-label="Delete transaction"
            >
              <Trash2Icon />
            </DashboardIconButton>
          </DashboardTableActions>
        </TableCell>
      )}
    </TableRow>
  )
}
