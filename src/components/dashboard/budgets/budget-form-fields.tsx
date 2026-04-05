import { FormErrorMessage } from "@/components/form-error-message"
import type {
  BudgetCategoryOption,
  BudgetFieldErrors,
  BudgetFormValues,
} from "@/components/dashboard/budgets/budgets-shared"
import {
  TOTAL_BUDGET_VALUE,
  resolveBudgetCategoryValue,
} from "@/components/dashboard/budgets/budgets-shared"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export function BudgetFormFields({
  values,
  errors,
  categoryOptions,
  onValueChange,
}: {
  values: BudgetFormValues
  errors: BudgetFieldErrors
  categoryOptions: Array<BudgetCategoryOption>
  onValueChange: (name: keyof BudgetFormValues, value: string) => void
}) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="budget-category">
          <FieldTitle>Budget target</FieldTitle>
        </FieldLabel>
        <NativeSelect
          id="budget-category"
          value={resolveBudgetCategoryValue(values.categoryId, categoryOptions)}
          onChange={(event) => onValueChange("categoryId", event.target.value)}
        >
          <NativeSelectOption value={TOTAL_BUDGET_VALUE}>
            Total spending
          </NativeSelectOption>
          {categoryOptions.map((category) => (
            <NativeSelectOption key={category._id} value={category._id}>
              {category.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldDescription>
          Track all posted expenses or focus on one expense category.
        </FieldDescription>
        <FormErrorMessage error={errors.categoryId} />
      </Field>

      <Field>
        <FieldLabel htmlFor="budget-limit">
          <FieldTitle>Monthly limit</FieldTitle>
        </FieldLabel>
        <Input
          id="budget-limit"
          type="number"
          min="0"
          step="0.01"
          value={values.limitAmount}
          onChange={(event) => onValueChange("limitAmount", event.target.value)}
        />
        <FormErrorMessage error={errors.limitAmount} />
      </Field>
    </FieldGroup>
  )
}
