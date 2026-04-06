import { useCallback, useEffect, useMemo, useState } from "react"

export type SortState = {
  column: string
  direction: "asc" | "desc"
} | null

export type DataTableOptions<T> = {
  data: Array<T>
  sortAccessors?: Record<string, (row: T) => string | number>
  defaultSort?: SortState
  defaultPageSize?: number
  pageSizeOptions?: Array<number>
}

export function useDataTable<T>({
  data,
  sortAccessors = {},
  defaultSort = null,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableOptions<T>) {
  const [sort, setSort] = useState<SortState>(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

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

  const paginatedData = useMemo(() => {
    const start = (Math.min(page, totalPages) - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize, totalPages])

  const toggleSort = useCallback((column: string) => {
    setPage(1)
    setSort((current) => {
      if (current?.column === column) {
        if (current.direction === "asc") return { column, direction: "desc" }
        return null
      }
      return { column, direction: "asc" }
    })
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return {
    data: paginatedData,
    allSortedData: sortedData,
    sort,
    toggleSort,
    page,
    pageSize,
    pageSizeOptions,
    totalPages,
    totalItems: sortedData.length,
    setPage,
    setPageSize: handlePageSizeChange,
  }
}
