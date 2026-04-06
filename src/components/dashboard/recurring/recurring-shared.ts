import type { Id } from "../../../../convex/_generated/dataModel"
import type { useRecurringPageData } from "@/hooks/use-money-dashboard"
import type { recurringFrequencyOptions } from "@/lib/money"
import {
  getFirstOptionId,
  resolveValidOption as resolveValidOptionGeneric,
} from "@/lib/form-helpers"
import { toAmountInput, todayInputValue } from "@/lib/money"

type RecurringData = NonNullable<
  ReturnType<typeof useRecurringPageData>["data"]
>
type RecurringEditorOptions = {
  accountOptions: Array<RecurringAccountOption>
  incomeCategoryOptions: Array<RecurringCategoryOption>
  expenseCategoryOptions: Array<RecurringCategoryOption>
}
type RecurringMutationPayload = {
  type: RecurringType
  amount: number
  accountId: Id<"accounts">
  categoryId: Id<"categories">
  description: string
  frequency: RecurringFrequency
  startDate: string
  nextDueDate: string
  endDate?: string
}

export type RecurringRecord = RecurringData["recurring"]["all"][number]
export type RecurringAccountOption = RecurringData["accounts"]["active"][number]
export type RecurringCategoryOption = RecurringData["categories"]["all"][number]
export type RecurringType = RecurringRecord["type"]
export type RecurringFrequency =
  (typeof recurringFrequencyOptions)[number]["value"]
export type RecurringFormValues = {
  type: RecurringType
  amount: string
  accountId: string
  categoryId: string
  frequency: RecurringFrequency
  description: string
  startDate: string
  nextDueDate: string
  endDate: string
}
export type RecurringFieldErrors = Partial<
  Record<keyof RecurringFormValues, string>
>

export function getCategoryOptions(
  type: RecurringType,
  incomeCategoryOptions: Array<RecurringCategoryOption>,
  expenseCategoryOptions: Array<RecurringCategoryOption>
) {
  return type === "income" ? incomeCategoryOptions : expenseCategoryOptions
}

export function getDefaultRecurringType(
  incomeCategoryOptions: Array<RecurringCategoryOption>,
  expenseCategoryOptions: Array<RecurringCategoryOption>
): RecurringType {
  if (expenseCategoryOptions.length > 0) {
    return "expense"
  }

  if (incomeCategoryOptions.length > 0) {
    return "income"
  }

  return "expense"
}

export const resolveValidOption = resolveValidOptionGeneric

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
): RecurringMutationPayload {
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

export function getRecurringStatusLabel(status: RecurringRecord["status"]) {
  if (status === "overdue") {
    return "Overdue"
  }

  if (status === "dueSoon") {
    return "Due soon"
  }

  return "Upcoming"
}

export function canConfirmRecurringItem(item: RecurringRecord, today: string) {
  return item.nextDueDate <= today
}
