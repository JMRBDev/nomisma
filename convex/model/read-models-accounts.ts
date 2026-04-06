import { buildBalanceMap } from "./balances"
import type { Id } from "../_generated/dataModel"
import type { AccountDoc, TransactionDoc } from "./types"
import type { MappedTransaction } from "./read-models-transactions"

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
