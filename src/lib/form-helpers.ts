type HasId = { _id: string }

export function getFirstOptionId<T extends HasId>(options: Array<T>): string {
  return options[0]?._id ?? ""
}

export function resolveValidOption<T extends HasId>(
  value: string,
  options: Array<T>
): string {
  if (options.some((option) => option._id === value)) {
    return value
  }

  return getFirstOptionId(options)
}

export function getCategoryOptions<TCategory extends HasId>(
  type: "income" | "expense" | "transfer",
  categoryOptions: Array<TCategory>
): Array<TCategory> {
  return type === "transfer" ? [] : categoryOptions
}

export function resolveCategoryOnTypeChange(
  currentCategoryId: string,
  newType: "income" | "expense" | "transfer",
  categoryOptions: Array<HasId>
): string {
  if (newType === "transfer") return ""
  const options = getCategoryOptions(newType, categoryOptions)
  return resolveValidOption(currentCategoryId, options)
}
