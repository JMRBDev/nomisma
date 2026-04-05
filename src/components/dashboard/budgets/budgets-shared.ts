import type { Id } from "../../../../convex/_generated/dataModel"
import type { useBudgetsPageData } from "@/hooks/use-money-dashboard"
import { toAmountInput } from "@/lib/money"

type BudgetsData = NonNullable<ReturnType<typeof useBudgetsPageData>["data"]>

export const TOTAL_BUDGET_VALUE = "total"

export type BudgetRecord = BudgetsData["budgets"]["items"][number]
export type BudgetCategoryOption =
  BudgetsData["categories"]["activeExpense"][number]
export type BudgetFormValues = {
  categoryId: string
  limitAmount: string
}
export type BudgetFieldErrors = Partial<Record<keyof BudgetFormValues, string>>
export type BudgetMutationPayload = {
  month: string
  categoryId?: Id<"categories">
  limitAmount: number
}

export function createBudgetDefaults(
  categoryOptions: Array<BudgetCategoryOption>
): BudgetFormValues {
  return {
    categoryId: categoryOptions[0]?._id ?? TOTAL_BUDGET_VALUE,
    limitAmount: "0",
  }
}

export function createBudgetFormValues(budget: BudgetRecord): BudgetFormValues {
  return {
    categoryId: budget.categoryId ?? TOTAL_BUDGET_VALUE,
    limitAmount: toAmountInput(budget.limitAmount),
  }
}

export function resolveBudgetCategoryValue(
  value: string,
  categoryOptions: Array<BudgetCategoryOption>
) {
  if (value === TOTAL_BUDGET_VALUE) {
    return TOTAL_BUDGET_VALUE
  }

  if (categoryOptions.some((category) => category._id === value)) {
    return value
  }

  return categoryOptions[0]?._id ?? TOTAL_BUDGET_VALUE
}

export function validateBudgetValues(
  values: BudgetFormValues,
  categoryOptions: Array<BudgetCategoryOption>
): BudgetFieldErrors {
  const errors: BudgetFieldErrors = {}

  if (Number(values.limitAmount || "0") <= 0) {
    errors.limitAmount = "Budget amount must be greater than zero."
  }

  if (
    values.categoryId !== TOTAL_BUDGET_VALUE &&
    !categoryOptions.some((category) => category._id === values.categoryId)
  ) {
    errors.categoryId = "Pick a valid expense category."
  }

  return errors
}

export function buildBudgetPayload(
  values: BudgetFormValues,
  month: string
): BudgetMutationPayload {
  return {
    month,
    categoryId:
      values.categoryId === TOTAL_BUDGET_VALUE
        ? undefined
        : (values.categoryId as Id<"categories">),
    limitAmount: Number(values.limitAmount),
  }
}
