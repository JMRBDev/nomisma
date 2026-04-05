import type { Id } from "../../../../convex/_generated/dataModel"
import type { useTransactionsPageData } from "@/hooks/use-money-dashboard"
import type {
  transactionStatusOptions,
  transactionTypeOptions,
} from "@/lib/money"
import { toAmountInput, todayInputValue } from "@/lib/money"

export type TransactionsPageData = NonNullable<
  ReturnType<typeof useTransactionsPageData>["data"]
>
export type TransactionRecord = TransactionsPageData["transactions"][number]
export type AccountOption = TransactionsPageData["accounts"]["active"][number]
export type CategoryOption = TransactionsPageData["categories"]["all"][number]
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
  type: string
  status: string
  accountId: string
  categoryId: string
  fromDate: string
  toDate: string
}

export type TransactionMutationPayload = {
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
  type: "all",
  status: "all",
  accountId: "all",
  categoryId: "all",
  fromDate: "",
  toDate: "",
}

export function createTransactionDefaults(
  accountOptions: Array<{ _id: string }>,
  expenseCategoryOptions: Array<{ _id: string }>
): TransactionFormValues {
  return {
    type: "expense",
    status: "posted",
    amount: "0",
    date: todayInputValue(),
    accountId: accountOptions[0]?._id ?? "",
    toAccountId: "",
    categoryId: expenseCategoryOptions[0]?._id ?? "",
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

export function getCategoryOptions(
  type: TransactionType,
  incomeCategoryOptions: Array<CategoryOption>,
  expenseCategoryOptions: Array<CategoryOption>
) {
  if (type === "income") {
    return incomeCategoryOptions
  }

  if (type === "expense") {
    return expenseCategoryOptions
  }

  return []
}

export function resolveValidOption(
  value: string,
  options: Array<{ _id: string }>
): string {
  if (options.some((option) => option._id === value)) {
    return value
  }

  return options[0]?._id ?? ""
}

export function filterTransactions(
  transactions: Array<TransactionRecord>,
  filters: TransactionFilterValues
) {
  return transactions.filter((transaction) => {
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false
    }

    if (filters.status !== "all" && transaction.status !== filters.status) {
      return false
    }

    if (
      filters.accountId !== "all" &&
      transaction.accountId !== filters.accountId &&
      transaction.toAccountId !== filters.accountId
    ) {
      return false
    }

    if (
      filters.categoryId !== "all" &&
      transaction.categoryId !== filters.categoryId
    ) {
      return false
    }

    if (filters.fromDate && transaction.date < filters.fromDate) {
      return false
    }

    if (filters.toDate && transaction.date > filters.toDate) {
      return false
    }

    return true
  })
}

export function countActiveFilters(filters: TransactionFilterValues) {
  return [
    filters.type !== "all",
    filters.status !== "all",
    filters.accountId !== "all",
    filters.categoryId !== "all",
    Boolean(filters.fromDate),
    Boolean(filters.toDate),
  ].filter(Boolean).length
}

export function validateTransactionValues(
  values: TransactionFormValues,
  {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }: {
    accountOptions: Array<AccountOption>
    incomeCategoryOptions: Array<CategoryOption>
    expenseCategoryOptions: Array<CategoryOption>
  }
) {
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
    errors.categoryId = `Create at least one ${values.type} category in Settings before saving this transaction.`
  }

  return errors
}

export function buildTransactionPayload(
  values: TransactionFormValues,
  {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }: {
    accountOptions: Array<AccountOption>
    incomeCategoryOptions: Array<CategoryOption>
    expenseCategoryOptions: Array<CategoryOption>
  }
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
