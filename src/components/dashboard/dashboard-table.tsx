import type { ReactNode } from "react"
import type { SortState } from "@/hooks/use-data-table"
import { DataTableHead } from "@/components/ui/data-table-head"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Column = {
  column?: string
  header: string
  className?: string
}

export function DashboardTable({
  table,
  columns,
  children,
  footer,
}: {
  table: {
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
  columns: Array<Column>
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) =>
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
                <TableHead key={i} className={col.className}>
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
