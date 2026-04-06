import type { CategoryDoc } from "./types"

export function groupCategories(categories: Array<CategoryDoc>) {
  const all = [...categories].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind.localeCompare(b.kind)
    if (a.archived !== b.archived) return a.archived ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  return {
    activeExpense: all.filter(
      (category) => category.kind === "expense" && !category.archived
    ),
    archivedExpense: all.filter(
      (category) => category.kind === "expense" && category.archived
    ),
    activeIncome: all.filter(
      (category) => category.kind === "income" && !category.archived
    ),
    archivedIncome: all.filter(
      (category) => category.kind === "income" && category.archived
    ),
    all,
  }
}
