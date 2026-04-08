import type { OverviewRecentTransactionRecord } from "@/components/dashboard/overview/overview-shared"
import { AccountNameCell } from "@/components/dashboard/account-name-cell"
import { CategoryTableValue } from "@/components/dashboard/category-table-value"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  capitalizeFirstLetter,
  formatDateLabel,
  formatSignedAmount,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

export function OverviewRecentTransactionRow({
  transaction,
  currency,
  isColumnVisible,
}: {
  transaction: OverviewRecentTransactionRecord
  currency?: string | null
  isColumnVisible: (columnId: string) => boolean
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
          <p className="font-medium">{transaction.description}</p>
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
          />
        </TableCell>
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
    </TableRow>
  )
}
