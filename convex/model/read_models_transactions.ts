import { mapTransaction, sortByDateDescending } from "./balances"
import type { AccountDoc, CategoryDoc, TransactionDoc } from "./types"

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
