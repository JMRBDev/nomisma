import type { useRecurringPageData } from "@/hooks/use-money-dashboard"
import type { recurringFrequencyOptions } from "@/lib/money"
import { resolveValidOption as resolveValidOptionGeneric } from "@/lib/form-helpers"

type RecurringData = NonNullable<
  ReturnType<typeof useRecurringPageData>["data"]
>

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
