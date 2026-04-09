import { useMemo } from "react"
import type { Id } from "../../../../convex/_generated/dataModel"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import type { CategoryTableRowData } from "@/components/dashboard/transactions/category-table-row"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { CategoryTableRow } from "@/components/dashboard/transactions/category-table-row"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { m } from "@/paraglide/messages"

export type CategoryTableRow = CategoryTableRowData

const SORT_ACCESSORS: Record<
  string,
  (row: CategoryTableRow) => string | number
> = {
  name: (row) => row.name.toLowerCase(),
  transactionCount: (row) => row.transactionCount,
}

const COLUMN_VISIBILITY_STORAGE_KEY = "nomisma-table-columns:categories"

const COLUMNS: Array<DashboardTableColumn> = [
  { id: "name", column: "name", header: m.common_name(), alwaysVisible: true },
  { id: "status", header: m.common_status() },
  {
    id: "transactionCount",
    column: "transactionCount",
    header: m.nav_transactions(),
    className: "text-right",
    alwaysVisible: true,
  },
  {
    id: "actions",
    header: m.common_actions(),
    className: "text-right",
    alwaysVisible: true,
  },
]

export function CategoriesTable({
  categories,
  onEdit,
  onToggleArchived,
}: {
  categories: Array<CategoryTableRow>
  onEdit: (category: CategoryTableRow) => void
  onToggleArchived: (categoryId: Id<"categories">, archived: boolean) => void
}) {
  const table = useDataTable({
    data: categories,
    columns: COLUMNS,
    columnVisibilityStorageKey: COLUMN_VISIBILITY_STORAGE_KEY,
    sortAccessors: SORT_ACCESSORS,
    defaultSort: { column: "name", direction: "asc" },
  })

  const aggregates = useMemo(() => {
    const activeCount = table.allSortedData.filter((c) => !c.archived).length
    const totalUsage = table.allSortedData.reduce(
      (sum, c) => sum + c.transactionCount,
      0
    )
    return { activeCount, totalUsage }
  }, [table.allSortedData])

  return (
    <DashboardTable
      table={table}
      footer={
        <TableRow>
          <TableCell>
            <span className="text-muted-foreground">
              {m.categories_table_footer({
                active: aggregates.activeCount,
                archived: table.allSortedData.length - aggregates.activeCount,
              })}
            </span>
          </TableCell>
          {table.isColumnVisible("status") && <TableCell />}
          {table.isColumnVisible("transactionCount") && (
            <TableCell className="text-right font-medium">
              {aggregates.totalUsage}
            </TableCell>
          )}
          {table.isColumnVisible("actions") && <TableCell />}
        </TableRow>
      }
    >
      {table.data.map((category) => (
        <CategoryTableRow
          key={category._id}
          category={category}
          isColumnVisible={table.isColumnVisible}
          onEdit={onEdit}
          onToggleArchived={onToggleArchived}
        />
      ))}
    </DashboardTable>
  )
}
