export type NamedEntityReference = {
  _id: string
  name: string
  archived: boolean
}

export type ReferenceComboboxAction = {
  key: string
  label: string
  description?: string
  onSelect: () => Promise<unknown> | unknown
}

export function normalizeEntityName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

export function toEntityLabel(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

export function getEntityNameMatchState<TOption extends NamedEntityReference>(
  options: Array<TOption>,
  query: string
) {
  const label = toEntityLabel(query)
  const normalized = normalizeEntityName(label)

  if (!normalized) {
    return {
      label: "",
      normalized: "",
      activeMatch: null,
      archivedMatch: null,
    }
  }

  const exactMatches = options.filter(
    (option) => normalizeEntityName(option.name) === normalized
  )

  return {
    label,
    normalized,
    activeMatch: exactMatches.find((option) => !option.archived) ?? null,
    archivedMatch: exactMatches.find((option) => option.archived) ?? null,
  }
}

export function getCreateOrRestoreActions<
  TOption extends NamedEntityReference,
>({
  options,
  query,
  createKey,
  unarchiveKey,
  createDescription,
  unarchiveDescription,
  onCreate,
  onUnarchive,
}: {
  options: Array<TOption>
  query: string
  createKey: string
  unarchiveKey: string
  createDescription: string
  unarchiveDescription: string
  onCreate: (name: string) => Promise<unknown> | unknown
  onUnarchive: (option: TOption) => Promise<unknown> | unknown
}): Array<ReferenceComboboxAction> {
  const matchState = getEntityNameMatchState(options, query)
  if (!matchState.label || matchState.activeMatch) {
    return []
  }
  const archivedMatch = matchState.archivedMatch

  return [
    {
      key: createKey,
      label: `Create "${matchState.label}"`,
      description: createDescription,
      onSelect: () => onCreate(matchState.label),
    },
    ...(archivedMatch
      ? [
          {
            key: unarchiveKey,
            label: `Unarchive "${archivedMatch.name}"`,
            description: unarchiveDescription,
            onSelect: () => onUnarchive(archivedMatch),
          },
        ]
      : []),
  ]
}
