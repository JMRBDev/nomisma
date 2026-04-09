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
import { m } from "@/paraglide/messages"

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
      createDescription: m.budgets_category_reference_description(),
      unarchiveDescription: m.budgets_category_restore_description(),
      onCreate: onCreateCategory,
      onUnarchive: (category) => onUnarchiveCategory(category._id),
    })
  }

  return (
    <FieldGroup>
      <ReferenceComboboxField
        id="budget-category"
        label={m.budgets_table_target()}
        value={resolveBudgetCategoryValue(values.categoryId, categoryOptions)}
        options={[
          {
            value: TOTAL_BUDGET_VALUE,
            label: m.budgets_total_spending(),
          },
          ...categoryOptions.map((category) => ({
            value: category._id,
            label: category.name,
          })),
        ]}
        error={errors.categoryId}
        placeholder={m.budgets_category_placeholder()}
        emptyMessage={m.budgets_empty_targets()}
        description={m.budgets_target_description()}
        onValueChange={(nextValue) => onValueChange("categoryId", nextValue)}
        getActions={getCategoryActions}
      />

      <Field>
        <FieldLabel htmlFor="budget-limit">
          <FieldTitle>{m.budgets_monthly_limit()}</FieldTitle>
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
