import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { getAccountTypeLabel } from "@/components/dashboard/accounts/accounts-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDateLabel } from "@/lib/money"
import { cn } from "@/lib/utils"

export function AccountsTable({
  accounts,
  currency,
  archived,
  pendingAccountId,
  onToggleArchived,
}: {
  accounts: Array<AccountRecord>
  currency?: string | null
  archived: boolean
  pendingAccountId?: AccountRecord["_id"] | null
  onToggleArchived: (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => void | Promise<void>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Totals</TableHead>
          <TableHead className="text-right">Opening</TableHead>
          <TableHead className="text-right">Current</TableHead>
          <TableHead>Recent activity</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => {
          const recentTransactions = account.recentTransactions ?? []

          return (
            <TableRow key={account._id}>
              <TableCell>
                <div className="flex items-start gap-3">
                  <span
                    className={
                      cn("mt-1 size-2.5 shrink-0 rounded-full", account.color)
                    }
                    style={{
                      backgroundColor:
                        account.color && account.color.trim()
                          ? account.color
                          : "var(--color-border)",
                    }}
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      In {formatCurrency(account.income ?? 0, currency)}.
                      Out {formatCurrency(account.expense ?? 0, currency)}.
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getAccountTypeLabel(account.type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={account.includeInTotals ? "default" : "outline"}
                >
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
                        {formatDateLabel(transaction.date)}.{" "}
                        {transaction.description}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No activity yet.
                  </p>
                )}
              </TableCell>
              <TableCell>
                <DashboardTableActions>
                  <DashboardIconButton
                    onClick={() => onToggleArchived(account._id, !archived)}
                    disabled={pendingAccountId === account._id}
                    aria-label={
                      archived ? "Restore account" : "Archive account"
                    }
                  >
                    {archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
                  </DashboardIconButton>
                </DashboardTableActions>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
