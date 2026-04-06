import { useMemo } from "react"
import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"

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

const COLUMNS = [
  { column: "name", header: "Name" },
  { column: "kind", header: "Type" },
  { header: "Status" },
  {
    column: "transactionCount",
    header: "Transactions",
    className: "text-right",
  },
  { header: "Actions", className: "text-right" },
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
      columns={COLUMNS}
      footer={
        <TableRow>
          <TableCell colSpan={3}>
            <span className="text-muted-foreground">
              {aggregates.activeCount} active ·{" "}
              {table.allSortedData.length - aggregates.activeCount} archived
            </span>
          </TableCell>
          <TableCell className="text-right font-medium">
            {aggregates.totalUsage}
          </TableCell>
          <TableCell />
        </TableRow>
      }
    >
      {table.data.map((category) => (
        <TableRow key={category._id}>
          <TableCell className="font-medium">{category.name}</TableCell>
          <TableCell>
            <Badge
              variant={category.kind === "income" ? "default" : "outline"}
              className={
                category.kind === "income"
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
              }
            >
              {category.kind === "income" ? "Income" : "Expense"}
            </Badge>
          </TableCell>
          <TableCell>
            {category.archived ? (
              <Badge variant="outline">Archived</Badge>
            ) : (
              <Badge variant="default">Active</Badge>
            )}
          </TableCell>
          <TableCell className="text-right">
            {category.transactionCount}
          </TableCell>
          <TableCell>
            <DashboardTableActions>
              <DashboardIconButton
                onClick={() => onEdit(category)}
                aria-label="Edit category"
              >
                <PencilIcon />
              </DashboardIconButton>
              <DashboardIconButton
                onClick={() =>
                  onToggleArchived(category._id, !category.archived)
                }
                aria-label={
                  category.archived ? "Restore category" : "Archive category"
                }
              >
                {category.archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
              </DashboardIconButton>
            </DashboardTableActions>
          </TableCell>
        </TableRow>
      ))}
    </DashboardTable>
  )
}
