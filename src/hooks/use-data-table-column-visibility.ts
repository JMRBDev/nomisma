import { useCallback, useMemo, useState } from "react"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import {
  getDefaultVisibleColumnIds,
  getHiddenColumnIdsFromVisible,
  readStoredVisibleColumnIds,
  sanitizeVisibleColumnIds,
  serializeHiddenColumnIds,
} from "@/components/dashboard/dashboard-table-columns"
import { useMountEffect } from "@/hooks/use-mount-effect"

export function useDataTableColumnVisibility(
  columns: Array<DashboardTableColumn>,
  storageKey?: string
) {
  const [visibleColumnIds, setVisibleColumnIds] = useState(() =>
    getDefaultVisibleColumnIds(columns)
  )

  const normalizedVisibleColumnIds = useMemo(
    () => sanitizeVisibleColumnIds(columns, visibleColumnIds),
    [columns, visibleColumnIds]
  )
  const visibleColumnIdSet = useMemo(
    () => new Set(normalizedVisibleColumnIds),
    [normalizedVisibleColumnIds]
  )
  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnIdSet.has(column.id)),
    [columns, visibleColumnIdSet]
  )
  const toggleableColumns = useMemo(
    () => columns.filter((column) => !column.alwaysVisible),
    [columns]
  )

  const isColumnVisible = useCallback(
    (columnId: string) => visibleColumnIdSet.has(columnId),
    [visibleColumnIdSet]
  )

  const persistVisibleColumns = useCallback(
    (nextVisibleColumnIds: Array<string>) => {
      if (
        typeof window === "undefined" ||
        !storageKey ||
        columns.length === 0
      ) {
        return
      }

      window.localStorage.setItem(
        storageKey,
        serializeHiddenColumnIds(
          getHiddenColumnIdsFromVisible(columns, nextVisibleColumnIds)
        )
      )
    },
    [columns, storageKey]
  )

  const setColumnVisibility = useCallback(
    (columnId: string, visible: boolean) => {
      const column = columns.find((item) => item.id === columnId)

      if (!column || column.alwaysVisible) {
        return
      }

      setVisibleColumnIds((current) => {
        const nextVisibleColumnIds = visible
          ? [...current, columnId]
          : current.filter((item) => item !== columnId)

        const normalizedNextVisibleColumnIds = sanitizeVisibleColumnIds(
          columns,
          nextVisibleColumnIds
        )

        persistVisibleColumns(normalizedNextVisibleColumnIds)

        return normalizedNextVisibleColumnIds
      })
    },
    [columns, persistVisibleColumns]
  )

  useMountEffect(() => {
    if (typeof window === "undefined" || !storageKey || columns.length === 0) {
      return
    }

    const storedState = readStoredVisibleColumnIds(
      window.localStorage.getItem(storageKey),
      columns
    )

    if (storedState.migratedValue) {
      window.localStorage.setItem(storageKey, storedState.migratedValue)
    }

    setVisibleColumnIds(storedState.visibleColumnIds)
  })

  return {
    columns,
    visibleColumns,
    toggleableColumns,
    isColumnVisible,
    setColumnVisibility,
  }
}
