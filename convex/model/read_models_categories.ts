import type { CategoryDoc } from "./types"

export function groupCategories(categories: Array<CategoryDoc>) {
  const all = [...categories].sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  return {
    active: all.filter((category) => !category.archived),
    archived: all.filter((category) => category.archived),
    all,
  }
}
