import { PencilIcon, Trash2Icon } from "lucide-react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { AccountNameCell } from "@/components/dashboard/account-name-cell"
import { CategoryTableValue } from "@/components/dashboard/category-table-value"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { getTransactionCategoryLabel } from "@/lib/dashboard-i18n"
import {
  formatDateLabel,
  formatSignedAmount,
  getTransactionStatusLabel,
  getTransactionTone,
  getTransactionTypeLabel,
} from "@/lib/money"
import { m } from "@/paraglide/messages"
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
  onEdit?: (transaction: TransactionRecord) => void
  onDelete?: (transactionId: TransactionRecord["_id"]) => void
}) {
  const showActions =
    isColumnVisible("actions") && onEdit !== undefined && onDelete !== undefined

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
        <TableCell>
          <CategoryTableValue
            name={transaction.categoryName}
            icon={transaction.categoryIcon}
            color={transaction.categoryColor}
            emptyLabel={getTransactionCategoryLabel(transaction)}
          />
        </TableCell>
      )}
      {isColumnVisible("type") && (
        <TableCell>
          <span className={cn(getTransactionTone(transaction.type))}>
            {getTransactionTypeLabel(transaction.type)}
          </span>
        </TableCell>
      )}
      {isColumnVisible("status") && (
        <TableCell>
          <span className="text-muted-foreground">
            {getTransactionStatusLabel(transaction.status)}
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
      {showActions && (
        <TableCell>
          <DashboardTableActions
            actions={[
              {
                id: "edit",
                label: m.common_edit(),
                icon: PencilIcon,
                onSelect: () => onEdit(transaction),
              },
              {
                id: "delete",
                label: m.common_delete(),
                icon: Trash2Icon,
                variant: "destructive",
                onSelect: () => onDelete(transaction._id),
              },
            ]}
          />
        </TableCell>
      )}
    </TableRow>
  )
}
