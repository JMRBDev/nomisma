import { useMemo } from "react"
import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { cn } from "@/lib/utils"

export type CategoryTableRow = {
  _id: Id<"categories">
  name: string
  kind: "income" | "expense"
  archived: boolean
  transactionCount: number
}

const SORT_ACCESSORS: Record<
  string,
  (row: CategoryTableRow) => string | number
> = {
  name: (row) => row.name.toLowerCase(),
  kind: (row) => row.kind,
  transactionCount: (row) => row.transactionCount,
}

const COLUMN_VISIBILITY_STORAGE_KEY = "nomisma-table-columns:categories"

const COLUMNS: Array<DashboardTableColumn> = [
  { id: "name", column: "name", header: "Name", alwaysVisible: true },
  { id: "kind", column: "kind", header: "Type" },
  { id: "status", header: "Status" },
  {
    id: "transactionCount",
    column: "transactionCount",
    header: "Transactions",
    className: "text-right",
    alwaysVisible: true,
  },
  {
    id: "actions",
    header: "Actions",
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
    defaultSort: { column: "kind", direction: "asc" },
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
              {aggregates.activeCount} active ·{" "}
              {table.allSortedData.length - aggregates.activeCount} archived
            </span>
          </TableCell>
          {table.isColumnVisible("kind") && <TableCell />}
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
        <TableRow key={category._id}>
          {table.isColumnVisible("name") && (
            <TableCell className="font-medium">{category.name}</TableCell>
          )}
          {table.isColumnVisible("kind") && (
            <TableCell>
              <span
                className={cn(
                  category.kind === "income" ? "text-success" : "text-destructive"
                )}
              >
                {category.kind === "income" ? "Income" : "Expense"}
              </span>
            </TableCell>
          )}
          {table.isColumnVisible("status") && (
            <TableCell>
              <span
                className={cn(category.archived && "text-muted-foreground")}
              >
                {category.archived ? "Archived" : "Active"}
              </span>
            </TableCell>
          )}
          {table.isColumnVisible("transactionCount") && (
            <TableCell className="text-right">
              {category.transactionCount}
            </TableCell>
          )}
          {table.isColumnVisible("actions") && (
            <TableCell>
              <DashboardTableActions
                actions={[
                  {
                    id: "edit",
                    label: "Edit",
                    icon: PencilIcon,
                    onSelect: () => onEdit(category),
                  },
                  {
                    id: "toggle-archived",
                    label: category.archived ? "Restore" : "Archive",
                    icon: category.archived ? ArchiveRestoreIcon : ArchiveIcon,
                    onSelect: () =>
                      onToggleArchived(category._id, !category.archived),
                  },
                ]}
              />
            </TableCell>
          )}
        </TableRow>
      ))}
    </DashboardTable>
  )
}
