import type { Id } from "../../../../convex/_generated/dataModel"
import type {
  AccountOption,
  CategoryOption,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionRecord,
} from "@/components/dashboard/transactions/transactions-shared"
import {
  getCategoryOptions,
  resolveValidOption,
} from "@/components/dashboard/transactions/transactions-shared"
import { getFirstOptionId } from "@/lib/form-helpers"
import { toAmountInput, todayInputValue } from "@/lib/money"

export type TransactionEditorOptions = {
  accountOptions: Array<AccountOption>
  incomeCategoryOptions: Array<CategoryOption>
  expenseCategoryOptions: Array<CategoryOption>
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
) {
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
