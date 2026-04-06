import { addDays, inRange } from "./dates"
import type { MappedTransaction } from "./read-models-transactions"

type DashboardTransactions = Array<MappedTransaction>

export function buildIncomeExpensesComparison(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
): Array<{ period: string; income: number; expenses: number }> {
  const sameMonth =
    dateRange.startDate.slice(0, 7) === dateRange.endDate.slice(0, 7)
  const periodMap = new Map<string, { income: number; expenses: number }>()

  if (sameMonth) {
    let weekStart = dateRange.startDate
    while (weekStart <= dateRange.endDate) {
      periodMap.set(weekStart, { income: 0, expenses: 0 })
      weekStart = addDays(weekStart, 7)
    }
  } else {
    let [year, month] = dateRange.startDate.slice(0, 7).split("-").map(Number)
    const endMonth = dateRange.endDate.slice(0, 7)
    let current = `${year}-${String(month).padStart(2, "0")}`
    while (current <= endMonth) {
      periodMap.set(current, { income: 0, expenses: 0 })
      const next = new Date(Date.UTC(year, month, 1))
      year = next.getUTCFullYear()
      month = next.getUTCMonth() + 1
      current = `${year}-${String(month).padStart(2, "0")}`
    }
  }

  for (const t of transactions) {
    if (
      t.status !== "posted" ||
      !inRange(t.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }
    let key: string
    if (sameMonth) {
      const diffMs =
        new Date(`${t.date}T00:00:00Z`).getTime() -
        new Date(`${dateRange.startDate}T00:00:00Z`).getTime()
      const diffDays = Math.round(diffMs / 86400000)
      key = addDays(dateRange.startDate, Math.floor(diffDays / 7) * 7)
    } else {
      key = t.date.slice(0, 7)
    }
    const entry = periodMap.get(key)
    if (!entry) continue
    if (t.type === "income") entry.income += t.amount
    if (t.type === "expense") entry.expenses += t.amount
  }

  return [...periodMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({ period, ...data }))
}

export function resolveSelectedDateRange(args: {
  startDate?: string
  endDate?: string
  defaultDateRange: { start: string; end: string }
}) {
  if (args.startDate && args.endDate) {
    return args.startDate <= args.endDate
      ? {
          startDate: args.startDate,
          endDate: args.endDate,
          isFiltered: true,
        }
      : {
          startDate: args.endDate,
          endDate: args.startDate,
          isFiltered: true,
        }
  }

  return {
    startDate: args.defaultDateRange.start,
    endDate: args.defaultDateRange.end,
    isFiltered: false,
  }
}
