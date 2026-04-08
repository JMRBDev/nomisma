import { getRouteApi } from "@tanstack/react-router"
import type { recurringFrequencyOptions } from "@/lib/money"
import { resolveValidOption as resolveValidOptionGeneric } from "@/lib/form-helpers"

const recurringRouteApi = getRouteApi("/_authenticated/dashboard/recurring")

type RecurringData = ReturnType<typeof recurringRouteApi.useLoaderData>

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
  _type: RecurringType,
  categoryOptions: Array<RecurringCategoryOption>
) {
  return categoryOptions
}

export function getDefaultRecurringType(
  _categoryOptions: Array<RecurringCategoryOption>
): RecurringType {
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
