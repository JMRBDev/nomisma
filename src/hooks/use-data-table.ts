import { useCallback, useMemo, useState } from "react"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { useDataTableColumnVisibility } from "@/hooks/use-data-table-column-visibility"
import { useDataTableSort } from "@/hooks/use-data-table-sort"

export type SortState = {
  column: string
  direction: "asc" | "desc"
} | null

export type DataTableOptions<T> = {
  data: Array<T>
  columns?: Array<DashboardTableColumn>
  columnVisibilityStorageKey?: string
  sortAccessors?: Record<string, (row: T) => string | number>
  defaultSort?: SortState
  defaultPageSize?: number
  pageSizeOptions?: Array<number>
}

export function useDataTable<T>({
  data,
  columns = [],
  columnVisibilityStorageKey,
  sortAccessors = {},
  defaultSort = null,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableOptions<T>) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const { sort, toggleSort } = useDataTableSort(
    sortAccessors,
    defaultSort,
    columnVisibilityStorageKey
  )

  const sortedData = useMemo(() => {
    if (!sort) return data
    const accessor = sortAccessors[sort.column]
    return [...data].sort((a, b) => {
      const va = accessor(a)
      const vb = accessor(b)
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return sort.direction === "asc" ? cmp : -cmp
    })
  }, [data, sort, sortAccessors])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const columnVisibility = useDataTableColumnVisibility(
    columns,
    columnVisibilityStorageKey
  )

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [currentPage, pageSize, sortedData])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage))
  }, [])

  return {
    data: paginatedData,
    ...columnVisibility,
    allSortedData: sortedData,
    sort,
    toggleSort: (column: string) => {
      setPage(1)
      toggleSort(column)
    },
    page: currentPage,
    pageSize,
    pageSizeOptions,
    totalPages,
    totalItems: sortedData.length,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
  }
}
