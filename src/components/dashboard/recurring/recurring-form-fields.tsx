import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringFieldErrors,
  RecurringFormValues,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import { getCategoryOptions } from "@/components/dashboard/recurring/recurring-shared"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { FormErrorMessage } from "@/components/form-error-message"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { t } from "@/lib/i18n"
import {
  getRecurringFrequencyOptions,
  getTransactionTypeLabel,
} from "@/lib/money"
import { RecurringSelectFields } from "@/components/dashboard/recurring/recurring-select-fields"

export function RecurringFormFields({
  values,
  errors,
  accountOptions,
  allAccountOptions,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onTypeChange,
  onCreateAccount,
  onUnarchiveAccount,
  onCreateCategory,
  onUnarchiveCategory,
}: {
  values: RecurringFormValues
  errors: RecurringFieldErrors
  accountOptions: Array<RecurringAccountOption>
  allAccountOptions: Array<RecurringAccountOption>
  categoryOptions: Array<RecurringCategoryOption>
  allCategoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
  onTypeChange: (value: RecurringType) => void
  onCreateAccount: (name: string) => void
  onUnarchiveAccount: (accountId: string) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  const resolvedCategoryOptions = getCategoryOptions(values.type, categoryOptions)
  const recurringFrequencyOptions = getRecurringFrequencyOptions()
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="recurring-type">
            <FieldTitle>{t("common_type")}</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="recurring-type"
            value={values.type}
            onChange={(event) =>
              onTypeChange(event.target.value as RecurringType)
            }
          >
            <NativeSelectOption value="expense">
              {getTransactionTypeLabel("expense")}
            </NativeSelectOption>
            <NativeSelectOption value="income">
              {getTransactionTypeLabel("income")}
            </NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="recurring-frequency">
            <FieldTitle>{t("common_frequency")}</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="recurring-frequency"
            value={values.frequency}
            onChange={(event) => onValueChange("frequency", event.target.value)}
          >
            {recurringFrequencyOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="recurring-amount">
            <FieldTitle>{t("common_amount")}</FieldTitle>
          </FieldLabel>
          <Input
            id="recurring-amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={(event) => onValueChange("amount", event.target.value)}
          />
          <FormErrorMessage error={errors.amount} />
        </Field>
        <RecurringSelectFields
          values={values}
          errors={errors}
          accountOptions={accountOptions}
          allAccountOptions={allAccountOptions}
          categoryOptions={resolvedCategoryOptions}
          allCategoryOptions={allCategoryOptions}
          onValueChange={onValueChange}
          onCreateAccount={onCreateAccount}
          onUnarchiveAccount={onUnarchiveAccount}
          onCreateCategory={onCreateCategory}
          onUnarchiveCategory={onUnarchiveCategory}
        />
      </div>
      <Field>
        <FieldLabel htmlFor="recurring-description">
          <FieldTitle>{t("common_description")}</FieldTitle>
        </FieldLabel>
        <Input
          id="recurring-description"
          value={values.description}
          onChange={(event) => onValueChange("description", event.target.value)}
          placeholder={
            values.type === "income"
              ? t("recurring_income_placeholder")
              : t("recurring_expense_placeholder")
          }
        />
      </Field>
    </FieldGroup>
  )
}
