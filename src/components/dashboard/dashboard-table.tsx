import { SlidersHorizontalIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { SortState } from "@/hooks/use-data-table"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { Button } from "@/components/ui/button"
import { DataTableHead } from "@/components/ui/data-table-head"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DashboardTable({
  table,
  children,
  footer,
}: {
  table: {
    columns: Array<DashboardTableColumn>
    visibleColumns: Array<DashboardTableColumn>
    toggleableColumns: Array<DashboardTableColumn>
    isColumnVisible: (columnId: string) => boolean
    setColumnVisibility: (columnId: string, visible: boolean) => void
    sort: SortState
    toggleSort: (column: string) => void
    allSortedData: Array<unknown>
    page: number
    pageSize: number
    pageSizeOptions: Array<number>
    totalPages: number
    totalItems: number
    setPage: (page: number) => void
    setPageSize: (size: number) => void
  }
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {table.visibleColumns.map((col) =>
              col.column ? (
                <DataTableHead
                  key={col.column}
                  column={col.column}
                  sort={table.sort}
                  onSort={table.toggleSort}
                  className={col.className}
                >
                  {col.header}
                </DataTableHead>
              ) : (
                <TableHead key={col.id} className={col.className}>
                  {col.header}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
        {table.allSortedData.length > 0 && footer && (
          <TableFooter>{footer}</TableFooter>
        )}
      </Table>

      <div className="flex justify-between items-end gap-4">
        <DataTablePagination
          page={table.page}
          pageSize={table.pageSize}
          pageSizeOptions={table.pageSizeOptions}
          totalPages={table.totalPages}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />

        {table.toggleableColumns.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Choose columns">
                <SlidersHorizontalIcon />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {table.columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={table.isColumnVisible(column.id)}
                    disabled={column.alwaysVisible}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      table.setColumnVisibility(column.id, checked === true)
                    }
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}
