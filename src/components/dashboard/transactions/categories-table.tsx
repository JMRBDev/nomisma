import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon } from "lucide-react"
import { useMemo } from "react"
import type { Id } from "../../../../convex/_generated/dataModel"
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

export type CategoryTableRow = {
  _id: Id<"categories">
  name: string
  kind: "income" | "expense"
  archived: boolean
  transactionCount: number
}

const CATEGORY_SORT_ACCESSORS: Record<
  string,
  (row: CategoryTableRow) => string | number
> = {
  name: (row) => row.name.toLowerCase(),
  kind: (row) => row.kind,
  transactionCount: (row) => row.transactionCount,
}

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
    sortAccessors: CATEGORY_SORT_ACCESSORS,
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <DataTableHead
              column="name"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Name
            </DataTableHead>
            <DataTableHead
              column="kind"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Type
            </DataTableHead>
            <TableHead>Status</TableHead>
            <DataTableHead
              column="transactionCount"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Transactions
            </DataTableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                      category.archived
                        ? "Restore category"
                        : "Archive category"
                    }
                  >
                    {category.archived ? (
                      <ArchiveRestoreIcon />
                    ) : (
                      <ArchiveIcon />
                    )}
                  </DashboardIconButton>
                </DashboardTableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {table.allSortedData.length > 0 && (
          <TableFooter>
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
