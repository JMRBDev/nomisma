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
import { m } from "@/paraglide/messages"

export type TransactionEditorOptions = {
  accountOptions: Array<AccountOption>
  categoryOptions: Array<CategoryOption>
}

export function createTransactionDefaults(
  accountOptions: Array<AccountOption>,
  categoryOptions: Array<CategoryOption>
): TransactionFormValues {
  return {
    type: "expense",
    status: "posted",
    amount: "0",
    date: todayInputValue(),
    accountId: getFirstOptionId(accountOptions),
    toAccountId: "",
    categoryId: getFirstOptionId(categoryOptions),
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
  { accountOptions, categoryOptions }: TransactionEditorOptions
): TransactionFieldErrors {
  const errors: TransactionFieldErrors = {}
  const resolvedAccountId = resolveValidOption(values.accountId, accountOptions)

  if (!resolvedAccountId) {
    errors.accountId = m.transactions_error_no_account()
  }

  if (Number(values.amount || "0") <= 0) {
    errors.amount = m.common_error_amount_positive()
  }

  if (!values.date) {
    errors.date = m.common_error_pick_date()
  }

  if (values.type === "transfer") {
    if (!values.toAccountId) {
      errors.toAccountId = m.transactions_error_destination_required()
    } else if (values.toAccountId === resolvedAccountId) {
      errors.toAccountId = m.transactions_error_destination_different()
    } else if (
      !accountOptions.some((account) => account._id === values.toAccountId)
    ) {
      errors.toAccountId = m.transactions_error_destination_invalid()
    }

    return errors
  }

  const validCategoryOptions = getCategoryOptions(values.type, categoryOptions)

  if (!resolveValidOption(values.categoryId, validCategoryOptions)) {
    errors.categoryId = m.transactions_error_no_category()
  }

  return errors
}

export function buildTransactionPayload(
  values: TransactionFormValues,
  { accountOptions, categoryOptions }: TransactionEditorOptions
) {
  const accountId = resolveValidOption(values.accountId, accountOptions)
  const validCategoryOptions = getCategoryOptions(values.type, categoryOptions)
  const categoryId =
    values.type === "transfer"
      ? undefined
      : resolveValidOption(values.categoryId, validCategoryOptions) || undefined

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
