import { getRouteApi } from "@tanstack/react-router"
import type { Id } from "../../../../convex/_generated/dataModel"
import type {
  TransactionStatusValue,
  TransactionTypeValue,
} from "@/lib/money"
import {
  getCategoryOptions as getCategoryOptionsGeneric,
  resolveValidOption as resolveValidOptionGeneric,
} from "@/lib/form-helpers"

const transactionsRouteApi = getRouteApi(
  "/_authenticated/dashboard/transactions"
)

type TransactionsData = ReturnType<typeof transactionsRouteApi.useLoaderData>

type TransactionMutationPayload = {
  type: TransactionType
  status: TransactionStatus
  amount: number
  date: string
  accountId: Id<"accounts">
  toAccountId?: Id<"accounts">
  categoryId?: Id<"categories">
  description: string
  note?: string
}

const ALL_FILTER_VALUE = "all"

export type TransactionRecord = TransactionsData["transactions"][number]
export type AccountOption = TransactionsData["accounts"]["active"][number]
export type CategoryOption = TransactionsData["categories"]["all"][number]
export type TransactionType = TransactionTypeValue
export type TransactionStatus = TransactionStatusValue

export type TransactionFormValues = {
  type: TransactionType
  status: TransactionStatus
  amount: string
  date: string
  accountId: string
  toAccountId: string
  categoryId: string
  description: string
  note: string
}

export type TransactionFieldErrors = Partial<
  Record<keyof TransactionFormValues, string>
>

export type TransactionFilterValues = {
  type: TransactionType | typeof ALL_FILTER_VALUE
  status: TransactionStatus | typeof ALL_FILTER_VALUE
  accountId: string
  categoryId: string
}

export type TransactionsPageActions = {
  onCreateTransaction: (payload: TransactionMutationPayload) => Promise<unknown>
  onUpdateTransaction: (
    transactionId: TransactionRecord["_id"],
    payload: TransactionMutationPayload
  ) => Promise<unknown>
  onDeleteTransaction: (
    transactionId: TransactionRecord["_id"]
  ) => Promise<unknown> | unknown
}

export const DEFAULT_FILTER_VALUES: TransactionFilterValues = {
  type: ALL_FILTER_VALUE,
  status: ALL_FILTER_VALUE,
  accountId: ALL_FILTER_VALUE,
  categoryId: ALL_FILTER_VALUE,
}

export const getCategoryOptions = getCategoryOptionsGeneric<CategoryOption>

export const resolveValidOption = resolveValidOptionGeneric

export function filterTransactions(
  transactions: Array<TransactionRecord>,
  filters: TransactionFilterValues
): Array<TransactionRecord> {
  return transactions.filter((transaction) => {
    if (
      filters.type !== ALL_FILTER_VALUE &&
      transaction.type !== filters.type
    ) {
      return false
    }

    if (
      filters.status !== ALL_FILTER_VALUE &&
      transaction.status !== filters.status
    ) {
      return false
    }

    if (
      filters.accountId !== ALL_FILTER_VALUE &&
      transaction.accountId !== filters.accountId &&
      transaction.toAccountId !== filters.accountId
    ) {
      return false
    }

    if (
      filters.categoryId !== ALL_FILTER_VALUE &&
      transaction.categoryId !== filters.categoryId
    ) {
      return false
    }

    return true
  })
}

export function countActiveFilters(filters: TransactionFilterValues) {
  return [
    filters.type !== ALL_FILTER_VALUE,
    filters.status !== ALL_FILTER_VALUE,
    filters.accountId !== ALL_FILTER_VALUE,
    filters.categoryId !== ALL_FILTER_VALUE,
  ].filter(Boolean).length
}
