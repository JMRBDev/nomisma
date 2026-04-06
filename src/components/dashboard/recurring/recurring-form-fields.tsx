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
import { recurringFrequencyOptions } from "@/lib/money"
import { RecurringSelectFields } from "@/components/dashboard/recurring/recurring-select-fields"

export function RecurringFormFields({
  values,
  errors,
  accountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  onValueChange,
  onTypeChange,
}: {
  values: RecurringFormValues
  errors: RecurringFieldErrors
  accountOptions: Array<RecurringAccountOption>
  incomeCategoryOptions: Array<RecurringCategoryOption>
  expenseCategoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
  onTypeChange: (value: RecurringType) => void
}) {
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="recurring-type">
            <FieldTitle>Type</FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="recurring-type"
            value={values.type}
            onChange={(event) =>
              onTypeChange(event.target.value as RecurringType)
            }
          >
            <NativeSelectOption value="expense">Expense</NativeSelectOption>
            <NativeSelectOption value="income">Income</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="recurring-frequency">
            <FieldTitle>Frequency</FieldTitle>
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
            <FieldTitle>Amount</FieldTitle>
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
          categoryOptions={categoryOptions}
          onValueChange={onValueChange}
        />
      </div>
      <Field>
        <FieldLabel htmlFor="recurring-description">
          <FieldTitle>Description</FieldTitle>
        </FieldLabel>
        <Input
          id="recurring-description"
          value={values.description}
          onChange={(event) => onValueChange("description", event.target.value)}
          placeholder={values.type === "income" ? "Salary" : "Rent"}
        />
      </Field>
    </FieldGroup>
  )
}
