import { addDays, inRange } from "./dates"
import type { Id } from "../_generated/dataModel"
import type { MappedTransaction } from "./read_models_transactions"

type DashboardTransactions = Array<MappedTransaction>
type CategoryBreakdownItem = {
  labelKind: "category" | "deleted" | "uncategorized" | "other"
  categoryName: string | null
  amount: number
}

export function buildTopSpendingCategories(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
) {
  const spendByCategory = new Map<
    Id<"categories">,
    {
      amount: number
      categoryId: Id<"categories">
      categoryName: string | null
      categoryMissing: boolean
    }
  >()

  for (const transaction of transactions) {
    if (
      transaction.status !== "posted" ||
      transaction.type !== "expense" ||
      !transaction.categoryId ||
      !inRange(transaction.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }

    const existing = spendByCategory.get(transaction.categoryId)
    if (existing) {
      existing.amount += transaction.amount
      continue
    }

    spendByCategory.set(transaction.categoryId, {
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      categoryMissing: transaction.categoryDisplayState === "deleted",
    })
  }

  return [...spendByCategory.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

export function buildDailySpending(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
): Array<{ date: string; amount: number }> {
  const dailyMap = new Map<string, number>()
  let current = dateRange.startDate
  while (current <= dateRange.endDate) {
    dailyMap.set(current, 0)
    current = addDays(current, 1)
  }
  for (const t of transactions) {
    if (
      t.status !== "posted" ||
      t.type !== "expense" ||
      !inRange(t.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }
    dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + t.amount)
  }
  return [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))
}

export function buildCategoryBreakdown(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
): Array<{
  labelKind: "category" | "deleted" | "uncategorized" | "other"
  categoryName: string | null
  amount: number
  percentage: number
}> {
  const categoryMap = new Map<string, CategoryBreakdownItem>()
  for (const t of transactions) {
    if (
      t.status !== "posted" ||
      t.type !== "expense" ||
      !inRange(t.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }
    const key =
      t.categoryDisplayState === "deleted"
        ? "deleted"
        : t.categoryDisplayState === "uncategorized"
          ? "uncategorized"
          : `category:${t.categoryId ?? t.categoryName ?? ""}`
    const existing = categoryMap.get(key)
    if (existing) {
      existing.amount += t.amount
    } else {
      categoryMap.set(key, {
        labelKind:
          t.categoryDisplayState === "deleted"
            ? "deleted"
            : t.categoryDisplayState === "uncategorized"
              ? "uncategorized"
              : "category",
        categoryName: t.categoryName,
        amount: t.amount,
      })
    }
  }
  const sorted = [...categoryMap.values()].sort((a, b) => b.amount - a.amount)
  const totalExpenses = sorted.reduce((sum, c) => sum + c.amount, 0)
  if (totalExpenses === 0) return []
  const top: Array<CategoryBreakdownItem> = sorted.slice(0, 5)
  const otherAmount = sorted.slice(5).reduce((sum, c) => sum + c.amount, 0)
  if (otherAmount > 0) {
    top.push({
      labelKind: "other",
      categoryName: null,
      amount: otherAmount,
    })
  }
  return top.map((item) => ({
    ...item,
    percentage: Math.round((item.amount / totalExpenses) * 100),
  }))
}
