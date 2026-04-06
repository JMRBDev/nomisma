import {
  addDays,
  buildBalanceMap,
  getBudgetStatus,
  mapTransaction,
  sortByDateDescending,
} from "./shared"
import type { Id } from "../_generated/dataModel"
import type {
  AccountDoc,
  BudgetDoc,
  CategoryDoc,
  RecurringRuleDoc,
  TransactionDoc,
} from "./shared"

export type MappedTransaction = ReturnType<typeof mapTransaction>

export function buildMappedTransactions(
  accounts: Array<AccountDoc>,
  categories: Array<CategoryDoc>,
  transactions: Array<TransactionDoc>
) {
  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  return sortByDateDescending(transactions).map((transaction) =>
    mapTransaction(transaction, accountMap, categoryMap)
  )
}

export function buildAccountSummaries(
  accounts: Array<AccountDoc>,
  transactions: Array<TransactionDoc>,
  dashboardTransactions: Array<MappedTransaction>
) {
  const balances = buildBalanceMap(accounts, transactions)
  const accountMetrics = new Map<
    Id<"accounts">,
    {
      income: number
      expense: number
      transferIn: number
      transferOut: number
      recentTransactions: Array<MappedTransaction>
    }
  >()

  for (const account of accounts) {
    accountMetrics.set(account._id, {
      income: 0,
      expense: 0,
      transferIn: 0,
      transferOut: 0,
      recentTransactions: [],
    })
  }

  for (const transaction of dashboardTransactions) {
    const metrics = accountMetrics.get(transaction.accountId)
    if (metrics) {
      if (transaction.type === "income") metrics.income += transaction.amount
      if (transaction.type === "expense") metrics.expense += transaction.amount
      if (transaction.type === "transfer")
        metrics.transferOut += transaction.amount
      if (metrics.recentTransactions.length < 4) {
        metrics.recentTransactions.push(transaction)
      }
    }

    if (transaction.type === "transfer" && transaction.toAccountId) {
      const destinationMetrics = accountMetrics.get(transaction.toAccountId)
      if (destinationMetrics) {
        destinationMetrics.transferIn += transaction.amount
        if (destinationMetrics.recentTransactions.length < 4) {
          destinationMetrics.recentTransactions.push(transaction)
        }
      }
    }
  }

  return accounts
    .map((account) => ({
      ...account,
      currentBalance: balances.get(account._id) ?? account.openingBalance,
      ...accountMetrics.get(account._id),
    }))
    .sort((a, b) => {
      if (a.archived !== b.archived) return a.archived ? 1 : -1
      return a.name.localeCompare(b.name)
    })
}

export function groupAccountSummaries(
  accountSummaries: ReturnType<typeof buildAccountSummaries>
) {
  return {
    active: accountSummaries.filter((account) => !account.archived),
    archived: accountSummaries.filter((account) => account.archived),
  }
}

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
      categoryName: budget.categoryId
        ? (categoryMap.get(budget.categoryId)?.name ?? "Deleted category")
        : "Total spending",
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

export function buildRecurringItems(
  recurringRules: Array<RecurringRuleDoc>,
  accounts: Array<AccountDoc>,
  categories: Array<CategoryDoc>,
  today: string
) {
  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  const all = recurringRules
    .filter((rule) => rule.active)
    .map((rule) => ({
      ...rule,
      accountName: accountMap.get(rule.accountId)?.name ?? "Unknown account",
      categoryName:
        categoryMap.get(rule.categoryId)?.name ?? "Unknown category",
      status:
        rule.nextDueDate < today
          ? ("overdue" as const)
          : rule.nextDueDate <= addDays(today, 7)
            ? ("dueSoon" as const)
            : ("upcoming" as const),
    }))
    .sort((a, b) => (a.nextDueDate < b.nextDueDate ? -1 : 1))

  return {
    dueSoon: all.filter((item) => item.status === "dueSoon"),
    overdue: all.filter((item) => item.status === "overdue"),
    upcoming: all.filter((item) => item.status === "upcoming"),
    all,
  }
}
