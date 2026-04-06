import { useMemo } from "react"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { AccountsTableRow } from "@/components/dashboard/accounts/accounts-table-row"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { formatCurrency } from "@/lib/money"

const SORT_ACCESSORS: Record<string, (row: AccountRecord) => string | number> =
  {
    name: (row) => row.name.toLowerCase(),
    type: (row) => row.type,
    openingBalance: (row) => row.openingBalance,
    currentBalance: (row) => row.currentBalance,
  }

const COLUMNS = [
  { column: "name", header: "Account" },
  { column: "type", header: "Type" },
  { header: "Totals" },
  { column: "openingBalance", header: "Opening", className: "text-right" },
  { column: "currentBalance", header: "Current", className: "text-right" },
  { header: "Recent activity" },
  { header: "Actions", className: "text-right" },
]

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
    sortAccessors: SORT_ACCESSORS,
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
    <DashboardTable
      table={table}
      columns={COLUMNS}
      footer={
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
      }
    >
      {table.data.map((account) => (
        <AccountsTableRow
          key={account._id}
          account={account}
          currency={currency}
          archived={archived}
          pendingAccountId={pendingAccountId}
          onToggleArchived={onToggleArchived}
        />
      ))}
    </DashboardTable>
  )
}
