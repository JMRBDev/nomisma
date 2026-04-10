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
import { m } from "@/lib/i18n-client"

export type RecurringEditorOptions = {
  accountOptions: Array<RecurringAccountOption>
  categoryOptions: Array<RecurringCategoryOption>
}

export function createRecurringDefaults(
  accountOptions: Array<RecurringAccountOption>,
  categoryOptions: Array<RecurringCategoryOption>
): RecurringFormValues {
  const type = getDefaultRecurringType(categoryOptions)
  const validCategoryOptions = getCategoryOptions(type, categoryOptions)
  const today = todayInputValue()

  return {
    type,
    amount: "0",
    accountId: getFirstOptionId(accountOptions),
    categoryId: getFirstOptionId(validCategoryOptions),
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
  { accountOptions, categoryOptions }: RecurringEditorOptions
): RecurringFieldErrors {
  const errors: RecurringFieldErrors = {}
  const validCategoryOptions = getCategoryOptions(values.type, categoryOptions)

  if (!resolveValidOption(values.accountId, accountOptions)) {
    errors.accountId = m.recurring_error_no_account()
  }

  if (!resolveValidOption(values.categoryId, validCategoryOptions)) {
    errors.categoryId = m.recurring_error_no_category()
  }

  if (Number(values.amount || "0") <= 0) {
    errors.amount = m.common_error_amount_positive()
  }

  if (!values.startDate) {
    errors.startDate = m.recurring_error_start_date()
  }

  if (!values.nextDueDate) {
    errors.nextDueDate = m.recurring_error_first_due_date()
  } else if (values.startDate && values.nextDueDate < values.startDate) {
    errors.nextDueDate = m.recurring_error_first_due_date_after_start()
  }

  if (
    values.endDate &&
    values.nextDueDate &&
    values.endDate < values.nextDueDate
  ) {
    errors.endDate = m.recurring_error_end_date_after_due()
  }

  return errors
}

export function buildRecurringPayload(
  values: RecurringFormValues,
  { accountOptions, categoryOptions }: RecurringEditorOptions
) {
  const validCategoryOptions = getCategoryOptions(values.type, categoryOptions)

  return {
    type: values.type,
    amount: Number(values.amount || "0"),
    accountId: resolveValidOption(
      values.accountId,
      accountOptions
    ) as Id<"accounts">,
    categoryId: resolveValidOption(
      values.categoryId,
      validCategoryOptions
    ) as Id<"categories">,
    description: values.description.trim(),
    frequency: values.frequency,
    startDate: values.startDate,
    nextDueDate: values.nextDueDate,
    endDate: values.endDate || undefined,
  }
}
