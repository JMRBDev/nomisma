import type { Id } from "../../../../convex/_generated/dataModel"
import type { useTransactionsPageData } from "@/hooks/use-money-dashboard"
import type {
  transactionStatusOptions,
  transactionTypeOptions,
} from "@/lib/money"
import {
  getCategoryOptions as getCategoryOptionsGeneric,
  getFirstOptionId,
  resolveValidOption as resolveValidOptionGeneric,
} from "@/lib/form-helpers"
import { toAmountInput, todayInputValue } from "@/lib/money"

type TransactionsData = NonNullable<
  ReturnType<typeof useTransactionsPageData>["data"]
>
type TransactionEditorOptions = {
  accountOptions: Array<AccountOption>
  incomeCategoryOptions: Array<CategoryOption>
  expenseCategoryOptions: Array<CategoryOption>
}
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
export type TransactionType = (typeof transactionTypeOptions)[number]["value"]
export type TransactionStatus =
  (typeof transactionStatusOptions)[number]["value"]

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

export function createTransactionDefaults(
  accountOptions: Array<AccountOption>,
  expenseCategoryOptions: Array<CategoryOption>
): TransactionFormValues {
  return {
    type: "expense",
    status: "posted",
    amount: "0",
    date: todayInputValue(),
    accountId: getFirstOptionId(accountOptions),
    toAccountId: "",
    categoryId: getFirstOptionId(expenseCategoryOptions),
    description: "",
    note: "",
  }
}

export function createTransactionFormValues(
  transaction: TransactionRecord
): TransactionFormValues {
  return {
    type: transaction.type,
    status: transaction.status,
    amount: toAmountInput(transaction.amount),
    date: transaction.date,
    accountId: transaction.accountId,
    toAccountId: transaction.toAccountId ?? "",
    categoryId: transaction.categoryId ?? "",
    description: transaction.description,
    note: transaction.note ?? "",
  }
}

export const getCategoryOptions = getCategoryOptionsGeneric<
  CategoryOption,
  CategoryOption
>

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

export function validateTransactionValues(
  values: TransactionFormValues,
  {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }: TransactionEditorOptions
): TransactionFieldErrors {
  const errors: TransactionFieldErrors = {}
  const resolvedAccountId = resolveValidOption(values.accountId, accountOptions)

  if (!resolvedAccountId) {
    errors.accountId =
      "Add at least one account before recording a transaction."
  }

  if (Number(values.amount || "0") <= 0) {
    errors.amount = "Amount must be greater than zero."
  }

  if (!values.date) {
    errors.date = "Pick a date."
  }

  if (values.type === "transfer") {
    if (!values.toAccountId) {
      errors.toAccountId = "Transfers need a destination account."
    } else if (values.toAccountId === resolvedAccountId) {
      errors.toAccountId = "Pick two different accounts for a transfer."
    } else if (
      !accountOptions.some((account) => account._id === values.toAccountId)
    ) {
      errors.toAccountId = "Pick a valid destination account."
    }

    return errors
  }

  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )

  if (!resolveValidOption(values.categoryId, categoryOptions)) {
    errors.categoryId = `Create at least one ${values.type} category in Transactions before saving this transaction.`
  }

  return errors
}

export function buildTransactionPayload(
  values: TransactionFormValues,
  {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }: TransactionEditorOptions
): TransactionMutationPayload {
  const accountId = resolveValidOption(values.accountId, accountOptions)
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  const categoryId =
    values.type === "transfer"
      ? undefined
      : resolveValidOption(values.categoryId, categoryOptions) || undefined

  return {
    type: values.type,
    status: values.status,
    amount: Number(values.amount || "0"),
    date: values.date,
    accountId: accountId as Id<"accounts">,
    toAccountId:
      values.type === "transfer" && values.toAccountId
        ? (values.toAccountId as Id<"accounts">)
        : undefined,
    categoryId: categoryId ? (categoryId as Id<"categories">) : undefined,
    description: values.description,
    note: values.note || undefined,
  }
}
