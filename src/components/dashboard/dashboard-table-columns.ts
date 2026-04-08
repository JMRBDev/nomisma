export type DashboardTableColumn = {
  id: string
  header: string
  column?: string
  className?: string
  alwaysVisible?: boolean
}

export function getDefaultVisibleColumnIds(
  columns: Array<DashboardTableColumn>
) {
  return columns.map((column) => column.id)
}

export function sanitizeVisibleColumnIds(
  columns: Array<DashboardTableColumn>,
  visibleColumnIds: Array<string>
) {
  const availableColumnIds = new Set(columns.map((column) => column.id))
  const alwaysVisibleColumnIds = columns
    .filter((column) => column.alwaysVisible)
    .map((column) => column.id)

  const nextVisibleColumnIds = new Set(alwaysVisibleColumnIds)

  for (const columnId of visibleColumnIds) {
    if (!availableColumnIds.has(columnId)) continue
    nextVisibleColumnIds.add(columnId)
  }

  if (nextVisibleColumnIds.size === 0) {
    return getDefaultVisibleColumnIds(columns)
  }

  return columns
    .filter((column) => nextVisibleColumnIds.has(column.id))
    .map((column) => column.id)
}

export function sanitizeHiddenColumnIds(
  columns: Array<DashboardTableColumn>,
  hiddenColumnIds: Array<string>
) {
  const allowedHiddenColumnIds = new Set(
    columns.filter((column) => !column.alwaysVisible).map((column) => column.id)
  )

  return columns
    .filter((column) => allowedHiddenColumnIds.has(column.id))
    .map((column) => column.id)
    .filter((columnId) => hiddenColumnIds.includes(columnId))
}

export function getVisibleColumnIdsFromHidden(
  columns: Array<DashboardTableColumn>,
  hiddenColumnIds: Array<string>
) {
  const normalizedHiddenColumnIds = new Set(
    sanitizeHiddenColumnIds(columns, hiddenColumnIds)
  )

  return columns
    .filter((column) => !normalizedHiddenColumnIds.has(column.id))
    .map((column) => column.id)
}

export function getHiddenColumnIdsFromVisible(
  columns: Array<DashboardTableColumn>,
  visibleColumnIds: Array<string>
) {
  const normalizedVisibleColumnIds = new Set(
    sanitizeVisibleColumnIds(columns, visibleColumnIds)
  )

  return columns
    .filter(
      (column) =>
        !column.alwaysVisible && !normalizedVisibleColumnIds.has(column.id)
    )
    .map((column) => column.id)
}

export function serializeHiddenColumnIds(hiddenColumnIds: Array<string>) {
  return JSON.stringify({ hiddenColumnIds })
}

export function readStoredVisibleColumnIds(
  value: string | null,
  columns: Array<DashboardTableColumn>
) {
  if (!value) {
    return {
      visibleColumnIds: getDefaultVisibleColumnIds(columns),
      migratedValue: null,
    }
  }

  try {
    const parsed: unknown = JSON.parse(value)

    if (parsed && typeof parsed === "object") {
      const parsedObject = parsed as { hiddenColumnIds?: unknown }

      if (Array.isArray(parsedObject.hiddenColumnIds)) {
        return {
          visibleColumnIds: getVisibleColumnIdsFromHidden(
            columns,
            parsedObject.hiddenColumnIds.filter(
              (item: unknown): item is string => typeof item === "string"
            )
          ),
          migratedValue: null,
        }
      }
    }

    if (Array.isArray(parsed)) {
      const visibleColumnIds = sanitizeVisibleColumnIds(
        columns,
        parsed.filter(
          (item: unknown): item is string => typeof item === "string"
        )
      )

      return {
        visibleColumnIds,
        migratedValue: serializeHiddenColumnIds(
          getHiddenColumnIdsFromVisible(columns, visibleColumnIds)
        ),
      }
    }

    return {
      visibleColumnIds: getDefaultVisibleColumnIds(columns),
      migratedValue: null,
    }
  } catch {
    return {
      visibleColumnIds: getDefaultVisibleColumnIds(columns),
      migratedValue: null,
    }
  }
}
