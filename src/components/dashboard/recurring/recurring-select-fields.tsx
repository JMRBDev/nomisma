import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringFieldErrors,
  RecurringFormValues,
} from "@/components/dashboard/recurring/recurring-shared"
import { resolveValidOption } from "@/components/dashboard/recurring/recurring-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export function RecurringSelectFields({
  values,
  errors,
  accountOptions,
  categoryOptions,
  onValueChange,
}: {
  values: RecurringFormValues
  errors: RecurringFieldErrors
  accountOptions: Array<RecurringAccountOption>
  categoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
}) {
  return (
    <>
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
            {values.type === "income" ? "Income category" : "Expense category"}
          </FieldTitle>
        </FieldLabel>
        <NativeSelect
          id="recurring-category"
          value={resolveValidOption(values.categoryId, categoryOptions)}
          onChange={(event) => onValueChange("categoryId", event.target.value)}
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
          onChange={(event) => onValueChange("nextDueDate", event.target.value)}
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
    </>
  )
}
