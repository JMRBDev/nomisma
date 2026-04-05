import { FormErrorMessage } from "@/components/form-error-message"
import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringFieldErrors,
  RecurringFormValues,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import {
  getCategoryOptions,
  resolveValidOption,
} from "@/components/dashboard/recurring/recurring-shared"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { recurringFrequencyOptions } from "@/lib/money"

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

        <Field>
          <FieldLabel htmlFor="recurring-account">
            <FieldTitle>
              {values.type === "income" ? "Deposit account" : "Payment account"}
            </FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="recurring-account"
            value={resolveValidOption(values.accountId, accountOptions)}
            onChange={(event) => onValueChange("accountId", event.target.value)}
            disabled={accountOptions.length === 0}
          >
            {accountOptions.length === 0 ? (
              <NativeSelectOption value="">
                Create an account first
              </NativeSelectOption>
            ) : null}
            {accountOptions.map((account) => (
              <NativeSelectOption key={account._id} value={account._id}>
                {account.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FormErrorMessage error={errors.accountId} />
        </Field>

        <Field>
          <FieldLabel htmlFor="recurring-category">
            <FieldTitle>
              {values.type === "income"
                ? "Income category"
                : "Expense category"}
            </FieldTitle>
          </FieldLabel>
          <NativeSelect
            id="recurring-category"
            value={resolveValidOption(values.categoryId, categoryOptions)}
            onChange={(event) =>
              onValueChange("categoryId", event.target.value)
            }
            disabled={categoryOptions.length === 0}
          >
            {categoryOptions.length === 0 ? (
              <NativeSelectOption value="">
                Create a category first
              </NativeSelectOption>
            ) : null}
            {categoryOptions.map((category) => (
              <NativeSelectOption key={category._id} value={category._id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FormErrorMessage error={errors.categoryId} />
        </Field>

        <Field>
          <FieldLabel htmlFor="recurring-start-date">
            <FieldTitle>Start date</FieldTitle>
          </FieldLabel>
          <Input
            id="recurring-start-date"
            type="date"
            value={values.startDate}
            onChange={(event) => onValueChange("startDate", event.target.value)}
          />
          <FormErrorMessage error={errors.startDate} />
        </Field>

        <Field>
          <FieldLabel htmlFor="recurring-next-due-date">
            <FieldTitle>First due date</FieldTitle>
          </FieldLabel>
          <Input
            id="recurring-next-due-date"
            type="date"
            value={values.nextDueDate}
            onChange={(event) =>
              onValueChange("nextDueDate", event.target.value)
            }
          />
          <FormErrorMessage error={errors.nextDueDate} />
        </Field>

        <Field>
          <FieldLabel htmlFor="recurring-end-date">
            <FieldTitle>End date</FieldTitle>
          </FieldLabel>
          <Input
            id="recurring-end-date"
            type="date"
            value={values.endDate}
            onChange={(event) => onValueChange("endDate", event.target.value)}
          />
          <FieldDescription>
            Leave blank to keep this rule active.
          </FieldDescription>
          <FormErrorMessage error={errors.endDate} />
        </Field>
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
