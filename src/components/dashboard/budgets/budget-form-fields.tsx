import type {
  BudgetCategoryOption,
  BudgetFieldErrors,
  BudgetFormValues,
} from "@/components/dashboard/budgets/budgets-shared"
import type { CategoryOption } from "@/components/dashboard/transactions/transactions-shared"
import { ReferenceComboboxField } from "@/components/dashboard/reference-combobox-field"
import {
  TOTAL_BUDGET_VALUE,
  resolveBudgetCategoryValue,
} from "@/components/dashboard/budgets/budgets-shared"
import { getCreateOrRestoreActions } from "@/lib/reference-entities"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FormErrorMessage } from "@/components/form-error-message"

export function BudgetFormFields({
  values,
  errors,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onCreateCategory,
  onUnarchiveCategory,
}: {
  values: BudgetFormValues
  errors: BudgetFieldErrors
  categoryOptions: Array<BudgetCategoryOption>
  allCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof BudgetFormValues, value: string) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  const getCategoryActions = (query: string) => {
    return getCreateOrRestoreActions({
      options: allCategoryOptions,
      query,
      createKey: "create-category",
      unarchiveKey: "unarchive-category",
      createDescription: "Finish category setup and use it for this budget.",
      unarchiveDescription: "Restore this category and use it here.",
      onCreate: onCreateCategory,
      onUnarchive: (category) => onUnarchiveCategory(category._id),
    })
  }

  return (
    <FieldGroup>
      <ReferenceComboboxField
        id="budget-category"
        label="Budget target"
        value={resolveBudgetCategoryValue(values.categoryId, categoryOptions)}
        options={[
          {
            value: TOTAL_BUDGET_VALUE,
            label: "Total spending",
          },
          ...categoryOptions.map((category) => ({
            value: category._id,
            label: category.name,
          })),
        ]}
        error={errors.categoryId}
        placeholder="Search or create a category"
        emptyMessage="No budget targets found."
        description="Track all posted expenses or focus on one category."
        onValueChange={(nextValue) => onValueChange("categoryId", nextValue)}
        getActions={getCategoryActions}
      />

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
