import { useMemo } from "react"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { AccountsTableRow } from "@/components/dashboard/accounts/accounts-table-row"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { formatCurrency } from "@/lib/money"
import { t } from "@/lib/i18n"

const SORT_ACCESSORS: Record<string, (row: AccountRecord) => string | number> =
  {
    name: (row) => row.name.toLowerCase(),
    type: (row) => row.type,
    currentBalance: (row) => row.currentBalance,
  }

const COLUMN_VISIBILITY_STORAGE_KEY = "nomisma-table-columns:accounts"

const COLUMNS: Array<DashboardTableColumn> = [
  {
    id: "name",
    column: "name",
    header: t("common_account"),
    alwaysVisible: true,
  },
  { id: "type", column: "type", header: t("common_type") },
  {
    id: "includeInTotals",
    header: t("accounts_table_totals"),
    className: "text-center",
  },
  {
    id: "currentBalance",
    column: "currentBalance",
    header: t("accounts_table_current"),
    className: "text-right",
    alwaysVisible: true,
  },
  {
    id: "actions",
    header: t("common_actions"),
    className: "text-right",
    alwaysVisible: true,
  },
]

export function AccountsTable({
  accounts,
  currency,
  archived,
  pendingAccountId,
  onEdit,
  onToggleArchived,
}: {
  accounts: Array<AccountRecord>
  currency?: string | null
  archived: boolean
  pendingAccountId?: AccountRecord["_id"] | null
  onEdit: (account: AccountRecord) => void
  onToggleArchived: (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => void | Promise<void>
}) {
  const table = useDataTable({
    data: accounts,
    columns: COLUMNS,
    columnVisibilityStorageKey: COLUMN_VISIBILITY_STORAGE_KEY,
    sortAccessors: SORT_ACCESSORS,
  })

  const aggregates = useMemo(() => {
    const totalCurrent = table.allSortedData.reduce(
      (sum, a) => sum + a.currentBalance,
      0
    )
    return { totalCurrent }
  }, [table.allSortedData])

  return (
    <DashboardTable
      table={table}
      footer={
        <TableRow>
          <TableCell>
            <span className="text-muted-foreground">
              {t("accounts_table_total", {
                count: table.allSortedData.length,
              })}
            </span>
          </TableCell>
          {table.isColumnVisible("type") && <TableCell />}
          {table.isColumnVisible("includeInTotals") && <TableCell />}
          {table.isColumnVisible("currentBalance") && (
            <TableCell className="text-right font-medium">
              {formatCurrency(aggregates.totalCurrent, currency)}
            </TableCell>
          )}
          {table.isColumnVisible("actions") && <TableCell />}
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
          isColumnVisible={table.isColumnVisible}
          onEdit={onEdit}
          onToggleArchived={onToggleArchived}
        />
      ))}
    </DashboardTable>
  )
}
