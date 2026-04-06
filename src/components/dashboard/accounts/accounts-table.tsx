import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { useMemo } from "react"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import {
  ACCOUNT_ICON_MAP,
  getAccountTypeLabel,
} from "@/components/dashboard/accounts/accounts-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableHead } from "@/components/ui/data-table-head"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getContrastColor } from "@/lib/colors"
import { formatCurrency, formatDateLabel } from "@/lib/money"
import { cn } from "@/lib/utils"

const ACCOUNT_SORT_ACCESSORS: Record<
  string,
  (row: AccountRecord) => string | number
> = {
  name: (row) => row.name.toLowerCase(),
  type: (row) => row.type,
  openingBalance: (row) => row.openingBalance,
  currentBalance: (row) => row.currentBalance,
}

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
  const table = useDataTable({
    data: accounts,
    sortAccessors: ACCOUNT_SORT_ACCESSORS,
  })

  const aggregates = useMemo(() => {
    const totalOpening = table.allSortedData.reduce(
      (sum, a) => sum + a.openingBalance,
      0
    )
    const totalCurrent = table.allSortedData.reduce(
      (sum, a) => sum + a.currentBalance,
      0
    )
    return { totalOpening, totalCurrent }
  }, [table.allSortedData])

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <DataTableHead
              column="name"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Account
            </DataTableHead>
            <DataTableHead
              column="type"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Type
            </DataTableHead>
            <TableHead>Totals</TableHead>
            <DataTableHead
              column="openingBalance"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Opening
            </DataTableHead>
            <DataTableHead
              column="currentBalance"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Current
            </DataTableHead>
            <TableHead>Recent activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.data.map((account) => {
            const recentTransactions = account.recentTransactions ?? []
            const resolvedColor = account.color?.trim()
            const isHex = resolvedColor?.startsWith("#")
            const iconColor = isHex
              ? getContrastColor(resolvedColor)
              : "#ffffff"

            return (
              <TableRow key={account._id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border bg-border",
                        {
                          [account.color || ""]:
                            account.color && account.color.trim(),
                        }
                      )}
                    >
                      {(() => {
                        const IconComponent = account.icon
                          ? ACCOUNT_ICON_MAP[account.icon]
                          : null
                        return IconComponent ? (
                          <IconComponent
                            size={14}
                            className="opacity-80"
                            style={{ color: iconColor }}
                          />
                        ) : null
                      })()}
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
        {table.allSortedData.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>
                <span className="text-muted-foreground">
                  Total ({table.allSortedData.length} account
                  {table.allSortedData.length !== 1 ? "s" : ""})
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(aggregates.totalOpening, currency)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(aggregates.totalCurrent, currency)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <DataTablePagination
        page={table.page}
        pageSize={table.pageSize}
        pageSizeOptions={table.pageSizeOptions}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  )
}
