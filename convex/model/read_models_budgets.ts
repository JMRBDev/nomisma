import { getBudgetStatus } from "./dates"
import type { Id } from "../_generated/dataModel"
import type { BudgetDoc, CategoryDoc } from "./types"
import type { MappedTransaction } from "./read_models_transactions"

export function buildBudgetStatuses(
  budgets: Array<BudgetDoc>,
  categories: Array<CategoryDoc>,
  transactions: Array<MappedTransaction>,
  currentMonth: string
) {
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )
  const currentMonthBudgets = budgets
    .filter((budget) => budget.month === currentMonth)
    .sort((a, b) => {
      if (a.categoryId === undefined && b.categoryId !== undefined) return -1
      if (a.categoryId !== undefined && b.categoryId === undefined) return 1
      return (
        (a.categoryId
          ? categoryMap.get(a.categoryId)?.name
          : "Total"
        )?.localeCompare(
          b.categoryId ? (categoryMap.get(b.categoryId)?.name ?? "") : "Total"
        ) ?? 0
      )
    })

  const currentMonthExpenses = transactions.filter(
    (transaction) =>
      transaction.status === "posted" &&
      transaction.type === "expense" &&
      transaction.month === currentMonth
  )

  const currentMonthTotalExpenses = currentMonthExpenses.reduce(
    (total, transaction) => total + transaction.amount,
    0
  )

  const currentMonthSpendByCategory = new Map<Id<"categories">, number>()
  for (const transaction of currentMonthExpenses) {
    if (!transaction.categoryId) continue
    currentMonthSpendByCategory.set(
      transaction.categoryId,
      (currentMonthSpendByCategory.get(transaction.categoryId) ?? 0) +
        transaction.amount
    )
  }

  const items = currentMonthBudgets.map((budget) => {
    const category = budget.categoryId
      ? categoryMap.get(budget.categoryId)
      : null
    const spent =
      budget.categoryId === undefined
        ? currentMonthTotalExpenses
        : (currentMonthSpendByCategory.get(budget.categoryId) ?? 0)
    const remaining = budget.limitAmount - spent
    const progress =
      budget.limitAmount <= 0
        ? 0
        : Math.min(Math.max(spent / budget.limitAmount, 0), 1.5)

    return {
      ...budget,
      categoryName: category?.name ?? null,
      categoryIcon: category?.icon ?? null,
      categoryColor: category?.color ?? null,
      isTotal: budget.categoryId === undefined,
      categoryMissing: budget.categoryId !== undefined && category === undefined,
      spent,
      remaining,
      progress,
      status: getBudgetStatus(progress),
    }
  })

  const totalBudget = currentMonthBudgets.find(
    (budget) => budget.categoryId === undefined
  )
  const totalPlanned = totalBudget
    ? totalBudget.limitAmount
    : items
        .filter((budget) => budget.categoryId !== undefined)
        .reduce((total, budget) => total + budget.limitAmount, 0)

  return {
    currentMonth,
    items,
    totalSpent: currentMonthTotalExpenses,
    totalPlanned,
    budgetRemaining: totalBudget
      ? totalBudget.limitAmount - currentMonthTotalExpenses
      : items.filter((budget) => budget.categoryId !== undefined).length > 0
        ? items
            .filter((budget) => budget.categoryId !== undefined)
            .reduce((total, budget) => total + budget.remaining, 0)
        : null,
  }
}
