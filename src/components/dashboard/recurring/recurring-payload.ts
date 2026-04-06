import type { Id } from "../../../../convex/_generated/dataModel"
import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringFieldErrors,
  RecurringFormValues,
  RecurringRecord,
} from "@/components/dashboard/recurring/recurring-shared"
import {
  getCategoryOptions,
  getDefaultRecurringType,
  resolveValidOption,
} from "@/components/dashboard/recurring/recurring-shared"
import { getFirstOptionId } from "@/lib/form-helpers"
import { toAmountInput, todayInputValue } from "@/lib/money"

export type RecurringEditorOptions = {
  accountOptions: Array<RecurringAccountOption>
  incomeCategoryOptions: Array<RecurringCategoryOption>
  expenseCategoryOptions: Array<RecurringCategoryOption>
}

export function createRecurringDefaults(
  accountOptions: Array<RecurringAccountOption>,
  incomeCategoryOptions: Array<RecurringCategoryOption>,
  expenseCategoryOptions: Array<RecurringCategoryOption>
): RecurringFormValues {
  const type = getDefaultRecurringType(
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  const categoryOptions = getCategoryOptions(
    type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  const today = todayInputValue()

  return {
    type,
    amount: "0",
    accountId: getFirstOptionId(accountOptions),
    categoryId: getFirstOptionId(categoryOptions),
    frequency: "monthly",
    description: "",
    startDate: today,
    nextDueDate: today,
    endDate: "",
  }
}

export function createRecurringFormValues(
  rule: RecurringRecord
): RecurringFormValues {
  return {
    type: rule.type,
    amount: toAmountInput(rule.amount),
    accountId: rule.accountId,
    categoryId: rule.categoryId,
    frequency: rule.frequency,
    description: rule.description,
    startDate: rule.startDate,
    nextDueDate: rule.nextDueDate,
    endDate: rule.endDate ?? "",
  }
}

export function validateRecurringValues(
  values: RecurringFormValues,
  {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }: RecurringEditorOptions
): RecurringFieldErrors {
  const errors: RecurringFieldErrors = {}
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )

  if (!resolveValidOption(values.accountId, accountOptions)) {
    errors.accountId =
      "Add at least one active account before scheduling a recurring item."
  }

  if (!resolveValidOption(values.categoryId, categoryOptions)) {
    errors.categoryId = `Create at least one ${values.type} category in Settings before saving this recurring item.`
  }

  if (Number(values.amount || "0") <= 0) {
    errors.amount = "Amount must be greater than zero."
  }

  if (!values.startDate) {
    errors.startDate = "Pick a start date."
  }

  if (!values.nextDueDate) {
    errors.nextDueDate = "Pick the first due date."
  } else if (values.startDate && values.nextDueDate < values.startDate) {
    errors.nextDueDate =
      "The first due date must be on or after the start date."
  }

  if (
    values.endDate &&
    values.nextDueDate &&
    values.endDate < values.nextDueDate
  ) {
    errors.endDate = "The end date must be on or after the next due date."
  }

  return errors
}

export function buildRecurringPayload(
  values: RecurringFormValues,
  {
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
  }: RecurringEditorOptions
) {
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )

  return {
    type: values.type,
    amount: Number(values.amount || "0"),
    accountId: resolveValidOption(
      values.accountId,
      accountOptions
    ) as Id<"accounts">,
    categoryId: resolveValidOption(
      values.categoryId,
      categoryOptions
    ) as Id<"categories">,
    description: values.description.trim(),
    frequency: values.frequency,
    startDate: values.startDate,
    nextDueDate: values.nextDueDate,
    endDate: values.endDate || undefined,
  }
}
