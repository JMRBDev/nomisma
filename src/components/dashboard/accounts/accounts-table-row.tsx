import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import {
  ACCOUNT_ICON_MAP,
  getAccountTypeLabel,
} from "@/components/dashboard/accounts/accounts-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { getContrastColor } from "@/lib/colors"
import { formatCurrency, formatDateLabel } from "@/lib/money"
import { cn } from "@/lib/utils"

export function AccountsTableRow({
  account,
  currency,
  archived,
  pendingAccountId,
  onToggleArchived,
}: {
  account: AccountRecord
  currency?: string | null
  archived: boolean
  pendingAccountId?: AccountRecord["_id"] | null
  onToggleArchived: (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => void | Promise<void>
}) {
  const recentTransactions = account.recentTransactions ?? []
  const resolvedColor = account.color?.trim()
  const isHex = resolvedColor?.startsWith("#")
  const iconColor = isHex ? getContrastColor(resolvedColor) : "#ffffff"
  const IconComponent = account.icon ? ACCOUNT_ICON_MAP[account.icon] : null

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border bg-border",
              { [account.color || ""]: account.color && account.color.trim() }
            )}
          >
            {IconComponent ? (
              <IconComponent
                size={14}
                className="opacity-80"
                style={{ color: iconColor }}
              />
            ) : null}
          </span>
          <div className="space-y-1">
            <p className="font-medium">{account.name}</p>
            <p className="text-xs text-muted-foreground">
              In {formatCurrency(account.income ?? 0, currency)}. Out{" "}
              {formatCurrency(account.expense ?? 0, currency)}.
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getAccountTypeLabel(account.type)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={account.includeInTotals ? "default" : "outline"}>
          {account.includeInTotals ? "Included" : "Excluded"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(account.openingBalance, currency)}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(account.currentBalance, currency)}
      </TableCell>
      <TableCell>
        {recentTransactions.length > 0 ? (
          <div className="space-y-1">
            {recentTransactions.slice(0, 2).map((transaction) => (
              <p
                key={`${account._id}-${transaction._id}`}
                className="text-xs text-muted-foreground"
              >
                {formatDateLabel(transaction.date)}. {transaction.description}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        )}
      </TableCell>
      <TableCell>
        <DashboardTableActions>
          <DashboardIconButton
            onClick={() => onToggleArchived(account._id, !archived)}
            disabled={pendingAccountId === account._id}
            aria-label={archived ? "Restore account" : "Archive account"}
          >
            {archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
          </DashboardIconButton>
        </DashboardTableActions>
      </TableCell>
    </TableRow>
  )
}
