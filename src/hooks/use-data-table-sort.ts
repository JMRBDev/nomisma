import { useCallback, useMemo, useState } from "react"
import type { SortState } from "@/hooks/use-data-table"
import { useMountEffect } from "@/hooks/use-mount-effect"

function getSortStorageKey(storageKey?: string) {
  return storageKey ? `${storageKey}:sort` : undefined
}

function isValidSortState<T>(
  sort: SortState,
  sortAccessors: Record<string, (row: T) => string | number>
): sort is NonNullable<SortState> {
  if (!sort) {
    return false
  }

  return typeof sortAccessors[sort.column] === "function"
}

function parseStoredSortState<T>(
  value: string | null,
  sortAccessors: Record<string, (row: T) => string | number>,
  defaultSort: SortState
) {
  if (!value) {
    return defaultSort
  }

  try {
    const parsed = JSON.parse(value)

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.column === "string" &&
      (parsed.direction === "asc" || parsed.direction === "desc")
    ) {
      const sort = {
        column: parsed.column,
        direction: parsed.direction,
      } satisfies NonNullable<SortState>

      return isValidSortState(sort, sortAccessors) ? sort : defaultSort
    }

    return parsed === null ? null : defaultSort
  } catch {
    return defaultSort
  }
}

export function useDataTableSort<T>(
  sortAccessors: Record<string, (row: T) => string | number>,
  defaultSort: SortState,
  storageKey?: string
) {
  const [sort, setSort] = useState<SortState>(defaultSort)

  const normalizedSort = useMemo(() => {
    if (!sort) {
      return null
    }

    return isValidSortState(sort, sortAccessors) ? sort : defaultSort
  }, [defaultSort, sort, sortAccessors])

  const persistSort = useCallback(
    (nextSort: SortState) => {
      const sortStorageKey = getSortStorageKey(storageKey)

      if (typeof window === "undefined" || !sortStorageKey) {
        return
      }

      window.localStorage.setItem(sortStorageKey, JSON.stringify(nextSort))
    },
    [storageKey]
  )

  const toggleSort = useCallback(
    (column: string) => {
      if (typeof sortAccessors[column] !== "function") {
        return
      }

      setSort((current) => {
        let nextSort: SortState

        if (current?.column === column) {
          nextSort =
            current.direction === "asc" ? { column, direction: "desc" } : null
        } else {
          nextSort = { column, direction: "asc" }
        }

        persistSort(nextSort)

        return nextSort
      })
    },
    [persistSort, sortAccessors]
  )

  useMountEffect(() => {
    const sortStorageKey = getSortStorageKey(storageKey)

    if (typeof window === "undefined" || !sortStorageKey) {
      return
    }

    setSort(
      parseStoredSortState(
        window.localStorage.getItem(sortStorageKey),
        sortAccessors,
        defaultSort
      )
    )
  })

  return {
    sort: normalizedSort,
    toggleSort,
  }
}
